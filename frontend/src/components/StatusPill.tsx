import React from 'react';

export type StatusType =
  | 'PENDING_REVIEW'
  | 'pending_review'
  | 'VERIFIED'
  | 'verified'
  | 'approved'
  | 'IN_PROGRESS'
  | 'in_progress'
  | 'processing'
  | 'completed'
  | 'failed'
  | string;

interface StatusPillProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '', size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = normalized;

  if (normalized.includes('VERIFIED') || normalized.includes('APPROVED') || normalized.includes('COMPLETED')) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold';
    label = normalized === 'APPROVED' ? 'VERIFIED' : normalized;
  } else if (normalized.includes('PENDING') || normalized.includes('REVIEW')) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80 font-semibold';
    label = 'PENDING REVIEW';
  } else if (normalized.includes('PROGRESS') || normalized.includes('PROCESSING')) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200/80 font-semibold';
    label = 'IN PROGRESS';
  } else if (normalized.includes('FAILED') || normalized.includes('ERROR')) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold';
    label = 'FAILED';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} tracking-wide transition-all ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          colorClasses.includes('emerald')
            ? 'bg-emerald-500'
            : colorClasses.includes('amber')
            ? 'bg-amber-500'
            : colorClasses.includes('sky')
            ? 'bg-sky-500'
            : colorClasses.includes('rose')
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      <span>{label}</span>
    </span>
  );
};
