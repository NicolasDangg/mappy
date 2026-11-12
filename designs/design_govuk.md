# DESIGN.md: GOV.UK (Set up a business page)

## Limitations (read first)
- **No screenshot.** The Firecrawl full-page screenshot call returned markdown text (a cookie banner), not an image, so no visual reference is embedded. Layout is described from page HTML and the stylesheet only.
- **Redirect.** `https://www.gov.uk/starting-up-a-business` redirects (200) to `https://www.gov.uk/set-up-business`. The page analysed is "Set up a business".
- **Firecrawl branding output is partly unreliable.** It returned overall confidence 0.56 and some labels conflict with the stylesheet (see Colors). Values below were checked against the stylesheet, which I fetched directly with curl. This is the one step done outside Firecrawl.
- **Images list is empty.** The page has no content photography. The only raster/vector brand asset is the header wordmark.
- **Font file not confirmed.** The stylesheet declares GDS Transport (one `@font-face` rule), but I did not confirm the font file URL. GDS Transport is a Crown font; use the Arial fallback rather than sourcing it.
- **Not confirmed:** which exact colour applies to body links. See Colors.

## Source
- URL: https://www.gov.uk/starting-up-a-business (resolves to https://www.gov.uk/set-up-business)
- Capture date: 2026-11-12
- Evidence: Firecrawl `branding,images` scrape (title, description, theme-color, body class, metadata); page HTML via curl; main stylesheet `application-5c3385e08fe8537ee8f94db512cdc8e15439427843360d44fb88cfdac0fadfe1.css` via curl. Scrape artifacts are kept outside the project, in the session scratchpad.

## Design Summary
A plain, high-contrast, government-service page. Flat white background, near-black text, a solid blue header band, square-cornered controls, and no decorative imagery. Hierarchy comes from bold sans-serif headings and generous line height, not colour or effects. An agent should recreate this as restrained, accessible, text-first UI with strong focus states and no shadows, gradients, or rounded corners.

## Design Tokens

### Colors (verified against stylesheet)
| Role | Value | Evidence |
|---|---|---|
| Text (primary) | `#0B0C0C` | Most-used colour (359 occurrences); branding agrees |
| Background | `#FFFFFF` | Branding `background`; `#FFF` used widely |
| Header / brand band | `#1D70B8` | `.govuk-header` default `var(--govuk-brand-colour, #1d70b8)`; page `theme-color` is `#1d70b8` |
| Footer top border | `#1D70B8` | `.govuk-footer` `border-top-color` default |
| Primary button | `#0F7A52` | `.govuk-button` `background-color` |
| Primary button hover | `#0B5C3E` | `.govuk-button:hover` |
| Primary button shadow | `#083D29` | `.govuk-button` `box-shadow: 0 2px 0` |
| Focus | `#FFDD00` background, `#0B0C0C` text | `:focus` rule with `var(--govuk-focus-colour)` |
| Secondary text | `#505A5F` | Appears 8 times; likely secondary text, not confirmed on a specific rule |
| Borders / rules | `#CECECE`, `#B1B4B6` | Most-used border greys |
| Panel background | `#F3F2F1` | Appears 5 times, likely inset/panel background, not confirmed |
| Error / warning | `#CA3535` | Appears 17 times; role not confirmed |
| Link | Not confirmed | Branding says `#1A65A6`; stylesheet also uses `#1D70B8` heavily. Treat `#1D70B8` as the link colour and `#1A65A6` as the alternative. |

Branding-output labels to disregard: `buttonPrimary.background: #F4F8FB` conflicts with the `#0F7A52` primary button in the stylesheet. Do not use it as the primary button colour.

### Typography
- **Family:** `"GDS Transport", arial, sans-serif`. Agents should use `Arial, sans-serif` as the working substitute.
- **Body:** 19px (`1.1875rem`), line-height about 1.32 (`1.3157894737`), weight 400.
- **Headings** (all weight 700):
  - XL: 32px / line-height 1.09 on mobile, 48px / 1.04 from the 641px breakpoint up.
  - L: 27px / 1.11 on mobile, 36px / 1.11 from the 641px breakpoint up.
  - M: 21px / 1.19 on mobile, 24px / 1.25 from the 641px breakpoint up.
- **Buttons:** 19px, weight 400, line-height 1.
- **Links:** underlined, `text-decoration-thickness: max(1px, .0625rem)`, `text-underline-offset: .1578em`. Links are underlined by default; do not remove underlines to match a modern style.
- Sentence-case headings. The page H1 is `govuk-heading-xl`.

