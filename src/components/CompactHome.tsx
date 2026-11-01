/**
 * Compact Overview pieces behind chrome.compact: summary figure cards,
 * bridge status chips, and the three About accordions from the R0 mockup.
 * Figures come from the existing summarise() totals — never recomputed here.
 */
import { Link } from 'react-router-dom';
import type { BridgeGroup } from '../api/types';
import { count, php, plural } from '../lib/format';
import { COMPACT_CHIP_ORDER, compactChipLabel } from '../lib/compact-chips';
import { ILOILO_NEIGHBOUR_SHARES, ILOILO_PORTAL_ID, formatIloiloNeighbourShares } from '../lib/iloilo-neighbours';
import { usePortal } from '../lib/portal-context';
import type { Summary } from '../lib/scope';
import { shortNameOf } from '../config';

export function CompactSummaryCards({
  summary,
  totalRows,
  totalOffices,
  shownOffices,
  filtered,
}: {
  summary: Summary;
  /** Portal-wide project count (denominator when filtered). */
  totalRows: number;
  /** Configured / portal office count. */
  totalOffices: number;
  /** Offices represented in the current summary rows. */
  shownOffices: number;
  filtered: boolean;
}) {
  const recordsNote = filtered
    ? `${count(summary.rows)} shown of ${plural(totalRows, 'record')} · ${count(shownOffices)} of ${plural(totalOffices, 'office')}`
    : totalOffices
      ? `${plural(totalOffices, 'office')} · ${plural(summary.rows, 'record')} in this portal`
      : plural(summary.rows, 'record');

  const nepValue = summary.nep.rows ? php(summary.nep.php) : '—';
  const houseValue = summary.house.rows ? php(summary.house.php) : '—';
  const nepNote = summary.nep.rows
    ? `NEP on ${plural(summary.nep.rows, 'record')} · compared, not added`
    : '—';
  const houseNote = summary.house.rows
    ? `House on ${plural(summary.house.rows, 'record')} · compared with the NEP, not added`
    : '—';

  return (
    <div className="summary-cards" aria-label="Summary figures">
      <div className="summary-card">
        <DocIcon />
        <div>
          <p className="stat-label">Project records</p>
          <p className="stat-value num">{summary.rows ? count(summary.rows) : '—'}</p>
          <p className="stat-note">{recordsNote}</p>
        </div>
      </div>
      <div className="summary-card">
        <CoinIcon />
        <div>
          <p className="stat-label">Proposed · NEP</p>
          <p className="stat-value num">{nepValue}</p>
          <p className="stat-note">{nepNote}</p>
        </div>
      </div>
      <div className="summary-card">
        <CapitolIcon />
        <div>
          <p className="stat-label">House version</p>
          <p className="stat-value num">{houseValue}</p>
          <p className="stat-note">{houseNote}</p>
        </div>
      </div>
    </div>
  );
}

export function CompactStatusChips({
  summary,
  status,
  onStatus,
  onClear,
  narrowed,
  showingLabel,
  showingCount,
}: {
  /** Counts for the current search/office scope (status chips stay switchable). */
  summary: Summary;
  status: BridgeGroup | '';
  onStatus: (g: BridgeGroup | '') => void;
  onClear: () => void;
  narrowed: boolean;
  showingLabel: string;
  showingCount: number;
}) {
  return (
    <>
      <div className="chips-row">
        <div className="chips" id="status-filters" role="group" tabIndex={-1} aria-label="Filter by status">
          {COMPACT_CHIP_ORDER.map((g) => {
            if (g === 'all') {
              return (
                <button
                  key="all"
                  type="button"
                  className="chip"
                  aria-pressed={!status}
                  onClick={() => onStatus('')}
                >
                  {compactChipLabel('all')} <span className="num">({count(summary.rows)})</span>
                </button>
              );
            }
            const cell = summary.groups[g];
            const empty = !cell.rows;
            // Hide empty scope_review so other forks / datasets stay quiet.
            if (g === 'scope_review' && empty && status !== g) return null;
            return (
              <button
                key={g}
                type="button"
                className="chip"
                aria-pressed={status === g}
                // Keep non-empty chips clickable while another status is active.
                disabled={empty && status !== g}
                onClick={() => onStatus(status === g ? '' : g)}
              >
                {compactChipLabel(g)} <span className="num">({count(cell.rows)})</span>
                {empty && <span className="sr-only">, no projects</span>}
              </button>
            );
          })}
        </div>
        {narrowed && (
          <button type="button" className="clear-filters" onClick={onClear}>
            Clear filters
          </button>
        )}
      </div>
      <p className="filter-showing" aria-live="polite">
        Showing: {showingLabel} ({count(showingCount)})
      </p>
    </>
  );
}

