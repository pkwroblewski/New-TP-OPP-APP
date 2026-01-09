"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import PdfViewer from "./pdf-viewer";
import { PanelRightClose, PanelRightOpen, FileText } from "lucide-react";

interface PdfSidebarContextValue {
  pdfData: string | null;
  setPdfData: (data: string | null) => void;
  goToPage: (page: number) => void;
  currentPage: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PdfSidebarContext = createContext<PdfSidebarContextValue | null>(null);

export function usePdfSidebar() {
  const context = useContext(PdfSidebarContext);
  if (!context) {
    throw new Error("usePdfSidebar must be used within a PdfSidebarProvider");
  }
  return context;
}

interface PdfSidebarProviderProps {
  children: React.ReactNode;
  initialPdfData?: string | null;
}

export function PdfSidebarProvider({ children, initialPdfData = null }: PdfSidebarProviderProps) {
  const [pdfData, setPdfData] = useState<string | null>(initialPdfData);
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Update pdfData when initialPdfData changes (e.g., after async fetch)
  useEffect(() => {
    if (initialPdfData) {
      setPdfData(initialPdfData);
    }
  }, [initialPdfData]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Also open the sidebar if it's closed
    setIsOpen(true);
  }, []);

  return (
    <PdfSidebarContext.Provider
      value={{
        pdfData,
        setPdfData,
        goToPage,
        currentPage,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </PdfSidebarContext.Provider>
  );
}

interface PdfSidebarProps {
  className?: string;
}

export function PdfSidebar({ className = "" }: PdfSidebarProps) {
  const { pdfData, isOpen, setIsOpen, currentPage } = usePdfSidebar();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  if (!pdfData) {
    return null;
  }

  return (
    <>
      {/* Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-20 z-40 flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors shadow-lg"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Show PDF</span>
          <PanelRightOpen className="w-4 h-4" />
        </button>
      )}

      {/* Sidebar */}
      {isOpen && !isFullScreen && (
        <div
          className={`fixed right-0 top-16 bottom-0 w-[450px] bg-slate-900 border-l border-slate-800 z-40 flex flex-col ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-sm font-medium text-slate-300">PDF Document</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Hide PDF"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            <PdfViewer
              pdfData={pdfData}
              isFullScreen={false}
              onToggleFullScreen={handleToggleFullScreen}
            />
          </div>
        </div>
      )}

      {/* Full Screen Mode */}
      {isFullScreen && (
        <PdfViewer
          pdfData={pdfData}
          isFullScreen={true}
          onToggleFullScreen={handleToggleFullScreen}
        />
      )}
    </>
  );
}

// Note link component for clickable references
interface NoteLinkProps {
  noteRef: string;
  pageNumber?: number;
  children?: React.ReactNode;
}

export function NoteLink({ noteRef, pageNumber, children }: NoteLinkProps) {
  const { goToPage, setIsOpen } = usePdfSidebar();

  const handleClick = () => {
    if (pageNumber) {
      goToPage(pageNumber);
    }
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors text-sm"
      title={pageNumber ? `Go to page ${pageNumber}` : "View in PDF"}
    >
      {children || noteRef}
    </button>
  );
}
