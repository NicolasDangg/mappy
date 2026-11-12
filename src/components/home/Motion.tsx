"use client";

import { useEffect } from "react";

/**
 * The page's motion layer, armed only once script runs (without it nothing is hidden).
 * - [data-in]: rises in once when it enters the viewport; siblings stagger through --i.
 *   Marked with a data attribute, not a class, so React re-rendering className can't undo it.
 * - [data-progress]: gets --p, 0 → 1 as the element travels through the viewport (for scroll-linked moves).
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("[data-in]").forEach((el) => io.observe(el));

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-progress]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of tracked) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const p = reduce.matches ? 0.5 : Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
        el.style.setProperty("--p", p.toFixed(4));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
