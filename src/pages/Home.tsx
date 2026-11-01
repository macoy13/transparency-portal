import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import type { BridgeGroup, DatasetInfo, Disclaimer, GroupInfo } from '../api/types';
import { BRIDGE_GROUPS } from '../api/types';
import { compactChrome, homeSearchUnderLede, shortNameOf, type DatasetKey } from '../config';
import { Await, Disclaimers, ReasonTags, StatusChip } from '../components/Bits';
import { PageHead } from '../components/Chrome';
import OfficesSection from '../components/OfficesSection';
import { projectsCsv, downloadText } from '../lib/csv';
import { count, php, phpDelta, plural } from '../lib/format';
import { usePortal } from '../lib/portal-context';
import { summarise, type ScopedProject, type ScopeResult, type Summary } from '../lib/scope';
import { useTitle } from '../lib/use-title';

const PAGE = 100;

/** Same breakpoint as the narrow layout in app.css. */
const NARROW_SCREEN = '(max-width: 560px)';

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia(NARROW_SCREEN);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function useNarrowScreen(): boolean {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW_SCREEN).matches, () => false);
}

function scrollToProjects() {
  document.getElementById('projects')?.scrollIntoView({ block: 'start' });
}

/** What the count says: the total, or "N of M" once the list is narrowed. */
function countLabel(shown: number, total: number): string {
  return shown === total ? plural(total, 'project') : `${count(shown)} of ${plural(total, 'project')}`;
}

/**
 * One polite live region. The visible count updates immediately; this copy
 * waits, so a screen reader does not speak each letter of a word.
 * `silence` drops a pending update, for when focus is about to read the count.
 */
function useCountAnnouncement(text: string): { announced: string; silence: () => void } {
  const [announced, setAnnounced] = useState(text);
  const skipRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const silence = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAnnounced('');
  };

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setAnnounced(text);
    }, 500);
    return () => {
      if (timerRef.current == null) return;
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [text]);

  return { announced, silence };
}

