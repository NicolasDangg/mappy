# Mappy

Where should I set up? Give it one activity and three to five places. It returns every licence,
filing, fee and wait lined up side by side, each linked to the official government page it came from
and re-checked on the day, plus a recommendation for where it is easiest to start.

Built for the TinyFish launch bounty "Compliance Map" (brief in [docs/BRIEF.md](docs/BRIEF.md)).
It is a comparison to choose with, then hand to a lawyer. It is not legal advice, and it does not
check whether a person or business holds a licence.

## How TinyFish is used

| Step | Endpoint | What it does here |
| - | - | - |
| 1 | **TinySearch** | Finds the government sites that cover the activity in each place, before any research is paid for. Those hosts steer the research and define what counts as an official source. |
| 2 | **TinyResearch** | The core. One deep run reads the official rules for every place against the same eight categories and returns a cited report, ending in a JSON block with one entry per requirement (fee, time, renewal, source URL, verbatim quote, gaps). The brief forbids estimates and non-government sources. |
| 3 | **TinyFetch** | Re-reads every cited page live and tests each fee, processing time and quote against the page text. This produces the checked date and the confirmed / not confirmed mark on every row. |

After that, plain code: published fees are totalled per currency (converted to USD with European
Central Bank reference rates), the longest published wait is found, and places are ranked on four
measured things. The research's own written recommendation is shown next to that ranking, and the
page says so when the two disagree.

## What keeps it honest

- The same eight categories for every place (`src/lib/types.ts`). A category the research returned
  nothing for becomes a visible "Nothing found" row, never an invented one.
- "Not published" and "unclear" are first-class answers. Unpublished fees are counted, not estimated,
  and a total with unpublished fees is labelled a floor.
- A link that is not on a government domain is marked as such and the item is treated as unconfirmed.
- Nothing is hardcoded per activity or place. The two saved examples in `data/comparisons/` are the
  unedited output of real runs.

## Use it

```bash
npm install
export TINYFISH_API_KEY=...
npm run dev            # http://localhost:3000
```

Command line (prints JSON, or saves an example with `--save name`):

```bash
npm run compare -- "Open a small café that serves hot food" "Singapore" "London, UK" "New York City, USA"
```

API:

```
POST /api/compare            { "activity": "...", "places": ["...", "...", "..."] }  -> 202 { id }
GET  /api/compare/{id}       -> progress while research runs (5 to 20 min), then the comparison
GET  /api/compare/{id}?format=csv
```

Each comparison costs one TinyResearch deep run ($2). Set `COMPARE_PASSCODE` on a public deploy so
only people with the passcode can start new runs; saved examples stay open.

## Tests

```bash
npm test
```
