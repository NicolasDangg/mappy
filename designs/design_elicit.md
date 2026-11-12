# DESIGN.md: Elicit (elicit.com)

## Limitations (read first)
- The Firecrawl `--full-page-screenshot` call did not return a PNG. Its output file contained page markdown, so **no visual screenshot is available** and no layout was checked by eye. Layout notes below come from the markdown structure and CSS only.
- The Firecrawl HTML scrape hit a rate limit, so the page source was fetched directly with `curl` (public page, browser user agent) from `https://elicit.com/welcome`. Values below marked "CSS" come from that HTML/inline CSS. Values marked "branding" come from the Firecrawl `branding` format.
- Spacing scale and exact type sizes could not be fully resolved: the site uses Framer's root-relative `calc(var(--framer-root-font-size, 1rem) * N)` expressions, and the multipliers are listed but not mapped to named roles.
- Dark mode: the page declares `color-scheme: light dark` in metadata, but no dark-theme colour rules were found in the CSS. Treat the site as light-only.
- Brand assets (logo, favicon, fonts, photography) belong to Elicit. Do not reuse them without rights. Only the design tokens are recorded here.

## Source
- URL: https://elicit.com (canonical `https://elicit.com/welcome`, Framer-built site)
- Capture date: 2026-11-12
- Evidence:
  - Firecrawl `branding` + `images` scrape (scrape ID `01a1ce7b-d906-767d-97e0-5cd66222fc56`, confidence overall 0.845, colours 0.71, buttons 0.98)
  - Firecrawl markdown of the homepage (headings, copy, CTAs, section order)
  - Direct HTML/inline CSS fetch of `https://elicit.com/welcome` (colour tokens, font families, font files, breakpoints)

## Design Summary
Elicit looks like a calm, academic publication rather than a typical SaaS landing page. The page sits on a warm off-white paper colour, with text in a deep blue-green ink instead of black. Headings use a classical serif (Martina Plantijn), body copy uses a neutral grotesque (Special Gothic), and labels and meta text use a monospace (DM Mono). A single dark teal carries all primary actions, and a pale lime highlight appears only as a rare accent. The overall tone is professional and low-energy, aimed at students and researchers. An agent recreating this should keep the layout generous and quiet, let the serif headline carry the personality, and avoid bright colours, heavy shadows and gradients.

## Design Tokens

### Colors
Named colour roles. The Framer token names in the CSS are shown where they exist.

| Role | Hex | Source |
|---|---|---|
| Page background (paper) | `#FCFCF8` | branding; CSS token "Light Beige" |
| Primary text / ink | `#083D44` | branding `textPrimary`; CSS token "Dark Forest" (most used colour in CSS, 66 occurrences) |
| Primary / accent / links | `#026370` | branding `primary`, `accent`, `link`; CSS token "True Forest" |
| Secondary text | `#456D71` | branding `secondary` (inferred use: supporting copy) |
| Highlight (lime) | `#E5FF97` | CSS tokens (`#E5FF96`/`#E5FF97` variants). Rare accent. |
| Lime tints | `#F3F6E4`, `#F2F4DC`, `#C6E28B`, `#CFFFE5` | CSS, section tints and highlight accents |
| Neutral surface | `#F6F8F8`, `#E8ECED`, `#E4EAED` | CSS, cards and panels (inferred) |
| Sage | `#A7C7AE` | CSS (inferred decorative use) |
| Deep text variant | `#2F332F`, `#173A43` | CSS (inferred, secondary dark text) |
| Pure white | `#FFFFFF` | CSS |
| Ink at reduced opacity | `#083D44BF` (75%), `#083D4426` (15%), `#FCFCF899` (60%), `#FCFCF840` (25%) | CSS, dividers and muted text (inferred) |

Button colours: primary button background `#026370`, text `#FCFCF8`, radius 8px, no shadow (branding, confidence 0.98).

### Typography
- Heading font: **Martina Plantijn** (Regular, Italic, Bold). Fallback stack: `"Martina Plantijn", sans-serif`. Use a real serif fallback such as Georgia if the font is unavailable. The source uses sans-serif as the fallback, which is probably a weak choice.
- Body font: **Special Gothic** (woff2 from Google Fonts CDN). Fallback: `"Special Gothic", sans-serif`.
- Monospace: **DM Mono** (branding). The CSS also loads IBM Plex Mono and Fragment Mono for code-like blocks, so treat these as secondary.
- Heading and body sizes:
  - H1: 64px (branding). Hero headline: "AI for Scientific Research".
  - Body: 16px (branding and CSS `font-size:16px`).
  - Small label/meta: 12px and 18px appear in CSS. The branding `h2: 14.4px` looks suspicious for an H2 and should be treated as unverified.
  - Framer type scale multipliers in CSS, relative to root size 1rem: x2, x2.5, x2.6, x3, x3.36. Map these to H-levels when recreating. Mapping is not verified.
