# DESIGN.md: Our World in Data (ourworldindata.org)

## Limitations (read first)
- The full-page screenshot was NOT captured. Firecrawl's full-page option returned markdown, so the reference image is the 1920x1080 viewport of the homepage only. Layout below beyond the first fold is inferred from CSS, not from a visual.
- Firecrawl's branding block reports `h1: 20px` and `body: 12px`. The site CSS shows body text mostly at 14px and headings at 32-40px. The CSS values are used below; the branding values are recorded only as a discrepancy.
- Colours marked "(inferred)" were matched by eye against the screenshot, not pixel-sampled.
- Shadow values, footer, and the mobile layout were not measured.
- Only the homepage was scraped. Chart pages (Grapher) and article pages were not studied.

## Source
- URL: https://ourworldindata.org
- Capture date: 2026-11-12
- Evidence:
  - Firecrawl `branding,images` scrape, scrape ID `01a1ce7d-299d-747b-9ad6-c60f1a25ea1b`. Colours, fonts, component styles, metadata, and 100+ image URLs.
  - Firecrawl viewport screenshot, scrape ID `01a1ce7e-8360-7225-ba55-54829c3dbb58`, 1920x1080. Kept outside this project at `/private/tmp/claude-501/-Users-nicolasdangg--claude-spares-spare-uyAM8h/aae48edb-bcce-4574-9e8c-db8023f69850/scratchpad/firecrawl/owid-screenshot.png`. Not embedded here so that no files are added to the project.
  - Direct fetch of the homepage HTML (`/`) and its stylesheet (`/assets/owid.css`, about 620 KB). Used to verify hex values, font stacks, radii, breakpoints, and transitions.

## Reference Screenshot
Not embedded. See the Limitations section for the location of the captured viewport image. Use the screenshot as the visual source of truth for the first fold: navy header, red rule, light "Popular pages" strip, navy hero with gold serif headline, and a three-column card and panel grid.

## Design Summary
Our World in Data is a research publication with a calm, editorial, data-first look. It uses a deep navy and a single vermillion red accent on white and very pale blue-grey surfaces. Headlines are set in Playfair Display, a high-contrast serif. Body text and UI labels are set in Lato. The tone is professional and low-energy, with no gradients and almost no decoration beyond a faint world-map texture in the hero. Corners are nearly square (2-4px) and borders do most of the separation work. Charts use the UN SDG colour palette.

An agent should recreate: a navy masthead with a red rule under it, a serif headline on a navy hero, sparse white surfaces with 1px hairline borders, square-cornered red primary buttons, and a three-to-four column grid of cards, a grey "updates" panel and a pale-blue newsletter panel.

## Design Tokens

### Colours
Values are from the site CSS unless marked otherwise. "Count" is how often the hex appears in `owid.css`, which is a rough indicator of role.

Brand and accent
- `--brand-red` / `primary` / `accent`: `#CE261E` (53 uses). Primary button background, Donate button, Subscribe button, New badge, accent rule. Hover: `#B40000`.
- `--brand-navy` / `secondary`: `#002147` (36 uses). Masthead background and deep brand surfaces (header background is inferred from screenshot).
- `--ink-navy` / `textPrimary`: `#1D3D63` (253 uses). Body and heading text, default link colour, solid-blue button hover.
- `--ink-blue-muted`: `#426591` (167 uses). Secondary headings, titles, and labels.
- `--ink-blue-subtle`: `#577291` (97 uses). Secondary text and disabled text.
- `--ink-blue-faint`: `#355174` (27 uses). Tertiary text.
- `--link-light`: `#A4B6CA` (53 uses; branding also reports this as `link`). Used for quiet/muted accents. Its exact role is not confirmed.
- `--gold` / `--amber`: `#F7C020` (9 uses in CSS, named `--amber`). Hero headline colour on the navy hero (inferred from screenshot).
- `--hover-navy`: `#164377` (solid dark-blue button hover).

Surfaces and borders
- Page background: `#FFFFFF`.
- Hero background: `#F0F4FA` (45 uses) in the article hero rule. On the homepage the hero is navy with a world-map texture (inferred).
- Pale blue panel / light selected background: `#EBEEF2` (95 uses) and `#E7F2FF` (28 uses, newsletter panel, inferred).
- Border and divider: `#DBE5F0` (143 uses). Input borders, card borders, and dividers.
- Neutral grey panels: `#F7F7F7` / `#F2F2F2` (inferred for the updates panel; 80 and 26 uses).
- Neutral lines: `#E7E7E7`, `#DADADA`.

