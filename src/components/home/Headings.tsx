"use client";

import { useId, useState } from "react";
import type { LandingExample } from "../../lib/landing";

const KEYS = ["B", "T", "L", "P", "S", "Q", "I", "R"];

/** The eight headings set as a large command menu: type to filter, arrows or hover to select, the selection shows what each place asks. */
export function Headings({ example }: { example: LandingExample }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(example.matrix[2]?.id ?? example.matrix[0].id);
  const listId = useId();
  const q = query.trim().toLowerCase();
  const rows = example.matrix.map((m, i) => ({ ...m, key: KEYS[i] })).filter((m) => !q || m.label.toLowerCase().includes(q) || m.hint.toLowerCase().includes(q) || m.cells.some((c) => c?.name.toLowerCase().includes(q)));
  const current = rows.find((r) => r.id === selected) ?? rows[0];

  function move(e: React.KeyboardEvent) {
    if (!rows.length) return;
    const at = Math.max(0, rows.findIndex((r) => r.id === current?.id));
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(rows[Math.min(rows.length - 1, at + 1)].id); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(rows[Math.max(0, at - 1)].id); }
  }

  return (
    <div className="cmd">
      <label className="sr-only" htmlFor={`${listId}-q`}>Search the eight headings</label>
      <input
        id={`${listId}-q`}
        className="cmd-input"
        placeholder="Search the eight headings"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={move}
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={current ? `${listId}-${current.id}` : undefined}
        autoComplete="off"
      />
      <ul className="cmd-list" id={listId} role="listbox" aria-label="Requirement headings">
        {rows.map((m, i) => {
          const on = m.id === current?.id;
          return (
            <li key={m.id} id={`${listId}-${m.id}`} role="option" aria-selected={on} onMouseEnter={() => setSelected(m.id)} onClick={() => setSelected(m.id)} data-in style={{ "--i": i } as React.CSSProperties}>
              <div className="cmd-line">
                <span className="cmd-name">{m.label}</span>
                <kbd>{m.key}</kbd>
              </div>
              <div className="cmd-detail" hidden={!on}>
                <div className="cmd-cells">
                  {m.cells.map((c, k) => (
                    <div key={k}>
                      <p className="cc-place">{example.places[k].name}</p>
                      {c ? (
                        <>
                          <p className="cc-name">{c.name}</p>
                          <p className="cc-figs">{c.fee}{c.wait ? ` · ${c.wait}` : ""}</p>
                        </>
                      ) : (
                        <p className="cc-name">Nothing published, flagged as a gap</p>
                      )}
                    </div>
                  ))}
                </div>
                <p>Covers {m.hint}. A place with nothing published here is flagged as a gap, not skipped.</p>
              </div>
            </li>
          );
        })}
        {!rows.length ? <li className="cmd-empty">No heading matches &ldquo;{query}&rdquo;. Every place is checked for the same eight.</li> : null}
      </ul>
    </div>
  );
}
