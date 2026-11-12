/**
 * Exchange rates from the European Central Bank's daily reference file, so totals in different
 * currencies can be put side by side in USD. Rates are for comparison only; every fee is also shown
 * in the currency the government charges it in.
 */
const ECB = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

export interface Fx {
  base: "USD";
  date: string | null;
  source: string;
  /** Units of USD per one unit of the currency. */
  rates: Record<string, number>;
}

export async function loadFx(): Promise<Fx | null> {
  try {
    const res = await fetch(ECB, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const xml = await res.text();
    const perEur: Record<string, number> = { EUR: 1 };
    for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) perEur[m[1]] = Number(m[2]);
    const usd = perEur.USD;
    if (!usd) return null;
    const rates: Record<string, number> = {};
    for (const [cur, r] of Object.entries(perEur)) rates[cur] = usd / r;
    return { base: "USD", date: xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1] ?? null, source: ECB, rates };
  } catch {
    return null;
  }
}

export function toUsd(amount: number, currency: string, fx: Fx | null): number | null {
  const rate = fx?.rates[currency.toUpperCase()];
  return rate ? amount * rate : null;
}
