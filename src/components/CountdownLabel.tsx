import { getCountdownLabel } from '../lib/deadline';

export function CountdownLabel({ daysRemaining }: { daysRemaining: number | null }) {
  const { text, emoji } = getCountdownLabel(daysRemaining);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-200">
      {emoji && <span aria-hidden="true">{emoji}</span>}
      <span>{text}</span>
    </span>
  );
}
