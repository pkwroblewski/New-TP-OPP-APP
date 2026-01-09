"use client";

import { StreamingStage } from "@/hooks/useStreamingExtraction";
import {
  FileText,
  Building2,
  Users,
  Table,
  PieChart,
  FileSearch,
  AlertTriangle,
  Target,
  Check,
  Loader2,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ProgressPhase {
  id: string;
  label: string;
  stage: StreamingStage;
  icon: React.ReactNode;
}

const PHASES: ProgressPhase[] = [
  {
    id: "metadata",
    label: "Metadata",
    stage: "metadata",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "governance",
    label: "Governance",
    stage: "governance",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "entity",
    label: "Entity Type",
    stage: "entity",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "balance_sheet",
    label: "Balance Sheet",
    stage: "balance_sheet",
    icon: <Table className="w-5 h-5" />,
  },
  {
    id: "profit_and_loss",
    label: "P&L",
    stage: "profit_and_loss",
    icon: <PieChart className="w-5 h-5" />,
  },
  {
    id: "notes",
    label: "Notes",
    stage: "notes",
    icon: <FileSearch className="w-5 h-5" />,
  },
  {
    id: "tp_analysis",
    label: "TP Analysis",
    stage: "tp_analysis",
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    id: "complete",
    label: "Score",
    stage: "complete",
    icon: <Target className="w-5 h-5" />,
  },
];

// Map stage to order for comparison
const STAGE_ORDER: Record<StreamingStage, number> = {
  idle: 0,
  connecting: 1,
  metadata: 2,
  governance: 3,
  entity: 4,
  balance_sheet: 5,
  profit_and_loss: 6,
  notes: 7,
  tp_analysis: 8,
  complete: 9,
  error: -1,
};

interface ProgressGridProps {
  currentStage: StreamingStage;
  className?: string;
}

export default function ProgressGrid({ currentStage, className = "" }: ProgressGridProps) {
  const currentOrder = STAGE_ORDER[currentStage];

  const getPhaseStatus = (phase: ProgressPhase): "pending" | "active" | "completed" => {
    const phaseOrder = STAGE_ORDER[phase.stage];

    if (currentStage === "error") {
      return "pending";
    }

    // When complete, all phases should show as completed (green)
    if (currentStage === "complete") {
      return "completed";
    }

    if (currentOrder > phaseOrder) {
      return "completed";
    }

    if (currentOrder === phaseOrder) {
      return "active";
    }

    return "pending";
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      {PHASES.map((phase) => {
        const status = getPhaseStatus(phase);

        return (
          <div
            key={phase.id}
            className={`relative rounded-xl p-4 border transition-all duration-300 ${
              status === "completed"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : status === "active"
                ? "bg-blue-500/10 border-blue-500/30 animate-pulse"
                : "bg-slate-800/50 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : status === "active"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-700/50 text-slate-500"
                }`}
              >
                {status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : status === "active" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  phase.icon
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  status === "completed"
                    ? "text-emerald-400"
                    : status === "active"
                    ? "text-blue-400"
                    : "text-slate-500"
                }`}
              >
                {phase.label}
              </span>
            </div>

            {/* Completion indicator */}
            {status === "completed" && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Heartbeat indicator for live processing feedback
interface HeartbeatIndicatorProps {
  isActive: boolean;
  elapsedSeconds: number;
  hasError: boolean;
  isComplete: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function HeartbeatIndicator({
  isActive,
  elapsedSeconds,
  hasError,
  isComplete,
}: HeartbeatIndicatorProps) {
  // Don't show if idle
  if (!isActive && !hasError && !isComplete) {
    return null;
  }

  const isWarning = elapsedSeconds >= 90;

  // Determine status
  const getStatusConfig = () => {
    if (hasError) {
      return {
        dotColor: "bg-red-500",
        glowColor: "shadow-red-500/50",
        textColor: "text-red-400",
        statusText: "Extraction failed",
        helpText: "Please try again or use a different file",
        animate: false,
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }
    if (isComplete) {
      return {
        dotColor: "bg-emerald-500",
        glowColor: "shadow-emerald-500/50",
        textColor: "text-emerald-400",
        statusText: "Extraction complete",
        helpText: "All data extracted successfully",
        animate: false,
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }
    if (isWarning) {
      return {
        dotColor: "bg-amber-500",
        glowColor: "shadow-amber-500/50",
        textColor: "text-amber-400",
        statusText: "Still processing...",
        helpText: "Taking longer than usual. Please wait.",
        animate: true,
        icon: <Activity className="w-4 h-4" />,
      };
    }
    return {
      dotColor: "bg-emerald-500",
      glowColor: "shadow-emerald-500/50",
      textColor: "text-emerald-400",
      statusText: "Processing...",
      helpText: "Extraction typically takes 30-60 seconds",
      animate: true,
      icon: <Activity className="w-4 h-4" />,
    };
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-3">
        {/* Pulsing dot */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${config.dotColor} ${
              config.animate ? "animate-pulse" : ""
            }`}
          />
          {config.animate && (
            <div
              className={`absolute inset-0 w-3 h-3 rounded-full ${config.dotColor} animate-ping opacity-75`}
            />
          )}
        </div>

        {/* Status text and icon */}
        <div className="flex items-center gap-2">
          <span className={config.textColor}>{config.icon}</span>
          <span className={`text-sm font-medium ${config.textColor}`}>
            {config.statusText}
          </span>
        </div>

        {/* Elapsed time */}
        {isActive && !isComplete && (
          <span className="text-sm text-slate-500 tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        )}
      </div>

      {/* Help text */}
      <span className="text-xs text-slate-500 hidden sm:inline">
        {config.helpText}
      </span>
    </div>
  );
}

// Compact version for inline use
interface ProgressBarProps {
  currentStage: StreamingStage;
  className?: string;
}

export function ProgressBar({ currentStage, className = "" }: ProgressBarProps) {
  const currentOrder = STAGE_ORDER[currentStage];
  const totalPhases = PHASES.length;
  const completedPhases = Math.min(currentOrder - 1, totalPhases);
  const progressPercent = Math.max(0, (completedPhases / totalPhases) * 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
        <span>
          {currentStage === "error"
            ? "Error"
            : currentStage === "complete"
            ? "Complete"
            : currentStage === "idle"
            ? "Ready"
            : `Processing: ${PHASES.find((p) => p.stage === currentStage)?.label || currentStage}`}
        </span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            currentStage === "error"
              ? "bg-red-500"
              : currentStage === "complete"
              ? "bg-emerald-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
