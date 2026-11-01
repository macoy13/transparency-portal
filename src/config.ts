/**
 * The portal's configuration contract. A fork edits `portal.config.ts` at the
 * repository root; nothing else needs to change to point the portal at a
 * different LGU or district engineering office.
 *
 * Pure: no browser or Vite APIs, so `scripts/` (tsx) and `vite.config.ts`
 * import it too.
 */

/** The four programs the FY2027 House bill lists project by project. */
export type DatasetKey = 'dpwh' | 'fmr' | 'hfep' | 'nia';
export const DATASET_KEYS: readonly DatasetKey[] = ['dpwh', 'fmr', 'hfep', 'nia'];

/** What the portal is for. Only changes wording; the scope decides the data. */
export type PortalKind = 'deo' | 'province' | 'city' | 'municipality';

export const KIND_LABELS: Record<PortalKind, string> = {
  deo: 'DPWH district engineering office',
  province: 'Province',
  city: 'City',
  municipality: 'Municipality',
};

/** The years that follow the kind on the default masthead line. */
export const MASTHEAD_YEARS = 'Budgets 2020–2027';

/** A place whose name, in a project's title, brings the project into the portal. */
export interface PlaceQuery {
  /** What readers see: "Tagbilaran". */
  label: string;
  /**
   * The API search. Every word must appear in the project's title or listing
   * ("Tagbilaran Bohol" needs both). Defaults to `label`.
   */
  q?: string;
  /** A region key ("VII", "NCR", "IV-A") to keep a common name to one region. */
  region?: string;
  /** Programs to search. Defaults to all four. */
  datasets?: DatasetKey[];
}

/** A line the maintainer removed from the portal. Every exclusion is published on the About page. */
export interface Exclusion {
  /** `<dataset>:<id>` for a 2027 line ("dpwh:house-reading:848"), or `gaa:<family key>` for a 2020–2026 program. */
  key: string;
  /** Why, in a sentence a reader can check. */
  reason: string;
}

export interface PortalConfig {
  /** Stable id, lowercase with hyphens. Sent with citizen reports: "bohol-province". */
  id: string;
  kind: PortalKind;
  /**
   * The line above the portal name. When omitted, the masthead shows the kind
   * ("Province", "City", …) and "· Budgets 2020–2027".
   */
  kicker?: string;
  /** The LGU or office in full: "Province of Bohol". */
  name: string;
  /** Short form for headings: "Bohol". Defaults to `name`. */
  shortName?: string;
  /** Who runs this copy of the portal. Shown in the footer. */
  operator: { name: string; url?: string; email?: string };
  /** Optional logo: a path under public/ ("/brand/lgu-seal.png") or a URL. */
  logo?: string;
  /**
   * Optional brand assets for compact chrome. Paths are under public/.
   * `lockup` is the full logo image for the header; `icons` are favicons
   * derived from the same mark (cropped). Omit `brand` to keep BetterGov chrome.
   */
  brand?: {
    /** Full lockup (1x) shown in the compact header. */
    lockup?: string;
    /** Optional 2x lockup for denser displays. */
    lockup2x?: string;
    /** Favicon set — only linked when compact is on. */
    icons?: {
      svg?: string;
      png16?: string;
      png32?: string;
      ico?: string;
      appleTouch?: string;
    };
  };
  /** Canonical URL of this deployment, for link previews. */
  siteUrl?: string;
  /**
   * The blue "Create your own transparency portal" strip above the masthead,
   * linking to the source on GitHub. On unless set to false.
   * Hiding the strip alone leaves the other source links. Set `chrome.sourceLinks`
   * to false to hide the strip and those links together.
   */
  buildYourOwnStrip?: boolean;
  /**
   * Header and footer links that leave this portal. Each one is on unless
   * set to false, so a fork that omits `chrome` keeps the current chrome.
   */
  chrome?: {
    /**
     * The blue strip, the header "Build your own" link, and the footer link
     * to this portal's source on GitHub.
     */
    sourceLinks?: boolean;
    /** The header "API" link, the footer API link, and a project's API-record link. */
    apiLinks?: boolean;
    /**
     * Compact branded chrome: R0 header/footer, self-hosted type, and the
     * portal's own mark. Off unless set to true, so other BetterGov forks keep
     * the default masthead.
     */
    compact?: boolean;
  };
  /**
   * Home-page presentation. Omitted, the home page stays as it is upstream:
   * the project search lives in the list toolbar, under the office cards.
   */
  home?: {
    /**
     * The same project search (`q`) sits just under the lede, before the
     * office cards, and still filters the one list. On a narrow screen the
     * lede moves below the four totals so that search is on the first screen.
     * Off unless set to true.
     */
    searchUnderLede?: boolean;
  };
  /** Budget API host. Default https://budget.bettergov.ph. VITE_API_BASE overrides it. */
  api?: string;
  scope: {
    /**
     * DPWH offices, named exactly as the documents publish them
     * ("Bohol 1st District Engineering Office"). Every DPWH line listed under
     * each office is in the portal. `npm run setup` finds the names.
     */
    offices?: string[];
    /**
     * Places whose name in a project's title brings it in: the four 2027
     * programs, and every department's programs in the 2020–2026 budgets.
     */
    places?: PlaceQuery[];
    /** Legislative districts to show cards for: ids such as "leg:bohol:1st". */
    districts?: string[];
    /** Lines removed by hand. Published, with reasons, on the About page. */
    exclude?: Exclusion[];
  };
  /**
   * Citizen reports go to one central service on budget.bettergov.ph (not
   * built yet). While `enabled` is false the portal says reporting is coming.
   * See docs/reporting.md for the link contract.
   */
  reporting?: { enabled: boolean; url?: string };
}

