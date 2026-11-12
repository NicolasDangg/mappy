# DESIGN.md: Stripe Atlas (stripe.com/atlas)

## Source
- URL: https://stripe.com/atlas
- Capture date: 2026-11-12
- Evidence used:
  - Firecrawl `branding` + `images` scrape (structured tokens, metadata, 5 content image URLs). Scrape returned a rate-limit/throttle warning but full data.
  - Firecrawl markdown scrape (section order, copy, CTAs, footnotes).
  - Firecrawl `html` scrape (about 102 KB; used for the stylesheet list and the preloaded font URL).
  - 27 stylesheets linked from the HTML, fetched directly with curl and grepped for custom properties (title sizes, weights, container width, gradient tokens).
  - Firecrawl `screenshot` format, downloaded locally. It is a 1920x1080 viewport capture of the first fold only, not a full-page capture (see Limitations).
- Local copies (outside the project, per the no-other-files instruction): `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/`

## Limitations
- **Only the first viewport was captured visually.** The full-page screenshot flag returned text, not an image. Everything below the hero is described from markdown and branding data, not from pixels.
- **Desktop only.** No mobile or tablet capture was taken, so responsive behaviour is inferred, not observed.
- **Font family is detected, not confirmed in CSS.** Firecrawl reports `Sohne-Var`. The HTML preloads a single woff2 from `b.stripecdn.com` (`f965fdf4.woff2`). The family name is not found in the fetched stylesheets.
- **Stylesheets are shared.** The fetched CSS covers many Stripe components, so the raw hex tally mixes in colours from other products. Only values tied to Atlas evidence (branding data, screenshot, and Atlas-specific custom properties) are treated as Atlas tokens.
- **Branding h1 size conflicts with the screenshot.** Branding reports `h1: 32px`. The hero headline in the screenshot is visibly larger, so the screenshot-based estimate is used below and marked as inferred.
- **Motion and hover states are not determinable** from a static scrape. Not documented.
- **Logos and images are third-party property.** Customer logos (Whimsical, Lovable, Linear, RupaHealth, Cursor, Ashby, RevenueCat, Runway, Copilot Money) and the Stripe wordmark must not be reused. Do not copy the Stripe wordmark or the Atlas social card into new work.

## Reference Screenshot
![Viewport screenshot of stripe.com/atlas, first fold at 1920x1080](/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/stripe-atlas-fullpage.png)

Use this as the visual source of truth for the hero: layout, density, the diagonal ribbon, and the form card. Tokens below describe the same page in machine-readable form.

## Design Summary
A light, airy product-marketing page for a business service. The look is a cool pale-blue-grey canvas with deep navy type and a single saturated orange accent used for every primary action. The hero pairs a large, tightly set headline with a live-looking product form card, over a diagonal orange-to-yellow gradient ribbon that carries the energy. Faint dashed vertical grid lines run behind a centred 1080px container. Copy is plain and declarative, with concrete numbers and superscript footnotes for fine print. Recreate the calm, precise, product-as-UI feel. Do not recreate the Stripe brand marks.

## Design Tokens

### Colors
Values marked **(observed)** come from branding data or the screenshot. Values marked **(inferred)** are estimates from the screenshot or shared CSS, with low confidence.

| Role | Hex | Basis |
|---|---|---|
| Brand accent / primary CTA | `#FF7600` | observed (branding `primary`, `accent`, `link`; button in screenshot) |
| Text primary / headings | `#0A2540` | observed (branding `textPrimary`, `secondary`) |
| Page background | `#F6F9FC` | observed (branding `background`; screenshot) |
| Card / surface | `#FFFFFF` | observed (form card in screenshot) |
| Primary button text | `#FFFFFF` | observed (branding `buttonPrimary.textColor`) |
| Body / secondary text | approx. `#4B5870` | inferred (screenshot subhead colour; CSS tokens near `#4D5B78` / `#3F4B66`) |
| Dark secondary button ("Start company") | approx. `#3F4B66` | inferred (screenshot; low confidence) |
| Hairline / card border | approx. `#E3E8EE` | inferred (screenshot; shared CSS neutral) |
| Gradient ribbon | orange `#FF7600` to yellow approx. `#FFD84D`, with lighter edges | inferred (screenshot; yellow highlight core is an estimate) |
| Input text | `#0A2540` | observed (branding `input.textColor`) |

Named roles for implementation:
- `--color-accent: #FF7600` (CTAs, links, eyebrow labels, nav "Contact sales")
- `--color-ink: #0A2540` (headings, body-strong, input text)
- `--color-canvas: #F6F9FC` (page)
- `--color-surface: #FFFFFF` (cards)
- `--color-body: #4B5870` (inferred; body copy)
- `--color-border: #E3E8EE` (inferred; hairlines and card outlines)

Use accent orange only for actions and small emphasis. Do not use it for large text blocks.

