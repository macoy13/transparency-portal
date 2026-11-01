/**
 * DPWH offices first, legislative districts under them: the hierarchy the
 * budget documents use. DPWH lists its money by district engineering office
 * (DEO); each office serves one or more legislative districts.
 *
 * Each office's figures are shown once, whole. A shared (Tier B) office's
 * districts are listed under it and its money is never split between them.
 * Figures are the API's office figures (named projects, NEP against House
 * bill on the same ledger); lines whose two versions name different offices
 * are held out of them, as the API holds them out.
 *
 * Compact chrome renders the R0 office-card grid and compare table; amounts
 * follow the Home filters without changing the calculation code.
 */
import { Link } from 'react-router-dom';
import { useId, useMemo } from 'react';
import type { BridgeGroup, DistrictCard, DistrictOffice, Envelope } from '../api/types';
import { BRIDGE_GROUPS } from '../api/types';
import { compactChrome } from '../config';
import { count, php, phpDelta, plural } from '../lib/format';
import { usePortal } from '../lib/portal-context';
import type { QueryReport, ScopedProject } from '../lib/scope';
import { Await, External } from './Bits';

/** Local portraits from design/portraits (House of Representatives, public domain). */
const LOCAL_PORTRAITS: Record<string, string> = {
  'leg:iloilo-city:lone': '/brand/iloilo/portraits/baronda.jpg',
  'leg:iloilo:1st': '/brand/iloilo/portraits/garin.jpg',
  'leg:iloilo:2nd': '/brand/iloilo/portraits/gorriceta.jpg',
  'leg:iloilo:3rd': '/brand/iloilo/portraits/defensor.jpg',
  'leg:iloilo:4th': '/brand/iloilo/portraits/biron.jpg',
  'leg:iloilo:5th': '/brand/iloilo/portraits/tupas.jpg',
};

const PORTRAIT_CREDIT =
  'House of Representatives of the Philippines, public domain, via Wikimedia Commons';

interface DistrictRow {
  id: string;
  label: string;
  card: DistrictCard | null;
  /** Other offices that also build in this district. */
  alsoServedBy: string[];
}

interface OfficeView {
  office: DistrictOffice;
  /** The office as the documents publish it ("Bohol 1st District Engineering Office"). */
  printed: string;
  /** The portal's query for this office, when all of its lines are in the portal. */
  query: QueryReport | null;
  /** How many of the portal's lines the documents list under this office. */
  lines: number;
  districts: DistrictRow[];
}

export interface CompactOfficesProps {
  /** Projects after Home's search/status/office filters (cards + table rows). */
  filtered: ScopedProject[];
  /**
   * Projects after search + office filters only (no status). Table status chips
   * count offices from this set so chips stay switchable while a status is on.
   */
  scoped: ScopedProject[];
  /** All portal projects (for unfiltered whole-office card figures). */
  all: ScopedProject[];
  /** Active bridge status, or '' for All. */
  status: BridgeGroup | '';
  /** Active office filter printed name, or ''. */
  office: string;
  /** Chip label for the compare-table "All" / status chips. */
  chipLabel: (g: BridgeGroup | 'all') => string;
  /** Optional status chip press from the compare table. */
  onStatus: (g: BridgeGroup | '') => void;
}

export default function OfficesSection(props: { compact?: CompactOfficesProps }) {
  const { districts, scope, config } = usePortal();
  // Nothing to show for a scope with neither offices nor districts.
  if (!config.scope.offices?.length && !config.scope.districts?.length) return null;
  const queries = scope.status === 'ready' ? scope.value.queries.filter((q) => q.kind === 'office') : [];
  const projects = scope.status === 'ready' ? scope.value.projects : [];
  const useCompact = compactChrome(config) && props.compact;
  return (
    <section className="section" id="offices" aria-labelledby="offices-h">
      <Await state={districts} what="DPWH offices and districts">
        {(list) =>
          useCompact && props.compact ? (
            <CompactOffices list={list} queries={queries} projects={projects} compact={props.compact} />
          ) : (
            <Offices list={list} queries={queries} projects={projects} />
          )
        }
      </Await>
    </section>
  );
}

