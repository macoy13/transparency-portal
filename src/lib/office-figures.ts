/**
 * Compact office-card figure helpers: held-out lines and visible-office counts.
 * Kept out of React component modules so Fast Refresh stays happy.
 */
import type { DistrictCard, Envelope } from '../api/types';
import type { ScopedProject } from './scope';

/** Held out of office figures: flag or listed on the office's office_change.lines. */
export function isHeldOutOfOffice(p: ScopedProject, heldIds: Set<string>): boolean {
  if (p.flags?.includes('office_difference')) return true;
  return heldIds.has(p.id);
}

/** Ids listed on any office's office_change.lines (held out of office totals). */
export function heldOutLineIdsFromDistricts(list: Envelope<DistrictCard>[]): Set<string> {
  const ids = new Set<string>();
  for (const env of list) {
    for (const o of env.data.offices) {
      for (const line of o.fy2027?.office_change?.lines ?? []) ids.add(line.id);
    }
  }
  return ids;
}

/**
 * How many config-scope offices would render a compact card for these rows
 * (same cut as the grid: drop office_difference / office_change lines).
 */
export function countVisibleCompactOffices(
  scopeOffices: readonly string[],
  projects: ScopedProject[],
  heldIds: Set<string>,
): number {
  let n = 0;
  for (const printed of scopeOffices) {
    if (projects.some((p) => p.office === printed && !isHeldOutOfOffice(p, heldIds))) n++;
  }
  return n;
}
