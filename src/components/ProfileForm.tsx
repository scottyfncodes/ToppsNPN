import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { UserProfile } from '../types';

interface ProfileFormProps {
  initial: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const emptyProfile: UserProfile = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
};

export function ProfileForm({ initial, onSave, onCancel }: ProfileFormProps) {
  const [form, setForm] = useState<UserProfile>(initial ?? emptyProfile);

  const update = (key: keyof UserProfile) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const isValid = Boolean(
    form.fullName.trim() && form.addressLine1.trim() && form.city.trim() && form.state.trim() && form.zip.trim() && form.country.trim(),
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSave(form);
      }}
      className="space-y-3"
    >
      <p className="text-sm text-slate-400">
        Your information is stored locally on this device for convenience. The app does not submit anything to Topps.
      </p>
      <Field label="Full name" value={form.fullName} onChange={update('fullName')} required />
      <Field label="Mailing address" value={form.addressLine1} onChange={update('addressLine1')} required />
      <Field label="Address line 2 (optional)" value={form.addressLine2 ?? ''} onChange={update('addressLine2')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" value={form.city} onChange={update('city')} required />
        <Field label="State" value={form.state} onChange={update('state')} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="ZIP" value={form.zip} onChange={update('zip')} required />
        <Field label="Country" value={form.country} onChange={update('country')} required />
      </div>
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-xl border border-navy-600 px-4 py-2.5 font-semibold text-slate-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="min-h-11 flex-1 rounded-xl bg-open-600 px-4 py-2.5 font-bold text-white disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function Field({ label, value, onChange, required }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-300">{label}</span>
      <input
        value={value}
        onChange={onChange}
        required={required}
        className="min-h-11 w-full rounded-xl border border-navy-600 bg-navy-900 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-open-500 focus:outline-none"
      />
    </label>
  );
}