Text neutrals
- `#5B5B5B` (73 uses): long-form body text in article contexts and `title-text`.
- `#767676` (62 uses): fragments and tertiary text.
- `#A1A1A1`, `#787878`, `#4E4E4E`: additional greys.

Other
- Visited link: `#631D49` (37 uses) and `#91577C`.
- Error/alert red: `#B40000`.
- SDG chart palette (data only, not UI chrome): `#c9182d`, `#dda63a`, `#3f842e`, `#a71526`, `#fcc30b`, `#26bde2`, `#e91a00`, `#fd9d24`, `#bf8b2e`, `#56c02b`, `#0879ae`, `#366b3a`, `#005885`, `#bc1058`, `#fd6925`, `#8a1538`.

### Typography
Font families (verified in CSS and branding)
- Headings: `"Playfair Display", Georgia, "Times New Roman", "Liberation Serif", serif`. Used in the hero, card titles, panel titles, and the section headings. Weights present: Regular, Medium, SemiBold, plus italics for bylines and quotes.
- Body and UI: `Lato, "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif`. Lato is self-hosted as WOFF2 (`/fonts/LatoLatin-Regular.woff2`, preloaded). Weights used: Regular and 700 bold.
- Code: `monospace`.

Scale (from CSS frequency, desktop)
- Display: `2.5rem` (40px) `display-2-semibold` (Playfair). Hero headline is roughly this size and weight, in gold on navy (inferred).
- Display small: `2rem` (32px) `display-3-semibold`, with 48px top margin.
- Section and card titles: `1.5rem` (24px) and `1.25rem` (20px), Playfair SemiBold or Medium, navy.
- Large body / lead: `1.125rem` (18px).
- Body: `1rem` (16px) and `.875rem` (14px). 14px is the most common text size in the CSS (158 uses) and is the default for UI and card body text.
- Small/meta: `.8125rem` (13px), `.75rem` (12px), `13px`, `12px`.
- Micro labels (eyebrows, badges): `.625rem` (10px) to `11px`, set in uppercase with letter-spacing. Examples: "POPULAR PAGES", "DATA UPDATE · 7 DAYS AGO", "NEW", "FROM OUR CLASSICS", "ARTICLE · 5 MIN READ".

Weights and rules
- Headings: Playfair, weight 500-600, sentence case. Titles are often written as questions.
- Body: Lato Regular, with bold 700 for item titles inside lists and checkboxes.
- Bylines and attributions: Playfair Italic (e.g. `Hannah Ritchie, Esteban Ortiz-Ospina…`), in muted blue.
- Line-height: not measured precisely. Body reads at about 1.4-1.5.

### Spacing, Layout, Radius, Shadow, Borders
- Base unit: 4px (branding `baseUnit`). Observed spacing values in CSS include 4, 8, 12, 16, 24, 32, 36, 48.
- Grid gap: `--grid-gap: 24px` on desktop, `16px` at max-width 768px.
- Modal and panel padding: `24px` (`--modal-padding`), with 16px on small screens.
- Content width: about 1280px on desktop (measured from screenshot: content spans roughly x=320 to x=1600 at 1920px wide). Inferred.
- Radius: `4px` is dominant (47 uses), with `3px` and `2px` for small chips and inputs. `50%` for avatars and round icons. `0` for some buttons and inputs (branding reports 0px on primary button and input). Fully rounded pill tags (`32px`) for the popular pages and stat chips.
- Borders: 1px solid hairlines in `#DBE5F0`. Cards are outlined rather than shadowed.
- Shadows: not determined. Treat as none or minimal. Branding reports `shadow: none` on buttons and inputs.
- Breakpoints (max-width/min-width pairs in CSS): 520px, 768px / 769px, 960px / 961px, 1200px, 1280px / 1281px. The primary desktop break is 768/769 and the wide break is 1280.
- Transitions: 0.125-0.2s for border-colour and background-colour; opacity on popovers uses `--ease-out: cubic-bezier(.23, 1, .32, 1)`.

## Components

Masthead (site header)
- Full-width navy `#002147` bar, about 76px tall. A red rule of about 3-4px sits directly beneath it (inferred from screenshot).
- Left: a two-line serif wordmark "Our World in Data" in white, with three small partner logos (Oxford Martin School, University of Oxford, GCDL). Logo files are third-party marks. Do not reuse them.
- Centre-left nav: text links in white, Lato, 14-16px, with a small icon before "Browse by topic" and chevron-down dropdowns for "Resources" and "About".
- Right: a solid red `#CE261E` "Donate" button with white text, square corners, about 94x40px.

