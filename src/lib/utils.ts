import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as EUR currency
 */
export function formatEUR(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-EU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

/**
 * Format basis points
 */
export function formatBps(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value.toFixed(0)} bps`;
}

/**
 * Calculate year-over-year change percentage
 */
export function calculateYoYChange(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous === 0
  ) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Format YoY change with color indicator
 */
export function formatYoYChange(change: number | null): string {
  if (change === null) {
    return "-";
  }

  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Get color class for YoY change
 */
export function getYoYChangeColor(change: number | null): string {
  if (change === null) {
    return "text-slate-500";
  }

  if (change > 0) {
    return "text-emerald-500";
  } else if (change < 0) {
    return "text-red-500";
  }

  return "text-slate-400";
}

/**
 * Get TP score color classes
 */
export function getTPScoreClasses(score: "A" | "B" | "C"): string {
  switch (score) {
    case "A":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "B":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "C":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
}

/**
 * Get priority color classes
 */
export function getPriorityClasses(
  priority: "high" | "medium" | "low"
): string {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "low":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
}

/**
 * Get TP score label
 */
export function getTPScoreLabel(score: "A" | "B" | "C"): string {
  switch (score) {
    case "A":
      return "High Priority";
    case "B":
      return "Medium Priority";
    case "C":
      return "Low Priority";
  }
}

/**
 * Format date string for display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format debt-to-equity ratio
 */
export function formatDERatio(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) {
    return "-";
  }

  return `${ratio.toFixed(2)}x`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * File size validation (max 50MB)
 */
export function isFileSizeValid(file: File): boolean {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  return file.size <= MAX_SIZE;
}

/**
 * File type validation (PDF only)
 */
export function isFilePDF(file: File): boolean {
  return file.type === "application/pdf";
}

/**
 * Parse European number format (e.g., "108.784.025,00" → 108784025)
 * European format uses period as thousands separator and comma as decimal
 */
export function parseEuropeanNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  // Remove spaces and trim
  const cleaned = value.trim().replace(/\s/g, "");

  if (!cleaned) {
    return null;
  }

  // Check if it's European format (has periods as thousands separators)
  // Pattern: digits with periods as thousands separators and optional comma for decimals
  const europeanPattern = /^-?(\d{1,3}(\.\d{3})*)(,\d+)?$/;

  if (europeanPattern.test(cleaned)) {
    // European format: remove periods (thousands), replace comma with period (decimal)
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const result = parseFloat(normalized);
    return isNaN(result) ? null : result;
  }

  // Try parsing as standard number
  const result = parseFloat(cleaned.replace(/,/g, ""));
  return isNaN(result) ? null : result;
}

/**
 * D/E ratio status with risk level and color
 */
export interface DERatioStatus {
  label: string;
  color: string;
  risk: "none" | "low" | "medium" | "high";
  percentage: number;
}

/**
 * Get D/E ratio status based on Luxembourg market practice thresholds
 * - D/E <= 1.5x (<=60% debt): No flag
 * - D/E 1.5x-5.67x (60-85% debt): Low priority flag
 * - D/E 5.67x-10x (85-90% debt): Medium priority flag
 * - D/E > 10x (>90% debt): High priority flag
 */
export function getDERatioStatus(ratio: number | null | undefined): DERatioStatus {
  if (ratio === null || ratio === undefined) {
    return {
      label: "N/A",
      color: "text-slate-500",
      risk: "none",
      percentage: 0,
    };
  }

  // Calculate debt percentage from D/E ratio: debt% = D/E / (1 + D/E) * 100
  const percentage = (ratio / (1 + ratio)) * 100;

  if (ratio <= 1.5) {
    return {
      label: "Acceptable",
      color: "text-emerald-500",
      risk: "none",
      percentage,
    };
  } else if (ratio <= 5.67) {
    return {
      label: "Low Risk",
      color: "text-amber-400",
      risk: "low",
      percentage,
    };
  } else if (ratio <= 10) {
    return {
      label: "Medium Risk",
      color: "text-orange-500",
      risk: "medium",
      percentage,
    };
  } else {
    return {
      label: "High Risk",
      color: "text-red-500",
      risk: "high",
      percentage,
    };
  }
}

/**
 * Format interest rate spread in basis points with color
 */
export function getSpreadColor(spreadBps: number | null | undefined): string {
  if (spreadBps === null || spreadBps === undefined) {
    return "text-slate-500";
  }

  if (spreadBps < 10) {
    return "text-red-500"; // Zero/negative spread - high risk
  } else if (spreadBps < 50) {
    return "text-orange-500"; // Low spread
  } else if (spreadBps < 100) {
    return "text-amber-400"; // Moderate spread
  } else {
    return "text-emerald-500"; // Healthy spread
  }
}
