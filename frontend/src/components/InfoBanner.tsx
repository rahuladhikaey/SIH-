import React from 'react';
import { ShieldCheck, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

interface InfoBannerProps {
  title: string;
  description: string;
  variant?: 'trust' | 'info' | 'warning' | 'alert';
  action?: React.ReactNode;
  className?: string;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  description,
  variant = 'trust',
  action,
  className = '',
}) => {
  let bgClasses = 'bg-teal-50/80 border-teal-200/80 text-teal-900';
  let icon = <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />;

  if (variant === 'info') {
    bgClasses = 'bg-sky-50/80 border-sky-200/80 text-sky-900';
    icon = <Info className="h-5 w-5 text-sky-600 shrink-0" />;
  } else if (variant === 'warning') {
    bgClasses = 'bg-amber-50/80 border-amber-200/80 text-amber-900';
    icon = <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
  } else if (variant === 'alert') {
    bgClasses = 'bg-rose-50/80 border-rose-200/80 text-rose-900';
    icon = <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />;
  }

  return (
    <div
      className={`flex items-start justify-between gap-3.5 rounded-2xl border p-4 shadow-sm backdrop-blur-md transition-all ${bgClasses} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">{title}</h4>
          <p className="mt-0.5 text-xs leading-relaxed opacity-80">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
