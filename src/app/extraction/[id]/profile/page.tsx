"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useExtraction } from "@/hooks/useExtraction";
import AuthHeader from "@/components/auth-header";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  Building2,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Lightbulb,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// Helper to get availability badge
function AvailabilityBadge({ availability }: { availability: "complete" | "partial" | "unavailable" }) {
  const config = {
    complete: { icon: CheckCircle, text: "Complete", className: "text-emerald-400 bg-emerald-400/10" },
    partial: { icon: AlertTriangle, text: "Partial", className: "text-amber-400 bg-amber-400/10" },
    unavailable: { icon: XCircle, text: "Unavailable", className: "text-slate-400 bg-slate-400/10" },
  };
  const { icon: Icon, text, className } = config[availability];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {text}
    </span>
  );
}

// Section component for consistent styling
function ProfileSection({
  title,
  icon,
  content,
  sources,
  availability,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
  sources: string[];
  availability: "complete" | "partial" | "unavailable";
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <AvailabilityBadge availability={availability} />
      </div>
      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
      {sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Sources</p>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-slate-700 rounded text-slate-400"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// TP Relevant Info section component
function TPRelevantSection({
  title,
  icon,
  data,
}: {
  title: string;
  icon: React.ReactNode;
  data: { content: string; sources: string[]; data_availability: "complete" | "partial" | "unavailable" } | null;
}) {
  if (!data) {
    return null;
  }
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <AvailabilityBadge availability={data.data_availability} />
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{data.content}</p>
      {data.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-1.5">
            {data.sources.map((source, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-xs bg-slate-700 rounded text-slate-500"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompanyProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { extraction, extractionResult, isLoading, error } = useExtraction(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !extraction || !extractionResult) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] pt-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              Extraction not found
            </h2>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { metadata, company_profile } = extractionResult;

  // Handle older extractions that don't have company_profile
  if (!company_profile) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AuthHeader />
        <main className="max-w-5xl mx-auto px-4 py-6 pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <span>/</span>
            <Link href={`/extraction/${id}/summary`} className="hover:text-slate-300">
              {metadata.company_name || "Extraction"}
            </Link>
            <span>/</span>
            <span className="text-slate-300">Company Profile</span>
          </div>

          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              Company Profile Not Available
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              This extraction was created before the Company Profile feature was added.
              Re-extract the PDF to generate a company profile.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              New Extraction
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { company_overview, business_activities, tp_relevant_info, generation_notes } = company_profile;

  // Count how many TP-relevant sections have data
  const tpSectionsWithData = [
    tp_relevant_info.ic_financing,
    tp_relevant_info.ic_trading,
    tp_relevant_info.ip_transactions,
    tp_relevant_info.cost_sharing,
    tp_relevant_info.management_fees,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <AuthHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/extraction/${id}/summary`} className="hover:text-slate-300">
            {metadata.company_name || "Extraction"}
          </Link>
          <span>/</span>
          <span className="text-slate-300">Company Profile</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Company Profile</h1>
            <p className="text-sm text-slate-400 mt-1">
              AI-generated profile based on PDF content
            </p>
          </div>
          <Link
            href={`/extraction/${id}/summary`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Summary
          </Link>
        </div>

        {/* Generation Notes */}
        {generation_notes && generation_notes.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-amber-400">
              <span className="font-medium">Note:</span> {generation_notes.join(" ")}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Company Overview */}
          <ProfileSection
            title="Company Overview"
            icon={<Building2 className="w-5 h-5 text-blue-400" />}
            content={company_overview.content}
            sources={company_overview.sources}
            availability={company_overview.data_availability}
          />

          {/* Business Activities */}
          <ProfileSection
            title="Business Activities"
            icon={<Briefcase className="w-5 h-5 text-purple-400" />}
            content={business_activities.content}
            sources={business_activities.sources}
            availability={business_activities.data_availability}
          />

          {/* TP Relevant Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Transfer Pricing Relevant Information
              {tpSectionsWithData > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-400/10 text-emerald-400 rounded">
                  {tpSectionsWithData} section{tpSectionsWithData !== 1 ? "s" : ""} identified
                </span>
              )}
            </h2>

            {tpSectionsWithData === 0 ? (
              <p className="text-slate-400 italic">
                No transfer pricing relevant transactions were identified in the document.
              </p>
            ) : (
              <div className="space-y-4">
                <TPRelevantSection
                  title="Intercompany Financing"
                  icon={<CreditCard className="w-4 h-4 text-blue-400" />}
                  data={tp_relevant_info.ic_financing}
                />
                <TPRelevantSection
                  title="Intercompany Trading"
                  icon={<ShoppingCart className="w-4 h-4 text-amber-400" />}
                  data={tp_relevant_info.ic_trading}
                />
                <TPRelevantSection
                  title="IP Transactions"
                  icon={<Lightbulb className="w-4 h-4 text-purple-400" />}
                  data={tp_relevant_info.ip_transactions}
                />
                <TPRelevantSection
                  title="Cost Sharing"
                  icon={<Users className="w-4 h-4 text-emerald-400" />}
                  data={tp_relevant_info.cost_sharing}
                />
                <TPRelevantSection
                  title="Management Fees & Recharges"
                  icon={<FileText className="w-4 h-4 text-slate-400" />}
                  data={tp_relevant_info.management_fees}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
