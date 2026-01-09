"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PdfSidebarProvider, PdfSidebar } from "@/components/pdf-sidebar";
import { useEffect, useState } from "react";

export default function ExtractionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const [pdfData, setPdfData] = useState<string | null>(null);

  // Get PDF URL from Convex storage
  const pdfUrl = useQuery(
    api.extractions.getPdfUrl,
    id ? { id: id as Id<"extractions"> } : "skip"
  );

  // Fetch PDF and convert to base64 when URL is available
  useEffect(() => {
    if (pdfUrl) {
      fetch(pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            setPdfData(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error("Failed to load PDF:", err);
        });
    }
  }, [pdfUrl]);

  return (
    <PdfSidebarProvider initialPdfData={pdfData}>
      <div className="min-h-screen bg-slate-950">
        {/* Main content - adjusted for sidebar */}
        <div className="lg:mr-[450px] transition-all">
          {children}
        </div>

        {/* PDF Sidebar */}
        <div className="hidden lg:block">
          <PdfSidebar />
        </div>
      </div>
    </PdfSidebarProvider>
  );
}
