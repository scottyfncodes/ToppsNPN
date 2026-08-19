import { useState } from 'react';
import type { Product, ProductComputed, UserProfile } from '../types';
import { Modal } from './Modal';
import { ProfileForm } from './ProfileForm';
import { downloadPdf, generatePrintAllPdf, printPdf } from '../lib/pdf';
import { setTrackerStatus } from '../lib/storage';
import { formatDisplayDate } from '../lib/deadline';

interface Props {
  items: Array<{ product: Product; computed: ProductComputed }>;
  profile: UserProfile | null;
  sportLabel: string;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
}

export function PrintAllModal({ items, profile, sportLabel, onClose, onProfileSaved }: Props) {
  const [editing, setEditing] = useState(!profile);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(profile);
  const [selected, setSelected] = useState<Set<string>>(new Set(items.map((i) => i.product.id)));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.product.id))));
  };

  const selectedItems = items.filter((i) => selected.has(i.product.id));

  const handleGenerate = async (action: 'download' | 'print') => {
    if (!localProfile || selectedItems.length === 0) return;
    const doc = await generatePrintAllPdf(selectedItems, localProfile);
    if (action === 'download') downloadPdf(doc, `topps-access-entries-${new Date().toISOString().slice(0, 10)}`);
    else printPdf(doc);
    selectedItems.forEach((i) => setTrackerStatus(i.product.id, 'printed'));
    onClose();
  };

  return (
    <Modal title="Print All Open" onClose={onClose}>
      {editing || !localProfile ? (
        <ProfileForm
          initial={localProfile}
          onSave={(p) => {
            onProfileSaved(p);
            setLocalProfile(p);
            setEditing(false);
          }}
          onCancel={localProfile ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            You currently have <strong className="text-white">{items.length}</strong> eligible {sportLabel} open.
          </p>
          <p className="rounded-xl border border-closing-500/40 bg-closing-500/10 p-3 text-xs font-semibold text-closing-500">
            Each product requires its own envelope. Do not combine multiple product entries into a single submission.
          </p>
          <div>
            <button type="button" onClick={toggleAll} className="mb-2 text-xs font-semibold text-open-500">
              {selected.size === items.length ? 'Deselect all' : 'Select all'}
            </button>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {items.map(({ product, computed }) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-navy-700 bg-navy-850 p-3"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggle(product.id)}
                    className="h-5 w-5 shrink-0 accent-open-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{product.productName}</p>
                    <p className="text-xs text-slate-500">Deadline: {formatDisplayDate(computed.entryDeadline)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => handleGenerate('download')}
              className="min-h-11 flex-1 rounded-xl bg-open-600 px-4 py-2.5 font-bold text-white disabled:opacity-40"
            >
              Download Packet
            </button>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => handleGenerate('print')}
              className="min-h-11 flex-1 rounded-xl border border-navy-600 px-4 py-2.5 font-bold text-slate-200 disabled:opacity-40"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
