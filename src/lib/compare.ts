import { discoverOfficialDomains } from "./domains";
import { loadFx } from "./fx";
import { missingCategories, parseReport } from "./parse";
import { buildQuery } from "./prompt";
import { recommend, summarise } from "./score";
import { getResearch, startResearch, type ResearchRun } from "./tinyfish";
import { CATEGORIES, type Comparison, type PlaceResult, type Requirement } from "./types";
import { checkSources } from "./verify";

export interface CompareInput {
  activity: string;
  places: string[];
  mode?: "deep" | "max";
}

export function validateInput(input: CompareInput): string | null {
  if (!input.activity?.trim() || input.activity.trim().length < 4) return "Describe the activity (for example: open a café that serves hot food).";
  if (input.activity.length > 400) return "Keep the activity under 400 characters.";
  const places = [...new Set((input.places ?? []).map((p) => p.trim()).filter(Boolean))];
  if (places.length < 3) return "Give at least three different places (cities, states or countries).";
  if (places.length > 5) return "Compare at most five places at once.";
  return null;
}

/** Step 1 (TinySearch) + step 2 (TinyResearch start). Returns as soon as the research run is queued. */
export async function startComparison(input: CompareInput): Promise<{ id: string; official_domains: string[]; no_official_site_found: string[] }> {
  const places = [...new Set(input.places.map((p) => p.trim()).filter(Boolean))];
  const found = await discoverOfficialDomains(input.activity.trim(), places);
  const id = await startResearch(
    buildQuery(input.activity.trim(), places),
    input.mode ?? "deep",
    found.domains.length ? { mode: "include", domains: found.domains.slice(0, 150) } : undefined,
  );
  return { id, official_domains: found.domains, no_official_site_found: found.missing };
}

/** Reads the activity and places back out of the brief we sent, so a run id is all that needs storing. */
export function readInput(query: string): { activity: string; places: string[] } | null {
  const activity = query.match(/^ACTIVITY: (.+)$/m)?.[1]?.trim();
  const line = query.match(/^PLACES: (.+)\.$/m)?.[1];
  if (!activity || !line) return null;
  const places = line.split(/;\s*/).map((p) => p.replace(/^\(\d+\)\s*/, "").trim()).filter(Boolean);
  return places.length ? { activity, places } : null;
}

/** Steps 3 to 5: lay the finished report out by category, re-read every source (TinyFetch), score and rank. */
export async function buildComparison(run: ResearchRun, extraOfficial: string[] = []): Promise<Comparison> {
  const input = readInput(run.query);
  if (!input) throw new Error("This research run was not started by Mappy.");
  const report = run.deep_result?.result;
  if (run.status !== "COMPLETED" || !report) throw new Error(`The research run is ${run.status.toLowerCase()}, with no report to use.`);

  const parsed = parseReport(report, input.places);
  const warnings = [...parsed.warnings];
  if (run.deep_result?.termination_reason && run.deep_result.termination_reason !== "planner_done")
    warnings.push(`The research stopped early (${run.deep_result.termination_reason}), so coverage may be thinner than usual.`);

  const flat = parsed.places.flatMap((p) => p.requirements.map((r) => ({ place: p.place, r })));
  const [checks, fx] = await Promise.all([
    checkSources(flat.map((f) => f.r), { extraOfficial, evidence: run.evidence ?? [] }),
    loadFx(),
  ]);
  const checkedAt = new Date().toISOString();

  const places: PlaceResult[] = parsed.places.map((p) => {
    const requirements: Requirement[] = [];
    flat.forEach((f, i) => {
      if (f.place === p.place) requirements.push({ ...f.r, id: `${slug(p.place)}-${requirements.length + 1}`, check: checks[i], placeholder: false });
    });
    for (const cat of missingCategories(p.requirements)) {
      requirements.push({
        id: `${slug(p.place)}-gap-${cat}`,
        category: cat,
        name: "Nothing found",
        authority: null,
        status: "unclear",
        condition: null,
        fee: { amount: null, currency: null, basis: null, text: null },
        processing_time: { min_days: null, max_days: null, text: null },
        renewal: { period: null, fee_text: null },
        source_url: null,
        source_quote: null,
        gaps: `The research returned nothing for "${CATEGORIES.find((c) => c.id === cat)!.label}" in ${p.place}. That is a gap in what we found, not proof that nothing is required.`,
        check: { status: "no_source", checked_at: checkedAt, official: false, found: { fee: null, time: null, quote: null }, page_title: null, note: null },
        placeholder: true,
      });
    }
    const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
    requirements.sort((a, b) => order.get(a.category)! - order.get(b.category)!);
    return { place: p.place, requirements, summary: summarise(requirements, fx) };
  });

  const usedFetch = flat.some((f) => f.r.source_url);
  return {
    id: run.research_run_id,
    activity: input.activity,
    places,
    recommendation: recommend(places, parsed.recommendation),
    report_markdown: parsed.prose,
    research: {
      run_id: run.research_run_id,
      mode: "deep",
      started_at: run.created_at,
      completed_at: run.completed_at,
      termination_reason: run.deep_result?.termination_reason ?? null,
      iterations: run.iterations,
      sources_read: run.evidence?.length ?? 0,
      citations: run.deep_result?.citations ?? [],
      official_domains: extraOfficial,
      questions: (run.research_plan?.subquestions ?? []).map((q) => q.question),
    },
    fx,
    checked_at: checkedAt,
    endpoints_used: [
      { name: "TinySearch", how: "Finds the government sites that cover this activity in each place before any research is paid for. Those sites steer the research and define what counts as an official source." },
      { name: "TinyResearch", how: "Does the digging: one deep run reads the official rules for every place against the same eight categories and returns a cited report plus the structured data behind this table." },
      ...(usedFetch ? [{ name: "TinyFetch", how: "Re-reads every cited page live and tests each fee, processing time and quote against it. The checked date and the confirmed / not confirmed mark on each row come from this step." }] : []),
    ],
    warnings,
  };
}

export async function loadComparison(id: string, extraOfficial: string[] = []): Promise<{ run: ResearchRun; comparison: Comparison | null }> {
  const run = await getResearch(id);
  if (run.status !== "COMPLETED") return { run, comparison: null };
  return { run, comparison: await buildComparison(run, extraOfficial) };
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
