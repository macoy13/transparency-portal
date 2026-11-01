/**
 * `npm run check` — runs portal.config.ts against the live API and prints what
 * the portal will show: every query, its count, and the totals. Exits non-zero
 * when the config cannot work (an office name the API does not know, an
 * exclusion that matches nothing, a query too broad to be one place), so it
 * can gate a deploy in CI.
 *
 *   npm run check                                   portal.config.ts
 *   npm run check -- --config=examples/deo.config.ts
 *   npm run check -- --verbose                      list lines to review
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv, cwd, env, exit } from 'node:process';
import type { PortalConfig } from '../src/config.ts';
import { createClient } from '../src/api/client.ts';
import { configProblems, DEFAULT_API } from '../src/config.ts';
import { resolveScope, summarise } from '../src/lib/scope.ts';
import { departmentShort, gaaYearTotals, resolveGaa } from '../src/lib/gaa.ts';
import { ILOILO_NEIGHBOUR_SHARES, ILOILO_PORTAL_ID, formatIloiloNeighbourShares, neighbourShareProblems, neighbourYearShares } from '../src/lib/iloilo-neighbours.ts';
import { GAA_YEARS, type GaaEnvelope } from '../src/api/types.ts';
import { count, php, plural } from '../src/lib/format.ts';

const verbose = argv.includes('--verbose');
// --config=examples/deo.config.ts checks another file; default portal.config.ts.
const configPath = resolve(cwd(), argv.find((a) => a.startsWith('--config='))?.slice('--config='.length) ?? 'portal.config.ts');

// Node's fetch waits up to five minutes for response headers, and a body read
// can stall after the headers have arrived. Bound each request. A timeout and
// a connection failure ("fetch failed") do not name the URL, so the paths below
// do. Messages stay the request URL and the cause: no headers.
const REQUEST_MS = 30_000;
const fetchImpl = globalThis.fetch.bind(globalThis);

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string' || input instanceof URL) return String(input);
  return input.url;
}

/** Our deadline aborted the request. Another signal's abort is left alone. */
function timedOut(err: unknown, deadline: AbortSignal): boolean {
  if (!deadline.aborted || !(err instanceof Error)) return false;
  return err.name === 'TimeoutError' || err.name === 'AbortError';
}

// Headers already arrived; res.json() rejects with a bare TimeoutError.
function guardJson(res: Response, url: string, deadline: AbortSignal): Response {
  const read = res.json.bind(res);
  Object.defineProperty(res, 'json', {
    configurable: true,
    writable: true,
    value: async () => {
      try {
        return await read();
      } catch (err) {
        if (!timedOut(err, deadline)) throw err;
        throw new Error(`timed out after ${REQUEST_MS / 1000}s reading ${url}`, { cause: err });
      }
    },
  });
  return res;
}

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const deadline = AbortSignal.timeout(REQUEST_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, deadline]) : deadline;
  const url = requestUrl(input);
  try {
    return guardJson(await fetchImpl(input, { ...init, signal }), url, deadline);
  } catch (err) {
    if (timedOut(err, deadline)) throw new Error(`no response within ${REQUEST_MS / 1000}s from ${url}`, { cause: err });
    // Connection refused, DNS, and the other failures Node reports as "fetch failed".
    throw new Error(`request failed for ${url}`, { cause: err });
  }
}) as typeof globalThis.fetch;

/** Walk the cause chain; join distinct messages so ECONNREFUSED is not lost. */
function describeFailure(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts: string[] = [];
  const seen = new Set<string>();
  let cur: unknown = err;
  for (let depth = 0; depth < 8 && cur instanceof Error; depth++, cur = cur.cause) {
    const msg = cur.message.trim();
    if (!msg || seen.has(msg)) continue;
    seen.add(msg);
    parts.push(msg);
  }
  return parts.length ? parts.join(': ') : String(err);
}

