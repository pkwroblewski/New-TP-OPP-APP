"use client";

import { getTPScoreClasses, getTPScoreLabel } from "@/lib/utils";

interface StickyScoreProps {
  score: "A" | "B" | "C";
}

export default function StickyScore({ score }: StickyScoreProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getTPScoreClasses(
        score
      )}`}
      title={getTPScoreLabel(score)}
    >
      <span className="font-bold">Score {score}</span>
    </div>
  );
}
