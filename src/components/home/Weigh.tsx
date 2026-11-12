"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LandingExample } from "../../lib/landing";

type Place = LandingExample["places"][number];

const MEASURES: { key: string; label: string; value: (p: Place) => number | null; show: (p: Place) => string }[] = [
  { key: "steps", label: "Fewer steps", value: (p) => p.steps, show: (p) => `${p.steps} steps` },
  { key: "fees", label: "Lower fees", value: (p) => p.feesUsd, show: (p) => (p.feesUsd == null ? "Fees not published" : `about US$${Math.round(p.feesUsd).toLocaleString("en-US")}`) },
  { key: "wait", label: "Shorter wait", value: (p) => p.waitDays, show: (p) => (p.waitDays == null ? "Wait not published" : `${p.waitDays} days`) },
  { key: "ongoing", label: "Fewer renewals", value: (p) => p.ongoing, show: (p) => `${p.ongoing} renewals` },
];

const LEVELS = ["Ignore", "Some", "Normal", "A lot"];

/** Ranks 1..n, ties share the better rank, an unpublished figure gets the worst rank (same rule as the scorecard). */
function ranks(values: (number | null)[]): number[] {
  const known = values.filter((v): v is number => v != null).sort((a, b) => a - b);
  return values.map((v) => (v == null ? values.length : known.indexOf(v) + 1));
}

/** The showcase: the scorecard with its weights exposed, re-ranking the real places as the visitor moves them. */
export function Weigh({ examples }: { examples: LandingExample[] }) {
  const [active, setActive] = useState(0);
  const [weights, setWeights] = useState<number[]>([2, 2, 2, 2]);
  const ex = examples[active];

  const ranked = useMemo(() => {
    const per = MEASURES.map((m) => ranks(ex.places.map(m.value)));
    const scored = ex.places.map((p, i) => ({ p, i, score: per.reduce((s, r, k) => s + r[i] * weights[k], 0) }));
    const order = [...scored].sort((a, b) => a.score - b.score || a.i - b.i);
    return { order, positionOf: new Map(order.map((o, pos) => [o.i, pos])) };
  }, [ex, weights]);

  const lead = ranked.order[0];
  const tie = ranked.order[1] && ranked.order[1].score === lead.score;
  const allOff = weights.every((w) => w === 0);
  const notes = ex.tradeOffs.filter((t) => t.toLowerCase().startsWith(`${lead.p.name.toLowerCase()}:`)).slice(0, 2);

  return (
    <div className="weigh" data-ui>
      <div className="weigh-demo">
        <div className="weigh-head">
          <p>{ex.label}</p>
          <p className="weigh-verdict" aria-live="polite">
            {allOff ? "Nothing weighed yet" : tie ? `${lead.p.name} and ${ranked.order[1].p.name} tie` : `Start in ${lead.p.name}`}
          </p>
        </div>
        <ol className="weigh-list" style={{ "--n": ex.places.length } as React.CSSProperties}>
          {ex.places.map((p, i) => {
            const pos = ranked.positionOf.get(i) ?? i;
            const first = pos === 0 && !allOff;
            return (
              <li key={p.name} className={first ? "first" : ""} style={{ "--pos": pos } as React.CSSProperties}>
                <p className="wl-name">{p.name}</p>
                <p className="wl-figs">
                  {MEASURES.map((m, k) => (
                    <span key={m.key} className={weights[k] === 0 ? "off" : m.value(p) == null ? "gap" : ""}>{m.show(p)}</span>
                  ))}
                </p>
              </li>
            );
          })}
        </ol>
        {notes.length && !allOff ? (
          <div className="weigh-notes">
            <h3>What the numbers miss in {lead.p.name}</h3>
            {notes.map((n) => <p key={n}>{n.replace(/^[^:]+:\s*/, "")}</p>)}
          </div>
        ) : null}
        <Link href={`/c/${ex.id}`} className="weigh-link">Open the full comparison</Link>
      </div>

      <div className="weigh-controls">
        <div className="weigh-switch" role="group" aria-label="Activity">
          {examples.map((e, i) => (
            <button key={e.id} aria-pressed={i === active} onClick={() => setActive(i)}>{e.label}</button>
          ))}
        </div>
        {MEASURES.map((m, k) => (
          <label key={m.key} className="weigh-row">
            <span className="wr-label">{m.label}</span>
            <span className="wr-level">{LEVELS[weights[k]]}</span>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={weights[k]}
              onChange={(e) => setWeights(weights.map((w, j) => (j === k ? Number(e.target.value) : w)))}
              aria-valuetext={LEVELS[weights[k]]}
            />
          </label>
        ))}
        <button className="weigh-reset" onClick={() => setWeights([2, 2, 2, 2])} disabled={weights.every((w) => w === 2)}>
          Back to equal weights
        </button>
      </div>
    </div>
  );
}