Popular pages strip
- Full-width pale blue-grey band `#DBE5F0` (inferred), about 48px tall.
- Label "POPULAR PAGES" in small bold uppercase, letter-spaced, navy.
- Pills: white, fully rounded, navy text, 14px Lato, 8-16px horizontal padding. Examples: CO₂ Emissions, Population Growth, Life Expectancy, Poverty, Impacts of Food, War & Peace, Global Education, Artificial Intelligence, Democracy.

Hero (homepage)
- Navy `#002147` background with a faint world-map texture, about 316px tall.
- Headline: centred Playfair Display, gold `#F7C020`, about 40px, two lines.
- Sub-link: "Read about our mission →", light blue-grey Lato 16px with an arrow.
- Search input: full-width-ish white field, about 628px wide, 1px `#DBE5F0` border, square corners, placeholder in grey, with a magnifier icon at the right. Placeholder text suggests example queries.
- Stat chips: three or four outlined pill chips with an icon and a count, for example "14,052 charts", "126 topic pages", "27 data explorers", "507 articles". White text on navy, thin light border, fully rounded.
- Footnote line: "All free: open access and openly licensed", small, light blue-grey, centred.

Card (topic and article cards)
- White surface, 1px `#DBE5F0` border, square or 4px corners, 16px padding.
- Optional image or chart thumbnail at the top, aspect about 1.4:1 to 1:1, full width of the card's inner area.
- Eyebrow line above the title: small uppercase, letter-spaced, blue for "ARTICLE · 5 MIN READ" and red for the "NEW" badge (red fill with white text, small caps). "TOPIC UPDATE" and "FROM OUR CLASSICS" use blue-grey.
- Title: Playfair SemiBold, navy, about 20-24px, two to three lines.
- Body: Lato 14-16px, `#1D3D63`.
- Byline: Playfair Italic, muted blue, 14px.

Updates and announcements panel
- Light grey background `#F7F7F7` or `#F2F2F2` (inferred), 24px padding.
- Heading row: a circular icon (about 56px, pale blue circle with a document glyph) beside a Playfair title "Updates and announcements".
- Item pattern: uppercase eyebrow "DATA UPDATE · 7 DAYS AGO" in blue, a Playfair bold title in navy, one or two lines of muted-blue Lato, then "Read more →" in navy.
- Items are separated by 1px hairlines in `#DBE5F0`.

Newsletter panel
- Pale blue background `#E7F2FF` (inferred), with a circular mail icon, a Playfair heading "Subscribe to our newsletters", and Lato body copy.
- Checkbox rows: red-filled square checkboxes with white ticks, each with a bold title, an inline small grey label ("Twice a month", "Every few days"), and a one-line description.
- Email field: white, 1px `#DBE5F0` border, square corners, placeholder "Your email address".
- Subscribe: full-width solid red `#CE261E` button, white text, about 40px tall.
- Small print below, 12-13px, with a link to the privacy policy.

Social row: outline-style monochrome icons (X, Instagram, Threads, Facebook, LinkedIn, Bluesky, GitHub) in navy, about 16-20px, evenly spaced.

Floating chat button: a navy square icon button at the bottom right corner, fixed position (inferred).

Buttons (from branding and CSS)
- Primary (`.owid-btn--solid-vermillion`): background `#CE261E`, text `#FFFFFF`, hover `#B40000`, square corners (`0px` per branding), no shadow.
- Secondary outline (`.owid-btn--outline-vermillion`): white background, red text and border `#CE261E`, square corners.
- Solid dark blue (`.owid-btn--solid-dark-blue`): navy `#1D3D63` background, hover `#164377`. Also `--solid-light-blue` with hover `#ebeef2`.
- Disabled: background `#EBEEF2`, text `#577291`; outline disabled uses `#98A9BD`.
- Icon-only padding `4.5px 9px`. Icons sit `0.5rem` from the label.

Inputs: white background, `#DBE5F0` border, square corners, no shadow. Placeholder grey.

Links: default `#1D3D63` with underline and 4px underline offset. Hover removes the underline. Visited `#631D49` in some contexts.

Badges and pills: fully rounded for topic chips, small square-cornered fills for "NEW" and status labels.

Footer: not captured. Note that the footer is not measured.

