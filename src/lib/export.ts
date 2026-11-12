import { CATEGORIES, type Comparison } from "./types";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** One row per requirement per place, for spreadsheets and other tools. */
export function toCsv(c: Comparison): string {
  const head = ["place", "category", "requirement", "authority", "status", "condition", "fee_amount", "fee_currency", "fee_basis", "fee_as_stated", "time_min_days", "time_max_days", "time_as_stated", "renewal_period", "renewal_fee", "source_url", "source_check", "checked_at", "gaps"];
  const label = new Map<string, string>(CATEGORIES.map((k) => [k.id, k.label]));
  const rows = c.places.flatMap((p) =>
    p.requirements.map((r) => [p.place, label.get(r.category), r.name, r.authority, r.status, r.condition, r.fee.amount, r.fee.currency, r.fee.basis, r.fee.text, r.processing_time.min_days, r.processing_time.max_days, r.processing_time.text, r.renewal.period, r.renewal.fee_text, r.source_url, r.check.status, r.check.checked_at, r.gaps ?? r.check.note]),
  );
  return [head, ...rows].map((r) => r.map(cell).join(",")).join("\n") + "\n";
}
