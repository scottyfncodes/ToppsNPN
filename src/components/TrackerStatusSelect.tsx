import type { TrackerStatus } from '../types';
import { TRACKER_STATUSES } from '../types';

const LABELS: Record<TrackerStatus, string> = {
  not_started: '⚪ Not Started',
  printed: '🖨️ Printed',
  mailed: '📬 Mailed',
  received: '🎉 Received',
  no_response: '🤷 No Response',
};

interface Props {
  value: TrackerStatus;
  onChange: (status: TrackerStatus) => void;
}

export function TrackerStatusSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TrackerStatus)}
      className="min-h-11 rounded-xl border border-navy-600 bg-navy-900 px-3 text-sm font-semibold text-white focus:border-open-500 focus:outline-none"
    >
      {TRACKER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {LABELS[status]}
        </option>
      ))}
    </select>
  );
}
