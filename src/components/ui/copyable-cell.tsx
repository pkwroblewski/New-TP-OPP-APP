"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableCellProps {
  value: string | number | null | undefined;
  displayValue?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function CopyableCell({
  value,
  displayValue,
  className,
  children,
}: CopyableCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (value === null || value === undefined) return;

    try {
      const textToCopy = String(value);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [value]);

  if (value === null || value === undefined) {
    return <span className={className}>{children || displayValue || "-"}</span>;
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group relative inline-flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer",
        className
      )}
      title="Click to copy"
      aria-label={`Copy ${displayValue || value}`}
    >
      <span>{children || displayValue || String(value)}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-slate-500" />
        )}
      </span>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded shadow-lg whitespace-nowrap z-50">
          Copied!
        </span>
      )}
    </button>
  );
}