export const DEFAULT_API = 'https://budget.bettergov.ph';
export const DEFAULT_REPORT_URL = 'https://budget.bettergov.ph/report';

export function defineConfig(config: PortalConfig): PortalConfig {
  return config;
}

/** Problems a fork should fix before deploying. Empty when the config is usable. */
export function configProblems(config: PortalConfig): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.id)) {
    problems.push(`id "${config.id}" should be lowercase letters, digits and hyphens.`);
  }
  if (!config.name.trim()) problems.push('name is empty.');
  if (!config.operator?.name?.trim()) problems.push('operator.name is empty: say who runs this portal.');
  const { offices = [], places = [], districts = [], exclude = [] } = config.scope;
  if (!offices.length && !places.length) {
    problems.push('scope needs at least one office or place, or the portal has no projects.');
  }
  for (const p of places) {
    if (!p.label.trim()) problems.push('a place has an empty label.');
    for (const d of p.datasets ?? []) {
      if (!DATASET_KEYS.includes(d)) problems.push(`place "${p.label}": unknown program "${d}".`);
    }
  }
  for (const d of districts) {
    if (!d.startsWith('leg:')) problems.push(`district "${d}" should be an id such as "leg:bohol:1st".`);
  }
  for (const e of exclude) {
    if (!/^(dpwh|fmr|hfep|nia|gaa):.+/.test(e.key)) problems.push(`exclusion "${e.key}" should be "<program>:<id>" (2027) or "gaa:<family key>" (2020–2026).`);
    if (!e.reason.trim()) problems.push(`exclusion "${e.key}" needs a reason; readers see it.`);
  }
  return problems;
}

export function shortNameOf(config: PortalConfig): string {
  return config.shortName?.trim() || config.name;
}

/** GitHub links that invite a reader to build their own portal. On unless `chrome.sourceLinks` is false. */
export function showSourceLinks(config: PortalConfig): boolean {
  return config.chrome?.sourceLinks !== false;
}

/** The blue strip. Also off when source links are off. `buildYourOwnStrip: false` hides only the strip. */
export function showBuildStrip(config: PortalConfig): boolean {
  return showSourceLinks(config) && config.buildYourOwnStrip !== false;
}

/** Links to the Budget API docs and to a project's API record. On unless `chrome.apiLinks` is false. */
export function showApiLinks(config: PortalConfig): boolean {
  return config.chrome?.apiLinks !== false;
}

/** Compact branded header/footer and tokens. Off unless `chrome.compact` is true. */
export function compactChrome(config: PortalConfig): boolean {
  return config.chrome?.compact === true;
}

/** The home-page search sits under the lede. Off unless `home.searchUnderLede` is true. */
export function homeSearchUnderLede(config: PortalConfig): boolean {
  return config.home?.searchUnderLede === true;
}
