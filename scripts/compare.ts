/**
 * Command line: start a comparison, or build one from a finished research run.
 *   npm run compare -- "open a café that serves hot food" "Singapore" "London, UK" "New York City, USA"
 *   npm run compare -- --run <research_run_id> [--save name]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { buildComparison, startComparison, validateInput } from "../src/lib/compare";
import { getResearch, isTerminal } from "../src/lib/tinyfish";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const save = flag("save");
let id = flag("run");
let official: string[] = (flag("official") ?? "").split(",").filter(Boolean);

if (!id) {
  const [activity, ...places] = args;
  const problem = validateInput({ activity, places });
  if (problem) {
    console.error(problem);
    process.exit(1);
  }
  const started = await startComparison({ activity, places });
  id = started.id;
  official = started.official_domains;
  console.error(`Research run ${id} started. Government sites found: ${official.join(", ") || "none"}`);
  if (started.no_official_site_found.length) console.error(`No government site found by search for: ${started.no_official_site_found.join(", ")}`);
}

/** A dropped connection must not lose a paid run: keep trying, the run id is all we need. */
async function read(runId: string) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getResearch(runId);
    } catch (err) {
      if (attempt >= 10) throw err;
      console.error(`Could not reach TinyFish (try ${attempt}); retrying. Resume any time with --run ${runId}`);
      await new Promise((r) => setTimeout(r, 15_000));
    }
  }
}

let run = await read(id);
while (!isTerminal(run.status)) {
  console.error(`${new Date().toISOString().slice(11, 19)} ${run.status}, ${run.evidence?.length ?? 0} sources read`);
  await new Promise((r) => setTimeout(r, 30_000));
  run = await read(id);
}

const comparison = await buildComparison(run, official);
const out = JSON.stringify(comparison, null, 2);
if (save) {
  await mkdir("data/comparisons", { recursive: true });
  await writeFile(`data/comparisons/${save}.json`, out);
  console.error(`Saved data/comparisons/${save}.json`);
} else console.log(out);
