import type { TrackerEntry, TrackerStatus, UserProfile } from '../types';

const KEYS = {
  profile: 'taf.profile.v1',
  tracker: 'taf.tracker.v1',
} as const;

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getProfile(): UserProfile | null {
  return readJSON<UserProfile>(KEYS.profile);
}

export function saveProfile(profile: UserProfile): void {
  writeJSON(KEYS.profile, profile);
}

export function hasProfile(): boolean {
  const profile = getProfile();
  return !!profile && !!profile.fullName && !!profile.addressLine1 && !!profile.city && !!profile.state && !!profile.zip;
}

export function getTrackerEntries(): Record<string, TrackerEntry> {
  return readJSON<Record<string, TrackerEntry>>(KEYS.tracker) ?? {};
}

export function getTrackerStatus(productId: string): TrackerStatus {
  return getTrackerEntries()[productId]?.status ?? 'not_started';
}

export function setTrackerStatus(productId: string, status: TrackerStatus): void {
  const entries = getTrackerEntries();
  entries[productId] = { productId, status, updatedAt: new Date().toISOString() };
  writeJSON(KEYS.tracker, entries);
}

export function clearAllData(): void {
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.tracker);
}
