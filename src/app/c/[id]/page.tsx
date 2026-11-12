import Link from "next/link";
import { ComparisonView } from "../../../components/ComparisonView";
import { LiveComparison } from "../../../components/LiveComparison";
import { savedComparison } from "../../../lib/saved";

export default async function Page({ params, searchParams }: PageProps<"/c/[id]">) {
  const { id } = await params;
  const official = (await searchParams).official;
  const saved = await savedComparison(id);
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
      <nav className="flex h-12 items-center justify-between" aria-label="Main">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-ink no-underline">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2.5c-4 0-7 3-7 6.9 0 5 7 12.1 7 12.1s7-7.1 7-12.1c0-3.9-3-6.9-7-6.9Z" fill="var(--accent)" /><circle cx="12" cy="9.4" r="2.6" fill="var(--bg)" /></svg>
          Mappy
        </Link>
        <Link href="/#start" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[var(--accent-deep)]">Compare your own places</Link>
      </nav>
      <div className="mt-8">{saved ? <ComparisonView c={saved} /> : <LiveComparison id={id} official={typeof official === "string" ? official : ""} />}</div>
    </main>
  );
}
