"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LandingExample, LandingRow } from "../../lib/landing";

export interface PlacePhoto {
  place: string;
  src: string;
  w: number;
  h: number;
  alt: string;
}

const STEPS = [
  { title: "One business, three streets.", text: "You say what you want to open and where. Mappy asks every place the same question." },
  { title: "Eight headings, every city.", text: "Registration, tax, the licence itself, premises, safety, staff, insurance and renewals. No place looks simpler by skipping one." },
  { title: "Every figure, tied to its page.", text: "Each fee and wait links to the government page it came from, with the date that page was read again." },
  { title: "Then, where to start.", text: "The published numbers pick one place. The research gives its own written pick. When they disagree, you see both." },
];

/**
 * The pinned story: one comparison window stays on screen while four statements change what it shows.
 * On narrow screens and with reduced motion the section is not pinned and the finished state is shown.
 */
export function Story({ example, photos, row }: { example: LandingExample; photos: PlacePhoto[]; row: LandingRow | null }) {
  const track = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(3);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 960px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!wide.matches) {
        setStep(3);
        el.style.setProperty("--sp", "1");
        el.style.setProperty("--fit", "1");
        return;
      }
      const w = win.current;
      if (w) el.style.setProperty("--fit", Math.min(1, (window.innerHeight - 64 - 48) / w.offsetHeight).toFixed(4));
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / span));
      el.style.setProperty("--sp", p.toFixed(4));
      setStep(Math.min(3, Math.floor(p * 4.2)));
    };
    const on = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    wide.addEventListener("change", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      wide.removeEventListener("change", on);
      cancelAnimationFrame(frame);
    };
  }, []);

  const pickIndex = example.places.findIndex((p) => p.name === example.scorecardPick);
  const researchIndex = example.places.findIndex((p) => p.name === example.researchPick);
  const quoteCol = row ? example.places.findIndex((p) => p.name === row.place) : -1;

  return (
    <div className="story" ref={track} data-step={step}>
      <div className="story-stage">
        <div className="story-copy">
          {STEPS.map((s, i) => (
            <div key={s.title} className={`story-step ${i === step ? "now" : ""} ${i < step ? "past" : ""}`}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
          <div className="story-dots" aria-hidden="true">
            {STEPS.map((s, i) => <span key={s.title} className={i <= step ? "on" : ""} />)}
          </div>
        </div>

        <div className="story-window" data-ui ref={win}>
          <div className="sw-query">
            <span className="sw-q-activity">{example.activity}</span>
          </div>
          <div className="sw-grid" style={{ "--cols": example.places.length } as React.CSSProperties}>
            <div className="sw-corner" />
            {example.places.map((p, i) => {
              const ph = photos.find((x) => x.place === p.name);
              return (
                <div key={p.name} className={`sw-head ${step >= 3 && i === pickIndex ? "pick" : ""}`}>
                  {ph ? (
                    <div className="sw-photo">
                      <Image src={ph.src} width={ph.w} height={ph.h} alt={ph.alt} sizes="(max-width: 960px) 30vw, 220px" />
                    </div>
                  ) : null}
                  <p className="sw-place">{p.name}</p>
                  <p className="sw-verdict">
                    {i === pickIndex ? "Easiest on the numbers" : i === researchIndex ? "Researcher’s pick" : " "}
                  </p>
                </div>
              );
            })}

            {example.matrix.map((m, r) => (
              <div key={m.id} className="sw-row" style={{ "--r": r } as React.CSSProperties}>
                <p className="sw-cat">{m.label}</p>
                {m.cells.map((c, i) => (
                  <div key={i} className={`sw-cell ${step >= 3 && i === pickIndex ? "pick" : ""} ${row && c && r === example.matrix.findIndex((x) => x.id === "activity_licence") && i === quoteCol ? "quoted" : ""}`}>
                    {c ? (
                      <>
                        <p className="sw-name">{c.name}</p>
                        <p className="sw-figs">
                          <span className={c.fee === "Not published" ? "gap" : ""}>{c.fee}</span>
                          {c.wait ? <span className={c.wait.includes("not published") ? "gap" : ""}>{c.wait}</span> : null}
                        </p>
                        {c.host ? <p className="sw-src">{c.host}</p> : null}
                      </>
                    ) : (
                      <p className="sw-name gap">Nothing published</p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="sw-total">
              <p className="sw-cat">Before you open</p>
              {example.places.map((p, i) => (
                <div key={p.name} className={`sw-cell ${i === pickIndex ? "pick" : ""}`}>
                  <p className="sw-big">{p.steps} steps</p>
                  <p className="sw-figs"><span>{p.fees}</span><span>{p.wait}</span></p>
                </div>
              ))}
            </div>
          </div>

          {row ? (
            <figure className="sw-quote">
              <blockquote>&ldquo;{row.quote}&rdquo;</blockquote>
              <figcaption>
                <a href={row.url} target="_blank" rel="noreferrer">{row.host}</a> · read again {row.checked}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </div>
  );
}
