import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { EntryGeneratorModal } from '../components/EntryGeneratorModal';
import { PrintAllModal } from '../components/PrintAllModal';
import { getProfile, getTrackerStatus, saveProfile } from '../lib/storage';
import type { UserProfile } from '../types';

type SortKey = 'deadline' | 'release' | 'name' | 'daysRemaining';
type StatusFilter = 'open' | 'closingSoon' | 'upcoming' | 'closed' | 'tracked';

const STATUS_FILTER_OPTIONS: Array<[StatusFilter, string]> = [
  ['open', 'Open only'],
  ['closingSoon', 'Closing soon'],
  ['upcoming', 'Upcoming'],
  ['closed', 'Closed'],
  ['tracked', 'Tracked entries'],
];

export function Home() {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport') ?? 'Baseball';
  const all = useProducts();

  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [brand, setBrand] = useState('all');
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfile());
  const [generateFor, setGenerateFor] = useState<string | null>(null);
  const [printAllOpen, setPrintAllOpen] = useState(false);

  const bySport = useMemo(() => (sport === 'All' ? all : all.filter((i) => i.product.sport === sport)), [all, sport]);

  const years = useMemo(() => Array.from(new Set(bySport.map((i) => i.product.year))).sort((a, b) => b - a), [bySport]);
  const brands = useMemo(() => Array.from(new Set(bySport.map((i) => i.product.brand))).sort(), [bySport]);

  const closingSoon = useMemo(
    () =>
      [...bySport]
        .filter((i) => i.computed.status === 'CLOSING_SOON')
        .sort(
          (a, b) =>
            (a.computed.daysRemaining ?? 999) - (b.computed.daysRemaining ?? 999) ||
            (a.computed.entryDeadline ?? '').localeCompare(b.computed.entryDeadline ?? '') ||
            (a.product.releaseDate ?? '').localeCompare(b.product.releaseDate ?? ''),
        ),
    [bySport],
  );

  const openNow = useMemo(
    () => bySport.filter((i) => i.computed.status === 'OPEN' || i.computed.status === 'CLOSING_SOON'),
    [bySport],
  );

  const filtered = useMemo(() => {
    let list = bySport;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) => i.product.productName.toLowerCase().includes(q) || i.product.brand.toLowerCase().includes(q),
      );
    }
    if (year !== 'all') list = list.filter((i) => String(i.product.year) === year);
    if (brand !== 'all') list = list.filter((i) => i.product.brand === brand);
    if (statusFilters.size > 0) {
      list = list.filter((i) => {
        if (statusFilters.has('open') && i.computed.status === 'OPEN') return true;
        if (statusFilters.has('closingSoon') && i.computed.status === 'CLOSING_SOON') return true;
        if (statusFilters.has('upcoming') && i.computed.status === 'UPCOMING') return true;
        if (statusFilters.has('closed') && i.computed.status === 'CLOSED') return true;
        if (statusFilters.has('tracked') && getTrackerStatus(i.product.id) !== 'not_started') return true;
        return false;
      });
    }
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'deadline':
          return (a.computed.entryDeadline ?? '9999-99-99').localeCompare(b.computed.entryDeadline ?? '9999-99-99');
        case 'release':
          return (a.product.releaseDate ?? '9999-99-99').localeCompare(b.product.releaseDate ?? '9999-99-99');
        case 'name':
          return a.product.productName.localeCompare(b.product.productName);
        case 'daysRemaining':
          return (a.computed.daysRemaining ?? 9999) - (b.computed.daysRemaining ?? 9999);
        default:
          return 0;
      }
    });
  }, [bySport, search, year, brand, statusFilters, sortKey]);

  const toggleStatusFilter = (key: StatusFilter) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleProfileSaved = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
  };

  const generateItem = all.find((i) => i.product.id === generateFor);
  const sportNoun = sport === 'All' ? 'product' : sport.toLowerCase();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-850 to-navy-800 p-5">
        <p className="text-sm text-slate-300">
          You currently have <strong className="text-white">{openNow.length}</strong> eligible {sportNoun}
          {openNow.length === 1 ? '' : 's'} open.
        </p>
        <button
          type="button"
          disabled={openNow.length === 0}
          onClick={() => setPrintAllOpen(true)}
          className="mt-3 min-h-12 w-full rounded-xl bg-open-600 px-4 text-base font-black text-white shadow-lg shadow-open-600/20 transition active:scale-[0.98] disabled:opacity-40 sm:w-auto sm:px-8"
        >
          🖨️ PRINT ALL OPEN {sport === 'All' ? 'PRODUCTS' : sport.toUpperCase()}
        </button>
      </section>

      {closingSoon.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-closing-500">🚨 CLOSING SOON</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {closingSoon.map(({ product, computed }) => (
              <ProductCard key={product.id} product={product} computed={computed} onGenerateEntry={setGenerateFor} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-black text-white">OPEN NOW</h2>
        {openNow.length === 0 ? (
          <p className="rounded-xl border border-navy-700 bg-navy-850 p-4 text-sm text-slate-400">
            No {sportNoun} products are currently open. Check back soon, or browse everything below.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openNow.map(({ product, computed }) => (
              <ProductCard key={product.id} product={product} computed={computed} onGenerateEntry={setGenerateFor} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-black text-white">Browse &amp; Search</h2>
        <div className="space-y-3 rounded-2xl border border-navy-700 bg-navy-850 p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="min-h-11 w-full rounded-xl border border-navy-600 bg-navy-900 px-3 text-white placeholder:text-slate-600 focus:border-open-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleStatusFilter(key)}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${
                  statusFilters.has(key) ? 'border-open-500 bg-open-500/15 text-open-500' : 'border-navy-600 text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="min-h-11 rounded-xl border border-navy-600 bg-navy-900 px-2 text-sm text-white"
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="min-h-11 rounded-xl border border-navy-600 bg-navy-900 px-2 text-sm text-white"
            >
              <option value="all">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="col-span-2 min-h-11 rounded-xl border border-navy-600 bg-navy-900 px-2 text-sm text-white"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="release">Sort: Release date</option>
              <option value="name">Sort: Product name</option>
              <option value="daysRemaining">Sort: Days remaining</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ product, computed }) => (
            <ProductCard key={product.id} product={product} computed={computed} onGenerateEntry={setGenerateFor} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-xl border border-navy-700 bg-navy-850 p-4 text-sm text-slate-400">
              No products match your filters.
            </p>
          )}
        </div>
      </section>

      {generateItem && (
        <EntryGeneratorModal
          product={generateItem.product}
          computed={generateItem.computed}
          profile={profile}
          onClose={() => setGenerateFor(null)}
          onProfileSaved={handleProfileSaved}
        />
      )}

      {printAllOpen && (
        <PrintAllModal
          items={openNow}
          profile={profile}
          sportLabel={sport === 'All' ? 'products' : `${sport.toLowerCase()} products`}
          onClose={() => setPrintAllOpen(false)}
          onProfileSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}
