import { z } from "zod";

/** The eight kinds of requirement every place is checked for, in display order. This fixed list is what makes places comparable. */
export const CATEGORIES = [
  { id: "business_registration", label: "Business registration", hint: "registering the business or company itself" },
  { id: "tax_registration", label: "Tax registration", hint: "tax IDs and sales tax / VAT / GST registration" },
  { id: "activity_licence", label: "Activity licence", hint: "the core licence, permit or registration specific to this activity" },
  { id: "premises_and_zoning", label: "Premises and zoning", hint: "planning or zoning approval, change of use, occupancy, fire safety, signage" },
  { id: "health_safety_environment", label: "Health, safety, environment", hint: "inspections, hygiene or safety certificates, waste and environmental rules" },
  { id: "people_and_qualifications", label: "People and qualifications", hint: "required training or certificates for the operator or staff, employer registration" },
  { id: "insurance_and_bonds", label: "Insurance and bonds", hint: "insurance or bonds that the law makes compulsory" },
  { id: "ongoing_filings", label: "Renewals and ongoing filings", hint: "renewals, annual returns and recurring filings after opening" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

const nullableString = z.string().trim().min(1).nullable().catch(null);
const nullableNumber = z.number().finite().nonnegative().nullable().catch(null);

/** One requirement exactly as TinyResearch reported it. Anything it left out stays null: nothing here is filled in by us. */
export const ReportedRequirement = z.object({
  category: z.enum(CATEGORY_IDS),
  name: z.string().trim().min(1),
  authority: nullableString,
  status: z.enum(["mandatory", "conditional", "not_required", "unclear"]).catch("unclear"),
  condition: nullableString,
  fee: z
    .object({ amount: nullableNumber, currency: nullableString, basis: nullableString, text: nullableString })
    .catch({ amount: null, currency: null, basis: null, text: null }),
  processing_time: z
    .object({ min_days: nullableNumber, max_days: nullableNumber, text: nullableString })
    .catch({ min_days: null, max_days: null, text: null }),
  renewal: z.object({ period: nullableString, fee_text: nullableString }).catch({ period: null, fee_text: null }),
  source_url: nullableString,
  source_quote: nullableString,
  gaps: nullableString,
});
export type ReportedRequirement = z.infer<typeof ReportedRequirement>;

export const ReportedData = z.object({
  places: z.array(z.object({ place: z.string().trim().min(1), requirements: z.array(z.unknown()) })).min(1),
  recommendation: z
    .object({
      easiest: nullableString,
      ranking: z.array(z.string()).catch([]),
      reasons: z.array(z.string()).catch([]),
      trade_offs: z.array(z.string()).catch([]),
    })
    .nullable()
    .catch(null),
});

/**
 * What we could confirm about a requirement's source when we re-read the page ourselves.
 * - confirmed: the page is live and the quoted fee, time or wording is on it
 * - page_live: the page is live, but we could not find the quoted figure in its text (often a PDF, table or fee calculator)
 * - unreachable: the page did not load when checked
 * - not_official: the link is not on a government domain we recognise
 * - no_source: the research gave no link for this item
 */
export type CheckStatus = "confirmed" | "page_live" | "unreachable" | "not_official" | "no_source";

export interface SourceCheck {
  status: CheckStatus;
  /** ISO date-time we re-read the page. */
  checked_at: string;
  official: boolean;
  /** Which of the item's facts we found on the page. */
  found: { fee: boolean | null; time: boolean | null; quote: boolean | null };
  page_title: string | null;
  note: string | null;
}

export interface Requirement extends ReportedRequirement {
  id: string;
  check: SourceCheck;
  /** True when this row was added by us because the research returned nothing for the category. */
  placeholder: boolean;
}

export interface Money {
  currency: string;
  amount: number;
}

export interface PlaceSummary {
  mandatory_steps: number;
  conditional_steps: number;
  /** Sum of published one-off fees for mandatory items, per currency. A floor when fees_unpublished > 0. */
  upfront: Money[];
  upfront_usd: number | null;
  fees_unpublished: number;
  /** Longest published wait among mandatory items, in days. */
  longest_wait_days: number | null;
  /** That item's shortest published time, when the source gives a range. */
  longest_wait_min_days: number | null;
  longest_wait_item: string | null;
  times_unpublished: number;
  ongoing_items: number;
  gaps: number;
  sources_confirmed: number;
  sources_total: number;
}

export interface PlaceResult {
  place: string;
  requirements: Requirement[];
  summary: PlaceSummary;
}

export interface Recommendation {
  /** From the measured scorecard below. */
  easiest: string | null;
  ranking: { place: string; score: number; why: string[] }[];
  method: string;
  /** TinyResearch's own written recommendation, kept separate from ours. */
  research: { easiest: string | null; ranking: string[]; reasons: string[]; trade_offs: string[] } | null;
  agree: boolean | null;
  caveats: string[];
}

export interface Comparison {
  id: string;
  activity: string;
  places: PlaceResult[];
  recommendation: Recommendation;
  report_markdown: string;
  research: {
    run_id: string;
    mode: "deep" | "max";
    started_at: string | null;
    completed_at: string | null;
    termination_reason: string | null;
    iterations: number | null;
    sources_read: number;
    citations: string[];
    official_domains: string[];
    /** The sub-questions TinyResearch set itself for this run. */
    questions: string[];
  };
  fx: { base: "USD"; date: string | null; source: string; rates: Record<string, number> } | null;
  checked_at: string;
  endpoints_used: { name: string; how: string }[];
  warnings: string[];
}
