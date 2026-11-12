import { timingSafeEqual } from "node:crypto";
import { startComparison, validateInput } from "../../../lib/compare";
import { TinyFishError } from "../../../lib/tinyfish";

export const maxDuration = 60;

function passcodeOk(given: unknown): boolean {
  const want = process.env.COMPARE_PASSCODE;
  if (!want) return true; // local use: no passcode configured
  if (typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/compare  { activity: string, places: string[3..5], passcode?: string }
 * Starts a comparison and returns its id at once. Research takes 5 to 20 minutes; poll GET /api/compare/{id}.
 * Each run costs the owner $2, so a deployed copy asks for a passcode.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { activity?: string; places?: string[]; passcode?: string } | null;
  if (!body) return Response.json({ error: "Send JSON: { activity, places }" }, { status: 400 });
  const input = { activity: String(body.activity ?? ""), places: Array.isArray(body.places) ? body.places.map(String) : [] };
  const problem = validateInput(input);
  if (problem) return Response.json({ error: problem }, { status: 400 });
  if (!passcodeOk(body.passcode)) return Response.json({ error: "A passcode is needed to start a new comparison here. The saved examples are open to everyone." }, { status: 401 });

  try {
    const started = await startComparison(input);
    return Response.json({ ...started, status: "QUEUED", poll: `/api/compare/${started.id}` }, { status: 202 });
  } catch (err) {
    const status = err instanceof TinyFishError && [402, 429, 503].includes(err.status) ? err.status : 502;
    return Response.json({ error: err instanceof Error ? err.message : "Could not start the research." }, { status });
  }
}
