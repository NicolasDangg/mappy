# DESIGN.md: The Pudding (pudding.cool)

## Limitations (read first)
- Evidence was a Firecrawl `branding` + `images` scrape, a Firecrawl markdown page capture, and a single 1920x1080 viewport screenshot. No raw HTML or CSS was fetched, so there are no CSS variables, exact class names, or hover/transition values.
- The requested full-page screenshot did not come back as an image (the `--full-page-screenshot` flag returned markdown, and `--format screenshot` returned a viewport capture only). Layout below covers the first screen of the homepage, not the full scroll length.
- Font family names come from Firecrawl `branding`. They were not confirmed against loaded font files, and the two commercial families (Gooper, Atlas) may be self-hosted or licensed. Fallback stacks are as Firecrawl reported them.
- Font sizes reported by `branding` (h1 16px, h2 16px, body 14px) conflict with the screenshot, where story titles are roughly 30px. Treat the reported sizes as unreliable and use the measured values in the Typography section.
- Story thumbnails rendered as flat colour blocks in the capture, so the real imagery treatment could not be verified. The `images` list gives URLs only.
- Pixel measurements are approximate and taken from the 1920px-wide screenshot.
- Raw scrape artifacts are in `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/` (branding JSON, page markdown, screenshot PNG). Nothing else was written to the project.
- Logos, thumbnails, stickers and copy belong to The Pudding. Using them in a new build needs the owner's permission.

## Source
- URL: https://pudding.cool
- Capture date: 2026-11-12
- Evidence: Firecrawl `scrape --format branding,images` (scrape ID 01a1ce7c-e48b-74b9-a83b-360d28e8ff3f, HTTP 200, `colorScheme: light`, confidence overall 0.77); Firecrawl markdown page capture (scrape ID 01a1ce7d-fc61-754a-abf1-b96287282f5a); Firecrawl viewport screenshot (scrape ID 01a1ce81-4f43-71cb-9abd-11ada108f728), 1920x1080.

## Reference Screenshot
![First-screen viewport screenshot of pudding.cool](/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/pudding-screenshot.png)

Use this screenshot as the visual reference for layout, hierarchy, density and feel. It shows the header, filter bar and first row of story cards only. The tokens below describe the same page in machine-readable form.

## Design Summary
The Pudding is a white, editorial, data-journalism homepage: a strict three-column grid of square story thumbnails, each with a boxed issue number and a monospaced date, then a bold serif title and a grey one-line dek. The voice is playful, shown in the lowercase story titles, the sticker-style logo and a sticker-set of small illustrated PNG icons. Chrome is minimal: uppercase monospaced navigation, thin pill outlines and no shadows on the page itself. An agent should recreate calm white space, one strong serif headline face, monospaced metadata, square image cards, and a single bright accent colour used sparingly.

## Design Tokens

### Colors
Values below are from the Firecrawl `branding` output unless marked as inferred.

| Role | Value | Source |
|---|---|---|
| Background | `#FFFFFF` | branding + screenshot |
| Primary text | `#262626` | branding |
| Primary (brand red) | `#E92420` | branding; matches the first card block in the screenshot by eye |
| Secondary (purple) | `#9A4CAD` | branding |
| Accent / link (magenta) | `#DF20DF` | branding; links are reported as this value |
| Input border | `#ACACAC` | branding |
| Card placeholder hues (observed by eye, not sampled) | red, mustard/gold, magenta, purple, yellow, pink | screenshot |

Notes: the reported primary, secondary and accent colours are the brand palette, not page chrome. The chrome is almost entirely black text on white. Use the saturated colours for story thumbnails and the occasional highlight only. Mustard and pink card hues were not in the branding output and are observation-only.

### Typography
- Display / headline family: `Gooper Semi Condensed` (serif). Stack: `"Gooper SemiCondensed", "Iowan Old Style", "Times New Roman", Times, serif`. Used for story titles (bold, lowercase, for example "afterlife of pi").
- Body / dek family: `Atlas Grotesk` (sans). Stack: `"Atlas Grotesk", -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif`. Used for the tagline and story descriptions (grey).
- Monospace / metadata family: `Atlas Typewriter`. Used for navigation (uppercase, letter-spaced), issue numbers, dates and the search field.
- Measured sizes (screenshot, approximate): story title about 30px bold serif; dek about 16px sans, grey (around `#666`, inferred); nav and metadata about 12-13px monospaced uppercase. The 16/16/14px values from `branding` were not confirmed.
- Weights observed: bold for titles; regular elsewhere.
- Line height for two-line deks: about 1.35-1.4 (inferred from the 23px line spacing at about 16px).
- Fallback recommendation if the commercial fonts are unavailable: Georgia-style bold serif for titles and a monospaced system face (for example `ui-monospace, Menlo, Consolas, monospace`) for metadata.

