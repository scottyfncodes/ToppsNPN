import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { StatusBadge } from '../components/StatusBadge';
import { TrackerStatusSelect } from '../components/TrackerStatusSelect';
import { formatDisplayDate } from '../lib/deadline';
import { clearAllData, getTrackerStatus, setTrackerStatus } from '../lib/storage';
import type { TrackerStatus } from '../types';

export function MyEntries() {
  const all = useProducts();
  const [, forceRender] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  const tracked = all
    .map((item) => ({ ...item, trackerStatus: getTrackerStatus(item.product.id) }))
    .filter((item) => item.trackerStatus !== 'not_started');

  const handleChange = (productId: string, status: TrackerStatus) => {
    setTrackerStatus(productId, status);
    forceRender((n) => n + 1);
  };

  const handleClear = () => {
    clearAllData();
    setConfirmClear(false);
    forceRender((n) => n + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">My Entries</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track your own submission progress. Topps does not confirm receipt through this app — statuses here reflect
          only what you record.
        </p>
      </div>

      {tracked.length === 0 ? (
        <p className="rounded-2xl border border-navy-700 bg-navy-850 p-4 text-sm text-slate-400">
          You haven't generated any entries yet. Once you generate or print an entry, it'll show up here so you can track
          it through mailing.
        </p>
      ) : (
        <div className="space-y-3">
          {tracked.map(({ product, computed, trackerStatus }) => (
            <div
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl border border-navy-700 bg-navy-850 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link to={`/product/${product.id}`} className="font-bold text-white hover:text-open-500">
                  {product.productName}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <StatusBadge status={computed.status} />
                  <span>Deadline: {formatDisplayDate(computed.entryDeadline)}</span>
                </div>
              </div>
              <TrackerStatusSelect value={trackerStatus} onChange={(status) => handleChange(product.id, status)} />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-navy-700 bg-navy-850 p-4">
        <h2 className="text-sm font-bold text-white">Privacy</h2>
        <p className="mt-1 text-xs text-slate-400">
          Your mailing address and tracked entries are stored only in this browser's local storage. Nothing is sent to a
          server.
        </p>
        {confirmClear ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <p className="flex-1 text-xs font-semibold text-closed-500">
              This will permanently delete your saved address and all tracked entries on this device.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="min-h-10 rounded-xl border border-navy-600 px-3 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="min-h-10 rounded-xl bg-closed-600 px-3 text-xs font-bold text-white"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="mt-3 min-h-11 rounded-xl border border-closed-500/50 px-4 text-sm font-bold text-closed-500"
          >
            CLEAR MY INFORMATION
          </button>
        )}
      </div>
    </div>
  );
}