export function CompactAccordions() {
  const { config } = usePortal();
  const name = shortNameOf(config);
  const isIloilo = config.id === ILOILO_PORTAL_ID;
  const email = config.operator.email?.trim();

  return (
    <section className="section about-accordions" aria-label="About this portal">
      <details className="accordion" id="coverage-methodology">
        <summary>
          <span className="accordion-summary-text">
            Coverage and methodology
            <span className="accordion-sub">Scope, geographic coverage, how the House version compares…</span>
          </span>
          <span className="chevron" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="accordion-body">
          <p>
            This portal follows {config.scope.offices?.length ?? 0} DPWH district engineering offices for {name}. An office’s
            budget is never split across the districts it serves.
            {isIloilo && <> There is no Iloilo 5th District Engineering Office.</>}
          </p>
          <p>
            The place name also brings in lines from all four programs whose title names {name}
            {isIloilo && <> (including a hyphenated Ilo-ilo spelling where the GAA uses it)</>}.
          </p>
          <p>
            A project is listed by the office or name in the budget line; this does not establish where it is built.
          </p>
          {isIloilo && (
            <>
              <p>
                <strong>Lines that also name a neighbouring province.</strong> Many enacted-budget lines also name Capiz or
                Antique, mostly shared roads and the Panay River Basin. Each line is shown in full. Its amount is not divided
                between the provinces. Of each year’s enacted-budget total on this portal, that share is{' '}
                {formatIloiloNeighbourShares(ILOILO_NEIGHBOUR_SHARES)}.
              </p>
              <p>
                Among the enacted-budget lines, Aklan is named only in the nationwide Iloilo-Capiz-Aklan Expressway bundles.
                Those are removed by hand, for the reason published above, and they are not part of these shares.
              </p>
            </>
          )}
          <p>NEP and House figures are compared, never added. Missing amounts are shown as —, never as zero.</p>
          <p>
            <Link to="/about">Full About the data →</Link>
          </p>
        </div>
      </details>

      <details className="accordion">
        <summary>
          <span className="accordion-summary-text">
            Sources and exclusions
            <span className="accordion-sub">What’s included and excluded in this comparison…</span>
          </span>
          <span className="chevron" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="accordion-body">
          <p>
            Figures come from the NEP FY 2027 and House Bill 10858 via the BetterGov.ph Budget API. Hand exclusions remove
            namesakes and nationwide bundles that mention the place among projects elsewhere — listed with reasons on{' '}
            <Link to="/about">About the data</Link>.
          </p>
        </div>
      </details>

      <details className="accordion" id="about-ref">
        <summary>
          <span className="accordion-summary-text">
            Corrections and contact
            <span className="accordion-sub">Report mistakes or send feedback about this portal.</span>
          </span>
          <span className="chevron" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="accordion-body">
          {email ? (
            <p>
              Report mistakes or missing context by email at <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ) : (
            <p>
              Report mistakes or missing context on the <Link to="/about">About the data</Link> page. This portal is run by{' '}
              {config.operator.name}.
            </p>
          )}
        </div>
      </details>
    </section>
  );
}

function DocIcon() {
  return (
    <svg className="summary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h2" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg className="summary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}

function CapitolIcon() {
  return (
    <svg className="summary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
    </svg>
  );
}
