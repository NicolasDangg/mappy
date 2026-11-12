import { CATEGORIES } from "./types";

/**
 * The research brief sent to TinyResearch. It fixes the same eight categories for every place (so the
 * answers line up), restricts evidence to government sources, forbids estimates, and asks for a JSON
 * block at the end so the report can be turned into a table without a second model guessing at prose.
 */
export function buildQuery(activity: string, places: string[]): string {
  const cats = CATEGORIES.map((c, i) => `${i + 1}. ${c.id} - ${c.hint}`).join("\n");
  const placeList = places.map((p, i) => `(${i + 1}) ${p}`).join("; ");
  return `Compare what it takes, legally, to start this activity in each of these places.

ACTIVITY: ${activity}
PLACES: ${placeList}.

Use only official government sources (national, state/provincial and city government websites, regulators and official gazettes). Do not rely on law-firm blogs, consultancies, incorporation agents or news sites for any requirement, fee or timeline. If an official source cannot be found for something, say so plainly instead of estimating.

For EACH place, work through the SAME eight categories, in this order, so the places line up:
${cats}

For every requirement give: its official name; the issuing authority; whether it is mandatory, conditional (say on what) or not required; the official fee with currency and what the fee is charged per; the official processing or approval time; the renewal period and renewal fee; and the exact official page URL where this is stated. If a category has no requirement in a place, say "not required" and cite the page that shows it. If the rule is unclear, depends on something you cannot resolve, or the fee or time is not published, say "unclear" or "not published" and explain what is missing. Never fill a gap with a guess or a typical figure.

Then recommend which place is easiest to start in, and explain the trade-offs (number of steps, total upfront cost, longest wait, ongoing burden, anything that could block a newcomer).

End the report with a section headed "DATA" that contains exactly one fenced json code block, with this shape and nothing else in it:
{"places":[{"place":"...","requirements":[{"category":"one of the eight category ids above","name":"...","authority":"...","status":"mandatory|conditional|not_required|unclear","condition":"... or null","fee":{"amount":number or null,"currency":"ISO code or null","basis":"e.g. one-off, per year, per application","text":"fee exactly as the source states it, or null"},"processing_time":{"min_days":number or null,"max_days":number or null,"text":"as the source states it, or null"},"renewal":{"period":"... or null","fee_text":"... or null"},"source_url":"exact official page URL","source_quote":"a short verbatim quote from that page supporting the fee or time, or null","gaps":"what is unclear or unpublished, or null"}]}],"recommendation":{"easiest":"place name","ranking":["place names, easiest first"],"reasons":["..."],"trade_offs":["..."]}}
Use the place names exactly as written above. Every place must have at least one entry for each of the eight categories. Use null, not 0, when a fee or time is not published; use 0 only when the source says it is free.`;
}