## Page Patterns
Homepage section order (first fold, observed)
1. Masthead (navy, about 76px) with red rule.
2. Popular pages strip (pale blue, about 48px).
3. Navy hero with serif headline, mission link, search, stat chips, and the "All free" line (about 316px).
4. Content grid of about 1280px width, beginning at about y=468:
   - Column A and B: two columns of topic and article cards, each about 300px wide, with 24px gaps. Cards are staggered vertically.
   - Column C: the grey "Updates and announcements" panel, about 300px wide.
   - Column D: the pale-blue "Subscribe to our newsletters" panel, about 300px wide.
5. Further sections (not captured): likely topic browsing, data explorers, and a footer.

Layout rules (inferred and CSS-supported)
- Use a 4-column grid at desktop with 24px gaps, and a centred max-width container of about 1280px.
- Collapse to a single column under 768px, with grid gap reduced to 16px.
- Hero text and search remain centred at all sizes.
- Cards keep their image at the top and their text left-aligned.

Responsive behaviour
- Breakpoints: 520, 768, 960, 1280. Reduce grid columns as the viewport narrows.
- Touch targets are generous on mobile (inferred).

## Content Style
- Voice: calm, factual, evidence-led. Tagline: "Research and data to make progress against the world's largest problems." Branding reports tone `professional`, energy `low`, audience "general consumers".
- Headings are sentence case. Card titles are often phrased as questions: "Which vaccines do children around the world receive?", "What do death certificates tell us about what people die from?"
- CTAs are plain and short: "Read more →", "Read about our mission →", "Subscribe", "Donate". The arrow glyph (→) is used on text links.
- Copy density is medium. Cards carry a one-line teaser of about 15-25 words. Eyebrow labels carry type and read time.
- Numbers are shown as counts with commas, for example "14,052 charts".
- Microcopy: "All free: open access and openly licensed".

## Agent Build Instructions
1. Set up tokens on `:root`:
   - Colours: `--brand-red: #CE261E`, `--brand-red-hover: #B40000`, `--navy: #002147`, `--ink: #1D3D63`, `--ink-muted: #426591`, `--ink-subtle: #577291`, `--border: #DBE5F0`, `--surface-blue: #EBEEF2`, `--surface-blue-soft: #F0F4FA`, `--surface-info: #E7F2FF`, `--surface-grey: #F7F7F7`, `--gold: #F7C020`, `--white: #FFFFFF`.
   - Fonts: `--font-serif: "Playfair Display", Georgia, "Times New Roman", serif`. `--font-sans: Lato, "Helvetica Neue", Helvetica, Arial, sans-serif`. Load Lato and Playfair Display from Google Fonts (both are open-licence fonts). Do not reuse the site's self-hosted files.
2. Type: headings in Playfair SemiBold, using 40px for the display, 32px for section display, 24px and 20px for titles. Body in Lato 16px, with 14px for dense UI and cards. Eyebrows are 11px uppercase with 0.04-0.08em letter-spacing.
3. Spacing: 4px base. Gutter 24px desktop, 16px mobile. Panel padding 24px.
4. Corners: 4px on cards and inputs, 0px on primary buttons, fully rounded pills for topic chips.
5. Borders: 1px `#DBE5F0` hairlines. Do not add drop shadows.
6. Build the masthead as a full-width navy bar with a 3-4px red rule beneath, white serif wordmark on the left, text nav centred-left, and a square red "Donate" button on the right.
7. Build the hero as a navy band with a very faint world-map or abstract texture, a centred gold serif headline, a white search field with a square border, and outlined pill stats.
8. Build content with a 4-column grid: cards in the first two columns, a grey updates panel, and a pale-blue newsletter panel with red checkboxes and a full-width red Subscribe button.
9. Write headlines in sentence case, using questions for article titles. CTAs are short verbs with a trailing arrow.
10. Interaction: hover underlines are removed on links. Buttons darken to the hover colour. Transitions are 0.15-0.2s. Easing `cubic-bezier(.23, 1, .32, 1)`.
11. Do not reproduce the Our World in Data name, logos, partner marks, or copy in a way that implies endorsement. Use placeholder text and marks.

## Rerun Inputs
workflow: firecrawl-website-design-clone
source_url: https://ourworldindata.org
target_stack: unspecified (tokens are framework-neutral)
output: /Users/nicolasdangg/dev/tiny-fish-bounties/compliance-map/designs/design_ourworldindata.md
firecrawl_scrape_ids: 01a1ce7d-299d-747b-9ad6-c60f1a25ea1b (branding,images), 01a1ce7e-8360-7225-ba55-54829c3dbb58 (screenshot, viewport only)
