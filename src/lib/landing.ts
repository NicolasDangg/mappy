import { hostOf } from "./official";
import { CATEGORIES, type CheckStatus, type Comparison, type Requirement } from "./types";

/** Trimmed, serialisable view of a saved comparison for the landing page. */
export interface LandingCell {
  name: string;
  fee: string;
  wait: string;
  status: Requirement["status"];
  check: CheckStatus;
  url: string | null;
  host: string | null;
  more: number;
}

export interface LandingExample {
  id: string;
  label: string;
  activity: string;
  checked: string;
  pagesRead: number;
  requirements: number;
  scorecardPick: string | null;
  researchPick: string | null;
  reasons: string[];
  ranking: { place: string; score: number; why: string[] }[];
  questions: string[];
  tradeOffs: string[];
  officialDomains: number;
  places: {
    name: string;
    steps: number;
    feesUsd: number | null;
    waitDays: number | null;
    fees: string;
    feesNote: string | null;
    wait: string;
    ongoing: number;
    unpublished: number;
    confirmed: number;
    sources: number;
    hosts: string[];
  }[];
  /** One entry per category, in order, each with one cell per place. */
  matrix: { id: string; label: string; hint: string; cells: (LandingCell | null)[] }[];
}

export const shortPlace = (p: string) => p.split(",")[0].trim();
const shortActivity = (a: string) => a.split(/ that |, | \(/)[0].trim();
export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

function feeShort(r: Requirement): string {
  if (r.status === "not_required") return "Not required";
  if (r.fee.amount === 0) return "Free";
  if (r.fee.amount != null && r.fee.currency) return `${r.fee.currency} ${r.fee.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return "Not published";
}

function waitShort(r: Requirement): string {
  if (r.status === "not_required") return "";
  const { min_days: lo, max_days: hi } = r.processing_time;
  if (lo != null && hi != null && lo !== hi) return `${lo} to ${days(hi)}`;
  if (hi != null || lo != null) return days((hi ?? lo)!);
  return "Wait not published";
}

function cell(reqs: Requirement[]): LandingCell | null {
  const real = reqs.filter((r) => !r.placeholder);
  if (!real.length) return null;
  const rank = { mandatory: 0, conditional: 1, unclear: 2, not_required: 3 } as const;
  const [top] = [...real].sort((a, b) => rank[a.status] - rank[b.status]);
  return { name: top.name, fee: feeShort(top), wait: waitShort(top), status: top.status, check: top.check.status, url: top.source_url, host: top.source_url ? hostOf(top.source_url) : null, more: real.length - 1 };
}

export function toExample(c: Comparison): LandingExample {
  return {
    id: c.id,
    label: shortActivity(c.activity),
    activity: c.activity,
    checked: longDate(c.checked_at),
    pagesRead: c.research.sources_read,
    requirements: c.places.reduce((n, p) => n + p.requirements.filter((r) => !r.placeholder).length, 0),
    scorecardPick: c.recommendation.easiest ? shortPlace(c.recommendation.easiest) : null,
    researchPick: c.recommendation.research?.easiest ? shortPlace(c.recommendation.research.easiest) : null,
    reasons: (c.recommendation.research?.reasons ?? []).slice(0, 3),
    ranking: c.recommendation.ranking.map((r) => ({ place: shortPlace(r.place), score: r.score, why: r.why })),
    questions: (c.research.questions ?? []).slice(0, 7),
    tradeOffs: c.recommendation.research?.trade_offs ?? [],
    officialDomains: c.research.official_domains.length,
    places: c.places.map((p) => {
      const s = p.summary;
      const hosts = [...new Set(p.requirements.map((r) => (r.source_url ? hostOf(r.source_url) : null)).filter((h): h is string => !!h))];
      return {
        name: shortPlace(p.place),
        steps: s.mandatory_steps,
        feesUsd: s.fees_unpublished && !s.upfront.length ? null : s.upfront_usd,
        waitDays: s.longest_wait_days,
        fees: s.upfront.length ? s.upfront.map((m) => `${m.currency} ${m.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`).join(" + ") : "Not published",
        feesNote: s.fees_unpublished ? `${s.fees_unpublished} more not published` : null,
        wait: s.longest_wait_days != null ? days(s.longest_wait_days) : "Not published",
        ongoing: s.ongoing_items,
        unpublished: s.gaps,
        confirmed: s.sources_confirmed,
        sources: s.sources_total,
        hosts,
      };
    }),
    matrix: CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      hint: cat.hint,
      cells: c.places.map((p) => cell(p.requirements.filter((r) => r.category === cat.id))),
    })),
  };
}

export interface LandingRow {
  place: string;
  name: string;
  authority: string | null;
  fee: string | null;
  wait: string | null;
  renewal: string | null;
  url: string;
  host: string;
  quote: string | null;
  checked: string;
}

/** One real, confirmed requirement to show up close: the core licence if there is one. */
export function pickRow(c: Comparison): LandingRow | null {
  const all = c.places.flatMap((p) => p.requirements.map((r) => ({ p: p.place, r })));
  const good = (x: { r: Requirement }) => x.r.check.status === "confirmed" && x.r.source_url && x.r.fee.text && x.r.processing_time.text && x.r.source_quote;
  const hit = all.find((x) => x.r.category === "activity_licence" && x.r.status === "mandatory" && good(x)) ?? all.find(good);
  if (!hit?.r.source_url) return null;
  return {
    place: shortPlace(hit.p),
    name: hit.r.name,
    authority: hit.r.authority,
    fee: hit.r.fee.text,
    wait: hit.r.processing_time.text,
    renewal: [hit.r.renewal.period, hit.r.renewal.fee_text].filter(Boolean).join(", ") || null,
    url: hit.r.source_url,
    host: hostOf(hit.r.source_url) ?? "",
    quote: hit.r.source_quote,
    checked: longDate(hit.r.check.checked_at),
  };
}

export interface LandingSource {
  host: string;
  place: string;
}

/** The government sites cited across the saved comparisons, spread evenly over the places. */
export function pickSources(examples: LandingExample[], max = 16): LandingSource[] {
  const lists = examples.flatMap((e) => e.places.map((p) => p.hosts.map((host) => ({ host, place: p.name }))));
  const seen = new Set<string>();
  const out: LandingSource[] = [];
  for (let i = 0; out.length < max && lists.some((l) => l.length > i); i++) {
    for (const l of lists) {
      const s = l[i];
      if (s && !seen.has(s.host) && out.length < max) {
        seen.add(s.host);
        out.push(s);
      }
    }
  }
  return out;
}
