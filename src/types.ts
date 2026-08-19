// Core data model for Topps Access Finder.
// Sport is intentionally a plain string union so the data layer never bakes in
// baseball-specific logic -- new sports are just new data, not new code paths.
export type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer' | 'Other';

export const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer', 'Other'];

export interface MailingAddress {
  name: string;
  attnLine?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * A Topps product that may be eligible for a Topps Access / No Purchase
 * Necessary mail-in entry. Any field that can't be confirmed from an
 * official Topps source must be left null -- the UI treats null fields as
 * "Not yet verified" rather than guessing.
 */
export interface Product {
  id: string;
  year: number;
  sport: Sport;
  brand: string;

  /** Display name, e.g. "2026 Topps Chrome Baseball". */
  productName: string;

  /**
   * The exact eligible product name as required by the official rules.
   * Must be copied verbatim from the official rules -- never abbreviated
   * or reworded. Null means it has not yet been verified against an
   * official source.
   */
  exactEligibleProductName: string | null;

  /** ISO date (yyyy-mm-dd) the product releases. Null if unannounced/unknown. */
  releaseDate: string | null;

  /**
   * Length of the official entry window in days, counted from releaseDate.
   * Used to compute entryDeadline programmatically. Prefer this over a
   * hard-coded deadline whenever the official rules define the window as
   * "N days from release."
   */
  entryWindowDays: number | null;

  /**
   * Explicit deadline (ISO date) to use instead of releaseDate + entryWindowDays,
   * for products whose rules specify a fixed calendar date rather than a
   * release-relative window. Takes precedence over entryWindowDays when set.
   */
  entryDeadlineOverride: string | null;

  /** Whether Topps Access / NPN eligibility has been confirmed. Null = not yet verified. */
  accessEligible: boolean | null;

  officialProductUrl: string | null;
  officialRulesUrl: string | null;
  officialChecklistUrl: string | null;
  officialSubmissionFormUrl: string | null;

  /** Official mail-in address, structured so it can be reused in PDFs. */
  submissionAddress: MailingAddress | null;

  /** Free-text description of envelope requirements from the official rules. */
  envelopeRequirements: string | null;

  /** Free-text description of any required handwritten info (e.g. on the outer envelope). */
  handwrittenRequirements: string | null;

  /** ISO date this record was last checked against an official Topps source. */
  lastVerified: string | null;

  notes: string | null;

  /** True for seed/sample records that are NOT verified real Topps data. */
  isPlaceholder: boolean;
}

export type ProductStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'UPCOMING' | 'VERIFICATION_REQUIRED';

export interface ProductComputed {
  entryDeadline: string | null;
  status: ProductStatus;
  daysRemaining: number | null;
  missingFields: string[];
}

export type TrackerStatus = 'not_started' | 'printed' | 'mailed' | 'received' | 'no_response';

export const TRACKER_STATUSES: TrackerStatus[] = ['not_started', 'printed', 'mailed', 'received', 'no_response'];

export interface TrackerEntry {
  productId: string;
  status: TrackerStatus;
  updatedAt: string;
}

export interface UserProfile {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/**
 * Scaffold only -- not wired to any delivery mechanism in the MVP.
 * Kept here so a future backend/notifications feature can reuse the shape
 * without a data migration.
 */
export interface ReminderPreference {
  productId: string;
  daysBefore: number[];
  channels: Array<'in_app' | 'browser' | 'email'>;
}