/** The one `q` field. `controls` points the hero search at the project list. */
function QueryField({ q, onChange, controls, submitHint }: { q: string; onChange: (value: string) => void; controls?: string; submitHint?: boolean }) {
  return (
    <label className="field field-grow">
      <span className="label">Search</span>
      <input
        type="search"
        value={q}
        placeholder="Barangay, road, school, office…"
        aria-controls={controls}
        enterKeyHint={submitHint ? 'search' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

type Sort = 'house' | 'nep' | 'change' | 'title';
const SORTS: Record<Sort, { label: string; cmp: (a: ScopedProject, b: ScopedProject) => number }> = {
  house: { label: 'House bill amount', cmp: (a, b) => (b.house_php ?? -1) - (a.house_php ?? -1) },
  nep: { label: 'NEP amount', cmp: (a, b) => (b.nep_php ?? -1) - (a.nep_php ?? -1) },
  change: { label: 'Size of change', cmp: (a, b) => Math.abs(b.delta_php ?? 0) - Math.abs(a.delta_php ?? 0) },
  title: { label: 'Name', cmp: (a, b) => a.title.localeCompare(b.title) },
};

export default function Home() {
  const { scope, overview, config } = usePortal();
  useTitle(`Every FY 2027 project · ${shortNameOf(config)}`);
  const datasets = overview.status === 'ready' ? overview.value.data.datasets : [];
  return (
    <main id="main" className="page main">
      <Await state={scope} what="projects">
        {(s) => <Projects scope={s} datasets={datasets} />}
      </Await>
    </main>
  );
}

/** Group wording from the API (label, sub, help), falling back to the row's own label. */
type GroupWords = Pick<GroupInfo, 'label' | 'sub' | 'help'>;

function groupInfo(datasets: DatasetInfo[], rows: ScopedProject[]): Record<BridgeGroup, GroupWords> {
  const fromApi = datasets[0]?.bridge.groups;
  const out = {} as Record<BridgeGroup, GroupWords>;
  for (const g of BRIDGE_GROUPS) {
    out[g] = fromApi?.[g] ?? { label: rows.find((r) => r.bridge_group === g)?.group_label ?? g, sub: '', help: '' };
  }
  return out;
}

function Projects({ scope, datasets }: { scope: ScopeResult; datasets: DatasetInfo[] }) {
  const { config, districts } = usePortal();
  const leadSearch = homeSearchUnderLede(config);
  const narrow = useNarrowScreen();
  const { hash } = useLocation();

  // #offices and #projects links land on their section once it has rendered.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' });
  }, [hash, districts.status]);

  // The disclaimers of every response on this page: the project lists' and the districts'.
  const disclaimers = useMemo(() => {
    const byId = new Map<string, Disclaimer>(scope.disclaimers.map((d) => [d.id, d]));
    if (districts.status === 'ready') for (const env of districts.value) for (const d of env.disclaimers) if (!byId.has(d.id)) byId.set(d.id, d);
    return [...byId.values()];
  }, [scope.disclaimers, districts]);
  const name = shortNameOf(config);
  const all = scope.projects;
  const summary = useMemo(() => summarise(all), [all]);
  const groups = useMemo(() => groupInfo(datasets, all), [datasets, all]);
  const programName = (k: DatasetKey) => datasets.find((d) => d.key === k)?.short ?? k.toUpperCase();

  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const program = (params.get('program') ?? '') as DatasetKey | '';
  const status = (params.get('status') ?? '') as BridgeGroup | '';
  const why = params.get('why') ?? '';
  const office = params.get('office') ?? '';
  const sort = (params.get('sort') as Sort) in SORTS ? (params.get('sort') as Sort) : 'house';
  const [shown, setShown] = useState(PAGE);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setShown(PAGE);
  };

  // DPWH offices among the rows, largest first, for the Office filter.
  const offices = useMemo(() => {
    const n = new Map<string, number>();
    for (const p of all) if (p.office) n.set(p.office, (n.get(p.office) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en', { numeric: true }));
  }, [all]);

  const reasons = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of all) for (const r of p.reasons) seen.set(`${r.kind}:${r.label}`, r.kind === 'office' ? `Office: ${shortOffice(r.label)}` : `Title names ${r.label}`);
    return [...seen.entries()];
  }, [all]);

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = all.filter((p) => {
      if (program && p.dataset !== program) return false;
      if (status && p.bridge_group !== status) return false;
      if (why && !p.reasons.some((r) => `${r.kind}:${r.label}` === why)) return false;
      if (office && p.office !== office) return false;
      if (words.length) {
        const hay = [p.title, p.program, p.pap, p.office, p.region].join(' ').toLowerCase();
        if (!words.every((w) => hay.includes(w))) return false;
      }
      return true;
    });
    return rows.sort((a, b) => SORTS[sort].cmp(a, b) || a.title.localeCompare(b.title));
  }, [all, q, program, status, why, office, sort]);
  const filteredSummary = useMemo(() => summarise(filtered), [filtered]);
  const narrowed = filtered.length !== all.length;

  const compact = compactChrome(config);
  const eyebrow = <>FY 2027<span className="sep">·</span>NEP and House Bill 10858<span className="sep">·</span>{name}</>;
  const title = `${plural(summary.rows, 'project')} for ${name} in the 2027 budget`;
  const lede = (
    <div className="lede">
      <Lede summary={summary} />
    </div>
  );
  const totals = <Stats summary={summary} programName={programName} />;
  const clearFilters = () => {
    setParams(new URLSearchParams(), { replace: true });
    setShown(PAGE);
  };

  return (
    <>
      {leadSearch ? (
        <HomeIntro
          narrow={narrow}
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          totals={totals}
          q={q}
          shown={filtered.length}
          total={all.length}
          onQuery={(value) => setParam('q', value)}
          fyLabel={compact ? 'FY2027' : undefined}
        />
      ) : (
        <>
          <PageHead eyebrow={eyebrow} title={title} fyLabel={compact ? 'FY2027' : undefined}>
            <Lede summary={summary} />
          </PageHead>
          {totals}
        </>
      )}

      <OfficesSection />

      <section className="section" aria-labelledby="groups-h">
        <h2 id="groups-h" className="section-h">What the House bill did to them</h2>
        {compact && <p className="groups-filter-label" id="groups-filter-label">Filter by status</p>}
        <div className={compact ? 'groups-row' : undefined}>
          <div className="groups" role="group" aria-label="Filter by status" aria-labelledby={compact ? 'groups-filter-label' : undefined}>
            {BRIDGE_GROUPS.map((g) => {
              const cell = summary.groups[g];
              const info = groups[g];
              const active = status === g;
              return (
                <button
                  key={g}
                  type="button"
                  className={`group-tile${active ? ' active' : ''}`}
                  disabled={!cell.rows}
                  aria-pressed={active}
                  aria-label={cell.rows ? `Filter by status: ${info.label}` : `${info.label}, no projects`}
                  title={info.help}
                  onClick={() => setParam('status', active ? '' : g)}
                >
                  <span className="group-label"><span className={`status-dot g-${g}`} aria-hidden="true" />{info.label}</span>
                  {info.sub && <span className="label">{info.sub}</span>}
                  <span className="group-count num">{count(cell.rows)}</span>
                  <span className="group-php num">{groupAmount(g, cell)}</span>
                </button>
              );
            })}
          </div>
          {compact && narrowed && (
            <button type="button" className="clear-filters" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="section" id="projects" aria-labelledby="list-h">
        <div className="list-head">
          <h2 id="list-h" className="section-h" tabIndex={leadSearch ? -1 : undefined}>
            {narrowed ? `${count(filtered.length)} of ${plural(all.length, 'project')}` : `Every project (${count(all.length)})`}
          </h2>
          <button type="button" className="button button-quiet" onClick={() => downloadText(`${config.id}-fy2027-projects.csv`, projectsCsv(filtered))}>
            Download CSV{narrowed ? ` (${count(filtered.length)})` : ''}
          </button>
        </div>

        <div className="toolbar">
          {!leadSearch && <QueryField q={q} onChange={(value) => setParam('q', value)} />}
          <label className="field">
            <span className="label">Program</span>
            <select value={program} onChange={(e) => setParam('program', e.target.value)}>
              <option value="">All programs</option>
              {(Object.keys(summary.byDataset) as DatasetKey[]).map((k) => (
                <option key={k} value={k}>{programName(k)} ({count(summary.byDataset[k]!.rows)})</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="label">Status</span>
            <select value={status} onChange={(e) => setParam('status', e.target.value)}>
              <option value="">Any status</option>
              {BRIDGE_GROUPS.filter((g) => summary.groups[g].rows).map((g) => (
                <option key={g} value={g}>{groups[g].label} ({count(summary.groups[g].rows)})</option>
              ))}
            </select>
          </label>
          {offices.length > 1 && (
            <label className="field">
              <span className="label">DPWH office</span>
              <select value={office} onChange={(e) => setParam('office', e.target.value)}>
                <option value="">Any office</option>
                {offices.map(([o, n]) => <option key={o} value={o}>{shortOffice(o)} ({count(n)})</option>)}
              </select>
            </label>
          )}
          {reasons.length > 1 && (
            <label className="field">
              <span className="label">Listed because</span>
              <select value={why} onChange={(e) => setParam('why', e.target.value)}>
                <option value="">Any reason</option>
                {reasons.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
          )}
          <label className="field">
            <span className="label">Sort by</span>
            <select value={sort} onChange={(e) => setParam('sort', e.target.value === 'house' ? '' : e.target.value)}>
              {(Object.keys(SORTS) as Sort[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
            </select>
          </label>
        </div>

        {narrowed && (
          <p className="filter-sums">
            These {count(filtered.length)}: NEP {php(filteredSummary.nep.php)} on {count(filteredSummary.nep.rows)}
            <span className="sep">·</span>House bill {php(filteredSummary.house.php)} on {count(filteredSummary.house.rows)}
            {!compact && (
              <>
                <span className="sep">·</span>
                <button type="button" className="link-button" onClick={clearFilters}>
                  Clear filters
                </button>
              </>
            )}
          </p>
        )}

        <ProjectTable rows={filtered.slice(0, shown)} programName={programName} />

        {filtered.length === 0 && <p className="state">No project matches. Try fewer words or clear the filters.</p>}
        {filtered.length > shown && (
          <div className="more">
            <span className="muted">Showing {count(shown)} of {count(filtered.length)}</span>
            <button type="button" className="button" onClick={() => setShown((n) => n + PAGE)}>Show {count(Math.min(PAGE, filtered.length - shown))} more</button>
            <button type="button" className="button button-quiet" onClick={() => setShown(filtered.length)}>Show all</button>
          </div>
        )}

        <p className="fine">
          Amounts are in pesos, as each document publishes them. A dash means that document has no such line. The NEP
          and the House bill are two versions of one budget: their totals are compared, never added.
        </p>
      </section>

      <Disclaimers items={disclaimers} compact />
    </>
  );
}

/**
 * Search under the lede, then the four totals, then (unchanged) the offices.
 * At 560px and below the lede follows the totals, so the search stays on the
 * first screen. The order is real markup: tab order matches the screen.
 */
function HomeIntro({
  narrow,
  eyebrow,
  title,
  lede,
  totals,
  q,
  shown,
  total,
  onQuery,
  fyLabel,
}: {
  narrow: boolean;
  eyebrow: ReactNode;
  title: string;
  lede: ReactNode;
  totals: ReactNode;
  q: string;
  shown: number;
  total: number;
  onQuery: (value: string) => void;
  fyLabel?: string;
}) {
  // Enter, or the keyboard's search key, opens the list. Typing does not scroll.
  const submit = () => {
    scrollToProjects();
    document.getElementById('list-h')?.focus({ preventScroll: true });
  };
  const search = <LeadSearch q={q} shown={shown} total={total} onQuery={onQuery} onSubmit={submit} />;

  return (
    <div className={narrow ? 'home-top home-top-narrow' : 'home-top'}>
      <PageHead eyebrow={eyebrow} title={title} fyLabel={fyLabel} />
      {narrow ? (
        <>
          {search}
          {totals}
          {lede}
        </>
      ) : (
        <>
          {lede}
          {search}
          {totals}
        </>
      )}
    </div>
  );
}

function LeadSearch({
  q,
  shown,
  total,
  onQuery,
  onSubmit,
}: {
  q: string;
  shown: number;
  total: number;
  onQuery: (value: string) => void;
  onSubmit: () => void;
}) {
  const { announced, silence } = useCountAnnouncement(countLabel(shown, total));
  return (
    <form
      className="home-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        // The heading is about to say the count. Drop the pending live update.
        silence();
        onSubmit();
      }}
    >
      <QueryField q={q} controls="projects" submitHint onChange={onQuery} />
      <p className="home-search-count" aria-hidden="true">{countLabel(shown, total)}</p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announced}</p>
    </form>
  );
}

/** "Bohol 1st District Engineering Office" → "Bohol 1st DEO", for tight spaces. */
function shortOffice(office: string): string {
  return office.replace(/ District Engineering Office$/, ' DEO');
}

function groupAmount(g: BridgeGroup, c: { nep_php: number; house_php: number; rows: number }): string {
  if (!c.rows) return '—';
  switch (g) {
    case 'nep_only': return php(c.nep_php);
    case 'increased':
    case 'decreased':
    case 'scope_review': return phpDelta(c.house_php - c.nep_php);
    default: return php(c.house_php);
  }
}

function Lede({ summary }: { summary: Summary }) {
  const added = summary.groups.house_only.rows;
  const dropped = summary.groups.nep_only.rows;
  return (
    <p>
      The NEP lists {count(summary.nep.rows)} of them, for {php(summary.nep.php)}; the House bill lists{' '}
      {count(summary.house.rows)}, for {php(summary.house.php)}.{' '}
      {added || dropped ? (
        <>
          {plural(added, 'project is', 'projects are')} in the House bill only and {count(dropped)} in the NEP only: candidates
          to check, not confirmed changes.
        </>
      ) : (
        <>Every project is in both.</>
      )}
    </p>
  );
}

function Stats({ summary, programName }: { summary: Summary; programName: (k: DatasetKey) => string }) {
  const programs = (Object.entries(summary.byDataset) as [DatasetKey, { rows: number }][])
    .sort((a, b) => b[1].rows - a[1].rows)
    .map(([k, c]) => `${programName(k)} ${count(c.rows)}`)
    .join(' · ');
  return (
    <dl className="stats">
      <div>
        <dt className="label">Projects</dt>
        <dd className="stat num">{count(summary.rows)}</dd>
        <dd className="stat-sub">{programs || 'none'}</dd>
      </div>
      <div>
        <dt className="label">NEP</dt>
        <dd className="stat num">{php(summary.nep.php)}</dd>
        <dd className="stat-sub">{plural(summary.nep.rows, 'project')} · the budget the President submits</dd>
      </div>
      <div>
        <dt className="label">House bill</dt>
        <dd className="stat num stat-accent">{php(summary.house.php)}</dd>
        <dd className="stat-sub">{plural(summary.house.rows, 'project')} · compared with the NEP, not added</dd>
      </div>
      <div>
        <dt className="label">In the House bill only</dt>
        <dd className="stat num">{count(summary.groups.house_only.rows)}</dd>
        <dd className="stat-sub">{php(summary.groups.house_only.house_php)} · insertion candidates</dd>
      </div>
    </dl>
  );
}

function ProjectTable({ rows, programName }: { rows: ScopedProject[]; programName: (k: DatasetKey) => string }) {
  if (!rows.length) return null;
  return (
    <div className="table" role="table" aria-label="Projects">
      <div className="tr th" role="row">
        <span role="columnheader">Project</span>
        <span role="columnheader">Status</span>
        <span role="columnheader" className="r">NEP</span>
        <span role="columnheader" className="r">House bill</span>
        <span role="columnheader" className="r">Change</span>
      </div>
      {rows.map((p) => (
        <div className="tr" role="row" key={p.key}>
          <span role="cell" className="td-project">
            <Link to={`/projects/${p.dataset}/${encodeURIComponent(p.id)}`} className="project-title">{p.title}</Link>
            <span className="project-meta">
              <span className="label">{programName(p.dataset)}</span>
              {p.office && <span>{shortOffice(p.office)}</span>}
              {p.region && <span>{p.region}</span>}
              <ReasonTags reasons={p.reasons} />
            </span>
          </span>
          <span role="cell" className="td-status"><StatusChip group={p.bridge_group} label={p.status_label} held={p.held} /></span>
          <span role="cell" className="r num" data-label="NEP">{php(p.nep_php)}</span>
          <span role="cell" className="r num strong" data-label="House bill">{php(p.house_php)}</span>
          <span role="cell" className={`r num delta ${(p.delta_php ?? 0) > 0 ? 'up' : (p.delta_php ?? 0) < 0 ? 'down' : ''}`} data-label="Change">
            {phpDelta(p.delta_php)}
          </span>
        </div>
      ))}
    </div>
  );
}