function buildOffices(cards: DistrictCard[], queries: QueryReport[], projects: ScopedProject[]): { offices: OfficeView[]; noOffice: DistrictCard[] } {
  const linesByOffice = new Map<string, number>();
  for (const p of projects) if (p.office) linesByOffice.set(p.office, (linesByOffice.get(p.office) ?? 0) + 1);
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const queryByOffice = new Map<string, QueryReport>();
  for (const q of queries) for (const o of q.officeLens?.offices ?? []) queryByOffice.set(o.id, q);

  const officeById = new Map<string, DistrictOffice>();
  for (const c of cards) for (const o of c.offices) if (!officeById.has(o.id)) officeById.set(o.id, o);

  const offices = [...officeById.values()].map((office): OfficeView => {
    const query = queryByOffice.get(office.id) ?? null;
    const printed =
      query?.label ??
      office.years?.find((y) => y.fy === 2027 && y.stage === 'hgab3' && y.matched_label)?.matched_label ??
      office.name;
    const labels = new Map(office.co_served_districts.map((d) => [d.id, d.label]));
    const districts = office.district_ids.map((id): DistrictRow => {
      const card = cardById.get(id) ?? null;
      return {
        id,
        label: card?.label ?? labels.get(id) ?? id,
        card,
        alsoServedBy: card ? card.offices.filter((o) => o.id !== office.id).map((o) => o.name) : [],
      };
    });
    return { office, printed, query, lines: linesByOffice.get(printed) ?? 0, districts };
  });

  // The portal's own offices first, then any that only serve a district it names.
  offices.sort((a, b) => Number(!a.query) - Number(!b.query) || a.printed.localeCompare(b.printed, 'en', { numeric: true }));
  return { offices, noOffice: cards.filter((c) => !c.offices.length) };
}

function Offices({ list, queries, projects }: { list: Envelope<DistrictCard>[]; queries: QueryReport[]; projects: ScopedProject[] }) {
  const { overview } = usePortal();
  const cards = list.map((e) => e.data);
  const { offices, noOffice } = buildOffices(cards, queries, projects);
  const districtCount = new Set(offices.flatMap((o) => o.districts.map((d) => d.id)).concat(noOffice.map((c) => c.id))).size;
  const note = list[0]?.meta.representatives_note as string | undefined;
  const residualTerm = overview.status === 'ready' ? overview.value.data.terms.residual : undefined;
  const credits = [...new Set(cards.flatMap((c) => (c.representative?.portrait ? [`${c.representative.portrait.attribution} · ${c.representative.portrait.license}`] : [])))];

  return (
    <>
      <h2 id="offices-h" className="section-h">
        {plural(offices.length, 'DPWH district engineering office')}, serving {plural(districtCount, 'legislative district')}
      </h2>
      <p className="section-lede">
        DPWH lists its money by the district engineering office that does the work. Each office serves one or more legislative
        districts, and a shared office’s money is never split between them. Representatives shown hold the seat in the 20th
        Congress.{note && <> {note}</>}
      </p>

      <div className={`ogrid${offices.length === 1 ? ' one' : ''}`}>
        {offices.map((o) => <Office key={o.office.id} view={o} />)}
      </div>

      {noOffice.length > 0 && (
        <p className="fine">
          No DPWH district office is listed for {noOffice.map((c) => c.label).join('; ')}.
        </p>
      )}
      <p className="fine">
        Office figures are its named projects in the 2027 NEP and the House bill, compared, never added.
        {residualTerm && <> {residualTerm.term}: {residualTerm.meaning.charAt(0).toLowerCase() + residualTerm.meaning.slice(1)}</>}
        {credits.length > 0 && <> Portraits: {credits.join('; ')}.</>}
      </p>
    </>
  );
}

