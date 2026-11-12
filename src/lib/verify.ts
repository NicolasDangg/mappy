import { hostOf, isOfficialUrl } from "./official";
import { fetchPages, type EvidenceSource } from "./tinyfish";
import type { ReportedRequirement, SourceCheck } from "./types";

const squash = (s: string) =>
  s
    .toLowerCase()
    .replace(/\\([_*\[\]()#.-])/g, "$1") // markdown escapes
    .replace(/[*_`>#|]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

/** Is the quoted wording on the page? Exact after normalising, or most of its five-word runs. */
export function quoteOnPage(quote: string, page: string): boolean {
  const q = squash(quote).replace(/^["'.\s]+|["'.\s]+$/g, "");
  const p = squash(page);
  if (q.length < 12) return false;
  if (p.includes(q)) return true;
  const words = q.split(" ");
  if (words.length < 6) return false;
  let hit = 0;
  let total = 0;
  for (let i = 0; i + 5 <= words.length; i++) {
    total++;
    if (p.includes(words.slice(i, i + 5).join(" "))) hit++;
  }
  return hit / total >= 0.7;
}

/** Is this amount on the page, as a whole number token (195, 195.00, 1,300)? Small amounts must sit next to a currency mark. */
export function amountOnPage(amount: number, page: string): boolean {
  const p = squash(page);
  if (amount === 0) return /\b(free|no fee|no charge|no cost|nil|without charge)\b/.test(p) || /[$£€]\s?0(\.00)?\b/.test(p);
  const whole = Math.trunc(amount);
  const frac = Math.round((amount - whole) * 100);
  const grouped = whole.toLocaleString("en-US");
  const forms = new Set([String(whole), grouped, grouped.replace(/,/g, " "), grouped.replace(/,/g, ".")]);
  for (const f of forms) {
    const body = f.replace(/[.]/g, "\\.");
    const dec = frac ? `[.,]${String(frac).padStart(2, "0")}` : `(?:[.,]00)?`;
    const re = new RegExp(`(^|[^\\d.,])${body}${dec}(?![\\d]|[.,]\\d)`, "g");
    for (const m of p.matchAll(re)) {
      if (amount >= 20) return true;
      const around = p.slice(Math.max(0, (m.index ?? 0) - 14), (m.index ?? 0) + m[0].length + 14);
      if (/[$£€¥₹]|\b(usd|gbp|eur|sgd|aud|cad|nzd|jpy|inr|aed|dollars?|pounds?|euros?|fee|cost)\b/.test(around)) return true;
    }
  }
  return false;
}

/** Are the numbers of the stated processing time on the page next to a time unit ("28 days", "4 to 6 weeks")? */
export function timeOnPage(timeText: string, page: string): boolean | null {
  const nums = [...squash(timeText).matchAll(/\d+/g)].map((m) => m[0]);
  if (!nums.length) return null;
  const p = squash(page);
  return nums.every((n) => new RegExp(`(^|\\D)${n}(\\s|-)?(?:to|-|or)?\\s?\\d*\\s?(calendar |working |business |clear )?(day|week|month|year|hour|minute)`).test(p));
}

export interface CheckContext {
  extraOfficial: string[];
  evidence: EvidenceSource[];
}

/**
 * TinyFetch step: re-read every cited page live and test the item against it. This is what the
 * "checked" date on each row means: the date we loaded the official page ourselves, not the date
 * the research ran.
 */
export async function checkSources(reqs: ReportedRequirement[], ctx: CheckContext): Promise<SourceCheck[]> {
  const urls = reqs.map((r) => r.source_url).filter((u): u is string => !!u && /^https?:\/\//.test(u));
  const pages = await fetchPages(urls);
  const now = new Date().toISOString();
  const evidenceByUrl = new Map(ctx.evidence.map((e) => [e.url.replace(/\/$/, ""), e]));

  return reqs.map((r) => {
    const base: SourceCheck = { status: "no_source", checked_at: now, official: false, found: { fee: null, time: null, quote: null }, page_title: null, note: null };
    if (!r.source_url || !hostOf(r.source_url)) return { ...base, note: "The research gave no link for this item." };

    const official = isOfficialUrl(r.source_url, ctx.extraOfficial);
    const page = pages.get(r.source_url);
    const seen = evidenceByUrl.get(r.source_url.replace(/\/$/, ""));
    const readNote = seen?.fetched_at ? ` TinyResearch read it on ${seen.fetched_at.slice(0, 10)}.` : "";

    if (!official) return { ...base, status: "not_official", page_title: page?.title ?? null, note: `${hostOf(r.source_url)} is not a government domain we recognise. Treat this item as unconfirmed.` };
    if (!page?.text) return { ...base, status: "unreachable", official, note: `The page did not load when we re-read it (${page?.error ?? "no response"}).${readNote}` };

    const found = {
      fee: r.fee.amount != null ? amountOnPage(r.fee.amount, page.text) : null,
      time: r.processing_time.text ? timeOnPage(r.processing_time.text, page.text) : null,
      quote: r.source_quote ? quoteOnPage(r.source_quote, page.text) : null,
    };
    const checkable = Object.values(found).filter((v) => v !== null);
    const numbersOk = (found.fee ?? true) && (found.time ?? true) && (found.fee !== null || found.time !== null);
    const confirmed = found.quote === true || numbersOk;

    let note: string | null = null;
    if (!checkable.length) note = "The page is live, but the item has no fee, time or quote we could test against it.";
    else if (!confirmed) {
      const missing = [found.fee === false && "the fee", found.time === false && "the processing time", found.quote === false && "the quoted wording"].filter(Boolean);
      note = `The page is live, but we could not find ${missing.join(" or ")} in its text. It may sit in a PDF, table or fee calculator. Open the page to confirm.`;
    } else if (found.fee === false) note = "The quoted wording is on the page, but the fee figure is not. Confirm the fee on the page.";
    else if (found.time === false) note = "The page supports this item, but the processing time is not stated there in those words.";

    return { status: confirmed ? "confirmed" : "page_live", checked_at: now, official, found, page_title: page.title, note };
  });
}
