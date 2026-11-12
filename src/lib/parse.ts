import { CATEGORIES, ReportedData, ReportedRequirement, type CategoryId } from "./types";

export interface ParsedReport {
  /** Requirements per input place, in input order. A place the report skipped has an empty list. */
  places: { place: string; requirements: ReportedRequirement[] }[];
  recommendation: { easiest: string | null; ranking: string[]; reasons: string[]; trade_offs: string[] } | null;
  /** The report with the machine-readable DATA section removed, for people to read. */
  prose: string;
  warnings: string[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Matches a place name from the report back to one the user typed ("London" ~ "London, England, United Kingdom"). */
export function matchPlace(name: string, inputs: string[]): string | null {
  const n = norm(name);
  const exact = inputs.find((p) => norm(p) === n);
  if (exact) return exact;
  const contains = inputs.filter((p) => norm(p).includes(n) || n.includes(norm(p)));
  if (contains.length === 1) return contains[0];
  const first = inputs.filter((p) => norm(p).split(" ")[0] === n.split(" ")[0]);
  return first.length === 1 ? first[0] : null;
}

function lastJsonBlock(report: string): { json: string; start: number } | null {
  const fences = [...report.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)];
  for (const m of fences.reverse()) {
    if (m[1].includes('"places"')) return { json: m[1], start: m.index ?? 0 };
  }
  // No fence: take the outermost object that starts at the last `{"places"`.
  const at = report.lastIndexOf('{"places"');
  if (at >= 0) {
    const end = report.lastIndexOf("}");
    if (end > at) return { json: report.slice(at, end + 1), start: at };
  }
  return null;
}

function parseLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Trailing commas and smart quotes are the usual culprits in model-written JSON.
    return JSON.parse(text.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"'));
  }
}

export function parseReport(report: string, inputPlaces: string[]): ParsedReport {
  const warnings: string[] = [];
  const block = lastJsonBlock(report);
  if (!block) throw new Error("The research report has no DATA block, so it can't be laid out as a comparison.");

  let raw: unknown;
  try {
    raw = parseLoose(block.json);
  } catch {
    throw new Error("The research report's DATA block is not valid JSON.");
  }
  const data = ReportedData.safeParse(raw);
  if (!data.success) throw new Error("The research report's DATA block doesn't have the expected shape.");

  const byPlace = new Map<string, ReportedRequirement[]>(inputPlaces.map((p) => [p, []]));
  for (const p of data.data.places) {
    const target = matchPlace(p.place, inputPlaces);
    if (!target) {
      warnings.push(`The report covered "${p.place}", which isn't one of the places asked for; it was left out.`);
      continue;
    }
    for (const item of p.requirements) {
      const req = ReportedRequirement.safeParse(item);
      if (req.success) byPlace.get(target)!.push(tidy(req.data));
      else warnings.push(`One requirement for ${target} was malformed in the report and left out.`);
    }
  }

  // Cut the DATA heading and block out of the readable report.
  const headingAt = report.slice(0, block.start).search(/\n#{0,6}\s*\**DATA\**\s*\n[\s\S]{0,200}$/);
  const prose = report.slice(0, headingAt >= 0 ? headingAt : block.start).trimEnd();

  const rec = data.data.recommendation;
  return {
    places: inputPlaces.map((place) => ({ place, requirements: byPlace.get(place)! })),
    recommendation: rec
      ? {
          easiest: rec.easiest ? (matchPlace(rec.easiest, inputPlaces) ?? rec.easiest) : null,
          ranking: rec.ranking.map((r) => matchPlace(r, inputPlaces) ?? r),
          reasons: rec.reasons,
          trade_offs: rec.trade_offs,
        }
      : null,
    prose,
    warnings,
  };
}

const NOT_STATED = /^(not (published|stated|specified|available|applicable|provided)|n\/?a|none|unknown|unclear)\b/i;

/**
 * The research sometimes writes "Not published on the official page" into a fee or time field instead
 * of leaving it empty. Those are gaps, not values: move the wording to `gaps` and blank the field.
 */
function tidy(r: ReportedRequirement): ReportedRequirement {
  const notes: string[] = [];
  const blank = (text: string | null, what: string, hasNumber: boolean): string | null => {
    if (!text || hasNumber || !NOT_STATED.test(text)) return text;
    if (!/^(n\/?a|not applicable|none)\b/i.test(text)) notes.push(`${what}: ${text}`);
    return null;
  };
  const fee = { ...r.fee, text: blank(r.fee.text, "Fee", r.fee.amount != null) };
  const time = { ...r.processing_time, text: blank(r.processing_time.text, "Processing time", r.processing_time.min_days != null || r.processing_time.max_days != null) };
  const renewal = { period: blank(r.renewal.period, "Renewal", false), fee_text: blank(r.renewal.fee_text, "Renewal fee", false) };
  const gaps = r.gaps ?? (r.status === "not_required" ? null : notes.join(" ") || null);
  return { ...r, fee, processing_time: time, renewal, gaps };
}

/** Categories the report left empty for a place. These become visible "nothing found" rows, never invented ones. */
export function missingCategories(reqs: ReportedRequirement[]): CategoryId[] {
  const have = new Set(reqs.map((r) => r.category));
  return CATEGORIES.map((c) => c.id).filter((id) => !have.has(id));
}
