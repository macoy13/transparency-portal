# R0: UI/UX redesign proposal (design only)

Static HTML/CSS mockups under `design/`. Open any `.html` file in a browser — no build step. Typography uses **system UI fallbacks** in mockups; **R1** will self-host **Manrope** and **Source Sans 3** as WOFF2 under `public/fonts/` (see Dependencies).

## Page map (actual app routes)

| Route | App page | Mockup |
| --- | --- | --- |
| `/` | **Home** — FY2027 scope summary, office/district section (`#offices`), bridge-status filters, searchable project list (`#projects`) | `overview-desktop.html`, `overview-mobile.html`, `explorer.html` |
| `/gaa` | **Enacted** — General Appropriations Act programs 2020–2026 (not FY2027 NEP/House lines) | `enacted.html` |
| `/projects/:dataset/:id` | **Project detail** — per-version amounts, PDFs, match labels | Noted in `explorer.html` |
| `/about` | **About** — scope, exclusions, methodology, data version credit | Footer “Methodology” + overview `#about-ref` |
| `/districts` | Redirect → `/#offices` | Office section in overview |

**Header:** compact logo + wordmark, disclosure kicker from `portal.config.ts`, nav limited to FY2027 home, enacted (`/gaa`), and about. **Headline:** “Understand public budgets across Iloilo.” Search sits under the lede (desktop) or above totals (mobile ≤560px), matching `home.searchUnderLede`.

## Summary figures (project records, not budget-line rollups)

All figures respect API rules: **integer pesos**, **missing (`—`) ≠ zero**, **NEP and House are compared, never added**.

| Figure | Meaning | Changes when user… |
| --- | --- | --- |
| **Projects** | Count of scoped FY2027 project rows in the portal | Search `q`, program, status, office, “listed because”, any bridge chip — same filters as the list |
| **Proposed (NEP)** | Sum on rows that have a NEP amount; subcopy = row count | Same filters as list (filtered subtotals on Home today) |
| **House version** | Sum on rows with a House bill amount; compared with NEP, not added | Same filters |
| **In the House version only** | Rows in bridge group `house_only`; subcopy uses House amounts on those rows | Status filter / chips; other filters narrow the set |
| **Bridge group tiles** | Per-group row counts and version-specific amounts (`groupAmount` in app) | `status` URL param / chip selection |
| **Office cards / table** | API office figures per DEO (NEP vs House on one ledger); `#office-table` for detail | **Same bridge/list filters as summary** (mockup demo: click **higher in House** chip) |
| **Program breakdown** | Subline under Projects stat (`byDataset` row counts) | Program filter |

Labeling: **NEP → “Proposed (NEP)”** on Home summary tiles; office card dl uses **NEP** / **House bill** / **Change** like `OfficesSection`. Enacted `/gaa` uses GAA program families — separate from FY2027 project lines.

## Home office layout (no bar chart)

- **No office bar chart on Home.** Lead with a **responsive grid of office cards** modeled on `OfficesSection`: tier tag, **In this portal** line count + link, NEP / House bill / Change (neutral ink), bridge breakdown chips (**House only**, **NEP only**, **same amount**, **higher in House**, **lower in House**), named-project / whole-office NEP / unconfirmed-match notes (live wording), **Its budget each year since 2020 →** (`/gaa#office-id`), legislative district block with local portrait, **honorific + name** (not “Iloilo, 1st District” under the photo), Bills + District page links. Lucide-style inline SVG (building + user badge on figure). **Sample** badges throughout.
- **`#office-table`** below the grid: accessible comparison (office, NEP, House, records, change). Cards are the visual lead; search and explorer stay high on the page.
- **Filter scope:** visible **Showing: …** line; cards, summary stats, and table update together (320ms fade/slide on values). Inline JS: `mockup-offices-data.js` + `mockup-filters.js`.
- **Progress:** do not show completion or progress percentages. One line: *Progress data: not available. These are budget amounts, not spending or completion.*
- **Colour roles (elsewhere):** blue = chrome only; teal/amber for labelled **series** where still used (e.g. Enacted); office **change** stays ink-only.

