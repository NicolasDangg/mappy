"use client";

import Link from "next/link";
import { useState } from "react";
import type { LandingExample } from "../../lib/landing";

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The hero's working fragment: a real finished comparison, switchable between the saved activities. */
export function HeroBoard({ examples }: { examples: LandingExample[] }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const ex = examples[active];
  const scoreTop = ex.ranking[0]?.score;
  const tied = new Set(ex.ranking.filter((r) => r.score === scoreTop).map((r) => r.place));
  const isTie = tied.size > 1;

  const rows: { label: string; value: (p: LandingExample["places"][number]) => React.ReactNode }[] = [
    { label: "Steps before opening", value: (p) => p.steps },
    { label: "Upfront government fees", value: (p) => (<>{p.fees}{p.feesNote ? <small>{p.feesNote}</small> : null}</>) },
    { label: "Longest wait", value: (p) => p.wait },
    { label: "Renewals and filings", value: (p) => p.ongoing },
    { label: "Sources confirmed", value: (p) => `${p.confirmed} of ${p.sources}` },
  ];

  return (
    <div className="board" data-ui>
      <div className="board-top">
        <div className="board-tabs" role="tablist" aria-label="Finished comparisons">
          {examples.map((e, i) => (
            <button key={e.id} role="tab" aria-selected={i === active} className={i === active ? "on" : ""} onClick={() => { setActive(i); setHover(null); }}>
              {e.label}
            </button>
          ))}
        </div>
        <p className="board-meta">{plural(ex.pagesRead, "page")} read · checked {ex.checked}</p>
      </div>

      <div className="board-scroll">
        <table key={ex.id} className="board-table" onMouseLeave={() => setHover(null)}>
          <caption className="sr-only">{ex.activity}</caption>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Measure</span></th>
              {ex.places.map((p, i) => {
                const pick = isTie ? tied.has(p.name) : p.name === ex.scorecardPick;
                return (
                  <th key={p.name} scope="col" className={`${pick ? "pick" : ""} ${hover === i ? "hover" : ""}`} onMouseEnter={() => setHover(i)} style={{ "--i": i } as React.CSSProperties}>
                    <span className="place">{p.name}</span>
                    {pick ? <span className="tag">{isTie ? "Tied on the numbers" : "Easiest on the numbers"}</span> : p.name === ex.researchPick ? <span className="tag soft">Researcher&apos;s pick</span> : <span className="tag none" aria-hidden="true">&nbsp;</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row.label} style={{ "--r": r } as React.CSSProperties}>
                <th scope="row">{row.label}</th>
                {ex.places.map((p, i) => {
                  const pick = isTie ? tied.has(p.name) : p.name === ex.scorecardPick;
                  return (
                    <td key={p.name} className={`${pick ? "pick" : ""} ${hover === i ? "hover" : ""}`} onMouseEnter={() => setHover(i)}>
                      {row.value(p)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="board-foot">
        <p>
          {isTie
            ? `${[...tied].join(" and ")} tie on the published numbers. The research leans to ${ex.researchPick ?? "neither"}.`
            : ex.researchPick && ex.researchPick !== ex.scorecardPick
              ? `${ex.scorecardPick} wins on the published numbers. The research leans to ${ex.researchPick}. You see both.`
              : `${ex.scorecardPick} wins on the published numbers and in the research.`}
        </p>
        <Link href={`/c/${ex.id}`}>Open all {ex.requirements} requirements</Link>
      </div>
    </div>
  );
}