### Typography
- **Family:** `Sohne-Var` (observed in branding). Fallback stack from branding: `"Sohne-Var", "Helvetica Neue", Arial, sans-serif`. Use a variable grotesque with optical sizing if available. If Sohne is unavailable, use a close substitute such as Inter or Helvetica Neue with the same weights and tight display tracking. The page loads one woff2 (preloaded), so the variable weight range is likely.
- **Headline (hero H1):** about 56px, line-height about 1.2, weight semibold to bold (`600`/`700`), tight tracking (about -0.02em to -0.03em). Inferred from the screenshot (two lines spaced about 67px apart). Branding reports 32px, which conflicts; the screenshot wins for hero size.
- **Subhead / lead:** about 20px, line-height about 1.4, weight regular, colour body. Inferred from screenshot line spacing (about 28px).
- **Section eyebrow / in-page label** ("Why Atlas", "Atlas" product label): about 18px, weight semibold, accent orange. Observed colour, inferred size.
- **Nav links:** about 15px, weight medium, ink colour. Inferred.
- **Form labels and body in card:** about 14px (branding `body: 14px`), weight medium for labels, regular for helper text. Observed size from branding.
- **Card title ("Start your company"):** about 18px, semibold, ink. Inferred.
- **CSS tokens (Atlas-adjacent stylesheet):** a shared card title token is set to `15px` with line-height `1.45` and semibold weight. Use only as a pattern reference, not as Atlas's exact hero scale.
- **Weights in use:** `600` (semibold) appears most in the stylesheets; `700` bold for display only.
- **Tracking:** headings tight; titles in the stylesheets use `0.1px` to `0.2px` positive tracking at small sizes. Keep body at 0.

### Spacing And Layout
- **Base unit:** 4px (branding `baseUnit`).
- **Container:** about 1080px wide, centred (observed in screenshot: hairline grid at x=420 to x=1500 on a 1920px viewport, matching the stylesheet `max-width: 1080px`). Content inset about 16px from the grid edges (text starts at x=436).
- **Grid lines:** dashed 1px vertical hairlines at container column boundaries (observed at x=420, 690, 960, 1230, 1500 on 1920px), plus a horizontal dashed rule under the top nav (y=77). These are a signature detail; reproduce them in a faint tint of `--color-border`.
- **Hero split:** left text column about 440px wide, right form card about 320px wide, positioned roughly at the 1070px to 1390px span.
- **Vertical rhythm:** generous. Hero top padding to headline is about 130px below the top nav (inferred). Section gaps are large (inferred 120px or more between sections).
- **Radius:**
  - Base card radius: 4px (branding `borderRadius`).
  - Form inputs: fully rounded pill (`999px`) per branding.
  - Primary button: `16.5px` (about half of a 33px tall button, so pill-like) per branding.
  - Radio-card option boxes inside the form: small radius (inferred about 8px).
  - Form card: about 8px (inferred).
- **Shadows:** the form card has a soft, low, wide shadow (inferred from the screenshot). A shared stylesheet pattern is `rgba(0,0,0,0.05) 0 12px 15px` plus a `0 0 0 1px` ring at `rgba(0,0,0,0.05)`. Use that pattern for the card. Keep shadows subtle.
- **Borders:** 1px hairline in a light neutral. The subnav and nav use dashed or solid hairlines.

## Components

- **Top nav:** logo left (Stripe wordmark, do not reuse), then text menu items with chevrons (Products, Solutions, Developers, Resources), then Pricing, then a thin vertical divider, then a sparkle "Guide me" item. Right side: "Sign in" as orange text with chevron, then a solid orange pill "Contact sales" with a trailing chevron. Height about 77px.
- **Product subnav:** bar below the nav with an orange "Atlas" label on the left and right-aligned links (Overview in ink; Guides, Perks, Docs in orange). Text about 15px.
- **Primary CTA button:** pill, orange `#FF7600`, white text, about 15px semibold, about 33px tall, trailing chevron. Example: "Start your company >". Radius about 16.5px.
- **Secondary / dark button:** inside the form, a dark slate-navy fill (inferred `#3F4B66`), white text, small, squared-off radius (about 4px), full natural width. Labelled "Start company".
- **Text inputs:** white or transparent fill, hairline border, pill radius per branding (`999px`). The form business-name field is a rectangular box in the screenshot, so treat the pill radius as the branding value and the screenshot as the visual truth. Mention as a conflict if reproduced.
- **Radio option cards:** three stacked bordered rows, each with a leading radio circle, a bold-ish title (for example "C corporation"), and a grey descriptor line ("Often used by startups"). Rows are about 52px tall, separated by about 8px.
- **Hero form card:** white card, about 320px wide, title, labelled input, option cards, and full-width dark button. This is the product-as-UI hook.
- **Diagonal gradient ribbon:** a full-bleed band crossing the hero at roughly 20 to 30 degrees, transitioning from orange at the left edge to a bright yellow core and back to orange at the right. Its top edge is a sharp diagonal; the body is soft. Implement with a linear gradient on a rotated element, clipped with `clip-path` or a skewed container. Inferred implementation.
- **Customer logo strip:** one horizontal row of 8 company wordmarks, small, single-colour, muted. Sits below the features. Use placeholders in new work.
- **Testimonial quote block:** quote in a larger body size, then a company logo beneath. Three quotes stacked or in a carousel (inferred from the testimonial CSS tokens such as `TestimonialCarousel`).
- **Step illustration:** a supporting SVG "tracker" illustration (Atlas-specific image) showing progress through the incorporation steps.
- **Resource / guide cards:** three link cards, each with a small "Guide" label, a bold title, and a rounded illustration or photo. Titles: "AMA with Marc Andreessen", "How to incorporate a business", "Build with Stripe Projects".
- **Footnote markers:** superscript numerals (¹, ²) attached to claims, with small grey footnote text at the bottom.
- **Sales chat widget:** a small block with "8 sales reps available", a headline "We're here to discuss your business needs.", and a "Chat now with sales" button.