## Representatives (20th Congress)

Portraits are copied under `design/portraits/` from the Budget API (`representative.portrait.url` on each district card). Mockups do not fetch images at render time.

Honorifics in mockups follow **congress.gov.ph** member profiles (`representative.profile_url` in the API). Those pages title every Iloilo member **District Representative** (plus **Deputy Speaker** or **Deputy majority leader** where listed). They do **not** publish “Congressman” or “Congresswoman”. The API `Representative` type has no gender or honorific field.

| Legislative district | Representative | Title on congress.gov.ph profile | Source |
| --- | --- | --- | --- |
| Iloilo City, Lone District | Baronda, Julienne "Jam" L. | District Representative · Deputy majority leader | https://www.congress.gov.ph/house-members/view/J013 |
| Iloilo, 1st District | Garin, Janette L. | District Representative · Deputy Speaker | https://www.congress.gov.ph/house-members/view/E032 |
| Iloilo, 2nd District | Gorriceta, Kathryn Joyce F., MD | District Representative | https://www.congress.gov.ph/house-members/view/L042 |
| Iloilo, 3rd District | Defensor, Lorenz R. | District Representative | https://www.congress.gov.ph/house-members/view/J119 |
| Iloilo, 4th District | Biron, Ferjenel G., M.D. | District Representative · Deputy Speaker | https://www.congress.gov.ph/house-members/view/E018 |
| Iloilo, 5th District | Tupas, Binky April M. | District Representative | https://www.congress.gov.ph/house-members/view/L084 |

**Mark’s “3 congresswomen” check:** gender is **not** on the API or on the allowed congress.gov.ph profile text, so this R0 pass cannot confirm a count of three. Do not infer gender from given names.

**DEO ↔ district mapping** (matches `portal.config.ts` and live district cards):

| DEO | Serves |
| --- | --- |
| Iloilo City DEO | Lone District of Iloilo City |
| Iloilo 1st DEO | 1st District |
| Iloilo 4th DEO | 2nd District |
| Iloilo 6th DEO | 3rd District |
| Iloilo 2nd DEO | 4th District |
| Iloilo 3rd DEO | 5th District |

**API nuance:** `representative.seat` for Gorriceta is spelled **“Iloilo City, 2nd District”** while the district card label is **“Iloilo, 2nd District”** — seat string only; mapping via `offices[].district_ids` is consistent.

## Motion

- Controls: **150–200ms** (tokens `--motion-control`).
- **Office card values:** on load and on filter change, figures **fade + translateY** using **`--motion-card: 320ms`** and `animation-fill-mode: backwards` — final values in the DOM immediately, **no count-up**. **`prefers-reduced-motion`** disables animation.

## Logo

Placeholder window mark in mockup headers only. **`logos.html` concepts are superseded** — Mark will supply the final logo in a later pass.

## Corrections (About page)

**hello@iloilotransparency.info** is the agreed placeholder (`mailto:` in mockups). Mark will set up routing later. **Do not wire into `src/` until routing is live** (mockups/README only for now).

## Dependencies (proposed)

| Package / asset | Licence | Approx. size | Why |
| --- | --- | --- | --- |
| *(none required)* | — | — | SVG logos and CSS charts avoid runtime deps |
| **Lucide** (optional) | ISC | ~500KB npm; tree-shake to tens of KB | Consistent 24px UI icons if we outgrow inline SVG |
| **Manrope 500–700** | SIL OFL | ~30KB WOFF2 subset | Headings, nav, summary figures — **R1: `public/fonts/`** |
| **Source Sans 3 400–600** | SIL OFL | ~40KB WOFF2 subset | Body, forms, tables — **R1: `public/fonts/`** |

Mockups use system UI stacks until R1 bundles WOFF2.

## Data refresh

