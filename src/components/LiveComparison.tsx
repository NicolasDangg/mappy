"use client";

import { useEffect, useState } from "react";
import type { Comparison } from "../lib/types";
import { ComparisonView } from "./ComparisonView";

interface Progress {
  status: string;
  activity?: string;
  places?: string[];
  started_at?: string | null;
  sources_read?: number;
  looking_into?: string[];
  error?: string | null;
}

/** Polls a running comparison every 20 seconds and swaps in the result when the research finishes. */
export function LiveComparison({ id, official }: { id: string; official: string }) {
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const res = await fetch(`/api/compare/${id}${official ? `?official=${encodeURIComponent(official)}` : ""}`, { cache: "no-store" });
        const body = await res.json();
        if (stop) return;
        if (body.comparison) return setComparison(body.comparison);
        if (!res.ok) return setError(body.error ?? "Something went wrong reading this comparison.");
        setProgress(body);
        timer = setTimeout(tick, 20_000);
      } catch {
        if (!stop) timer = setTimeout(tick, 20_000);
      }
    }
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [id, official]);

  if (comparison) return <ComparisonView c={comparison} />;
  if (error) return <p role="alert" className="rounded bg-bad-bg px-4 py-3 text-bad">{error}</p>;
  return (
    <div aria-live="polite">
      <p className="text-sm text-muted">{progress ? "Research in progress" : "Loading"}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{progress?.activity ?? "Reading the comparison…"}</h1>
      {progress ? (
        <>
          <p className="mt-2 text-sm text-muted">
            {progress.places?.join(" · ")}. {progress.sources_read ?? 0} pages read so far. This usually takes 5 to 20 minutes; keep this link and come back.
          </p>
          {progress.looking_into?.length ? (
            <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-muted">{progress.looking_into.map((q) => <li key={q}>{q}</li>)}</ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
