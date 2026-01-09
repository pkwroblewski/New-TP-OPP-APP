"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Logo from "@/components/logo";
import { SignInButton } from "@clerk/nextjs";
import { FileUp, ArrowRight, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth is loading OR while redirecting signed-in user
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Only show landing page for unauthenticated users
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <Logo href="/" showText={true} />
          <SignInButton mode="modal">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </SignInButton>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-slate-100 mb-4">
              Transfer Pricing Analysis
              <span className="block text-blue-400">Made Simple</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Extract transfer pricing data from Luxembourg annual accounts with AI.
              Identify opportunities, analyze IC transactions, and generate reports.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                  <FileUp className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignInButton>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">PDF Extraction</h3>
              <p className="text-slate-400 text-sm">
                Upload Luxembourg annual accounts and extract financial data automatically using AI.
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">TP Analysis</h3>
              <p className="text-slate-400 text-sm">
                Get instant scoring, identify flags, and analyze intercompany transactions.
              </p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Export & Share</h3>
              <p className="text-slate-400 text-sm">
                Export data to CSV, generate email templates, and share findings with your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
