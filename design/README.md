# R0: UI/UX redesign proposal (design only)

Static HTML/CSS mockups under `design/`. Open any `.html` file in a browser — no build step. Typography uses **system UI fallbacks** in mockups; **R1** will self-host **Manrope** and **Source Sans 3** as WOFF2 under `public/fonts/`.

Mark’s target mockup (revision 3): **straight to figures and data** — compact header, three summary cards, search + bridge chips, office card grid with mini bars, compare table, then accordion About rows and a compact footer.

## Page map

| Route | App page | Mockup |
| --- | --- | --- |
| `/` | Home | `overview-desktop.html`, `overview-mobile.html`, `explorer.html` |
| `/gaa` | Enacted | `enacted.html` |
| `/about` | About | Accordion rows on overview |
| `/districts` | → `/#offices` | Office section |

**Header:** logo placeholder, **Iloilo Transparency**, **Independent · Unofficial**, nav Overview / Enacted budgets / Project explorer / Offices, FY2027 selector. No route kicker under the selector.

## Summary & chips (reconciled sample)

| Chip | Count |
| --- | ---: |
| All | 360 |
| Same amount | 186 |
| Higher in House | 96 |
| Lower in House | 48 |
| House only | 20 |
| NEP only | 10 |

Chip text and the **Showing:** label use the **same words** (e.g. Showing: Higher in House). Demo wires **All** and **Higher in House**; other chips are disabled with “(demo: not wired)”.

Office amounts (₱B): City 3.6/3.9, 1st 2.8/3.0, 2nd 2.7/2.9, 3rd 2.5/2.6, 4th 2.4/2.5, 6th 2.0/2.1. Totals ₱16.0B / ₱17.0B. Per-card both + House-only + NEP-only = 60.

## Office cards

Modeled on Mark’s grid: Region VI eyebrow, records badge, Proposed · NEP / House version, change pill (+₱ and %), two thin bars on a shared zero-based scale, legislative district representative (local portrait, District Representative, Bills + District page), Coverage and source details (includes neighbouring-province caveat), View projects.

**DEO mapping** (unchanged): City→Lone; 1st→1st; 4th DEO→2nd; 6th→3rd; 2nd DEO→4th; 3rd DEO→5th. No 5th DEO.

## Representatives

Honorific: **District Representative** (congress.gov.ph). Bills URLs from API `bills_url` verbatim. No leadership titles.

**Portraits:** House of Representatives of the Philippines, public domain, via Wikimedia Commons.

| Representative | Portrait `source_url` |
| --- | --- |
| Baronda, Julienne "Jam" L. | https://commons.wikimedia.org/wiki/File:Rep._Julienne_Baronda_(20th_Congress).jpg |
| Garin, Janette L. | https://commons.wikimedia.org/wiki/File:Rep._Janette_Garin_(20th_Congress).jpg |
| Gorriceta, Kathryn Joyce F., MD | https://commons.wikimedia.org/wiki/File:Rep._Kathryn_Joyce_Gorriceta_(20th_Congress).jpg |
| Defensor, Lorenz R. | https://commons.wikimedia.org/wiki/File:Rep._Lorenz_Defensor_(20th_Congress).jpg |
| Biron, Ferjenel G., M.D. | https://commons.wikimedia.org/wiki/File:Rep._Ferjenel_Biron_(20th_Congress).jpg |
| Tupas, Binky April M. | https://commons.wikimedia.org/wiki/File:Rep._Binky_April_Tupas_(20th_Congress).jpg |

| District | Name | Profile |
| --- | --- | --- |
| City Lone | Baronda, Julienne "Jam" L. | https://www.congress.gov.ph/house-members/view/J013 |
| 1st | Garin, Janette L. | https://www.congress.gov.ph/house-members/view/E032 |
| 2nd | Gorriceta, Kathryn Joyce F., MD | https://www.congress.gov.ph/house-members/view/L042 |
| 3rd | Defensor, Lorenz R. | https://www.congress.gov.ph/house-members/view/J119 |
| 4th | Biron, Ferjenel G., M.D. | https://www.congress.gov.ph/house-members/view/E018 |
| 5th | Tupas, Binky April M. | https://www.congress.gov.ph/house-members/view/L084 |

## Motion & keepers

- Cards follow filters; **320ms** fade/slide; no count-up; static under `prefers-reduced-motion`.
- Sample banner; no City/Province shortcuts; no completion %; portrait credit; email placeholder; logo placeholder pending Mark.
- R1 fonts under `public/fonts/`.

## Screenshots

`ARTIFACTS_DIR=/opt/cursor/artifacts/workspace/design/screenshots node design/capture-screenshots.mjs` (1s wait). Or run without `ARTIFACTS_DIR` for repo-only PNGs.

## Open questions

1. District Representative vs gendered Congressman/Congresswoman in production?
2. Wire remaining bridge chips beyond All / Higher in House?
