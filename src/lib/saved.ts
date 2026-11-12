import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Comparison } from "./types";

const DIR = path.join(process.cwd(), "data", "comparisons");

/** Finished comparisons kept in the repo as examples. Each is the unedited output of a real run. */
export async function savedComparisons(): Promise<Comparison[]> {
  try {
    const files = (await readdir(DIR)).filter((f) => f.endsWith(".json")).sort();
    return await Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(DIR, f), "utf8")) as Comparison));
  } catch {
    return [];
  }
}

export async function savedComparison(id: string): Promise<Comparison | null> {
  return (await savedComparisons()).find((c) => c.id === id) ?? null;
}
