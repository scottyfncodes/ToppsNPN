import type { Product, ProductComputed, ProductStatus } from '../types';

const MS_PER_DAY = 86_400_000;

/** Parses a yyyy-mm-dd string as a UTC midnight Date, avoiding local-timezone drift. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** "Today" expressed in the user's local calendar date, normalized to UTC midnight for diffing. */
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function formatDisplayDate(iso: string | null): string {
  if (!iso) return 'Not yet verified';
  return parseISODate(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Computes the entry deadline from official rules data. An explicit override
 * always wins; otherwise the deadline is releaseDate + entryWindowDays.
 * Returns null (never a guess) if there isn't enough data to compute it.
 */
export function computeEntryDeadline(
  product: Pick<Product, 'releaseDate' | 'entryWindowDays' | 'entryDeadlineOverride'>,
): string | null {
  if (product.entryDeadlineOverride) return product.entryDeadlineOverride;
  if (product.releaseDate && product.entryWindowDays != null) {
    return formatISODate(addDays(parseISODate(product.releaseDate), product.entryWindowDays));
  }
  return null;
}

export function computeDaysRemaining(deadlineIso: string | null, now: Date = todayUTC()): number | null {
  if (!deadlineIso) return null;
  const deadline = parseISODate(deadlineIso);
  return Math.round((deadline.getTime() - now.getTime()) / MS_PER_DAY);
}

/**
 * Fields required before a product can be presented as confirmed-eligible.
 * Any gap here forces VERIFICATION_REQUIRED rather than a guessed status.
 */
export function getMissingFields(product: Product): string[] {
  const missing: string[] = [];
  if (!product.releaseDate) missing.push('releaseDate');
  if (product.accessEligible === null) missing.push('accessEligible');
  if (!product.exactEligibleProductName) missing.push('exactEligibleProductName');
  if (!product.officialRulesUrl) missing.push('officialRulesUrl');
  if (!product.entryDeadlineOverride && product.entryWindowDays == null) missing.push('entryWindowDays / entryDeadline');
  if (!product.submissionAddress) missing.push('submissionAddress');
  return missing;
}

export function computeProductStatus(product: Product, now: Date = todayUTC()): ProductComputed {
  const missingFields = getMissingFields(product);
  const entryDeadline = computeEntryDeadline(product);
  const daysRemaining = computeDaysRemaining(entryDeadline, now);

  if (missingFields.length > 0) {
    return { entryDeadline, status: 'VERIFICATION_REQUIRED', daysRemaining, missingFields };
  }

  if (product.accessEligible === false) {
    return { entryDeadline, status: 'CLOSED', daysRemaining, missingFields };
  }

  let status: ProductStatus;
  if (product.releaseDate && parseISODate(product.releaseDate).getTime() > now.getTime()) {
    status = 'UPCOMING';
  } else if (daysRemaining === null || daysRemaining < 0) {
    status = 'CLOSED';
  } else if (daysRemaining <= 6) {
    status = 'CLOSING_SOON';
  } else {
    status = 'OPEN';
  }

  return { entryDeadline, status, daysRemaining, missingFields };
}

export const STATUS_META: Record<ProductStatus, { label: string; emoji: string; className: string }> = {
  OPEN: { label: 'OPEN', emoji: '\u{1F7E2}', className: 'bg-open-500/15 text-open-500 border-open-500/40' },
  CLOSING_SOON: {
    label: 'CLOSING SOON',
    emoji: '\u{1F7E1}',
    className: 'bg-closing-500/15 text-closing-500 border-closing-500/40',
  },
  CLOSED: { label: 'CLOSED', emoji: '\u{1F534}', className: 'bg-closed-500/15 text-closed-500 border-closed-500/40' },
  UPCOMING: {
    label: 'UPCOMING',
    emoji: '\u{26AA}',
    className: 'bg-upcoming-500/15 text-upcoming-500 border-upcoming-500/40',
  },
  VERIFICATION_REQUIRED: {
    label: 'VERIFICATION REQUIRED',
    emoji: '\u{26A0}\u{FE0F}',
    className: 'bg-closing-500/15 text-closing-500 border-closing-500/40',
  },
};

export function getCountdownLabel(daysRemaining: number | null): { text: string; emoji: string } {
  if (daysRemaining === null) return { text: 'Deadline not yet verified', emoji: '' };
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);
    return { text: `CLOSED ${days} DAY${days === 1 ? '' : 'S'} AGO`, emoji: '' };
  }
  if (daysRemaining === 0) return { text: 'DUE TODAY', emoji: '\u{1F6A8}' };
  const label = `${daysRemaining} DAY${daysRemaining === 1 ? '' : 'S'} LEFT`;
  if (daysRemaining < 3) return { text: label, emoji: '\u{1F6A8}' };
  if (daysRemaining < 7) return { text: label, emoji: '\u{26A0}\u{FE0F}' };
  return { text: label, emoji: '' };
}