HGAB **`meta`** (`built_at`, `source_repo`, `source_commit`, `notice`) is on **project list** envelopes and on the **overview** response (`GET /api/v1/hgab/2027`, what `overview()` calls) — the same fields the footer and About page use. **`built_at`** is the API dataset build time in ISO UTC (**not** the date of source PDFs). **GAA** responses use `meta` with `dataset: 'gaa'` and **no** `built_at`. If scope loading never hits a list envelope, the portal can still take **`meta`** from `overview()`.

Live reference: **`built_at`** `2026-10-26T08:46:14Z` → footer **data built October 26, 2026** (`date()` in `Asia/Manila`); About **Data version: comparison csiiiv, DPWH-NEP-HB-2027-ANALYSIS, a0caa77, built October 26, 2026.**

**Sample totals (mockups):**

| Scope | Records | Both lines | House-only | Proposed-only | NEP on | House on | Amounts (sample) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Six offices | 360 | 330 | 20 | 10 | 340 | 350 | ₱16.0B NEP · ₱17.0B House |
| Other (not in six offices) | 40 | 10 | 20 | 10 | — | — | (illustrative) |
| **Portal-wide** | **400** | **340** | **40** | **20** | **360** | **380** | — |

Bridge chips: unchanged (186) + increased (96) + decreased (48) = **330** with both lines across six offices; **House-only (20)** and **NEP-only (10)** separate.

**Proposal:** Keep **`meta.built_at`** as the canonical freshness line in the footer; About keeps **`source_commit`** as above. Do not substitute client fetch time for `built_at`.

## WCAG 2.2 AA contrast (computed sRGB)

| Pair | Ratio | AA normal text (4.5:1) | Notes |
| --- | ---: | --- | --- |
| Heading `#192D50` on page `#F7F8F5` | 12.85:1 | Pass | |
| Heading on card `#FFFFFF` | 13.70:1 | Pass | |
| Body `#243247` on page | 12.14:1 | Pass | |
| Body on card | 12.95:1 | Pass | |
| Secondary `#56647A` on page | 5.63:1 | Pass | |
| Secondary on card | 6.00:1 | Pass | |
| Link `#3659B8` on white | 6.41:1 | Pass | |
| Link hover `#294696` on white | 8.71:1 | Pass | |
| White on primary nav `#3659B8` | 6.41:1 | Pass | |
| White on primary hover `#294696` | 8.71:1 | Pass | |
| Teal `#218579` text on white | 4.47:1 | **Fail** normal | Use for **fills** (3:1 non-text ✓) or pair with bold ≥18px / use darker teal for small labels |
| Amber `#B7791F` text on white | 3.64:1 | **Fail** | **Decision:** restrict `#B7791F` to **chart/chip fills**; use **`--color-amber-text: #7A5216`** (6.89:1 on white) for labels |
| Amber text `#7A5216` on white | 6.89:1 | Pass | Adopt in tokens |
| Body on selection `#EDF2FC` | 11.53:1 | Pass | |
| Teal / amber bar fills on white | 4.47:1 / 3.64:1 | Pass non-text (3:1) | Adjacent teal/amber bars need ≥3:1 separation — offset tracks or legend; amber text uses `#7A5216` |
| Border `#DCE3EC` on white | 1.29:1 | N/A | Decorative rules only |

## Open questions (Mark)

1. **Congressman / Congresswoman labels** — mockups use **District Representative** from congress.gov.ph because gendered honorifics are not on the API or those profile pages. Should production copy use gendered labels from another official source?
2. **Enacted mockup depth** — R0 shows two sample office year charts + a short program table; expand in R1?

## Files

- `tokens.css`, `mockups.css`
- `mockup-offices-data.js`, `mockup-filters.js`, `capture-screenshots.mjs`
- `overview-desktop.html`, `overview-mobile.html`, `explorer.html`, `components.html`, `enacted.html`, `logos.html`
- `portraits/*.jpg` (local copies from API portrait URLs)
- `logos/*.svg` (six)
- `screenshots/*.png`

Re-capture screenshots: `node design/capture-screenshots.mjs` (1s wait for motion; copies to `/opt/cursor/artifacts/workspace/design/screenshots/`).
