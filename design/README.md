# R0: UI/UX redesign proposal (design only)

Static HTML/CSS mockups under `design/`. Open any `.html` file in a browser — no build step. Typography uses **system UI fallbacks** in mockups; production should self-host WOFF2 subsets (see dependencies).

## Page map (actual app routes)

| Route | App page | Mockup |
| --- | --- | --- |
| `/` | **Home** — FY2027 scope summary, office/district section (`#offices`), bridge-status filters, searchable project list (`#projects`) | `overview-desktop.html`, `overview-mobile.html`, `explorer.html` |
| `/gaa` | **Enacted** — General Appropriations Act programs 2020–2026 (not FY2027 NEP/House lines) | Referenced in overview copy; no separate static page in R0 |
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
| **Office chart/table** | API office figures (named projects, NEP vs House on one ledger); residual lines excluded | Not filter-linked in R0 proposal — office section is scope-wide; list filters do not re-aggregate offices in current app |
| **Program breakdown** | Subline under Projects stat (`byDataset` row counts) | Program filter |

Labeling: **NEP → “Proposed (NEP)”**; **House bill → “House version”**. Enacted `/gaa` uses GAA program families — separate from FY2027 project lines.

## Chart plan

- **Colour roles:** blue is only for nav, links, selection, and primary actions. **Data series:** proposed (NEP) **teal** (`#218579`); **House version amber** (fills `#B7791F`, labels `#7A5216`) — each labelled, never colour alone.
- **Horizontal bars by DPWH office** (and district cards where data exists): **two sub-rows per office** (proposed, then House), each from a **zero baseline** — no overlap, no stacking, **compared not added**.
- **History:** only years/stages the API compares on the same basis (Enacted page: 2020–22, 2023–25, 2026, and 2027’s two versions where both exist — skip incomparable series, e.g. Iloilo 6th DEO before 2025 per About reading note).
- **Accessibility:** status uses dot + text; teal/amber never alone. Amber **fills** use `#B7791F`; **text** uses `#7A5216` (see contrast).
- **Alternative:** `#office-table` with columns office, proposed (NEP), House version, change — linked from chart footer.

## Corrections (About page)

The production **About** route (`/about`) should include a short **Corrections** section: invite readers to email **hello@iloilotransparency.info** (`mailto:`) for factual corrections or scope questions. Footer links on every page point to the same address. **Note:** inbox routing for this address still needs to be verified before `src/` footer/About code is changed.

## Dependencies (proposed)

| Package / asset | Licence | Approx. size | Why |
| --- | --- | --- | --- |
| *(none required)* | — | — | SVG logos and CSS charts avoid runtime deps |
| **Lucide** (optional) | ISC | ~500KB npm; tree-shake to tens of KB | Consistent 24px UI icons (search, external, chevron) if we outgrow inline SVG |
| **Manrope 500–700** | SIL OFL | ~30KB WOFF2 subset | Headings, nav, summary figures |
| **Source Sans 3 400–600** | SIL OFL | ~40KB WOFF2 subset | Body, forms, tables, chart labels |

Mockups did not bundle WOFF2 files (network not required for review).

## Data refresh

HGAB **`meta`** (`built_at`, `source_repo`, `source_commit`, `notice`) is on **project list** envelopes and on the **overview** response (`GET /api/v1/hgab/2027`, what `overview()` calls) — the same fields the footer and About page use. **`built_at`** is the API dataset build time in ISO UTC (**not** the date of source PDFs). **GAA** responses use `meta` with `dataset: 'gaa'` and **no** `built_at`. If scope loading never hits a list envelope, the portal can still take **`meta`** from `overview()`.

Live reference: **`built_at`** `2026-10-26T08:46:14Z` → footer **data built October 26, 2026** (`date()` in `Asia/Manila`); About **Data version: comparison csiiiv, DPWH-NEP-HB-2027-ANALYSIS, a0caa77, built October 26, 2026.**

**Sample totals (mockups):** 400 project records; bridge chips 200 + 80 + 60 + 40 + 20 = 400; **40** House-version-only → **360** with a proposed (NEP) line; **20** proposed-only → **380** with a House version line.

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

1. **Logo direction** — window, bridge, or IT monogram (or wordmark-only)?
2. **City vs Province split** — disabled “after classification” chip until geography is in scope?
3. **Office chart vs filters** — should list filters recompute office bars, or stay scope-wide with a clear label?
4. **Enacted mockup** — worth a dedicated `design/enacted.html` in R1?
5. **Self-hosted fonts** — OK to add WOFF2 under `public/fonts/` in a later PR?

## Files

- `tokens.css`, `mockups.css`
- `overview-desktop.html`, `overview-mobile.html`, `explorer.html`, `components.html`, `logos.html`
- `logos/*.svg` (six)
- `screenshots/*.png`
