import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Disclaimer, Overview } from '../api/types';
import { shortNameOf, showApiLinks, showSourceLinks } from '../config';
import { Await, Disclaimers, External } from '../components/Bits';
import { PageHead, PortalCredits } from '../components/Chrome';
import { count, date, plural } from '../lib/format';
import { SOURCE_CODE_URL } from '../lib/links';
import { usePortal } from '../lib/portal-context';
import type { ScopeResult } from '../lib/scope';
import { departmentShort, loadGaa, type GaaResult } from '../lib/gaa';
import { ILOILO_NEIGHBOUR_SHARES, ILOILO_PORTAL_ID, formatIloiloNeighbourShares } from '../lib/iloilo-neighbours';
import type { Async } from '../lib/portal-context';
import { useTitle } from '../lib/use-title';

/** "Check it" stays readable. The API href is only there when this fork still links out to the API. */
function ApiCheck({ href }: { href: string }) {
  const { config } = usePortal();
  if (!(__CHROME_API_LINKS__ && showApiLinks(config))) return <>API</>;
  return <External href={href}>API</External>;
}

/** Author and analysis name from a source repo URL, plus the short commit, with no link. */
function comparisonPlain(repo: string, commit: string): string {
  const sha = commit.slice(0, 7);
  const path = repo.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\.git$/, '').replace(/\/+$/, '');
  const [author, name] = path.split('/');
  if (author && name) return `${author}, ${name}, ${sha}`;
  return `${repo}, ${sha}`;
}

function ComparisonCredit({ repo, commit }: { repo: string; commit: string }) {
  const { config } = usePortal();
  if (!(__CHROME_SOURCE_LINKS__ && showSourceLinks(config))) return <>{comparisonPlain(repo, commit)}</>;
  return (
    <a href={`${repo}/tree/${commit}`} target="_blank" rel="noopener">
      {commit.slice(0, 7)}
    </a>
  );
}

/** The API's `rules`, in words for readers rather than developers. */
const READING_RULES = [
  'These are amounts in the budget documents, not money spent.',
  'Amounts are pesos, as each document publishes them. A dash means that document has no such line; it does not mean zero.',
  'The NEP and the House bill are two versions of one budget. Compare them; never add them together.',
  '“In the House bill only” and “In the NEP only” are candidates: leads to check, not confirmed insertions or deletions. Some are lines that were renamed or re-scoped.',
  '“Unconfirmed match” marks a pairing made on a similar name rather than an exact one.',
  'A DPWH office that serves several districts (Tier B) is shown whole; its money is never split between them. Money under the DPWH Central Office or a regional office is on no district card.',
];

export default function About() {
  const { scope, overview, config } = usePortal();
  useTitle(`About the data · ${shortNameOf(config)}`);
  return (
    <main id="main" className="page main">
      <Await state={scope} what="the portal’s queries">
        {(s) => (
          <Await state={overview} what="the data notes">
            {(ov) => <AboutView scope={s} overview={ov.data} />}
          </Await>
        )}
      </Await>
    </main>
  );
}