- Line heights: headings `120%` (most common; `0.7em` also appears, probably for large display text); body `150%` to `160%`; some `1.25em`, `1.4em`, `1.5em`.
- Letter spacing: headings `-0.02em` (tight); body small text `+0.1px` to `+0.15px`; `-0.005em` for some body.
- Weights: the CSS declares 300, 400, 500, 600, 700, 800 and 900. Body and heading weights are not resolved. Recommend 400 for body and Regular serif for headings, with Bold reserved for emphasis.

### Spacing And Layout
- Base unit: 4px (branding `baseUnit`).
- Maximum content width: 1400px (CSS `max-width:1400px`).
- Breakpoints (CSS): 699px, 700px, 999px, 1000px, 1399px, 1400px. Effectively mobile under 700px, tablet 700 to 999px, desktop from 1000px.
- Border radius: 8px (branding button and general), 12px and 6px for smaller elements, 40px for large pill or card shapes (CSS).
- Shadows: none on buttons. No significant box-shadow found in branding. Treat depth as flat and border-driven.
- Dividers and muted surfaces use translucent ink colours (see Colors).
- Section padding and exact gaps could not be measured without a screenshot. Use generous vertical rhythm (roughly 96 to 160px between major sections) as an inferred starting point, and tighten on mobile.

## Components

- **Primary button**: solid `#026370` background, `#FCFCF8` text, 8px radius, no shadow. Label example: "Try now". Single primary style with no gradient.
- **Text link / secondary CTA**: text link in `#026370`, with an arrow-style "Learn more" link under feature blocks. Example: "Read our customer stories" under the logo strip.
- **Eyebrow / section label**: small uppercase or all-caps text in the monospace (DM Mono) style, used for "FEATURES" and the "TRUSTED BY ..." strip.
- **Hero**: left-aligned or centred serif H1 on the paper background, one-sentence subhead ("Elicit helps researchers be 10x more evidence-based"), one primary CTA, then a product visual (screenshot or video) below.
- **Logo / trust strip**: a line of institutional logos under the hero, headed by an eyebrow label.
- **Feature block**: heading, one line of body copy, a bullet list of 3 items with short descriptions, a text link at the bottom. Product screenshot alongside or above with a radius of about 8px to 12px.
- **Product imagery**: UI screenshots of search results and reports, framed on the page with rounded corners. Treat them as the primary imagery style.
- **Input, card, nav, pricing, footer**: not inspected in detail. The homepage markdown contains no pricing or form components. Recommend building these with the same tokens (8px radius, flat, ink-on-paper, teal primary) and mark them as inferred.

## Page Patterns
Observed section order on the homepage (from markdown):
1. Top navigation with logo (wordmark "elicit" SVG in `#083D44`) and CTA.
2. Hero: H1 "AI for Scientific Research", subhead, "Try now" button, looping product video with description.
3. Eyebrow + logo strip: "TRUSTED BY OVER 5 MILLION RESEARCHERS, INCLUDING AT", "Read our customer stories".
4. Feature intro: H2 "Stand on the shoulders of giants" with a one-line subhead.
5. Feature showcase: H2 "Research takes many forms", product screenshot, three-item feature list for the "Research agent", "Learn more" link.
6. Further feature sections follow the same pattern (not all captured).
7. Footer (not captured in full).

Responsive behaviour: the CSS switches layout at 700px and 1000px. Stack feature blocks vertically below 700px. Keep the hero headline readable at mobile width.

## Content Style
- Voice: professional, measured, academic. Confident but not hype-driven. Some claims use concrete numbers ("10x more evidence-based", "7 million researchers" in metadata).
- Headings: short declarative title case or sentence case, often metaphorical ("Stand on the shoulders of giants", "Research takes many forms").
- Subheads: one sentence, plain English, benefit-led.
- CTAs: verb-first and short ("Try now", "Learn more", "Read our customer stories").
- Copy density: low. Lots of whitespace and one idea per block.
- Audience: students, educators, researchers and institutions.

## Agent Build Instructions
1. Set the page background to `#FCFCF8` and body text to `#083D44`. Do not use pure black or white for text.
2. Load Martina Plantijn for headings and Special Gothic for body. Use DM Mono for eyebrows and meta labels. If the serif is unavailable, use a high-quality serif such as Georgia, and keep the body font as a neutral grotesque.
3. Set H1 to around 64px on desktop with 120% line height and -0.02em letter spacing. Scale down proportionally on mobile. Body is 16px at 150% to 160% line height.
4. Use one primary colour `#026370` for buttons and links. Buttons have an 8px radius and no shadow. Use lime `#E5FF97` only for a single highlight per section, if any.
5. Build a 1400px max-width container with a 4px base spacing grid. Switch layouts at 700px and 1000px.
6. Keep sections flat. Use hairline borders or translucent ink dividers rather than heavy shadows or gradients.
7. Structure each feature section as eyebrow, serif H2, one-line subhead, product screenshot with rounded corners, short bullet list, and a text link.
8. Write copy in short, confident, evidence-focused sentences. Use verb-first CTAs.
9. Do not copy Elicit's logos, product screenshots, photography or copyrighted copy. Use placeholders and build your own content in this style.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://elicit.com
target_stack: unspecified (tokens are framework-agnostic)
output: /Users/nicolasdangg/dev/tiny-fish-bounties/compliance-map/designs/design_elicit.md