### Spacing And Layout
- **Spacing scale (observed frequency, not a declared token set):** 5, 10, 15, 20, 25, 30, 40, 50, 60 px. Most common: 15px, 10px, 20px, 30px.
- **Container:** `max-width: 960px`, side margins 15px on mobile and about 30px at desktop widths.
- **Breakpoints:** `min-width: 40.0625em` (641px) is the main desktop breakpoint, with a second at `48.0625em` (769px). Mobile-only rules use `max-width: 40.0525em`.
- **Grid:** 12-column grid (`govuk-grid-row` with `two-thirds`, `one-third`, and `full` columns). Main content sits in a two-thirds column.
- **Radius:** 0 everywhere. Square corners on buttons, inputs, and panels.
- **Shadows:** no blur shadows. Buttons use a flat 2px offset solid shadow (`0 2px 0`), and pressed buttons move `top: 2px`.
- **Borders:** 1px grey rules and 2px button borders. Footer has a 10px blue top border.

## Components

- **Header:** full-width blue band (`#1D70B8`) with the GOV.UK wordmark in white. Do not reproduce the crown wordmark. Use a plain text placeholder such as "Service name".
- **Breadcrumbs:** a `<nav aria-label="Breadcrumb">` above the main content. Collapses on mobile and is hidden in print.
- **Primary button:** full width on mobile, `width: auto` from desktop. Background `#0F7A52`, white text, 19px, padding `8px 10px 7px`, `box-shadow: 0 2px 0 #083D29`. Hover `#0B5C3E`. Active `top: 2px`. Square.
- **Secondary / feedback buttons:** same button style at the end of the page (for example "Is this page useful?").
- **Focus state:** yellow `#FFDD00` background with dark text and a yellow and dark box-shadow. This is the most distinctive interaction state and must be kept for accessibility.
- **Links:** blue, underlined, with no hover colour change observed in the grep.
- **Related navigation:** `gem-c-related-navigation` sections in a stacked list at the end of the page.
- **Footer:** `govuk-footer`, 19px text, blue top border, and a column-based link layout.
- **Forms, inputs, cards, badges, tables, and pricing:** not present on this page. Not determined from this scrape.

## Page Patterns
- Section order: header band → breadcrumbs → H1 (`xl`) → intro paragraph → body sections in a two-thirds column → related navigation → feedback prompt buttons → footer.
- Content is single-column text in the two-thirds column. There are no hero banners, cards, or image strips.
- Responsive behaviour: the layout stacks on mobile. Buttons go full width, breadcrumbs collapse, and headings step down in size below 641px.
- Print styles hide navigation and breadcrumbs (`govuk-!-display-none-print`).

## Content Style
- **Tone:** professional, plain, low-energy. Branding output: `tone: professional`, `energy: low`, audience "businesses".
- **Headings:** short, descriptive, sentence case (for example "Set up a business").
- **Descriptions:** plain-English summaries, for example "Choosing a legal structure when you're starting a business: the differences between being a sole trader and a limited company". Describe the topic directly, with no marketing language.
- **Voice:** second person ("you"), direct, no jargon where avoidable.
- Page body copy was not read in this pass, so sentence-level patterns and CTA wording are not determined.

## Agent Build Instructions
1. Use a white page background with `#0B0C0C` body text at 19px, line-height about 1.32, and `Arial, sans-serif` as the font stack.
2. Build a container at `max-width: 960px`, with 15px side margins on mobile and 30px from the 641px breakpoint.
3. Use a bold (700) sans-serif heading scale: 32px / 48px for H1, 27px / 36px for H2, 21px / 24px for H3, stepping at 641px.
4. Use square corners everywhere (radius 0). No blur shadows. Use 1px `#CECECE` or `#B1B4B6` rules for separation.
5. Build the primary button as a full-width block on mobile and `auto` width on desktop. Background `#0F7A52`, hover `#0B5C3E`, white 19px text, padding `8px 10px 7px`, and a flat `0 2px 0 #083D29` offset shadow. On active, shift down 2px.
6. Make the header a full-width `#1D70B8` band. Do not reuse the GOV.UK logo. Use a text placeholder.
7. Underline all links. Use `#1D70B8` as the link colour (see the unconfirmed note above).
8. Keep the focus state yellow (`#FFDD00`) with dark text and a box-shadow. Do not remove or restyle it.
9. Use a 12-column grid with a two-thirds main column, and stack to one column on mobile.
10. Use 5px-based spacing (5, 10, 15, 20, 30, 40 px). Do not add decorative imagery.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://www.gov.uk/starting-up-a-business
target_stack: not specified (design reference only)
output: designs/design_govuk.md
