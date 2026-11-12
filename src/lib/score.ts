import { toUsd, type Fx } from "./fx";
import type { Money, PlaceResult, PlaceSummary, Recommendation, Requirement } from "./types";

const isRecurring = (r: Requirement) => r.category === "ongoing_filings" || /year|annual|month|quarter|recurring|renewal/i.test(r.fee.basis ?? "");

/** Counts and totals for one place. Only published figures are added up; what isn't published is counted, not estimated. */
export function summarise(reqs: Requirement[], fx: Fx | null): PlaceSummary {
  const real = reqs.filter((r) => !r.placeholder);
  const mandatory = real.filter((r) => r.status === "mandatory");
  const setup = mandatory.filter((r) => r.category !== "ongoing_filings");

  const totals = new Map<string, number>();
  let feesUnpublished = 0;
  for (const r of setup) {
    if (r.fee.amount == null || !r.fee.currency) feesUnpublished++;
    else totals.set(r.fee.currency.toUpperCase(), (totals.get(r.fee.currency.toUpperCase()) ?? 0) + r.fee.amount);
  }
  const upfront: Money[] = [...totals.entries()].map(([currency, amount]) => ({ currency, amount }));
  const usdParts = upfront.map((m) => toUsd(m.amount, m.currency, fx));
  const upfrontUsd = upfront.length && usdParts.every((u) => u != null) ? usdParts.reduce<number>((a, b) => a + (b ?? 0), 0) : upfront.length ? null : feesUnpublished ? null : 0;

  let longest: Requirement | null = null;
  let timesUnpublished = 0;
  for (const r of setup) {
    const days = r.processing_time.max_days ?? r.processing_time.min_days;
    if (days == null) timesUnpublished++;
    else if (!longest || days > (longest.processing_time.max_days ?? longest.processing_time.min_days ?? 0)) longest = r;
  }

  const withSource = real.filter((r) => r.source_url);
  return {
    mandatory_steps: setup.length,
    conditional_steps: real.filter((r) => r.status === "conditional" && r.category !== "ongoing_filings").length,
    upfront,
    upfront_usd: upfrontUsd,
    fees_unpublished: feesUnpublished,
    longest_wait_days: longest ? (longest.processing_time.max_days ?? longest.processing_time.min_days) : null,
    longest_wait_min_days: longest?.processing_time.min_days ?? null,
    longest_wait_item: longest?.name ?? null,
    times_unpublished: timesUnpublished,
    ongoing_items: real.filter((r) => r.status !== "not_required" && r.status !== "unclear" && isRecurring(r)).length,
    gaps: reqs.filter((r) => r.placeholder || r.status === "unclear" || !!r.gaps).length,
    sources_confirmed: withSource.filter((r) => r.check.status === "confirmed").length,
    sources_total: withSource.length,
  };
}

const METHOD =
  "Each place is ranked on four measured things: number of mandatory steps before opening, total published upfront fees (in USD), the longest published wait (worst case where the source gives a range), and the number of recurring filings. The ranks are added up and the lowest total wins. Only published figures count; a place with unpublished fees or times is not treated as cheaper or faster, it is marked as less certain.";

/** Ranks 1..n with ties sharing the better rank. Places with no figure get the worst rank. */
function ranks(values: (number | null)[]): number[] {
  const known = values.filter((v): v is number => v != null).sort((a, b) => a - b);
  return values.map((v) => (v == null ? values.length : known.indexOf(v) + 1));
}

export function recommend(places: PlaceResult[], research: Recommendation["research"]): Recommendation {
  const measures: { label: string; values: (number | null)[]; fmt: (v: number) => string }[] = [
    { label: "mandatory steps", values: places.map((p) => p.summary.mandatory_steps), fmt: (v) => `${v} mandatory step${v === 1 ? "" : "s"}` },
    { label: "upfront fees", values: places.map((p) => p.summary.upfront_usd), fmt: (v) => `about US$${Math.round(v).toLocaleString("en-US")} in published upfront fees` },
    { label: "longest wait", values: places.map((p) => p.summary.longest_wait_days), fmt: (v) => `longest published wait ${v} day${v === 1 ? "" : "s"}` },
    { label: "recurring filings", values: places.map((p) => p.summary.ongoing_items), fmt: (v) => `${v} recurring filing${v === 1 ? "" : "s"}` },
  ];
  const perMeasure = measures.map((m) => ranks(m.values));

  const ranking = places
    .map((p, i) => ({
      place: p.place,
      score: perMeasure.reduce((sum, r) => sum + r[i], 0),
      why: measures.map((m, k) => {
        const v = m.values[i];
        return v == null ? `${m.label}: not published` : `${m.fmt(v)} (rank ${perMeasure[k][i]} of ${places.length})`;
      }),
    }))
    .sort((a, b) => a.score - b.score);

  const tie = ranking.length > 1 && ranking[0].score === ranking[1].score;
  const easiest = tie ? null : (ranking[0]?.place ?? null);

  const caveats: string[] = [];
  if (tie) caveats.push(`${ranking[0].place} and ${ranking[1].place} tie on the measured scorecard; read the trade-offs to choose.`);
  for (const p of places) {
    const s = p.summary;
    const bits = [
      s.fees_unpublished && `${s.fees_unpublished} fee${s.fees_unpublished === 1 ? " is" : "s are"} not published, so its total is a floor`,
      s.times_unpublished && `${s.times_unpublished} approval time${s.times_unpublished === 1 ? " is" : "s are"} not published`,
      s.gaps && `${s.gaps} item${s.gaps === 1 ? " is" : "s are"} flagged unclear or missing`,
      s.sources_total - s.sources_confirmed > 0 && `${s.sources_total - s.sources_confirmed} of ${s.sources_total} sources could not be confirmed on re-reading`,
    ].filter(Boolean);
    if (bits.length) caveats.push(`${p.place}: ${bits.join("; ")}.`);
  }

  return {
    easiest,
    ranking,
    method: METHOD,
    research,
    agree: research?.easiest && easiest ? research.easiest === easiest : null,
    caveats,
  };
}
