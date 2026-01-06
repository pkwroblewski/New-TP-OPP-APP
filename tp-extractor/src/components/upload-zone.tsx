"use client";

import { useCallback, useState, useRef } from "react";
import { cn, isFilePDF, isFileSizeValid } from "@/lib/utils";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
}

export default function UploadZone({
  onUpload,
  isProcessing,
  error,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((file: File) => {
    setValidationError(null);

    if (!isFilePDF(file)) {
      setValidationError("Please upload a PDF file");
      return false;
    }

    if (!isFileSizeValid(file)) {
      setValidationError("File size must be less than 50MB");
      return false;
    }

    setSelectedFile(file);
    return true;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && validateAndSetFile(file)) {
        onUpload(file);
      }
    },
    [onUpload, validateAndSetFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateAndSetFile(file)) {
        onUpload(file);
      }
    },
    [onUpload, validateAndSetFile]
  );

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const displayError = validationError || error;

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          isDragging
            ? "border-blue-500 bg-blue-500/5"
            : "border-slate-700 hover:border-slate-600 bg-slate-800/50",
          isProcessing && "pointer-events-none opacity-60"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF file"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="File input"
          disabled={isProcessing}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 text-slate-300">
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="flex flex-col">
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            {!isProcessing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                aria-label="Clear file"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "p-4 rounded-full mb-4 transition-colors",
                isDragging ? "bg-blue-500/10" : "bg-slate-700"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8",
                  isDragging ? "text-blue-400" : "text-slate-400"
                )}
              />
            </div>
            <p className="text-lg font-medium text-slate-200 mb-1">
              Drop your PDF here
            </p>
            <p className="text-sm text-slate-500">
              or click to browse (max 50MB)
            </p>
          </>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
