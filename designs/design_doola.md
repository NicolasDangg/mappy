# DESIGN.md: doola (www.doola.com)

## Source
- URL: https://www.doola.com (homepage)
- Capture date: 2026-11-12
- Evidence:
  - Firecrawl `branding` + `images` scrape, saved at `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/doola-branding.json` (page metadata, branding block, ~60 image URLs)
  - Firecrawl page markdown (captured alongside the screenshot attempt), saved at `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/doola-page-content.md`
  - Direct `curl` of the homepage was blocked by Cloudflare (HTTP 403 challenge page), so no stylesheet or raw HTML was read. CSS-level values were not verified.

## Limitations
- The Firecrawl screenshot is a 1920x1080 viewport capture (the above-the-fold hero and logo row), not the full page, even though the full-page flag was passed. Sections below the fold are described from the page markdown only. Layout and styling of those sections are less certain.
- The screenshot was saved to `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/doola-fullpage.png`. It is not copied into the project.
- Only the homepage was scraped. Pricing, product, and checkout pages were not inspected.
- Cloudflare blocked direct HTML/CSS access, so exact CSS variables, font weights, container widths, shadows, and motion could not be measured. Values not present in the Firecrawl branding output are marked "not determined".
- Firecrawl reported body text at 11px. That is implausibly small for a marketing page and is likely a measurement artifact. Treat it as low confidence.
- Firecrawl's color confidence is 0.65. Colors below are its reported values and are not confirmed against the stylesheet.
- Logos, product illustrations, founder and reviewer photos, and copy belong to doola and third parties. Do not reuse them in a new site, and do not imply rights to them.

## Reference Screenshot
Above-the-fold capture (1920x1080) saved at `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/doola-fullpage.png`. Use it as the visual reference for the header, hero, and logo row. It is not a full-page capture; see Limitations.

## Design Summary
A restrained, professional fintech/compliance marketing page. The palette is a yellow brand tint (`#F9C800` primary, `#FEF4CC` background) paired with near-black pill buttons and white surfaces. Everything is set in Inter, with large headings and generous whitespace. Components are pill-shaped (fully rounded buttons and inputs) and flat, with no shadows reported. The page is organized as a stack of alternating feature sections, each with a short headline, a checklist of bullets, a link to a product page, and a product UI mockup. Tone is direct, confident, and low-energy, aimed at small businesses. Copy is plain, with occasional wordplay ("doola is for Do'ers").

Recreate: yellow-tinted hero or section backgrounds, black pill primary CTAs, white pill secondary CTAs with a black border, Inter throughout, bold oversized headlines, checklist-style benefits, and card-based product mockups.

## Design Tokens

### Colors
Source: Firecrawl `branding.colors` and `branding.components` (observed values, not stylesheet-verified).

| Role | Value | Notes |
|---|---|---|
| Brand primary | `#F9C800` | Yellow. Likely used for highlights/accents. Exact usage not determined. |
| Accent / link | `#8C6B1A` | Dark gold. Also reported as link color. |
| Background (tinted) | `#FEF4CC` | Pale yellow. Matches the "Backed by" logo band in the screenshot. The hero is a more saturated yellow (approx. `#FDE993` by eye). |
| Text primary | `#141414` | Near-black body and heading text. |
| Button primary bg | `#000000` | Black pill. Text `#FFFFFF`. |
| Button secondary | bg `#FFFFFF`, text `#141414`, border `#000000` | White pill with black outline. |
| Input bg | `#FFFFFF` | |
| Input border | `#D2D2D2` | Neutral gray. |
| Theme color (meta) | `#ffffff` | From page metadata. |
| Trustpilot / rating | not determined | Star graphic is a PNG asset, so hex is unknown. |
| Success / error / focus states | not determined | Not observed in scrape. |

Recommended agent usage: neutral base is white and `#141414`. Use `#F9C800` sparingly for highlights and `#FEF4CC` for tinted bands. Use black for primary CTAs. Do not use the yellow as a button background, since the observed primary button is black.

