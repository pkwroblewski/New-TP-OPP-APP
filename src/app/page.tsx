"use client";

import Link from "next/link";
import AuthHeader from "@/components/auth-header";

export default function Home() {
  return (
    <main className="min-h-screen">
      <AuthHeader />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            TP Extractor
          </h1>
          <p className="text-slate-400 mb-12">
            Luxembourg Transfer Pricing Analysis Tool
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/analyze"
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-lg"
            >
              Upload PDF
            </Link>
            <Link
              href="/history"
              className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors text-lg"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
