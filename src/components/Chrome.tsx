import { Fragment, useEffect, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  KIND_LABELS,
  MASTHEAD_YEARS,
  compactChrome,
  shortNameOf,
  showApiLinks,
  showBuildStrip,
  showSourceLinks,
} from '../config';
import { usePortal } from '../lib/portal-context';
import { date } from '../lib/format';
import { NATIONAL_URL, SOURCE_CODE_URL } from '../lib/links';

const BETTERGOV_LOGO = '/brand/bettergov-horizontal-primary.png';
const WINDOW_MARK = '/brand/iloilo/window-mark.svg';

/** The configured sentence, with each " · " separator hidden from assistive tech, as the kind line is. */
function KickerText({ text }: { text: string }) {
  const parts = text.split(' · ');
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          {' '}
          <span aria-hidden="true">·</span>
          <span className="sr-only">,</span>{' '}
        </>
      )}
      {part}
    </Fragment>
  ));
}

const NAV = [
  { to: '/', hash: '', label: '2027 projects' },
  { to: '/', hash: '#offices', label: 'Offices and districts' },
  { to: '/gaa', hash: '', label: 'Budgets 2020–2026' },
  { to: '/about', hash: '', label: 'About the data' },
];

/** Compact primary nav — routes that already exist; drop anything not in the app yet. */
const COMPACT_NAV = [
  { to: '/', hash: '', label: 'Overview' },
  { to: '/gaa', hash: '', label: 'Enacted budgets' },
  { to: '/', hash: '#projects', label: 'Project explorer' },
  { to: '/', hash: '#offices', label: 'Offices' },
];

/** Sets `data-chrome` on <html> so CSS tokens apply without a framework. */
export function ChromeRoot({ children }: { children: ReactNode }) {
  const { config } = usePortal();
  const compact = compactChrome(config);
  useEffect(() => {
    const root = document.documentElement;
    if (compact) root.setAttribute('data-chrome', 'compact');
    else root.removeAttribute('data-chrome');
    return () => root.removeAttribute('data-chrome');
  }, [compact]);
  return <>{children}</>;
}

export function Masthead() {
  const { config } = usePortal();
  if (compactChrome(config)) return <CompactMasthead />;
  return <DefaultMasthead />;
}