### Spacing And Layout
- Content column: about 1248px wide (x 336 to 1583 at a 1920px viewport), centred. Side margin about 336px at 1920px, so the column is roughly 65% of the viewport at this width. Responsive breakpoints were not observed.
- Grid: 3 equal columns, each about 394px, with a gutter of about 32px.
- Thumbnails: square (394x394), no radius, no border, no shadow.
- Card meta row: issue number in a pill (1px dark outline, fully rounded, about 56x30px) on the left; date in monospaced uppercase on the right; gap about 16px above the thumbnail.
- Vertical rhythm: the next row starts about 170px below the first row's meta (inferred from y=275 to y=861 in the screenshot, which includes the thumbnail and text block).
- Header: tagline at left, logo centred, filter/search row below with navigation at right. Header occupies roughly the top 230px.
- Radius: 0 on thumbnails and page blocks; 6px on the search input (from branding); 2px reported for the primary button; full round for the issue-number pill.
- Shadows: the search input has a soft drop shadow, `rgba(0,0,0,0.3) 0 2px 1px 0`; no other shadows observed.
- Borders: thin dark outline on issue pills; grey `#ACACAC` on inputs.

## Components

### Header
- Left: small sans tagline "A digital publication that..." followed by bold "explains ideas with visual essays" (from the markdown capture).
- Centre: the wordmark logo, a black script "The Pudding" with a white sticker outline and drop shadow (SVG, cannot be reproduced exactly from the evidence; use a placeholder or the owner's asset).
- Right: uppercase monospaced nav: OUR FAVES, POPULAR, UPDATING, YOUR INPUT, VIDEO, AUDIO. Each has a small sticker icon (PNG, @2x) in the markdown capture.
- Search: text input with placeholder "Find a story...", white background, 6px radius, grey border, soft 2px shadow, about 168px wide.

### Story card
- Top row: issue pill (for example "#228") left, monospaced date right.
- Image: square thumbnail, full card width.
- Title: lowercase bold serif, about 30px.
- Dek: sans, grey, one to two lines, about 16px.
- The whole card links to the story. Hover state not observed.

### Filter tabs
- Plain uppercase monospaced text links (OUR FAVES, POPULAR, UPDATING, YOUR INPUT, VIDEO, AUDIO), with an "All" option in the markdown capture. Active or hover states were not observed.

### Buttons and CTAs
- "Load More Stories" at the bottom of the list (text, from markdown).
- "Shop our swag" link to an external merch store (from markdown).
- The `branding` primary button: white background, `#262626` text, 2px radius, no shadow. This is the only button data available and it is low confidence (0.67).

### Footer / merch block
- Section headline in a playful sans: "If you like our stories, you'll love our merch".
- Three product images: a dark tee and two sticker mockups (PNG).

### Form inputs
- White background, `#262626` text, 1px `#ACACAC` border, 6px radius, soft shadow.

## Page Patterns
- Section order seen on the homepage: header (tagline, logo, search, nav) -> filter tabs -> story grid (3 columns, reverse-chronological, issue numbers descending) -> "Load More Stories" -> merch block.
- Pagination is "Load More", not numbered pages.
- Grid pattern: card meta row, square image, serif title, grey dek.
- Responsive behaviour was not captured. The three-column grid is the desktop layout; expect a collapse to one or two columns on narrower screens, but this is inferred, not observed.

## Content Style
- Voice: playful and approachable, with lowercase titles ("kevin bacon", "lo-pi radio") and short, concrete deks that describe the question or the finding ("Are you more likely to die on your birthday? Yes.").
- Heading style: lowercase, bold serif, no terminal punctuation.
- Metadata: issue numbers as "#NNN" and dates as "MMM YYYY" in uppercase monospace.
- CTA wording is low-key: "Load More Stories", "Shop our swag", "Find a story...".
- Copy density: sparse. One dek per story and very little chrome text.

## Agent Build Instructions
1. Build a single white page (`#FFFFFF`) with `#262626` body text. Use the brand colours only for story thumbnails and rare accents, not for page chrome.
2. Load three font families if available: a bold semi-condensed serif for titles, a grotesk sans for body and deks, and a monospaced face for nav, dates and issue numbers. Use the fallback stacks above if they are not.
3. Centre a content column of about 1248px at desktop width (about 65% of a 1920px viewport), with a 3-column grid and a 32px gutter.
4. For each story card: a row with a fully rounded 1px-outlined pill ("#228") on the left and an uppercase monospaced date on the right; a square thumbnail with no radius or shadow; a lowercase bold serif title at about 30px; and a grey sans dek at about 16px.
5. Header: left tagline, centred logo (use a placeholder wordmark, not the real logo), right uppercase monospaced nav with small icons. Put a white search input under the header on the left, with a 6px radius, grey border and soft shadow.
6. Use no radius on images and page blocks. Use no shadows except on inputs.
7. End the list with a centred text button ("Load More Stories") and a merch block with a playful sans headline.
8. Keep copy short and lowercase for titles. Do not reuse The Pudding's logo, thumbnails, stickers or story copy without permission.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://pudding.cool
target_stack: not specified (design reference only)
output: /Users/nicolasdangg/dev/tiny-fish-bounties/compliance-map/designs/design_pudding.md
