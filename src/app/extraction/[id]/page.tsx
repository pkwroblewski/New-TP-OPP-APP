"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExtractionRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    // Redirect to summary page
    router.replace(`/extraction/${id}/summary`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400">Redirecting...</div>
    </div>
  );
}