## Page Patterns

Observed section order (top to bottom):
1. Top nav (main product nav), then product subnav.
2. Hero: left column headline, subhead with $500 offer and footnote ¹, orange CTA. Right column form card. Full-bleed diagonal ribbon behind the lower half.
3. "Why Atlas" eyebrow (orange), then a short paragraph about 170,000+ founders and the one-in-four claim.
4. Feature statements: apply online, legal documents (Cooley), Treasury banking and SAFEs. Each a short paragraph.
5. Customer logo strip (8 names).
6. Step-by-step section: "Fill out your company details in minutes" with a tracker illustration and a "Watch a demo" link. Steps: tell Atlas about the company and co-founders, Delaware incorporates the company, open a business bank account, generate a SAFE from the dashboard.
7. Testimonials (three quotes with company logos).
8. Guides row (three link cards).
9. Closing call to action: "Create a new Stripe account today and get started in minutes."
10. Footnotes and a long legal disclaimer, then the sales chat widget block.

Responsive behaviour (inferred, not observed): the two-column hero stacks to one column below desktop widths. The container shrinks to fill the viewport with about 16px side padding. The grid hairlines likely disappear on small screens. The meta viewport is `width=device-width, initial-scale=1, viewport-fit=cover`, so standard responsive behaviour is expected.

## Content Style
- **Voice:** direct, factual, confident, no hype words. Second person ("You'll receive...", "Tell Atlas about your company"). Business-focused.
- **Headlines:** short, imperative or noun-phrase ("Incorporate your startup", "Start your company", "Your company is ready"). No trailing punctuation.
- **CTAs:** verb-first, sentence case, with a trailing chevron ("Start your company", "Contact sales", "Watch a demo", "Chat now with sales").
- **Numbers as proof:** concrete figures ("170,000+ founders", "one in four new Delaware C corporations", "$500", "$2.5K in Stripe credits", "over $200K in offers", "Fundraise in one business day").
- **Fine print:** superscript footnote markers plus a legal paragraph disclosing terms, bank partner, and that Atlas is not a law firm.
- **Density:** medium-low. Short paragraphs, generous white space, lists of concrete benefits.

## Agent Build Instructions
1. Build a single centred container of 1080px with 16px side padding. Draw faint dashed vertical hairlines at the container's column edges and one horizontal dashed rule under the top nav.
2. Set the page background to `#F6F9FC` and all headings and primary text to `#0A2540`. Use `#FF7600` for primary buttons, links, and small eyebrow labels. Do not use orange for large text blocks.
3. Set the font family to Sohne-Var with the fallback stack above. Use a hero headline around 56px, semibold, tight tracking, line-height about 1.2. Use a 20px lead in body grey (inferred `#4B5870`). Use 14px for form text.
4. Build the hero as a two-column grid: headline, lead, and a pill-shaped orange CTA on the left; a white 320px card with a 4px or 8px radius and a soft shadow on the right.
5. Put the form card's inputs in pill-shaped boxes with a hairline border, radio option cards in bordered rows with a leading radio circle, and a squared dark-slate full-width button.
6. Add a full-bleed diagonal ribbon behind the lower hero: a linear gradient from orange through a bright yellow core back to orange, clipped to a skewed band. Keep it soft-edged on the bottom and sharp on the top diagonal.
7. Use a 4px base spacing scale. Give sections large vertical gaps (120px or more on desktop) and generous white space.
8. Write copy in short, declarative sentences. Use verb-first CTAs with a chevron. Put concrete numbers in the body. Mark fine print with superscript footnotes and a small legal paragraph.
9. Use placeholder wordmarks for customer logos and placeholder imagery. Do not reuse Stripe or Atlas brand marks, logos, the social card, or any third-party logo.
10. Verify at 1920px width that the container, hairlines, hero split, and card proportions match the reference screenshot. Then check a mobile width (not verified from this scrape).

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://stripe.com/atlas
target_stack: not specified (generic CSS tokens and layout; adapt to the target)
output: DESIGN.md
