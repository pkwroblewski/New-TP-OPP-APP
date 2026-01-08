"use client";

import { cn } from "@/lib/utils";

// Base skeleton component with pulse animation
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-slate-700/50 rounded", className)}
    />
  );
}

// Header skeleton (company name, badges)
export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <Skeleton className="h-7 w-64 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </header>
  );
}

// Summary cards skeleton
export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-slate-800 rounded-xl border border-slate-700 p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// TP Flags skeleton
export function TPFlagsSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data tables skeleton
export function DataTableSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      {/* Tab navigation */}
      <div className="flex border-b border-slate-700">
        {["Balance Sheet", "P&L", "IC Details", "Raw JSON"].map((tab, i) => (
          <div
            key={tab}
            className={cn(
              "px-6 py-3",
              i === 0 ? "text-blue-400" : "text-slate-400"
            )}
          >
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Table content */}
      <div className="p-6">
        {/* Search bar */}
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Table */}
        <div className="space-y-2">
          {/* Header row */}
          <div className="flex gap-4 py-2 border-b border-slate-700">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Data rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-4 py-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress indicator component
interface ProgressIndicatorProps {
  stage: string;
}

const stages = [
  { id: "connecting", label: "Connecting" },
  { id: "metadata", label: "Extracting metadata" },
  { id: "entity", label: "Classifying entity" },
  { id: "balance_sheet", label: "Processing balance sheet" },
  { id: "profit_and_loss", label: "Processing P&L" },
  { id: "notes", label: "Extracting notes" },
  { id: "tp_analysis", label: "Analyzing TP opportunities" },
  { id: "complete", label: "Complete" },
];

export function ProgressIndicator({ stage }: ProgressIndicatorProps) {
  const currentIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Extracting Financial Data
        </h3>
        <div className="text-sm text-slate-400">
          Step {Math.min(currentIndex + 1, stages.length)} of {stages.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{
            width: `${((currentIndex + 1) / stages.length) * 100}%`,
          }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex flex-wrap gap-2">
        {stages.map((s, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={s.id}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-all",
                isComplete && "bg-emerald-500/20 text-emerald-400",
                isCurrent && "bg-blue-500/20 text-blue-400",
                !isComplete && !isCurrent && "bg-slate-700/50 text-slate-500"
              )}
            >
              {isComplete && (
                <span className="mr-1">&#10003;</span>
              )}
              {isCurrent && (
                <span className="mr-1 inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Full dashboard skeleton for initial loading state
export function DashboardSkeleton({ stage }: { stage: string }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeaderSkeleton />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <ProgressIndicator stage={stage} />
        <section className="mb-8">
          <SummaryCardsSkeleton />
        </section>
        <section className="mb-8">
          <TPFlagsSkeleton />
        </section>
        <section>
          <DataTableSkeleton />
        </section>
      </main>
    </div>
  );
}
