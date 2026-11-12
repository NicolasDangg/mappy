import Image from "next/image";
import Link from "next/link";
import { CompareForm } from "../components/CompareForm";
import { Headings } from "../components/home/Headings";
import { HeroBoard } from "../components/home/HeroBoard";
import { Motion } from "../components/home/Motion";
import { Story, type PlacePhoto } from "../components/home/Story";
import { Weigh } from "../components/home/Weigh";
import { pickRow, pickSources, toExample } from "../lib/landing";
import { savedComparisons } from "../lib/saved";
import "./home.css";

const PHOTOS: (PlacePhoto & { credit: string; page: string })[] = [
  { place: "Singapore", src: "/photos/shophouse-singapore-04.jpg", w: 1920, h: 1439, alt: "A corner shophouse with tiled pillars and shuttered windows on a quiet Singapore street", credit: "Shophouse Singapore 04, Philip Nalangan, CC BY 4.0", page: "https://commons.wikimedia.org/w/index.php?curid=181952110" },
  { place: "London", src: "/photos/pellicci.jpg", w: 1023, h: 686, alt: "Customers at small tables inside a wood-panelled café in London", credit: "Pellicci, Roy Katzenberg, CC BY 2.0", page: "https://www.flickr.com/photos/14149634@N00/6865551330" },
  { place: "New York City", src: "/photos/the-magnolia-bakery.jpg", w: 1024, h: 683, alt: "The lit windows and awning of a bakery on a New York street", credit: "The Magnolia Bakery, Mike GL, CC BY 2.0", page: "https://www.flickr.com/photos/49481211@N08/5276348140" },
];
const DRONE = { src: "/photos/camera-drone.jpg", w: 1920, h: 1280, alt: "A white camera drone hovering over the sea", credit: "Quadcopter camera drone in flight, Josh Sorenson, CC0", page: "https://commons.wikimedia.org/wiki/File:Quadcopter_camera_drone_in_flight.jpg" };

const QUESTIONS = [
  { q: "Is this legal advice?", a: "No. It is the comparison you choose with, then hand to a lawyer or accountant to confirm before you sign a lease or spend real money." },
  { q: "What if a fee is not on the website?", a: "The row says Not published and the total is shown as a minimum. A missing figure is never guessed, and it never makes a place look cheaper." },
  { q: "How current are the figures?", a: "Every row carries the date its government page was read again. Rules change: if the date is old, run the comparison again." },
  { q: "Which places can I compare?", a: "Any three to five cities, states or countries, for any kind of business: a café, a salon, a food truck, a drone service, a shop. Nothing is pre-loaded." },
  { q: "How long does a comparison take?", a: "Five to twenty minutes. The research reads dozens of government pages for every place. The link keeps working if you close the tab." },
  { q: "Why are there two recommendations?", a: "One is counted from the published steps, fees, waits and renewals. The other is the research's written judgement, which can weigh things the numbers miss. When they split, you see both and why." },
  { q: "Does it check whether a business holds a licence?", a: "No. It reads what each place asks of a new business. Checking a particular company's licences is a different job." },
  { q: "Can I take the results away?", a: "Yes. Every comparison downloads as CSV for a spreadsheet or JSON for software, with the source link and checked date on every row." },
];

