/**
 * Iloilo only. The About page states what share of each year's enacted-budget
 * total also names Capiz, Antique or Aklan. Those figures are written once,
 * in `ILOILO_NEIGHBOUR_SHARES`. `npm run check` recomputes them.
 *
 * A neighbour row is a kept row (one per family key, config exclusions
 * already applied) whose published name matches capiz, antique or aklan on
 * a word boundary, in any case. Each such row counts once, in full. The
 * share is that sum divided by the portal's GAA total for the year, rounded
 * half up to one decimal place. Other portals do not use this module.
 */
import type { GaaProgram } from '../api/types';
import { GAA_YEARS } from '../api/types';
import { phpFull } from './format';
import { gaaYearTotals, hasYear } from './gaa';

/** Portal id the About caveat and the check both key off. */
export const ILOILO_PORTAL_ID = 'iloilo';

/**
 * Published share of each year's enacted-budget total, one decimal place,
 * in the order the About page prints them.
 */
export const ILOILO_NEIGHBOUR_SHARES: readonly { year: number; percent: string }[] = [
  { year: 2020, percent: '28.5' },
  { year: 2021, percent: '19.2' },
  { year: 2022, percent: '28.9' },
  { year: 2023, percent: '19.8' },
  { year: 2024, percent: '14.7' },
  { year: 2025, percent: '18.4' },
  { year: 2026, percent: '25.7' },
];

/** Capiz, Antique or Aklan as a whole word. A hyphen is a boundary, so "Iloilo-Capiz" matches. */
const NEIGHBOUR_PROVINCE = /\b(?:capiz|antique|aklan)\b/i;

function namesNeighbourProvince(name: string): boolean {
  return NEIGHBOUR_PROVINCE.test(name);
}

/** "28.5% in 2020, 19.2% in 2021 and 25.7% in 2026". No Oxford comma. */
export function formatIloiloNeighbourShares(shares: readonly { year: number; percent: string }[]): string {
  const parts = shares.map((s) => `${s.percent}% in ${s.year}`);
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export interface NeighbourYearShare {
  year: number;
  /** Pesos on kept rows whose name also names a neighbouring province. */
  neighbour: number;
  /** The portal's GAA total for the year, in pesos. */
  total: number;
  /** The share at one decimal place ("28.5"), or null when the total is zero. */
  percent: string | null;
}

/** Per enacted year, from rows `resolveGaa` kept: deduplicated, exclusions removed. */
export function neighbourYearShares(rows: readonly GaaProgram[]): NeighbourYearShare[] {
  const totals = new Map(gaaYearTotals(rows).map((t) => [t.year, t.amount]));
  const neighbours = rows.filter((r) => namesNeighbourProvince(r.name));
  return GAA_YEARS.map((year) => {
    let neighbour = 0;
    for (const row of neighbours) {
      if (hasYear(row, year)) neighbour += row.years[String(year)].amount;
    }
    const total = totals.get(year) ?? 0;
    return { year, neighbour, total, percent: total > 0 ? formatTenths(roundedTenths(neighbour, total)) : null };
  });
}

/**
 * Years whose published one-decimal share is not what the rows come to.
 * Empty when the About page still matches.
 */
export function neighbourShareProblems(
  shares: readonly NeighbourYearShare[],
  published: readonly { year: number; percent: string }[] = ILOILO_NEIGHBOUR_SHARES,
): string[] {
  const computed = new Map(shares.map((s) => [s.year, s]));
  const problems: string[] = [];
  const seen = new Set<number>();
  for (const share of published) {
    if (seen.has(share.year)) {
      problems.push(`${share.year}: neighbouring-province share is published more than once (published ${share.percent}%).`);
      continue;
    }
    seen.add(share.year);
    const got = computed.get(share.year);
    if (!got) {
      problems.push(`${share.year}: neighbouring-province share is published as ${share.percent}% but that year is not in the enacted budgets.`);
      continue;
    }
    if (!/^\d+\.\d$/.test(share.percent)) {
      problems.push(`${share.year}: neighbouring-province share is published as "${share.percent}", not one decimal place.`);
      continue;
    }
    if (got.percent == null) {
      problems.push(`${share.year}: neighbouring-province share is published as ${share.percent}% but the enacted-budget total is ${phpFull(got.total)}, so the computed share is none.`);
      continue;
    }
    if (got.percent !== share.percent) {
      problems.push(`${share.year}: neighbouring-province share is published as ${share.percent}% but the enacted-budget rows come to ${got.percent}% (${phpFull(got.neighbour)} of ${phpFull(got.total)}).`);
    }
  }
  for (const share of shares) {
    if (seen.has(share.year)) continue;
    const computedText = share.percent == null ? 'none' : `${share.percent}%`;
    problems.push(`${share.year}: neighbouring-province share is not published; the enacted-budget rows come to ${computedText} (${phpFull(share.neighbour)} of ${phpFull(share.total)}).`);
  }
  return problems;
}

/** Half up, in tenths of a percent. 285 means 28.5%. Amounts are non-negative integer pesos. */
function roundedTenths(numerator: number, denominator: number): number {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new Error(`cannot take a share of ${numerator} over ${denominator}`);
  }
  const num = BigInt(numerator) * 1000n;
  const den = BigInt(denominator);
  const q = num / den;
  const r = num % den;
  return Number(q + (r * 2n >= den ? 1n : 0n));
}

function formatTenths(tenths: number): string {
  return `${Math.trunc(tenths / 10)}.${tenths % 10}`;
}
