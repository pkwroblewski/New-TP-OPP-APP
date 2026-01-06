"use client";

import { useState } from "react";
import { ExtractionResult } from "@/types/extraction";
import { copyToClipboard } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

interface RawJsonViewerProps {
  data: ExtractionResult;
}

export default function RawJsonViewer({ data }: RawJsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    const success = await copyToClipboard(jsonString);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simple syntax highlighting
  const highlightJson = (json: string): JSX.Element[] => {
    const lines = json.split("\n");

    return lines.map((line, index) => {
      // Highlight keys
      let highlighted = line.replace(
        /"([^"]+)":/g,
        '<span class="text-blue-400">"$1"</span>:'
      );

      // Highlight string values
      highlighted = highlighted.replace(
        /: "([^"]*)"(,?)/g,
        ': <span class="text-emerald-400">"$1"</span>$2'
      );

      // Highlight numbers
      highlighted = highlighted.replace(
        /: (-?\d+\.?\d*)(,?)/g,
        ': <span class="text-amber-400">$1</span>$2'
      );

      // Highlight booleans
      highlighted = highlighted.replace(
        /: (true|false)(,?)/g,
        ': <span class="text-purple-400">$1</span>$2'
      );

      // Highlight null
      highlighted = highlighted.replace(
        /: (null)(,?)/g,
        ': <span class="text-red-400">$1</span>$2'
      );

      return (
        <div
          key={index}
          className="hover:bg-slate-700/30"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    });
  };

  return (
    <div className="relative">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm z-10"
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-slate-300" />
            <span className="text-slate-300">Copy</span>
          </>
        )}
      </button>

      {/* JSON content */}
      <div className="overflow-auto max-h-[600px] bg-slate-900 rounded-lg p-4">
        <pre className="font-mono text-sm text-slate-300 leading-relaxed">
          {highlightJson(jsonString)}
        </pre>
      </div>
    </div>
  );
}
