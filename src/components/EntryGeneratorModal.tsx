import { useState } from 'react';
import type { Product, ProductComputed, UserProfile } from '../types';
import { Modal } from './Modal';
import { ProfileForm } from './ProfileForm';
import { downloadPdf, generateEntryPdf, printPdf } from '../lib/pdf';
import { setTrackerStatus } from '../lib/storage';
import { formatDisplayDate } from '../lib/deadline';

interface Props {
  product: Product;
  computed: ProductComputed;
  profile: UserProfile | null;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
}

export function EntryGeneratorModal({ product, computed, profile, onClose, onProfileSaved }: Props) {
  const [editing, setEditing] = useState(!profile);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(profile);

  const handleSaveProfile = (p: UserProfile) => {
    onProfileSaved(p);
    setLocalProfile(p);
    setEditing(false);
  };

  const handleGenerate = async (action: 'download' | 'print') => {
    if (!localProfile) return;
    const doc = await generateEntryPdf(product, computed, localProfile);
    if (action === 'download') downloadPdf(doc, product.productName);
    else printPdf(doc);
    setTrackerStatus(product.id, 'printed');
    onClose();
  };

  return (
    <Modal title="Generate Entry" onClose={onClose}>
      {editing || !localProfile ? (
        <ProfileForm
          initial={localProfile}
          onSave={handleSaveProfile}
          onCancel={localProfile ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {product.isPlaceholder && (
            <p className="rounded-xl border border-closed-500/40 bg-closed-500/10 p-3 text-xs font-semibold text-closed-500">
              This product is sample data, not verified real Topps information. The generated PDF is for testing the app
              only — do not mail it.
            </p>
          )}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-3 text-sm">
            <p className="font-bold text-white">{product.exactEligibleProductName ?? product.productName}</p>
            <p className="mt-1 text-slate-400">Deadline: {formatDisplayDate(computed.entryDeadline)}</p>
          </div>
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-3 text-sm text-slate-300">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Your mailing info</span>
              <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-open-500">
                Edit
              </button>
            </div>
            <p>{localProfile.fullName}</p>
            <p>
              {localProfile.addressLine1}
              {localProfile.addressLine2 ? `, ${localProfile.addressLine2}` : ''}
            </p>
            <p>
              {localProfile.city}, {localProfile.state} {localProfile.zip}
            </p>
            <p>{localProfile.country}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleGenerate('download')}
              className="min-h-11 flex-1 rounded-xl bg-open-600 px-4 py-2.5 font-bold text-white"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => handleGenerate('print')}
              className="min-h-11 flex-1 rounded-xl border border-navy-600 px-4 py-2.5 font-bold text-slate-200"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