### Typography
- Font family: **Inter** for headings, body, and paragraphs (Firecrawl detected).
- Fallback stack (as reported): `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif`.
- Heading sizes (reported): H1 `56px`, H2 `50px`. Desktop assumed; responsive values not determined.
- Body size (reported): `11px`. Low confidence; see Limitations. Use 16px for body text in a new build unless verified otherwise.
- Font weights: not determined. Hero headline appears bold/heavy in the page markdown. Confirm before reuse.
- Line height, letter spacing: not determined.

### Spacing And Layout
- Spacing base unit (reported): `4px`.
- Card/container border radius (reported): `24px`.
- Button and input radius: fully rounded pills (`62px` for buttons, `999px` for inputs).
- Shadows: none reported on buttons or inputs.
- Container max width, section padding, grid gaps: not determined.
- Section rhythm: visibly generous vertical spacing between sections in the page markdown. Exact values not determined.

## Components

### Buttons
- **Primary**: black background `#000000`, white text `#FFFFFF`, pill radius (62px), no shadow. Labels are imperative and often include a right arrow icon. Examples: "Start My Business", "Talk to an Expert".
- **Secondary**: white background `#FFFFFF`, `#141414` text, 1px `#000000` border, pill radius (62px), no shadow. Examples: "See Plans & Pricing", "Compare All Features".
- **Text link**: "Log in" in the header, and "More About Formation/Taxes/Bookkeeping/Analytics" links under each feature section (with a chevron/arrow).

### Inputs
- White background, `#141414` text, `#D2D2D2` border, fully rounded pill (999px), no shadow. No input is observed on the homepage. Values come from the branding component block.

### Header / Navigation
- Floating pill-shaped header (white, fully rounded, soft shadow) inset from the page edges, centered on the hero background. Confirmed in the screenshot.
- Left: logo (wordmark "doola" with a yellow slash mark). Center: text nav items "Products" (with chevron), "Formation API", "Affiliate Program", "Resources" (with chevron), "Pricing". Right: "Log in" text link and a black pill "Talk to an Expert" button with an arrow.
- The captured markdown also shows a secondary sticky bar with a "Start My Business" CTA and a close (✕) control. It does not appear in the screenshot.
- Skip link "Skip to main content" is present (accessibility).

### Hero
- Rating row first: Trustpilot stars image, "Excellent", "4.5/5", "2,000+ Reviews".
- H1: "The Easiest Way to Start and Run Your U.S. Business." Set on two lines, centered, heavy weight. The phrase "U.S. Business." is in the darker gold accent color (roughly `#C9A100` by eye; not measured). Confirmed in the screenshot.
- Hero background: saturated pale yellow (roughly `#FDE993` by eye, not measured). This is more saturated than the `#FEF4CC` value reported by Firecrawl, which appears on the logo band below. Use the screenshot as the reference for the hero tint.
- Four-bullet checklist below the H1 (EIN guidance, taxes/compliance managed, real experts, formation guarantee).
- Primary and secondary CTA pair.
- Price line: "Starting at $297/year, plus state fees · No U.S. residency or SSN required".
- Three product mockup cards side-by-side (tax filings, formation tracker, bookkeeping).

### Logo / Trust Row
- "Backed by" label with grayscale or color logo SVGs (Y Combinator, HubSpot, Nexus, Hustle Fund). Logos are third-party trademarks.

### Process (How It Works)
- Section heading: "From Idea to Open for Business in Four Steps."
- Four numbered cards/steps, labeled "01" to "04", each with an icon tag, a title, a short paragraph, and small duration tags with clock icons.

### Feature Rows (Product Sections)
- Repeated pattern for Formation, Taxes, Bookkeeping, Analytics, AI Co-Founder.
- Each: a headline (for example "One Login to Replace Them All." and "We Decoded Taxes So You Don't Have To."), a one-sentence description, a 4-5 item bullet checklist, a text link to the product page, and a product dashboard image (webp/svg).
- Layout (alternate left/right or stacked) was not determined from the markdown.

