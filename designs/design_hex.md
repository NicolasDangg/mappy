# DESIGN.md: Hex (hex.tech)

## Source
- URL: https://hex.tech
- Capture date: 12 November 2026
- Evidence: Firecrawl `branding,images` scrape (`.firecrawl/hex-branding.json`), full-page screenshot (`.firecrawl/hex-screenshot.png`, sliced to `hex-0..5.png`), page markdown.

## Reference Screenshot
![Full-page screenshot of hex.tech](../.firecrawl/hex-screenshot.png)

## Design Summary
A warm, paper-light page that sells software by showing it. Short heavy headlines (two to four lines, tight tracking) sit beside
large, legible product windows built from the real interface: chat threads, charts, a Slack thread, a CLI. Quiet supporting text,
generous vertical rhythm, and near-monochrome ink with colour coming almost entirely from the product's own charts.

## Design Tokens

### Colors (observed unless marked)
- Ground: warm paper, about `#F6F3F0` (inferred from screenshot; branding reports a dark scheme for the nav only)
- Ink: `#14141C`; brand aubergine `#43394C`, `#31263B`
- Link / accent: `#365CA3`; secondary buttons are outlined in a soft rose (inferred `#E9C9CF`)
- Product panels: white `#FFFFFF` on paper, 1px warm-grey borders inside the UI only

### Typography
- Headings: PP Formula Semi Extended (heavy, wide), h1 about 74px, tight tracking
- Body: Cinetype, 16–24px; Cinetype Mono for captions (we do not copy this)
- Substitute used in Mappy: Geist 500–600 for display, Geist 400 for text

### Spacing And Layout
- 4px base unit; primary button radius 0, inputs 7px
- Content column about 1100px; product window to the right of a narrow text column (about 1/3 : 2/3)
- Section gaps about 160–200px

## Components
- Primary button: flat, square, light on dark or dark on light; secondary: outlined, small
- Product windows: real UI at true size, white, small radius, sitting on the paper ground
- Quotes: small, beside the product window, with the customer's mark

## Page Patterns
Hero statement → logo strip → alternating "statement + product window" rows → context diagram → use cases list → case-study cards → close.

## Content Style
Plain claims ("Ask a question, get a trusted answer"), short buttons named for what they do ("Explore self-serve insights").

## Agent Build Instructions (as applied to Mappy)
Take the principle, not the brand: light warm ground, one sober sans, short headlines next to large working product fragments,
colour supplied by the product's content. Do not copy Hex's fonts, logo, copy, imagery or illustrations.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://hex.tech
target_stack: Next.js 16 + CSS
output: designs/design_hex.md
