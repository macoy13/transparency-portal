import type { BridgeGroup } from '../api/types';

/** Friendly chip labels matching the approved R0 mockup. */
export const COMPACT_CHIP_LABELS: Record<BridgeGroup | 'all', string> = {
  all: 'All',
  unchanged: 'Same amount',
  increased: 'Higher in House',
  decreased: 'Lower in House',
  house_only: 'House only',
  nep_only: 'NEP only',
  scope_review: 'Scope review',
};

export const COMPACT_CHIP_ORDER: readonly (BridgeGroup | 'all')[] = [
  'all',
  'unchanged',
  'increased',
  'decreased',
  'house_only',
  'nep_only',
  'scope_review',
];

export function compactChipLabel(g: BridgeGroup | 'all', fallback?: string): string {
  if (g === 'all') return COMPACT_CHIP_LABELS.all;
  return COMPACT_CHIP_LABELS[g] || fallback || g;
}