### Guarantee Block
- Single centered band: "100% Guaranteed Formation or Your Money Back." with a "Approved: money back guarantee" badge image.

### Pricing Cards
- Three tiers as cards: Starter, Tax and Compliance, Business-in-a-Box. Each shows a tier name (uppercase label), a price per year with "+ State Fees", a short tagline, a bullet list of inclusions, a secondary "Compare All Features" link, a primary "Start your business with [Tier]" button, and a "Money-back formation guaranteed" note.
- Prices observed on the page: $297/yr, $1,999/yr, $2,999/yr. A second pricing block in the captured markdown shows Starter at $237/yr. Treat the discrepancy as unresolved; do not hard-code a price.

### Testimonials / Reviews
- Reviewer photo PNG plus Trustpilot stars. Exact card styling not determined.

### Final CTA / Founder
- Closing block with a founder photo (PNG) and a mark SVG ("final-cta-mark.svg"). CTA copy follows the same primary/secondary pattern.

### Footer
- Not captured in the markdown. Not determined.

## Page Patterns
Observed section order on the homepage:
1. Sticky header with logo, Log in, Talk to an Expert, and a secondary CTA bar.
2. Hero: rating row, H1, checklist, CTA pair, price line, three product mockup cards.
3. Backed-by logo row.
4. "Four Steps" process section.
5. Product feature rows: Formation, Taxes, Bookkeeping, Analytics, AI Co-Founder.
6. Guarantee band.
7. Pricing cards (three tiers).
8. Testimonials and final CTA with founder photo.
9. Footer.

Responsive behavior: the page includes `viewport` meta `width=device-width, initial-scale=1`. Breakpoints and mobile layout were not determined.

## Content Style
- Voice: confident, direct, low-energy, professional. The audience is small-business founders.
- Headings: short declarative sentences ending with a period, sometimes using a "Do'ers" or "Replace Them All" play on words: "The Easiest Way to Start and Run Your U.S. Business.", "We Decoded Taxes So You Don't Have To.", "This Co-Founder Never Clocks Out."
- CTAs: imperative verb phrases ("Start My Business", "See Plans & Pricing", "Talk to an Expert", "Explore AI Co-founder").
- Body copy: one short sentence per feature, then 4-5 benefit bullets. Bullets lead with the outcome ("Up-to-date books, reconciled every month").
- Trust cues appear early: ratings, review count, money-back guarantee, price transparency ("No U.S. residency or SSN required").

## Agent Build Instructions
Use these only where they are consistent with the captured evidence. Anything marked "not determined" should be decided by the builder, not copied from doola.

1. Base: white page background, `#141414` text, Inter (or a fallback stack) for all type. Body 16px, H1 about 56px, H2 about 50px, responsive down on mobile.
2. Buttons: pill shape (fully rounded), no shadow. Primary is black `#000000` with white text. Secondary is white with a 1px black border and near-black text. Use an arrow icon on primary CTAs.
3. Inputs (if needed): white, `#D2D2D2` border, fully rounded.
4. Accent: use the yellow `#F9C800` and tint `#FEF4CC` for section bands or highlights. Use dark gold `#8C6B1A` for links.
5. Cards: 24px radius. Lay out product mockups in a card with the feature checklist beside or below it.
6. Sections: hero first, then a logo row, process steps, alternating feature rows, a guarantee band, pricing cards, and a final CTA.
7. Copy: short declarative headlines, outcome-led bullets, and imperative CTA labels. Keep one H1 per page.
8. Do not reuse doola's logos, product screenshots, photos, or copy. Use placeholders.
9. Verify against the live site (in a browser) before treating any value here as final: font weights, spacing, container width, and motion were not measured.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://www.doola.com
target_stack: not specified
output: /Users/nicolasdangg/dev/tiny-fish-bounties/compliance-map/designs/design_doola.md