function AboutView({ scope, overview }: { scope: ScopeResult; overview: Overview }) {
  const { config, districts } = usePortal();
  const label = (k: string) => overview.datasets.find((d) => d.key === k)?.short ?? k.toUpperCase();
  const disclaimers = new Map<string, Disclaimer>();
  for (const d of scope.disclaimers) disclaimers.set(d.id, d);
  if (districts.status === 'ready') for (const env of districts.value) for (const d of env.disclaimers) disclaimers.set(d.id, d);
  const meta = scope.meta;

  return (
    <>
      <PageHead
        eyebrow={<>About the data<span className="sep">·</span>{shortNameOf(config)}</>}
        title={`Where these ${plural(scope.projects.length, 'project')} come from`}
      >
        <p>
          Every figure comes from the BetterGov.ph Budget API, which sets the House bill against the NEP project by project.
          This portal asks the API the questions below and shows every line it gets back.
        </p>
      </PageHead>

      <section className="section" aria-labelledby="q-h">
        <h2 id="q-h" className="section-h">The questions this portal asks</h2>
        <div className="table queries" role="table" aria-label="Queries">
          <div className="tr th" role="row">
            <span role="columnheader">Lines that…</span>
            <span role="columnheader">Program</span>
            <span role="columnheader" className="r">Found</span>
            <span role="columnheader" className="r">Kept</span>
            <span role="columnheader" className="r">Check it</span>
          </div>
          {scope.queries.map((q, i) => (
            <div className="tr" role="row" key={i}>
              <span role="cell">
                {q.kind === 'office' ? <>are listed under <strong>{q.label}</strong></> : <>have a title naming <strong>{String(q.params.q)}</strong></>}
                {q.region && <span className="muted small"> · kept to region {q.region}, or giving no region</span>}
              </span>
              <span role="cell">{label(q.dataset)}</span>
              <span role="cell" className="r num">{count(q.total)}</span>
              <span role="cell" className="r num">{count(q.kept)}</span>
              <span role="cell" className="r"><ApiCheck href={q.api} /></span>
            </div>
          ))}
        </div>
        <p className="fine">
          A line found by more than one question is shown once, with every reason. Searching by name finds titles that spell
          the place out; a project whose title does not name it is found only through its DPWH office.
        </p>
      </section>

      <GaaQuestions />

      <section className="section" aria-labelledby="x-h">
        <h2 id="x-h" className="section-h">2027 lines removed by hand: {count(scope.excluded.length)}</h2>
        {scope.excluded.length === 0 ? (
          <p>None. Every line the questions return is shown.</p>
        ) : (
          <ul className="plain-list">
            {scope.excluded.map(({ exclusion, project }) => (
              <li key={exclusion.key}>
                {project ? (
                  <External href={project.url}>{project.title}</External>
                ) : (
                  <code>{exclusion.key}</code>
                )}
                <span className="muted"> — {exclusion.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeoMappingNote />

      <section className="section two-col" aria-labelledby="r-h">
        <div>
          <h2 id="r-h" className="section-h">How to read the figures</h2>
          <ul className="plain-list">
            {READING_RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="section-h">Words used here</h2>
          <dl className="terms">
            {Object.entries(overview.terms).map(([k, t]) => (
              <div key={k}>
                <dt>{t.term}</dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="d-h">
        <h2 id="d-h" className="section-h">The documents</h2>
        <ul className="docs">
          {overview.documents.map((d) => (
            <li key={d.key}>
              <External href={d.pdf_url}>{d.title}</External>
              {d.source_url && <span className="muted small"> · <a href={d.source_url} target="_blank" rel="noopener">where it was published</a></span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="n-h">
        <h2 id="n-h" className="section-h">Notices</h2>
        <Disclaimers items={[...disclaimers.values()]} />
        <p className="fine">
          Data version: comparison <ComparisonCredit repo={meta.source_repo} commit={meta.source_commit} />,
          built {date(meta.built_at)}. Every project nationwide: <External href={overview.url}>budget.bettergov.ph</External>.
        </p>
        <PortalCredits />
      </section>

      {__CHROME_SOURCE_LINKS__ && showSourceLinks(config) && (
        <section className="section build-own" aria-labelledby="b-h">
          <h2 id="b-h" className="section-h">Run a portal like this for your LGU or DPWH office</h2>
          <p>
            This portal is open source. Fork it, run <code>npm run setup</code> to pick your province, city, municipality or
            district engineering office, and deploy it to Cloudflare, Vercel or Netlify. It needs no database: the data comes
            from the same API.{' '}
            <External href={SOURCE_CODE_URL}>Source code</External> · <Link to="/">Back to the projects</Link>
          </p>
        </section>
      )}
    </>
  );
}

/**
 * Iloilo only. The config has no field for a reading note, so the
 * district-to-DEO mapping and the neighbouring-province caveat live here.
 * The yearly shares are `ILOILO_NEIGHBOUR_SHARES`, which `npm run check`
 * recomputes. Other portals do not show them.
 */
function DeoMappingNote() {
  const { config } = usePortal();
  if (config.id !== ILOILO_PORTAL_ID) return null;
  return (
    <>
      <section className="section" aria-labelledby="neighbours-h">
        <h2 id="neighbours-h" className="section-h">Lines that also name a neighbouring province</h2>
        <p>
          Many enacted-budget lines also name Capiz or Antique, mostly shared roads and the Panay River Basin.
          Each line is shown in full. Its amount is not divided between the provinces.
          Of each year’s enacted-budget total on this portal, that share is {formatIloiloNeighbourShares(ILOILO_NEIGHBOUR_SHARES)}.
        </p>
        <p>
          Among the enacted-budget lines, Aklan is named only in the nationwide Iloilo-Capiz-Aklan Expressway bundles. Those are removed by hand, for the reason published above, and they are not part of these shares.
        </p>
      </section>
      <section className="section" aria-labelledby="deo-h">
        <h2 id="deo-h" className="section-h">District engineering offices and legislative districts</h2>
        <p>
          In Iloilo the DPWH district engineering office numbers are not the legislative district numbers.
          This portal follows six offices, each shown whole. An office’s budget is never split across the districts it serves.
        </p>
        <ul className="plain-list">
          <li>Iloilo City, lone district: Iloilo City District Engineering Office.</li>
          <li>1st legislative district: Iloilo 1st District Engineering Office.</li>
          <li>2nd legislative district: Iloilo 4th District Engineering Office.</li>
          <li>3rd legislative district: Iloilo 6th District Engineering Office.</li>
          <li>4th legislative district: Iloilo 2nd District Engineering Office.</li>
          <li>5th legislative district: Iloilo 3rd District Engineering Office.</li>
        </ul>
        <p>There is no Iloilo 5th District Engineering Office.</p>
        <p>
          The API maps the Iloilo 4th DEO only to the 2nd District. The Iloilo 6th DEO, which now serves the 3rd District,
          has no labelled amounts before 2025 (missing, not zero), so 2020–2024 office figures for the 3rd District cannot
          be attributed from this data.
        </p>
      </section>
    </>
  );
}

/** The 2020–2026 searches, published like the 2027 ones: every department with a match, and how to check it. */
function GaaQuestions() {
  const { client, config } = usePortal();
  const places = config.scope.places ?? [];
  const [state, setState] = useState<Async<GaaResult>>({ status: 'loading' });
  useEffect(() => {
    if (!places.length) return;
    let live = true;
    loadGaa(client, config).then(
      (value) => live && setState({ status: 'ready', value }),
      (error) => live && setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      live = false;
    };
  }, [client, config, places.length]);

  return (
    <section className="section" aria-labelledby="g-h">
      <h2 id="g-h" className="section-h">The questions for the 2020–2026 budgets</h2>
      {!places.length ? (
        <p>None: this portal names no place, and the enacted budgets list projects by name, not by office.</p>
      ) : state.status === 'loading' ? (
        <p className="state" role="status"><span className="spinner" aria-hidden="true" /> Loading the searches…</p>
      ) : state.status === 'error' ? (
        <p className="state state-error">Could not load the searches: {state.error.message}</p>
      ) : (
        <>
          <div className="table queries" role="table" aria-label="Searches of the enacted budgets">
            <div className="tr th" role="row">
              <span role="columnheader">Programs whose name has…</span>
              <span role="columnheader">Department</span>
              <span role="columnheader" className="r">Found</span>
              <span role="columnheader" className="r">Loaded</span>
              <span role="columnheader" className="r">Check it</span>
            </div>
            {state.value.queries.map((q) => (
              <div className="tr" role="row" key={q.place + q.department_id}>
                <span role="cell"><strong>{q.q}</strong></span>
                <span role="cell">{departmentShort(q.department)}</span>
                <span role="cell" className="r num">{count(q.matched)}</span>
                <span role="cell" className="r num">{count(q.fetched)}</span>
                <span role="cell" className="r"><ApiCheck href={q.api} /></span>
              </div>
            ))}
          </div>
          <p className="fine">
            Every one of the {count(state.value.searched)} departments in the GAA was searched for each place; those not listed
            matched nothing. A program found by two places is shown once.
            {state.value.excluded.length > 0 ? ` ${plural(state.value.excluded.length, 'program')} removed by hand:` : ' None removed by hand.'}
          </p>
          {state.value.excluded.length > 0 && (
            <ul className="plain-list">
              {state.value.excluded.map(({ exclusion, row }) => (
                <li key={exclusion.key}>
                  {row ? row.name : <code>{exclusion.key}</code>}
                  <span className="muted"> — {exclusion.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
