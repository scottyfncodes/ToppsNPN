import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { StatusBadge } from '../components/StatusBadge';
import { CountdownLabel } from '../components/CountdownLabel';
import { EntryGeneratorModal } from '../components/EntryGeneratorModal';
import { formatDisplayDate } from '../lib/deadline';
import { getProfile, saveProfile } from '../lib/storage';
import type { UserProfile } from '../types';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const all = useProducts();
  const item = all.find((i) => i.product.id === id);
  const [profile, setProfile] = useState<UserProfile | null>(() => getProfile());
  const [generating, setGenerating] = useState(false);

  if (!item) {
    return (
      <div className="rounded-2xl border border-navy-700 bg-navy-850 p-6 text-center">
        <p className="text-slate-300">Product not found.</p>
        <Link to="/" className="mt-3 inline-block font-semibold text-open-500">
          &larr; Back to all products
        </Link>
      </div>
    );
  }

  const { product, computed } = item;
  const canGenerate = computed.status === 'OPEN' || computed.status === 'CLOSING_SOON';
  const needsVerification = computed.status === 'VERIFICATION_REQUIRED';

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-semibold text-slate-400">
        &larr; Back
      </Link>

      {product.isPlaceholder && (
        <div className="rounded-xl border border-closed-500/40 bg-closed-500/10 p-3 text-xs font-semibold text-closed-500">
          SAMPLE DATA — this record has not been verified against an official Topps source. Do not use it for a real
          submission.
        </div>
      )}

      <div className="rounded-2xl border border-navy-700 bg-navy-850 p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-navy-700 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
            {product.sport}
          </span>
          <StatusBadge status={computed.status} />
        </div>
        <h1 className="text-2xl font-black text-white">{product.productName}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Topps Access:{' '}
          {product.accessEligible === true ? 'Eligible' : product.accessEligible === false ? 'Not eligible' : 'Not yet verified'}
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Release Date</dt>
            <dd className="text-sm font-semibold text-slate-200">{formatDisplayDate(product.releaseDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Entry Deadline</dt>
            <dd className="text-sm font-semibold text-slate-200">{formatDisplayDate(computed.entryDeadline)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Countdown</dt>
            <dd>
              <CountdownLabel daysRemaining={computed.daysRemaining} />
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-slate-500">
          Last verified: {product.lastVerified ? formatDisplayDate(product.lastVerified) : 'Not yet verified'}
        </p>
      </div>

      {needsVerification && (
        <div className="rounded-2xl border border-closing-500/40 bg-closing-500/10 p-4">
          <p className="font-bold text-closing-500">⚠️ Verification Required</p>
          <p className="mt-1 text-sm text-slate-300">
            This product can't be confirmed as an open Topps Access entry yet. Missing or unverified:
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
            {computed.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-navy-700 bg-navy-850 p-5">
        <h2 className="mb-3 text-base font-bold text-white">What you need</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            <span className="font-semibold text-slate-200">Exact eligible product name:</span>{' '}
            {product.exactEligibleProductName ?? 'Not yet verified'}
          </li>
          <li>
            <span className="font-semibold text-slate-200">Official submission form:</span>{' '}
            {product.officialSubmissionFormUrl ? (
              <a
                href={product.officialSubmissionFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-open-500"
              >
                View form
              </a>
            ) : (
              'Not yet verified'
            )}
          </li>
          <li>
            <span className="font-semibold text-slate-200">Mailing address:</span>{' '}
            {product.submissionAddress ? (
              <span>
                {product.submissionAddress.name}
                {product.submissionAddress.attnLine ? `, ${product.submissionAddress.attnLine}` : ''},{' '}
                {product.submissionAddress.addressLine1}
                {product.submissionAddress.addressLine2 ? `, ${product.submissionAddress.addressLine2}` : ''},{' '}
                {product.submissionAddress.city}, {product.submissionAddress.state} {product.submissionAddress.zip},{' '}
                {product.submissionAddress.country}
              </span>
            ) : (
              'Not yet verified'
            )}
          </li>
          <li>
            <span className="font-semibold text-slate-200">Envelope requirements:</span>{' '}
            {product.envelopeRequirements ?? 'Not yet verified'}
          </li>
          <li>
            <span className="font-semibold text-slate-200">Handwritten requirements:</span>{' '}
            {product.handwrittenRequirements ?? 'Not yet verified'}
          </li>
          <li>
            <span className="font-semibold text-slate-200">Deadline:</span> {formatDisplayDate(computed.entryDeadline)}
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={() => setGenerating(true)}
          className="min-h-12 rounded-xl bg-open-600 px-4 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-navy-700 disabled:text-slate-500"
        >
          🖨️ GENERATE ENTRY
        </button>
        {product.officialChecklistUrl && (
          <a
            href={product.officialChecklistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center rounded-xl border border-navy-600 px-4 font-bold text-slate-200"
          >
            📋 VIEW CHECKLIST
          </a>
        )}
        {product.officialRulesUrl && (
          <a
            href={product.officialRulesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center rounded-xl border border-navy-600 px-4 font-bold text-slate-200"
          >
            📜 OFFICIAL RULES
          </a>
        )}
        {product.officialProductUrl && (
          <a
            href={product.officialProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center rounded-xl border border-navy-600 px-4 font-bold text-slate-200"
          >
            🌐 TOPPS PRODUCT PAGE
          </a>
        )}
      </div>

      {product.notes && <p className="text-xs text-slate-500">{product.notes}</p>}

      {generating && (
        <EntryGeneratorModal
          product={product}
          computed={computed}
          profile={profile}
          onClose={() => setGenerating(false)}
          onProfileSaved={(p) => {
            saveProfile(p);
            setProfile(p);
          }}
        />
      )}
    </div>
  );
}