async function main() {
  const config = ((await import(pathToFileURL(configPath).href)) as { default: PortalConfig }).default;
  const problems = configProblems(config);
  const warnings: string[] = [];
  const api = createClient(env.VITE_API_BASE || config.api || DEFAULT_API);
  console.log(`${config.name} (${config.kind}) · API ${api.base}\n`);

  const scope = await resolveScope(api, config);

  console.log('Queries');
  for (const q of scope.queries) {
    const what = q.kind === 'office' ? `office "${q.label}"` : `title names "${q.label}" (q=${q.params.q})`;
    const kept = q.region ? ` · ${count(q.kept)} kept in region ${q.region} or giving no region` : '';
    console.log(`  ${q.dataset.padEnd(5)} ${what}: ${count(q.total)}${kept}`);
    if (q.kind === 'office') {
      if (q.total === 0) problems.push(`office "${q.label}" matches no DPWH line. Use the name as published: npm run setup -- --list-offices`);
      const lens = q.officeLens;
      if (lens?.offices.length) {
        for (const o of lens.offices) {
          console.log(`        ${o.tier_text}; districts: ${o.districts.map((d) => d.label).join('; ')}`);
        }
      }
    }
    if (q.truncated) problems.push(`"${q.label}" on ${q.dataset} matches ${count(q.total)} lines, too many for one place. Add a region or more words to q.`);
  }

  for (const { exclusion, project } of scope.excluded) {
    // (2020–2026 exclusions, gaa:…, are checked below with the enacted budgets.)
    if (!project) problems.push(`exclusion ${exclusion.key} matches no line in the portal; remove it.`);
  }

  // Lines found only by name, under a DPWH office outside the scope: often right
  // (a Central Office project in the place), sometimes a namesake elsewhere.
  const offices = new Set(config.scope.offices ?? []);
  const nameOnly = scope.projects.filter(
    (p) => p.dataset === 'dpwh' && p.office && !offices.has(p.office) && p.office_kind?.startsWith('District') && p.reasons.every((r) => r.kind === 'place'),
  );
  if (nameOnly.length) {
    warnings.push(`${nameOnly.length} DPWH line(s) are here only because the title names the place, but the documents list them under a district office this portal does not include. Review them (--verbose) and exclude any namesakes.`);
    if (verbose) for (const p of nameOnly) console.log(`    ${p.key}  [${p.office}]  ${p.title}`);
  }

  const s = summarise(scope.projects);
  console.log(`\nIn the portal: ${count(s.rows)} lines (${count(scope.excluded.length)} excluded by hand)`);
  console.log(`  NEP:        ${php(s.nep.php)} on ${count(s.nep.rows)} lines`);
  console.log(`  House bill: ${php(s.house.php)} on ${count(s.house.rows)} lines`);
  console.log('  Compared, never added.');
  for (const [g, c] of Object.entries(s.groups)) if (c.rows) console.log(`  ${g.padEnd(13)} ${count(c.rows)}`);
  for (const [d, c] of Object.entries(s.byDataset)) console.log(`  program ${d.padEnd(5)} ${count(c.rows)}`);

  for (const id of config.scope.districts ?? []) {
    try {
      const d = await api.district(id);
      console.log(`  district ${d.data.label} · ${d.data.attribution.label}`);
    } catch {
      problems.push(`district "${id}" is not in the API. List them: npm run setup -- --list-districts`);
    }
  }

  // The enacted budgets, 2020–2026: the same places, every department.
  if (config.scope.places?.length) {
    const gaa = await resolveGaa(api, config);
    console.log(`\nEnacted budgets 2020–2026: ${plural(gaa.rows.length, "program or project", "programs and projects")} name the places (${count(gaa.searched)} departments searched)`);
    for (const q of gaa.queries) {
      console.log(`  "${q.q}" in ${departmentShort(q.department)}: ${count(q.matched)}${q.truncated ? ` (cut at ${count(q.fetched)})` : ''}`);
      if (q.truncated) problems.push(`"${q.q}" matches ${count(q.matched)} ${departmentShort(q.department)} programs, more than the portal loads. Make q narrower.`);
    }
    for (const t of gaaYearTotals(gaa.rows)) console.log(`  ${t.year}: ${php(t.amount)} on ${count(t.programs)} programs`);

    // Iloilo only. The About page publishes each year's share of that total
    // that also names Capiz, Antique or Aklan. Recompute it from these rows
    // so the sentence cannot drift. With no kept rows the shares cannot be
    // checked, so say so. Other portals skip this.
    if (config.id === ILOILO_PORTAL_ID) {
      if (gaa.rows.length === 0) {
        problems.push('neighbouring-province shares are published for Iloilo, but the enacted-budget search kept no rows, so they cannot be checked.');
      } else {
        const shares = neighbourYearShares(gaa.rows);
        const shown = shares.map((s) => ({ year: s.year, percent: s.percent ?? '—' }));
        console.log(`  neighbouring-province shares: ${formatIloiloNeighbourShares(shown)}`);
        for (const p of neighbourShareProblems(shares, ILOILO_NEIGHBOUR_SHARES)) problems.push(p);
      }
    }

    // Reconcile: for every search and year, the rows loaded add up to the API's own total for that search.
    const withExcluded = [...gaa.rows, ...gaa.excluded.flatMap((x) => (x.row ? [x.row] : []))];
    let checked = 0;
    for (const q of gaa.queries) {
      if (q.truncated) continue;
      const mine = withExcluded.filter((r) => r.department_id === q.department_id && r.reasons.includes(q.place));
      for (const year of GAA_YEARS) {
        const theirs = (await api.json<GaaEnvelope<unknown[]>>(`/api/v1/gaa/departments/${q.department_id}/programs`, { q: q.q, limit: 1, year })).meta.matched_amount ?? 0;
        const ours = mine.reduce((a, r) => a + (r.years[String(year)]?.amount ?? 0), 0);
        checked++;
        if (ours !== theirs) problems.push(`"${q.q}" in ${departmentShort(q.department)}, ${year}: rows add up to ${php(ours)}, the API says ${php(theirs)}.`);
      }
    }
    console.log(`  reconciled ${count(checked)} department-years against the API's totals`);
    for (const { exclusion, row } of gaa.excluded) {
      if (!row) problems.push(`exclusion ${exclusion.key} matches no 2020–2026 program; remove it.`);
    }
  } else if (config.id === ILOILO_PORTAL_ID) {
    // The About page still prints the shares when the config names no place.
    problems.push('neighbouring-province shares are published for Iloilo, but the config names no place, so they cannot be checked.');
  }

  for (const w of warnings) console.log(`\nwarning: ${w}`);
  for (const p of problems) console.log(`\nproblem: ${p}`);
  if (problems.length) exit(1);
  console.log('\nOK');
}

main().catch((err) => {
  console.error(describeFailure(err));
  exit(1);
});
