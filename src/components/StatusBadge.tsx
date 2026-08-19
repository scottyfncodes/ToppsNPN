import { STATUS_META } from '../lib/deadline';
import type { ProductStatus } from '../types';

export function StatusBadge({ status }: { status: ProductStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap ${meta.className}`}
    >
      <span aria-hidden="true">{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