function DefaultMasthead() {
  const { config, client } = usePortal();
  const kicker = config.kicker?.trim();
  const sourceLinks = showSourceLinks(config);
  const apiLinks = showApiLinks(config);
  const { pathname, hash } = useLocation();
  const today = useMemo(
    () => new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );
  return (
    <>
    {__CHROME_SOURCE_LINKS__ && showBuildStrip(config) && (
      // Above the masthead, so it scrolls away; a plain link to the source.
      <a className="build-strip" href={SOURCE_CODE_URL} target="_blank" rel="noopener">
        <span className="build-strip-title">Create your own transparency portal</span>
        <span className="build-strip-url">
          {SOURCE_CODE_URL.replace(/^https:\/\//, '')} <span aria-hidden="true">→</span>
        </span>
      </a>
    )}
    <header className="masthead">
      <div className="masthead-top">
        <div className="page masthead-top-inner">
          <span className="muted">{today}</span>
          <span className="masthead-links">
            <a href={NATIONAL_URL} target="_blank" rel="noopener">
              National picture <span aria-hidden="true">↗</span>
            </a>
            {__CHROME_API_LINKS__ && apiLinks && (
              <a href={`${client.base}/docs`} target="_blank" rel="noopener">
                API <span aria-hidden="true">↗</span>
              </a>
            )}
            {__CHROME_SOURCE_LINKS__ && sourceLinks && (
              <a href={SOURCE_CODE_URL} target="_blank" rel="noopener">
                Build your own <span aria-hidden="true">↗</span>
              </a>
            )}
          </span>
        </div>
      </div>
      <div className="page masthead-main">
        <Link to="/" className="masthead-title">
          {config.logo && <img src={config.logo} alt="" className="masthead-logo" />}
          <span>
            <span className={kicker ? 'masthead-kicker masthead-kicker-custom' : 'masthead-kicker'}>
              {kicker ? (
                <KickerText text={kicker} />
              ) : (
                <>
                  {KIND_LABELS[config.kind]} <span aria-hidden="true">·</span> {MASTHEAD_YEARS}
                </>
              )}
            </span>
            <span className="masthead-name">{config.name}</span>
          </span>
        </Link>
        <a className="masthead-with" href="https://bettergov.ph" target="_blank" rel="noopener">
          <span className="label">Data from</span>
          <img src={BETTERGOV_LOGO} alt="BetterGov.ph" width="128" height="28" />
        </a>
      </div>
      <nav className="subnav" aria-label="Sections">
        <div className="page subnav-inner">
          {NAV.map((n) => {
            const active = pathname === n.to && (n.hash ? hash === n.hash : hash !== '#offices');
            return (
              <Link
                key={n.label}
                to={{ pathname: n.to, hash: n.hash }}
                className={active ? 'active' : undefined}
                aria-current={active ? 'page' : undefined}
                // "Projects" from further down the same page goes back to the top.
                onClick={() => !n.hash && pathname === n.to && window.scrollTo(0, 0)}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
    </>
  );
}

function CompactMasthead() {
  const { config } = usePortal();
  const { pathname, hash } = useLocation();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="site-header-bar">
          <Link to="/" className="nav-brand" aria-label="Iloilo Transparency, home" onClick={() => pathname === '/' && window.scrollTo(0, 0)}>
            <img src={WINDOW_MARK} alt="" width="36" height="36" className="nav-brand-mark" />
            <span className="nav-brand-text">
              <span className="nav-brand-name">{config.name}</span>
              <span className="nav-brand-sub">
                Independent <span aria-hidden="true">·</span>
                <span className="sr-only">,</span> Unofficial
              </span>
            </span>
          </Link>
          <nav className="site-nav" aria-label="Primary">
            {COMPACT_NAV.map((n) => {
              const onHome = pathname === '/';
              const active =
                n.to === '/' && n.hash === ''
                  ? onHome && hash !== '#offices' && hash !== '#projects'
                  : pathname === n.to && (n.hash ? hash === n.hash : true);
              return (
                <Link
                  key={n.label}
                  to={{ pathname: n.to, hash: n.hash }}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => !n.hash && pathname === n.to && window.scrollTo(0, 0)}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const { config } = usePortal();
  if (compactChrome(config)) return <CompactFooter />;
  return <DefaultFooter />;
}

function DefaultFooter() {
  const { config, scope, client } = usePortal();
  const meta = scope.status === 'ready' ? scope.value.meta : null;
  return (
    <footer className="footer">
      <div className="page footer-inner">
        <p className="footer-source">
          Source: NEP FY 2027 and House Bill 10858 · via the BetterGov.ph Budget API
          {meta && <> · data built {date(meta.built_at)}</>}
        </p>
        {meta && <p className="footer-notice">{meta.notice}</p>}
        <ul className="footer-links">
          <li>
            <span className="label">This portal</span>
            <span>
              {shortNameOf(config)}, run by{' '}
              {config.operator.url ? (
                <a href={config.operator.url} target="_blank" rel="noopener">{config.operator.name}</a>
              ) : (
                config.operator.name
              )}
              {config.operator.email && (
                <> · <a href={`mailto:${config.operator.email}`}>{config.operator.email}</a></>
              )}
            </span>
          </li>
          <li>
            <span className="label">Every project, nationwide</span>
            <a href={NATIONAL_URL} target="_blank" rel="noopener">budget.bettergov.ph ↗</a>
          </li>
          {__CHROME_API_LINKS__ && showApiLinks(config) && (
            <li>
              <span className="label">Data</span>
              <a href={`${client.base}/docs`} target="_blank" rel="noopener">Budget API and MCP ↗</a>
            </li>
          )}
          {__CHROME_SOURCE_LINKS__ && showSourceLinks(config) && (
            <li>
              <span className="label">Open source</span>
              <a href={SOURCE_CODE_URL} target="_blank" rel="noopener">Fork this portal for your LGU or DPWH office ↗</a>
            </li>
          )}
        </ul>
        <PortalCredits />
      </div>
    </footer>
  );
}

function CompactFooter() {
  const { config, scope } = usePortal();
  const meta = scope.status === 'ready' ? scope.value.meta : null;
  return (
    <footer className="site-footer">
      <div className="page footer-inner">
        <div className="footer-meta">
          <p>Source: NEP FY 2027 and House Bill 10858 · via the BetterGov.ph Budget API</p>
          {meta?.notice && (
            <details className="footer-notice-details">
              <summary>Independent and unofficial — full notice</summary>
              <p className="footer-notice">{meta.notice}</p>
            </details>
          )}
          <PortalCredits />
          <p>
            This portal: {shortNameOf(config)}, run by {config.operator.name}
            {config.operator.email && (
              <>
                {' '}
                · Corrections: <a href={`mailto:${config.operator.email}`}>{config.operator.email}</a>
              </>
            )}
          </p>
        </div>
        <a className="footer-powered" href="https://bettergov.ph" target="_blank" rel="noopener">
          <span className="label">Data from</span>
          <img src={BETTERGOV_LOGO} alt="BetterGov.ph" width="128" height="28" />
        </a>
        <p className="footer-disclosure">Independent volunteer project — not an official government site.</p>
      </div>
    </footer>
  );
}

/** Same-site software notice, plus the API's data licence. Shown on every fork. */
export function PortalCredits() {
  return (
    <p className="footer-legal">
      <a href="/LICENSE.txt">Portal software © 2026 BetterGov.ph, MIT License</a>
      {' · '}
      Data: BetterGov.ph Budget API, licensed{' '}
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>
      {', filtered and summarised for this portal.'}
    </p>
  );
}

export function PageHead({
  eyebrow,
  title,
  children,
  fyLabel,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  /** Existing FY label only — no new selector state. Shown beside the H1 under compact chrome. */
  fyLabel?: string;
}) {
  const { config } = usePortal();
  const compact = compactChrome(config);
  if (compact && fyLabel) {
    return (
      <div className="page-head">
        <div className="page-head-row">
          <h1>{title}</h1>
          <span className="fy-badge">{fyLabel}</span>
        </div>
        {children && <div className="lede">{children}</div>}
      </div>
    );
  }
  return (
    <div className="page-head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <div className="lede">{children}</div>}
    </div>
  );
}