export default async function Home() {
  const saved = await savedComparisons();
  const examples = saved.map(toExample);
  const cafe = examples.find((e) => /caf/i.test(e.label)) ?? examples[0];
  const drone = examples.find((e) => e !== cafe);
  const cafeSaved = saved.find((c) => c.id === cafe?.id);
  const row = cafeSaved ? pickRow(cafeSaved) : null;
  const sources = pickSources(examples, 14);
  const pages = examples.reduce((n, e) => n + e.pagesRead, 0);
  const reqs = examples.reduce((n, e) => n + e.requirements, 0);
  const hosts = new Set(examples.flatMap((e) => e.places.flatMap((p) => p.hosts))).size;

  return (
    <div className="home">
      <Motion />

      <nav className="bar" aria-label="Main">
        <Link href="/" className="wordmark" aria-label="Mappy home">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2.5c-4 0-7 3-7 6.9 0 5 7 12.1 7 12.1s7-7.1 7-12.1c0-3.9-3-6.9-7-6.9Z" fill="var(--accent)" /><circle cx="12" cy="9.4" r="2.6" fill="var(--bg)" /></svg>
          Mappy
        </Link>
        <div className="bar-links">
          <a href="#story">How it works</a>
          <a href="#weigh">Decide</a>
          <a href="#sources">Sources</a>
          <a href="#questions">Questions</a>
          <a href="#under">Under the hood</a>
        </div>
        <a href="#start" className="btn btn-small">Compare places</a>
      </nav>

      <header className="hero" data-progress>
        <div className="hero-copy">
          <h1 className="mask" aria-label="Where should your shop open?">
            <span><span>Where should your</span></span>
            <span><span>shop open?</span></span>
          </h1>
          <p className="hero-lead">
            Name your business and three places. Mappy reads each government&apos;s own pages and lines up every licence, fee and wait, so you can see where it&apos;s easiest to start.
          </p>
          <div className="hero-actions">
            <a href="#start" className="btn">Compare your three places</a>
            {cafe ? <Link href={`/c/${cafe.id}`} className="textlink">See a finished comparison</Link> : null}
          </div>
        </div>
        <div className="hero-stage">
          {examples.length ? <HeroBoard examples={examples} /> : null}
        </div>
      </header>

      <main>
        <section className="facts" aria-label="What the examples on this page are built from">
          <p data-in><strong>{pages}</strong> government pages read</p>
          <p data-in style={{ "--i": 1 } as React.CSSProperties}><strong>{reqs}</strong> requirements lined up</p>
          <p data-in style={{ "--i": 2 } as React.CSSProperties}><strong>{hosts}</strong> official sites cited</p>
          <p data-in style={{ "--i": 3 } as React.CSSProperties}><strong>0</strong> figures guessed</p>
        </section>

        {cafe ? (
          <section id="story" className="sec-story" aria-labelledby="h-story">
            <div className="wrap story-intro">
              <h2 id="h-story" data-in>{cafe.places.reduce((n, p) => n + p.hosts.length, 0)} government sites, one table</h2>
              <p data-in style={{ "--i": 1 } as React.CSSProperties}>Here is a real comparison for a thirty-seat café, built the way yours will be. Scroll to watch it come together.</p>
            </div>
            <Story example={cafe} photos={PHOTOS} row={row} />
          </section>
        ) : null}

        {examples.length ? (
          <section id="weigh" className="sec sec-weigh" aria-labelledby="h-weigh">
            <div className="wrap">
              <div className="weigh-intro">
                <h2 id="h-weigh" data-in>Weigh what matters to you</h2>
                <p data-in style={{ "--i": 1 }  as React.CSSProperties}>Short on cash, or short on time? Move the sliders and the places re-rank from their published figures. A figure a government doesn&apos;t publish counts against that place, never for it.</p>
              </div>
              <div data-in style={{ "--i": 2 } as React.CSSProperties}>
                <Weigh examples={examples} />
              </div>
            </div>
          </section>
        ) : null}

        {cafe ? (
          <section className="sec sec-cmd" aria-labelledby="h-cmd">
            <div className="wrap">
              <h2 id="h-cmd" className="sr-only">The eight headings every place answers</h2>
              <p className="cmd-intro" data-in>Every place answers the same eight headings, so nothing hides in the gaps.</p>
              <Headings example={cafe} />
            </div>
          </section>
        ) : null}

        {sources.length ? (
          <section id="sources" className="sec sec-sources" aria-labelledby="h-sources">
            <div className="wrap tiles">
              <div className="tile tile-head" data-in>
                <h2 id="h-sources">Read at the source</h2>
                <p>Only government sites count as a source. These are the ones behind the examples on this page.</p>
              </div>
              {sources.map((s, i) => (
                <div key={s.host} className="tile" data-in style={{ "--i": (i % 4) + 1 } as React.CSSProperties}>
                  <p className="tile-host">{s.host}</p>
                  <p className="tile-place"><Image src={`/logos/${s.host}.png`} width={28} height={28} alt="" unoptimized />{s.place}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {cafe && drone ? (
          <section className="sec sec-examples" aria-labelledby="h-examples">
            <div className="wrap">
              <h2 id="h-examples" data-in>Two businesses, already compared</h2>
              <div className="examples">
                {[{ e: cafe, ph: PHOTOS[1] }, { e: drone, ph: DRONE }].map(({ e, ph }, i) => (
                  <Link key={e.id} href={`/c/${e.id}`} className="example" data-in data-progress style={{ "--i": i + 1 } as React.CSSProperties}>
                    <div className="example-photo">
                      <Image src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} sizes="(max-width: 900px) 100vw, 50vw" />
                    </div>
                    <div className="example-text">
                      <h3>{e.label}</h3>
                      <p>{e.places.map((p) => p.name).join(", ")}</p>
                      <p className="example-figs">{e.requirements} requirements · {e.pagesRead} pages read · {e.researchPick ? `research leans to ${e.researchPick}` : "no clear winner"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="questions" className="sec sec-faq" aria-labelledby="h-faq">
          <div className="wrap faq">
            <h2 id="h-faq" data-in>Fair questions</h2>
            <div className="faq-list">
              {QUESTIONS.map((x, i) => (
                <details key={x.q} name="faq" open={i === 0} data-in style={{ "--i": Math.min(i, 4) } as React.CSSProperties}>
                  <summary>{x.q}<span className="plus" aria-hidden="true" /></summary>
                  <p>{x.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="sec-cta" aria-labelledby="h-start">
          <div className="cta-row">
            <div className="cta-side cta-photo" data-progress>
              <Image src={PHOTOS[0].src} width={PHOTOS[0].w} height={PHOTOS[0].h} alt={PHOTOS[0].alt} sizes="20vw" />
            </div>
            <div className="cta-main" data-in>
              <div className="cta-copy">
                <h2 id="h-start">Ask about your own three places</h2>
                <p>Say what you want to open and where. In five to twenty minutes you get every licence, fee and wait side by side, with a pick for where to start.</p>
              </div>
              <CompareForm />
            </div>
            <div className="cta-side cta-field" aria-hidden="true" />
          </div>
        </section>

        <section id="under" className="sec sec-under" aria-labelledby="h-under">
          <div className="under">
            <div className="under-head">
              <h2 id="h-under" data-in>Under the hood</h2>
              <p className="under-lead" data-in style={{ "--i": 1 } as React.CSSProperties}>Government sites have no API, so Mappy reads them the way a careful person would, with three TinyFish tools and a scorecard you can audit.</p>
            </div>

            <div className="under-grid">

            <div className="stage" data-in style={{ "--i": 0 } as React.CSSProperties}>
              <p><strong>To begin, TinySearch finds the official sites.</strong> Before any research is paid for, it searches for the government domains that cover your activity in each place. Those domains steer the research and decide what counts as an official source.</p>
              <div className="evidence" data-ui>
                {(cafe?.places ?? []).map((p) => (
                  <div key={p.name} className="ev-hosts">
                    <span className="ev-place">{p.name}</span>
                    {p.hosts.slice(0, 4).map((h) => <span key={h} className="ev-chip">{h}</span>)}
                  </div>
                ))}
              </div>
            </div>

            <div className="stage" data-in style={{ "--i": 1 } as React.CSSProperties}>
              <p><strong>Then, TinyResearch does the reading.</strong> One deep run reads the rules for every place against the same eight headings. It sets its own questions as it goes; these are a few it asked for the café.</p>
              <div className="evidence" data-ui>
                <ul className="ev-questions">
                  {(cafe?.questions ?? []).slice(0, 4).map((q) => <li key={q}>{q}</li>)}
                </ul>
              </div>
            </div>

            <div className="stage" data-in style={{ "--i": 0 } as React.CSSProperties}>
              <p><strong>After that, TinyFetch checks every source.</strong> It opens every cited page again and looks for the quoted fee, wait and wording on it. That is where each row&apos;s checked date and its confirmed mark come from.</p>
              {row ? (
                <div className="evidence ev-check" data-ui>
                  <p className="ev-row"><span>{row.name}</span><span className="ev-ok">Confirmed on page</span></p>
                  <p className="ev-sub">{row.host} · read again {row.checked}</p>
                </div>
              ) : null}
            </div>

            <div className="stage" data-in style={{ "--i": 1 } as React.CSSProperties}>
              <p><strong>Finally, the scorecard ranks.</strong> Each place is ranked on mandatory steps, published upfront fees in US dollars, the longest published wait and the number of recurring filings. Ranks are added and the lowest total wins. Unpublished figures count as worst, never as cheap.</p>
            </div>

            <div className="stage stage-wide" data-in>
              <p><strong>Use it from your own code.</strong> Start a comparison, then poll until it&apos;s ready. Or run it from the command line.</p>
              <pre className="code"><code>{`curl -X POST /api/compare \\
  -H "Content-Type: application/json" \\
  -d '{"activity": "Open a small café",
       "places": ["Singapore", "London, UK", "New York City"]}'

# 202 → { "id": "01a1…", "poll": "/api/compare/01a1…" }
curl /api/compare/01a1…          # QUEUED → RUNNING → the comparison JSON

npm run compare -- "Open a small café" "Singapore" "London, UK" "New York City"`}</code></pre>
            </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <p className="foot-word" aria-hidden="true">Mappy</p>
        <div className="foot-line">
          <p>Where to set up, from the source. Not legal advice.</p>
          <p className="foot-links">
            {examples.map((e) => <Link key={e.id} href={`/c/${e.id}`}>{e.label}</Link>)}
            <a href="#under">Built on TinyFish</a>
          </p>
          <p>© 2026 Mappy</p>
        </div>
        <p className="foot-credits">
          Photographs show the places, not any business on this page:{" "}
          {[...PHOTOS, DRONE].map((ph, i) => (
            <span key={ph.src}>{i ? " · " : ""}<a href={ph.page} target="_blank" rel="noreferrer">{ph.credit}</a></span>
          ))}
          . Logos are the sites&apos; own icons, shown to identify the source.
        </p>
      </footer>
    </div>
  );
}
