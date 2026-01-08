"use client";

import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Loader2,
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfData: string;
  onClose?: () => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export default function PdfViewer({
  pdfData,
  onClose,
  isFullScreen = false,
  onToggleFullScreen,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("PDF load error:", error);
    setIsLoading(false);
    setError("Failed to load PDF. The file may be corrupted or invalid.");
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === "Escape" && isFullScreen && onToggleFullScreen) {
        e.preventDefault();
        onToggleFullScreen();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    goToPrevPage,
    goToNextPage,
    isFullScreen,
    onToggleFullScreen,
    zoomIn,
    zoomOut,
    resetZoom,
  ]);

  const containerClass = isFullScreen
    ? "fixed inset-0 z-[100] bg-slate-950 flex flex-col"
    : "h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700";

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">PDF Viewer</span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
            title="Previous page (Left arrow)"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-sm text-slate-300 min-w-[80px] text-center">
            {numPages ? `${pageNumber} / ${numPages}` : "Loading..."}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
            title="Next page (Right arrow)"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={resetZoom}
            className="text-xs text-slate-300 px-2 py-1 hover:bg-slate-700 rounded transition-colors min-w-[50px]"
            title="Reset zoom (0)"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Full-screen and close buttons */}
        <div className="flex items-center gap-1">
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
              aria-label={isFullScreen ? "Exit full screen" : "Full screen"}
              title={isFullScreen ? "Exit full screen (Escape)" : "Full screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4 text-slate-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-300" />
              )}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
              aria-label="Close PDF viewer"
              title="Close"
            >
              <X className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* PDF content */}
      <div className="flex-1 overflow-auto bg-slate-950 flex items-start justify-center p-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading PDF...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-sm text-slate-500">
              Please ensure you've uploaded a valid PDF file.
            </p>
          </div>
        )}

        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          className={isLoading ? "hidden" : ""}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-2xl"
            loading={
              <div className="flex items-center gap-2 text-slate-400 py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Rendering page...</span>
              </div>
            }
          />
        </Document>
      </div>

      {/* Full screen hint */}
      {isFullScreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800/90 rounded-full text-xs text-slate-400">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded mx-1">Esc</kbd> to exit full screen
        </div>
      )}
    </div>
  );
}
