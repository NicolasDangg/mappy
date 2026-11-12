/** Thin server-only wrappers over the TinyFish HTTP APIs. Reads TINYFISH_API_KEY from the environment. */

const AGENT = "https://agent.tinyfish.ai";

function headers(): Record<string, string> {
  const key = process.env.TINYFISH_API_KEY;
  if (!key) throw new Error("Missing TINYFISH_API_KEY");
  return { "X-API-Key": key, "Content-Type": "application/json" };
}

export class TinyFishError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

async function json<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new TinyFishError(body?.error?.message ?? `${what} failed (${res.status})`, res.status, body?.error?.code);
  }
  return (await res.json()) as T;
}

// ---- Research -------------------------------------------------------------------------------

export interface EvidenceClaim {
  claim: string;
  snippet?: string;
  confidence?: string;
  claim_type?: string;
}
export interface EvidenceSource {
  url: string;
  title?: string | null;
  published_date?: string | null;
  fetched_at?: string | null;
  claims?: EvidenceClaim[];
}
export interface ResearchRun {
  research_run_id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMED_OUT";
  query: string;
  created_at: string | null;
  completed_at: string | null;
  iterations: number | null;
  deep_result: { result: string; citations?: string[]; termination_reason?: string } | null;
  evidence: EvidenceSource[] | null;
  research_plan: { subquestions?: { id: string; question: string }[] } | null;
  error: { code: string; message: string } | null;
}

export interface DomainFilter {
  mode: "include" | "exclusive";
  domains: string[];
  block?: string[];
}

/** Starts a TinyResearch run and returns its id straight away. Billed ($2 deep, $3 max) only when it completes. */
export async function startResearch(query: string, mode: "deep" | "max", domainFilter?: DomainFilter): Promise<string> {
  const res = await fetch(`${AGENT}/v1/automation/run-research-async`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ query, mode, domain_filter: domainFilter }),
    signal: AbortSignal.timeout(60_000),
  });
  const body = await json<{ research_run_id: string | null; error: { message: string } | null }>(res, "Starting research");
  if (!body.research_run_id) throw new TinyFishError(body.error?.message ?? "Research did not start", 502);
  return body.research_run_id;
}

export async function getResearch(id: string): Promise<ResearchRun> {
  const res = await fetch(`${AGENT}/v1/research-run/${encodeURIComponent(id)}`, {
    headers: headers(),
    signal: AbortSignal.timeout(60_000),
    cache: "no-store",
  });
  return json<ResearchRun>(res, "Reading the research run");
}

export const isTerminal = (s: ResearchRun["status"]) => s !== "QUEUED" && s !== "RUNNING";

// ---- Search ---------------------------------------------------------------------------------

export interface SearchHit {
  url: string;
  title: string;
  snippet: string;
}

export async function search(query: string, opts: { location?: string; purpose?: string } = {}): Promise<SearchHit[]> {
  const params = new URLSearchParams({ query });
  if (opts.location) params.set("location", opts.location);
  if (opts.purpose) params.set("purpose", opts.purpose);
  const res = await fetch(`https://api.search.tinyfish.ai?${params}`, {
    headers: headers(),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await json<{ results?: { url: string; title?: string; snippet?: string }[] }>(res, "Search");
  return (body.results ?? []).map((r) => ({ url: r.url, title: r.title ?? "", snippet: r.snippet ?? "" }));
}

// ---- Fetch ----------------------------------------------------------------------------------

export interface FetchedPage {
  url: string;
  final_url: string | null;
  title: string | null;
  text: string | null;
  error: string | null;
}

/** Reads pages live (ttl 0) through TinyFish Fetch, ten per request. Never throws for a single bad page. */
export async function fetchPages(urls: string[]): Promise<Map<string, FetchedPage>> {
  const out = new Map<string, FetchedPage>();
  const unique = [...new Set(urls)];
  const batches: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) batches.push(unique.slice(i, i + 10));
  await Promise.all(
    batches.map(async (batch) => {
      try {
        const res = await fetch("https://api.fetch.tinyfish.ai", {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ urls: batch, format: "markdown", ttl: 0, per_url_timeout_ms: 60_000 }),
          signal: AbortSignal.timeout(120_000),
        });
        const body = await json<{
          results?: { url: string; final_url?: string; title?: string; text?: string | null }[];
          errors?: { url: string; error: string }[];
        }>(res, "Fetch");
        for (const r of body.results ?? [])
          out.set(r.url, { url: r.url, final_url: r.final_url ?? null, title: r.title ?? null, text: r.text ?? null, error: r.text ? null : "empty page" });
        for (const e of body.errors ?? []) out.set(e.url, { url: e.url, final_url: null, title: null, text: null, error: e.error });
      } catch (err) {
        for (const u of batch) if (!out.has(u)) out.set(u, { url: u, final_url: null, title: null, text: null, error: err instanceof Error ? err.message : "fetch failed" });
      }
      for (const u of batch) if (!out.has(u)) out.set(u, { url: u, final_url: null, title: null, text: null, error: "no result returned" });
    }),
  );
  return out;
}
