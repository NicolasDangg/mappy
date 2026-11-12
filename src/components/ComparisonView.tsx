import { CATEGORIES, type CheckStatus, type Comparison, type Requirement } from "../lib/types";

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "unknown date");
const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const CHECK: Record<CheckStatus, { label: string; tone: string }> = {
  confirmed: { label: "Confirmed on page", tone: "bg-ok-bg text-ok" },
  page_live: { label: "Page live, figure not found", tone: "bg-warn-bg text-warn" },
  unreachable: { label: "Page did not load", tone: "bg-bad-bg text-bad" },
  not_official: { label: "Not a government site", tone: "bg-bad-bg text-bad" },
  no_source: { label: "No source", tone: "bg-bad-bg text-bad" },
};

const STATUS: Record<Requirement["status"], { label: string; tone: string }> = {
  mandatory: { label: "Mandatory", tone: "text-ink" },
  conditional: { label: "Conditional", tone: "text-warn" },
  not_required: { label: "Not required", tone: "text-muted" },
  unclear: { label: "Unclear", tone: "text-bad" },
};

function RequirementCard({ r }: { r: Requirement }) {
  const check = CHECK[r.check.status];
  const status = STATUS[r.status];
  if (r.placeholder)
    return (
      <div className="rounded-md border border-dashed border-line p-3 text-sm">
        <p className="font-medium text-bad">Nothing found</p>
        <p className="mt-1 text-muted">{r.gaps}</p>
      </div>
    );
  return (
    <div className="min-w-0 break-words rounded-md border border-line bg-surface p-3 text-sm">
      <p className={`text-xs font-medium uppercase tracking-wide ${status.tone}`}>
        {status.label}
        {r.condition ? <span className="normal-case tracking-normal text-muted">: {r.condition}</span> : null}
      </p>
      <p className="mt-1 font-semibold leading-snug">{r.name}</p>
      {r.authority ? <p className="text-muted">{r.authority}</p> : null}
      <dl className="mt-2 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-2 gap-y-1">
        <dt className="text-muted">Fee</dt>
        <dd>{r.fee.text ?? (r.fee.amount != null && r.fee.currency ? money(r.fee.amount, r.fee.currency) : <span className="text-bad">Not published</span>)}{r.fee.basis && r.fee.text ? <span className="text-muted"> ({r.fee.basis})</span> : null}</dd>
        <dt className="text-muted">Wait</dt>
        <dd>{r.processing_time.text ?? <span className={r.status === "not_required" ? "text-muted" : "text-bad"}>{r.status === "not_required" ? "n/a" : "Not published"}</span>}</dd>
        {r.renewal.period || r.renewal.fee_text ? (
          <>
            <dt className="text-muted">Renewal</dt>
            <dd>{[r.renewal.period, r.renewal.fee_text].filter(Boolean).join(", ")}</dd>
          </>
        ) : null}
      </dl>
      {r.gaps ? <p className="mt-2 rounded bg-warn-bg px-2 py-1 text-warn">Gap: {r.gaps}</p> : null}
      <div className="mt-2 border-t border-line pt-2">
        {r.source_url ? (
          <a href={r.source_url} target="_blank" rel="noreferrer" className="break-all text-accent underline">
            {new URL(r.source_url).hostname.replace(/^www\./, "")}
            {new URL(r.source_url).pathname.length > 1 ? new URL(r.source_url).pathname.slice(0, 48) : ""}
          </a>
        ) : null}
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`rounded px-1.5 py-0.5 font-medium ${check.tone}`}>{check.label}</span>
          <span className="text-muted">checked {day(r.check.checked_at)}</span>
        </p>
        {r.check.note ? <p className="mt-1 text-xs text-muted">{r.check.note}</p> : null}
      </div>
    </div>
  );
}

