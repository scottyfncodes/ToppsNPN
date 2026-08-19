import { Link } from 'react-router-dom';
import type { Product, ProductComputed } from '../types';
import { StatusBadge } from './StatusBadge';
import { CountdownLabel } from './CountdownLabel';
import { formatDisplayDate } from '../lib/deadline';

interface ProductCardProps {
  product: Product;
  computed: ProductComputed;
  onGenerateEntry: (productId: string) => void;
}

export function ProductCard({ product, computed, onGenerateEntry }: ProductCardProps) {
  const canGenerate = computed.status === 'OPEN' || computed.status === 'CLOSING_SOON';

  return (
    <div className="flex flex-col rounded-2xl border border-navy-700 bg-navy-850 p-4 shadow-lg shadow-black/20">
      <Link to={`/product/${product.id}`} className="flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="rounded-full bg-navy-700 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
            {product.sport}
          </span>
          <StatusBadge status={computed.status} />
        </div>
        <h3 className="text-lg leading-snug font-bold text-white">{product.productName}</h3>
        <dl className="mt-3 space-y-1 text-sm text-slate-300">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Release</dt>
            <dd>{formatDisplayDate(product.releaseDate)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-500">Deadline</dt>
            <dd>{formatDisplayDate(computed.entryDeadline)}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <CountdownLabel daysRemaining={computed.daysRemaining} />
        </div>
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canGenerate}
          title={canGenerate ? undefined : 'This entry window is not currently open'}
          onClick={() => onGenerateEntry(product.id)}
          className="min-h-11 flex-1 rounded-xl bg-open-600 px-3 py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-slate-500"
        >
          Generate Entry
        </button>
        {product.officialRulesUrl && (
          <a
            href={product.officialRulesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-xl border border-navy-600 px-3 py-2.5 text-sm font-semibold text-slate-200"
          >
            Rules
          </a>
        )}
        {product.officialChecklistUrl && (
          <a
            href={product.officialChecklistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-xl border border-navy-600 px-3 py-2.5 text-sm font-semibold text-slate-200"
          >
            Checklist
          </a>
        )}
      </div>
    </div>
  );
}
