import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  Send,
  Building2,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react';

export type StatusVariant =
  | 'draft'
  | 'submitted'
  | 'institute_verification'
  | 'state_verification'
  | 'sanctioned'
  | 'dbt_initiated'
  | 'disbursed'
  | 'deficiency_raised'
  | 'rejected'
  | 'pending'
  | 'verified'
  | 'warning'
  | 'critical'
  | 'info'
  | 'success';

interface StatusChipProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const norm = status.toLowerCase().replace(/[\s-]/g, '_');

  let icon = <Clock className="w-3.5 h-3.5 shrink-0" />;
  let text = label || status;
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (norm.includes('disbursed') || norm.includes('approved') || norm === 'success') {
    icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />;
    styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    if (!label) text = 'Disbursed';
  } else if (norm.includes('sanctioned')) {
    icon = <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />;
    styleClasses = 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60';
    if (!label) text = 'Sanctioned';
  } else if (norm.includes('dbt') || norm.includes('pfms')) {
    icon = <CreditCard className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" />;
    styleClasses = 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60';
    if (!label) text = 'DBT Initiated';
  } else if (norm.includes('institute')) {
    icon = <Building2 className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />;
    styleClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60';
    if (!label) text = 'Institute Check';
  } else if (norm.includes('state') || norm.includes('dwo')) {
    icon = <FileCheck className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />;
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    if (!label) text = 'State Check';
  } else if (norm.includes('submitted')) {
    icon = <Send className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />;
    styleClasses = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
    if (!label) text = 'Submitted';
  } else if (norm.includes('draft')) {
    icon = <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />;
    styleClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (!label) text = 'Draft';
  } else if (norm.includes('deficiency') || norm.includes('exception') || norm.includes('action') || norm === 'warning') {
    icon = <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />;
    styleClasses = 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800';
    if (!label) text = 'Action Required';
  } else if (norm.includes('reject') || norm.includes('fail') || norm === 'critical') {
    icon = <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" />;
    styleClasses = 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60';
    if (!label) text = 'Rejected';
  } else if (norm.includes('verified')) {
    icon = <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />;
    styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    if (!label) text = 'Verified';
  } else if (norm.includes('info')) {
    icon = <HelpCircle className="w-3.5 h-3.5 shrink-0 text-teal-600" />;
    styleClasses = 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60';
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs sm:text-sm px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`
        inline-flex items-center rounded-md border whitespace-nowrap
        ${sizeClasses}
        ${styleClasses}
        ${className}
      `}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};