export function ComparisonView({ c }: { c: Comparison }) {
  const cols = { gridTemplateColumns: `10rem repeat(${c.places.length}, minmax(0, 1fr))` };
  const tableWidth = { minWidth: `${10 + c.places.length * 16}rem` };
  const rec = c.recommendation;
  const rows: { label: string; cell: (i: number) => React.ReactNode }[] = [
    { label: "Mandatory steps before opening", cell: (i) => c.places[i].summary.mandatory_steps },
    { label: "Conditional steps", cell: (i) => c.places[i].summary.conditional_steps },
    {
      label: "Published upfront fees",
      cell: (i) => {
        const s = c.places[i].summary;
        return (
          <>
            {s.upfront.length ? s.upfront.map((m) => money(m.amount, m.currency)).join(" + ") : s.fees_unpublished ? "Not published" : "None"}
            {s.upfront_usd != null && s.upfront.some((m) => m.currency !== "USD") ? <span className="text-muted"> (about US${Math.round(s.upfront_usd).toLocaleString("en-US")})</span> : null}
            {s.fees_unpublished ? <span className="block text-xs text-warn">{s.fees_unpublished} fee{s.fees_unpublished === 1 ? "" : "s"} not published: this is a floor</span> : null}
          </>
        );
      },
    },
    {
      label: "Longest published wait",
      cell: (i) => {
        const s = c.places[i].summary;
        return (
          <>
            {s.longest_wait_days != null ? (s.longest_wait_min_days != null && s.longest_wait_min_days < s.longest_wait_days ? `${s.longest_wait_min_days} to ${s.longest_wait_days} days` : `${s.longest_wait_days} days`) : "Not published"}
            {s.longest_wait_item ? <span className="block text-xs text-muted">{s.longest_wait_item}</span> : null}
            {s.times_unpublished ? <span className="block text-xs text-warn">{s.times_unpublished} time{s.times_unpublished === 1 ? "" : "s"} not published</span> : null}
          </>
        );
      },
    },
    { label: "Recurring filings and renewals", cell: (i) => c.places[i].summary.ongoing_items },
    { label: "Flagged gaps", cell: (i) => c.places[i].summary.gaps },
    { label: "Sources confirmed on re-reading", cell: (i) => `${c.places[i].summary.sources_confirmed} of ${c.places[i].summary.sources_total}` },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">Where is it easiest to</p>
        <h1 className="mt-1 max-w-4xl text-3xl font-semibold leading-tight tracking-tight">{c.activity}</h1>
        <p className="mt-2 text-sm text-muted">
          {c.places.map((p) => p.place).join(" · ")}. Sources re-read {day(c.checked_at)}. Not legal advice: use it to choose, then confirm with a lawyer.
        </p>
      </header>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Recommendation</h2>
        <p className="mt-1 text-2xl font-semibold">{rec.agree === false ? `${rec.easiest} on the numbers, ${rec.research?.easiest} on the research's reading` : rec.easiest ? `Easiest to start: ${rec.easiest}` : rec.research?.easiest ? `The research favours ${rec.research.easiest}; the numbers are tied` : "No clear winner"}</p>
        {rec.agree === false ? (
          <p className="mt-2 rounded bg-warn-bg px-3 py-2 text-sm text-warn">The two views disagree. The scorecard only counts figures the governments publish; the research also weighs things that have no number, such as steps that depend on each other. Read both before choosing.</p>
        ) : null}
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Measured scorecard</h3>
            <ol className="mt-2 space-y-3 text-sm">
              {rec.ranking.map((r, i) => (
                <li key={r.place}>
                  <p className="font-medium">{i + 1}. {r.place} <span className="font-normal text-muted">(rank total {r.score}, lower is easier)</span></p>
                  <ul className="mt-1 list-disc pl-5 text-muted">{r.why.map((w) => <li key={w}>{w}</li>)}</ul>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">{rec.method}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">What the research says{rec.research?.easiest ? `: ${rec.research.easiest}` : ""}</h3>
            {rec.research ? (
              <>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{rec.research.reasons.map((w) => <li key={w}>{w}</li>)}</ul>
                {rec.research.trade_offs.length ? (
                  <>
                    <h4 className="mt-3 text-sm font-semibold">Trade-offs</h4>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{rec.research.trade_offs.map((w) => <li key={w}>{w}</li>)}</ul>
                  </>
                ) : null}
              </>
            ) : <p className="mt-2 text-sm text-muted">The research gave no written recommendation.</p>}
          </div>
        </div>
        {rec.caveats.length ? (
          <div className="mt-4 border-t border-line pt-3">
            <h3 className="text-sm font-semibold">Before you rely on this</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">{rec.caveats.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Side by side</h2>
        <div className="mt-3 overflow-x-auto">
          <div style={tableWidth}>
            <div className="sticky top-0 z-10 grid gap-3 border-b border-line bg-bg py-2 text-sm font-semibold" style={cols}>
              <div />
              {c.places.map((p) => <div key={p.place}>{p.place}</div>)}
            </div>
            {rows.map((row) => (
              <div key={row.label} className="grid gap-3 border-b border-line py-2 text-sm" style={cols}>
                <div className="text-muted">{row.label}</div>
                {c.places.map((p, i) => <div key={p.place} className="min-w-0 font-medium">{row.cell(i)}</div>)}
              </div>
            ))}
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="grid gap-3 border-b border-line py-4" style={cols}>
                <div>
                  <p className="text-sm font-semibold">{cat.label}</p>
                  <p className="mt-1 text-xs text-muted">{cat.hint}</p>
                </div>
                {c.places.map((p) => (
                  <div key={p.place} className="min-w-0 space-y-2">
                    {p.requirements.filter((r) => r.category === cat.id).map((r) => <RequirementCard key={r.id} r={r} />)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">How this was made</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {c.endpoints_used.map((e) => <li key={e.name}><span className="font-semibold">{e.name}.</span> <span className="text-muted">{e.how}</span></li>)}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Research run {c.research.run_id.slice(0, 8)} read {c.research.sources_read} pages and finished {day(c.research.completed_at)}.
            {c.fx?.date ? ` Currency conversion uses European Central Bank reference rates of ${c.fx.date}.` : " No exchange rates were available, so totals are not converted."}
          </p>
          {c.warnings.length ? <ul className="mt-2 list-disc pl-5 text-sm text-warn">{c.warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Take it with you</h2>
          <p className="mt-2 text-sm">
            <a className="text-accent underline" href={`/api/compare/${c.id}`}>JSON</a> · <a className="text-accent underline" href={`/api/compare/${c.id}?format=csv`}>CSV</a>
          </p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium">Read the full research report</summary>
            <pre className="mt-2 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-3 font-sans text-sm leading-relaxed">{c.report_markdown}</pre>
          </details>
        </div>
      </section>
    </div>
  );
}