function Office({ view }: { view: OfficeView }) {
  const { office, printed, query, lines, districts } = view;
  const f = office.fy2027;
  const wholeNep = office.years?.find((y) => y.fy === 2027 && y.stage === 'nep')?.php ?? null;
  const change = f && f.nep_php != null && f.hgab3_php != null ? f.hgab3_php - f.nep_php : null;
  // The project list, narrowed to this office's lines (and a status).
  const filter = (status?: string) => `/?office=${encodeURIComponent(printed)}${status ? `&status=${status}` : ''}#projects`;
  const groups = f ? BRIDGE_GROUPS.map((g) => f.bridge.groups[g]).filter((c) => c && c.rows > 0) : [];
  const unconfirmed = f?.annotations?.unconfirmed_rows ?? 0;
  const held = f?.office_change?.rows ?? 0;

  return (
    <article className="ocard">
      <header className="ocard-head">
        <div>
          <p className="label">DPWH {office.kind_label.replace(/ \(DEO\)$/, '')}{office.region && <> · {office.region}</>}</p>
          <h3>{printed}</h3>
        </div>
        <span className={`tag tier tier-${office.tier}`}>{office.tier_text}</span>
      </header>

      <dl className="ocard-figs">
        <div>
          <dt className="label">In this portal</dt>
          <dd>{lines ? <Link to={filter()} className="ocard-lines">{plural(lines, 'line')} →</Link> : <span className="muted">none</span>}</dd>
        </div>
        <div>
          <dt className="label">NEP</dt>
          <dd className="num">{php(f?.nep_php)}</dd>
        </div>
        <div>
          <dt className="label">House bill</dt>
          <dd className="num stat-accent">{php(f?.hgab3_php)}</dd>
        </div>
        <div>
          <dt className="label">Change</dt>
          <dd className="num">{phpDelta(change)}</dd>
        </div>
      </dl>

      {groups.length > 0 && (
        <p className="ocard-groups">
          {groups.map((c) => {
            const text = <><span className={`status-dot g-${c.group}`} aria-hidden="true" />{count(c.rows)} {c.label.charAt(0).toLowerCase() + c.label.slice(1)}</>;
            // These counts are the whole office's: link them only when all of its lines are in the portal.
            return query ? <Link key={c.group} to={filter(c.group)}>{text}</Link> : <span key={c.group}>{text}</span>;
          })}
        </p>
      )}
      <p className="ocard-note">
        Named projects{f ? <>: {count(f.nep_records)} in the NEP, {count(f.hgab3_records)} in the House bill</> : null}.
        {wholeNep != null && <> The whole office in the NEP: {php(wholeNep)}.</>}
        {unconfirmed > 0 && <> Includes {plural(unconfirmed, 'unconfirmed match', 'unconfirmed matches')} ({php(f?.annotations?.unconfirmed_php)}).</>}
        {held > 0 && <> {plural(held, 'line')} whose two versions name different offices {held === 1 ? 'is' : 'are'} not in these figures.</>}{' '}
        <Link to={`/gaa#${office.id}`}>Its budget each year since 2020 →</Link>
      </p>

      <div className="ocard-districts">
        <p className="label">
          {districts.length === 1 ? 'Legislative district it serves' : `${districts.length} legislative districts it serves`}
          {office.tier === 'B' && <> · shared, not split</>}
        </p>
        <ul>
          {districts.map((d) => <District key={d.id} row={d} />)}
        </ul>
      </div>

      {!query && office.projects_url && (
        <p className="small">
          This portal lists only this office’s lines that name its place. <External href={office.projects_url}>All of them</External>
        </p>
      )}
    </article>
  );
}

