import { buildComparison, readInput } from "../../../../lib/compare";
import { toCsv } from "../../../../lib/export";
import { getResearch, TinyFishError } from "../../../../lib/tinyfish";

// Re-reading every cited page takes up to a minute or two.
export const maxDuration = 300;

/**
 * GET /api/compare/{id}            -> progress while research runs, then the full comparison as JSON
 * GET /api/compare/{id}?format=csv -> one row per requirement per place
 * Optional ?official=a.gov,b.gov adds domains to treat as official (the ones returned when the run was started).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "That is not a comparison id." }, { status: 400 });
  const official = (url.searchParams.get("official") ?? "").split(",").map((d) => d.trim().toLowerCase()).filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)).slice(0, 150);

  try {
    const run = await getResearch(id);
    const input = readInput(run.query);
    if (!input) return Response.json({ error: "That run was not started by Mappy." }, { status: 404 });

    if (run.status !== "COMPLETED") {
      const failed = run.status !== "QUEUED" && run.status !== "RUNNING";
      return Response.json(
        {
          id,
          status: run.status,
          ...input,
          started_at: run.created_at,
          sources_read: run.evidence?.length ?? 0,
          looking_into: (run.research_plan?.subquestions ?? []).map((s) => s.question).slice(0, 40),
          error: failed ? (run.error?.message ?? `The research ${run.status.toLowerCase().replace("_", " ")}. It was not charged.`) : null,
        },
        { status: failed ? 502 : 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    const comparison = await buildComparison(run, official);
    if (url.searchParams.get("format") === "csv")
      return new Response(toCsv(comparison), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="mappy-${id.slice(0, 8)}.csv"` } });
    return Response.json({ status: "COMPLETED", comparison }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const status = err instanceof TinyFishError && (err.status === 404 || err.status === 403) ? 404 : 502;
    return Response.json({ error: err instanceof Error ? err.message : "Could not read the comparison." }, { status });
  }
}
