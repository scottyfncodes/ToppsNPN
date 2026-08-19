import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { StatusBadge } from '../components/StatusBadge';
import { formatDisplayDate } from '../lib/deadline';

interface CalendarEvent {
  date: string;
  type: 'release' | 'deadline';
  productId: string;
  productName: string;
}

export function Calendar() {
  const all = useProducts();
  const [sport, setSport] = useState<'Baseball' | 'All'>('Baseball');

  const items = useMemo(() => (sport === 'All' ? all : all.filter((i) => i.product.sport === sport)), [all, sport]);

  const events = useMemo(() => {
    const list: CalendarEvent[] = [];
    for (const { product, computed } of items) {
      if (product.releaseDate) {
        list.push({ date: product.releaseDate, type: 'release', productId: product.id, productName: product.productName });
      }
      if (computed.entryDeadline) {
        list.push({
          date: computed.entryDeadline,
          type: 'deadline',
          productId: product.id,
          productName: product.productName,
        });
      }
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const monthKey = event.date.slice(0, 7);
      const bucket = map.get(monthKey) ?? [];
      bucket.push(event);
      map.set(monthKey, bucket);
    }
    return Array.from(map.entries());
  }, [events]);

  const statusById = useMemo(() => new Map(items.map((i) => [i.product.id, i.computed.status])), [items]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Calendar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Release dates and entry deadlines, grouped by month, so you can see clusters of upcoming deadlines at a glance.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSport('Baseball')}
          className={`min-h-10 rounded-full px-4 text-sm font-bold ${sport === 'Baseball' ? 'bg-open-600 text-white' : 'bg-navy-800 text-slate-300'}`}
        >
          Baseball
        </button>
        <button
          type="button"
          onClick={() => setSport('All')}
          className={`min-h-10 rounded-full px-4 text-sm font-bold ${sport === 'All' ? 'bg-open-600 text-white' : 'bg-navy-800 text-slate-300'}`}
        >
          All Sports
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-navy-700 bg-navy-850 p-4 text-sm text-slate-400">
          No dated products yet.
        </p>
      ) : (
        groups.map(([monthKey, monthEvents]) => (
          <section key={monthKey}>
            <h2 className="mb-2 text-sm font-bold tracking-wide text-slate-400 uppercase">{formatMonth(monthKey)}</h2>
            <div className="space-y-2">
              {monthEvents.map((event, idx) => (
                <Link
                  key={`${event.productId}-${event.type}-${idx}`}
                  to={`/product/${event.productId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-navy-700 bg-navy-850 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{event.productName}</p>
                    <p className="text-xs text-slate-500">
                      {event.type === 'release' ? '⚪ Release' : '🏁 Entry deadline'} — {formatDisplayDate(event.date)}
                    </p>
                  </div>
                  {event.type === 'deadline' && statusById.get(event.productId) && (
                    <StatusBadge status={statusById.get(event.productId)!} />
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