function District({ row }: { row: DistrictRow }) {
  const rep = row.card?.representative ?? null;
  const portrait = rep?.portrait ?? null;
  return (
    <li className="odistrict">
      {portrait ? (
        <img
          className="odistrict-photo"
          src={portrait.url}
          alt={`Portrait of ${rep?.name ?? row.label}`}
          title={`${portrait.attribution} · ${portrait.license} · ${portrait.source_url}`}
          width="40"
          height="50"
          loading="lazy"
        />
      ) : (
        <span className="odistrict-photo" aria-hidden="true" />
      )}
      <div>
        <p className="odistrict-label">{row.label}</p>
        <p className="small">
          {rep ? rep.name : <span className="muted">No representative listed</span>}
        </p>
        <p className="odistrict-links small">
          {rep?.bills_url && <External href={rep.bills_url}>Bills</External>}
          {row.card && <External href={row.card.url}>District page</External>}
          {row.alsoServedBy.length > 0 && <span className="muted">also served by {row.alsoServedBy.join(', ')}</span>}
        </p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Compact (R0) office grid + compare table
// ---------------------------------------------------------------------------

interface OfficeAmounts {
  /** Projects kept after dropping held-out / office_difference lines. */
  lines: number;
  nep: number | null;
  house: number | null;
  nepRows: number;
  houseRows: number;
  /** Lines that carry both a NEP and a House amount (for the paired %). */
  bothRows: number;
  bothNep: number;
  bothHouse: number;
}

interface CardFigures {
  view: OfficeView;
  amounts: OfficeAmounts;
  /** ₱ difference of the two totals (House − NEP), never a mixed-set %. */
  changePhp: number | null;
  changePhpLabel: string;
  /** Paired-line % label, or null when there are no both-value lines. */
  changePctLabel: string | null;
  changeLabel: string;
}

/** Held out of office figures: flag or listed on the office's office_change.lines. */
function isHeldOutOfOffice(p: ScopedProject, heldIds: Set<string>): boolean {
  if (p.flags?.includes('office_difference')) return true;
  return heldIds.has(p.id);
}

function heldOutIdsFor(offices: OfficeView[]): Set<string> {
  const ids = new Set<string>();
  for (const o of offices) {
    for (const line of o.office.fy2027?.office_change?.lines ?? []) ids.add(line.id);
  }
  return ids;
}

/**
 * One source for office card/table figures: portal projects for this printed
 * office, minus held-out office_difference lines (same cut the API makes).
 */
function officeAmountsFromProjects(
  projects: ScopedProject[],
  printed: string,
  heldIds: Set<string>,
): OfficeAmounts {
  const rows = projects.filter((p) => p.office === printed && !isHeldOutOfOffice(p, heldIds));
  let nepSum = 0;
  let houseSum = 0;
  let nepRows = 0;
  let houseRows = 0;
  let bothRows = 0;
  let bothNep = 0;
  let bothHouse = 0;
  for (const p of rows) {
    if (p.nep_php != null) {
      nepSum += p.nep_php;
      nepRows++;
    }
    if (p.house_php != null) {
      houseSum += p.house_php;
      houseRows++;
    }
    if (p.nep_php != null && p.house_php != null) {
      bothRows++;
      bothNep += p.nep_php;
      bothHouse += p.house_php;
    }
  }
  return {
    lines: rows.length,
    nep: nepRows ? nepSum : null,
    house: houseRows ? houseSum : null,
    nepRows,
    houseRows,
    bothRows,
    bothNep,
    bothHouse,
  };
}

/** ₱ of totals + optional % on lines that have both values. */
function changeLabels(amts: OfficeAmounts): {
  changePhp: number | null;
  changePhpLabel: string;
  changePctLabel: string | null;
  /** Flat string for the table cell / animation. */
  changeLabel: string;
} {
  const { nep, house, bothRows, bothNep, bothHouse } = amts;
  if (nep == null || house == null) {
    return { changePhp: null, changePhpLabel: '—', changePctLabel: null, changeLabel: '—' };
  }
  const changePhp = house - nep;
  const changePhpLabel = changePhp === 0 ? 'no change' : phpDelta(changePhp);
  let changePctLabel: string | null = null;
  if (bothRows > 0 && bothNep !== 0) {
    const pct = ((bothHouse - bothNep) / bothNep) * 100;
    const signed = `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(pct).toFixed(1)}%`;
    changePctLabel = `${signed} on ${plural(bothRows, 'line')} in both`;
  }
  const changeLabel = changePctLabel
    ? `${changePhpLabel} · House vs NEP totals · ${changePctLabel}`
    : `${changePhpLabel} · House vs NEP totals`;
  return { changePhp, changePhpLabel, changePctLabel, changeLabel };
}

function CompactOffices({
  list,
  queries,
  projects,
  compact,
}: {
  list: Envelope<DistrictCard>[];
  queries: QueryReport[];
  projects: ScopedProject[];
  compact: CompactOfficesProps;
}) {
  const { config } = usePortal();
  const cards = useMemo(() => list.map((e) => e.data), [list]);
  const { offices } = useMemo(() => buildOffices(cards, queries, projects), [cards, queries, projects]);
  const note = list[0]?.meta.representatives_note as string | undefined;
  const heldIds = useMemo(() => heldOutIdsFor(offices), [offices]);
  const regionFallback = config.home?.compactRegionEyebrow?.trim() || null;

  // Cards always sum the same source: portal projects minus held-out lines.
  const sourceRows = compact.filtered;
  const cardRows: CardFigures[] = useMemo(() => {
    return offices
      .map((view): CardFigures | null => {
        const amounts = officeAmountsFromProjects(sourceRows, view.printed, heldIds);
        // Hide offices with nothing left after filters + held-out exclusion.
        if (!amounts.lines) return null;
        const { changePhp, changePhpLabel, changePctLabel, changeLabel } = changeLabels(amounts);
        return { view, amounts, changePhp, changePhpLabel, changePctLabel, changeLabel };
      })
      .filter((r): r is CardFigures => r != null);
  }, [offices, sourceRows, heldIds]);

  const scaleMax = useMemo(() => {
    let max = 0;
    for (const r of cardRows) {
      if (r.amounts.nep != null && r.amounts.nep > max) max = r.amounts.nep;
      if (r.amounts.house != null && r.amounts.house > max) max = r.amounts.house;
    }
    return max > 0 ? max : 1;
  }, [cardRows]);

  // Table chips: offices with ≥1 kept line in the search/office scope (no status).
  const tableChipCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const g of BRIDGE_GROUPS) counts[g] = 0;
    for (const o of offices) {
      const kept = compact.scoped.filter(
        (p) => p.office === o.printed && !isHeldOutOfOffice(p, heldIds),
      );
      if (!kept.length) continue;
      counts.all++;
      const seen = new Set<BridgeGroup>();
      for (const p of kept) {
        if (!seen.has(p.bridge_group)) {
          seen.add(p.bridge_group);
          counts[p.bridge_group] = (counts[p.bridge_group] ?? 0) + 1;
        }
      }
    }
    return counts;
  }, [offices, compact.scoped, heldIds]);

  const animKey = `${compact.status}|${compact.office}|${compact.filtered.length}|${scaleMax}`;

  return (
    <>
      <h2 id="offices-h" className="section-title">
        Explore by engineering office
      </h2>
      <p className="section-lede">
        Each DPWH engineering office serves one or more legislative districts, and a shared office’s money is never split
        between them.{' '}
        <a href="#coverage-methodology">Coverage details →</a>
        {note && <> {note}</>}
      </p>

      <div className="office-grid" key={animKey}>
        {cardRows.map((row) => (
          <CompactOfficeCard
            key={row.view.office.id}
            row={row}
            scaleMax={scaleMax}
            status={compact.status}
            regionFallback={regionFallback}
          />
        ))}
      </div>
      {cardRows.length === 0 && (
        <p className="state">No office matches these filters.</p>
      )}
      <p className="portraits-credit">Portraits: {PORTRAIT_CREDIT}.</p>

      <section className="section compare-section" id="compare" aria-labelledby="compare-h">
        <div className="compare-head">
          <div>
            <h2 id="compare-h" className="section-title">
              Compare offices
            </h2>
            <p className="section-lede compare-lede">
              NEP and House amounts side by side for the {plural(cardRows.length, 'DEO', 'DEOs')}. Compared, not added.
            </p>
          </div>
          <p className="compare-callout">Budget allocations, not spending or completion.</p>
        </div>
        <div className="chips" role="group" aria-label="Filter offices by status">
          <button
            type="button"
            className="chip"
            aria-pressed={!compact.status}
            aria-label={`${compact.chipLabel('all')}, ${plural(tableChipCounts.all, 'office')}`}
            onClick={() => compact.onStatus('')}
          >
            {compact.chipLabel('all')} <span className="num">({count(tableChipCounts.all)})</span>
          </button>
          {BRIDGE_GROUPS.map((g) => {
            const n = tableChipCounts[g] ?? 0;
            // Keep chips clickable while a status is active so you can switch directly.
            return (
              <button
                key={g}
                type="button"
                className="chip"
                aria-pressed={compact.status === g}
                aria-label={`${compact.chipLabel(g)}, ${plural(n, 'office')}`}
                onClick={() => compact.onStatus(compact.status === g ? '' : g)}
              >
                {compact.chipLabel(g)} <span className="num">({count(n)})</span>
              </button>
            );
          })}
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <caption className="sr-only">
              NEP and House amounts by DPWH office, compared not added
            </caption>
            <thead>
              <tr>
                <th scope="col">Office</th>
                <th scope="col" className="num">
                  Proposed · NEP
                </th>
                <th scope="col" className="num">
                  House version
                </th>
                <th scope="col" className="num">
                  Project records
                </th>
                <th scope="col" className="num">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {cardRows.map((row) => (
                <tr key={row.view.office.id}>
                  <th scope="row">{row.view.printed}</th>
                  <td className="num anim-value">
                    <AnimValue text={php(row.amounts.nep)} />
                  </td>
                  <td className="num anim-value">
                    <AnimValue text={php(row.amounts.house)} />
                  </td>
                  <td className="num anim-value">
                    <AnimValue
                      text={`NEP ${count(row.amounts.nepRows)} · House ${count(row.amounts.houseRows)}`}
                    />
                  </td>
                  <td className="num change-cell anim-value">
                    <AnimValue text={row.changeLabel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cardRows.length === 0 && (
          <p className="state">No offices to compare for this filter.</p>
        )}
      </section>
    </>
  );
}

/** Remount on text change so the CSS fade/slide runs; static under reduced motion. */
function AnimValue({ text }: { text: string }) {
  return (
    <span key={text} className="is-visible">
      {text}
    </span>
  );
}

function CompactOfficeCard({
  row,
  scaleMax,
  status,
  regionFallback,
}: {
  row: CardFigures;
  scaleMax: number;
  status: BridgeGroup | '';
  regionFallback: string | null;
}) {
  const { view, amounts, changePhpLabel, changePctLabel, changeLabel } = row;
  const { nep, house, nepRows, houseRows } = amounts;
  const { office, printed, districts } = view;
  const f = office.fy2027;
  const wholeNep = office.years?.find((y) => y.fy === 2027 && y.stage === 'nep')?.php ?? null;
  const unconfirmed = f?.annotations?.unconfirmed_rows ?? 0;
  const held = f?.office_change?.rows ?? 0;
  const region = office.region ?? regionFallback;
  // Primary legislative district for the rep block — first id the API lists for this office.
  const primary = districts[0] ?? null;
  const rep = primary?.card?.representative ?? null;
  const localPortrait = primary ? LOCAL_PORTRAITS[primary.id] : undefined;
  const portraitSrc = localPortrait ?? rep?.portrait?.url;
  const filterHref = `/?office=${encodeURIComponent(printed)}${status ? `&status=${status}` : ''}#projects`;
  const scaleNote = `shared scale ₱0–${php(scaleMax)} across offices shown`;
  const nepPct = nep != null ? (nep / scaleMax) * 100 : 0;
  const housePct = house != null ? (house / scaleMax) * 100 : 0;
  const detailsId = useId();
  const badge = `NEP on ${count(nepRows)} · House on ${count(houseRows)}`;

  return (
    <article className="office-card">
      <header className="ocard-top">
        <div className="ocard-title-row">
          <OfficeIcon />
          <div>
            {region && <p className="ocard-eyebrow">{region}</p>}
            <h3 className="office-card-title">{printed}</h3>
          </div>
        </div>
        <span className="records-badge anim-value">
          <AnimValue text={badge} />
        </span>
      </header>

      <div className="ocard-amounts-row">
        <div className="ocard-amounts">
          <div>
            <p className="stat-label">Proposed · NEP</p>
            <p className="ocard-fig num anim-value">
              <AnimValue text={php(nep)} />
            </p>
          </div>
          <div>
            <p className="stat-label">House version</p>
            <p className="ocard-fig num anim-value">
              <AnimValue text={php(house)} />
            </p>
          </div>
        </div>
        <div className="change-pill-wrap anim-value" title={changeLabel}>
          <p className="change-pill">
            <span className="change-php">
              <AnimValue text={changePhpLabel} />
            </span>
            {changePhpLabel !== '—' && (
              <span className="change-meta">House vs NEP totals</span>
            )}
            {changePctLabel && <span className="change-pct">{changePctLabel}</span>}
          </p>
        </div>
      </div>

      <div
        className="ocard-bars"
        role="img"
        aria-label={`NEP ${php(nep)}, House ${php(house)}; ${scaleNote}`}
      >
        <div className="mini-bar-row">
          <span className="mini-bar-label">NEP</span>
          <span className="mini-bar-track">
            <span className="mini-bar-fill mini-bar-nep" style={{ width: `${nepPct}%` }} />
          </span>
          <span className="mini-bar-val num">{php(nep)}</span>
        </div>
        <div className="mini-bar-row">
          <span className="mini-bar-label">House</span>
          <span className="mini-bar-track">
            <span className="mini-bar-fill mini-bar-house" style={{ width: `${housePct}%` }} />
          </span>
          <span className="mini-bar-val num">{php(house)}</span>
        </div>
        <p className="bar-legend">
          <span className="swatch swatch-nep" /> NEP <span className="swatch swatch-house" /> House · {scaleNote}
        </p>
      </div>

      {rep && (
        <div className="ocard-rep">
          <p className="ocard-eyebrow">Legislative district representative</p>
          <div className="odistrict compact-rep">
            <figure className="odistrict-figure">
              {portraitSrc ? (
                <img
                  className="odistrict-photo"
                  src={portraitSrc}
                  alt={`Portrait of ${rep.name}`}
                  title={PORTRAIT_CREDIT}
                  width="40"
                  height="50"
                  loading="lazy"
                />
              ) : (
                <span className="odistrict-photo" aria-hidden="true" />
              )}
            </figure>
            <div>
              <p className="rep-honorific">District Representative</p>
              <p className="rep-name">{rep.name}</p>
              <p className="odistrict-links">
                {rep.bills_url && (
                  <External href={rep.bills_url}>
                    Bills <span aria-hidden="true">↗</span>
                  </External>
                )}
                {primary?.card && (
                  <External href={primary.card.url}>
                    District page <span aria-hidden="true">↗</span>
                  </External>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <details className="ocard-details" id={detailsId}>
        <summary>
          Coverage and source details <span className="chevron" aria-hidden="true">▾</span>
        </summary>
        <div className="ocard-details-body">
          <p>
            Named projects in these figures: NEP on {count(nepRows)}, House on {count(houseRows)}.
            {f ? <> API office totals list {count(f.nep_records)} in the NEP and {count(f.hgab3_records)} in the House bill.</> : null}
            {wholeNep != null && <> The whole office in the NEP: {php(wholeNep)}.</>}
            {unconfirmed > 0 && (
              <> Includes {plural(unconfirmed, 'unconfirmed match', 'unconfirmed matches')} ({php(f?.annotations?.unconfirmed_php)}).</>
            )}
            {held > 0 && (
              <> {plural(held, 'line')} whose two versions name different offices {held === 1 ? 'is' : 'are'} not in these figures.</>
            )}
          </p>
          <p>
            <span className={`tag tier tier-${office.tier}`}>{office.tier_text}</span>
            {office.tier === 'B' && <> Shared office — money is never split across the districts it serves.</>}
          </p>
          <p>
            <Link to={`/gaa#${office.id}`}>{printed} budget each year since 2020 →</Link>
          </p>
        </div>
      </details>

      <Link className="button button-card" to={filterHref} aria-label={`View projects for ${printed}`}>
        View projects →
      </Link>
    </article>
  );
}

function OfficeIcon() {
  return (
    <svg className="office-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
