import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Check, 
  XCircle 
} from 'lucide-react';
import { TimelineEvent, ApplicationStatus } from '../types/index.ts';

interface LifecycleTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: ApplicationStatus;
  applicationNumber: string;
  schemeName: string;
  sanctionedAmount?: number;
}

const getStageIcon = (stage: ApplicationStatus) => {
  switch (stage) {
    case 'draft':
      return FileText;
    case 'submitted':
      return Send;
    case 'institute_verification':
      return Building2;
    case 'state_verification':
      return ShieldCheck;
    case 'sanctioned':
      return Sparkles;
    case 'dbt_initiated':
      return Coins;
    case 'disbursed':
      return CheckCircle2;
    case 'deficiency_raised':
      return AlertCircle;
    case 'rejected':
      return XCircle;
    default:
      return Clock;
  }
};

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  timeline,
  currentStatus,
  applicationNumber,
  schemeName,
  sanctionedAmount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 shadow-sm" id="lifecycle-timeline-card">
      <div className="flex items-start justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {t('timeline.title')}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            App #{applicationNumber} • {schemeName}
          </p>
        </div>
        {sanctionedAmount && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Sanctioned</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              ₹{sanctionedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Vertical Timeline Steps */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((evt, idx) => {
          const Icon = getStageIcon(evt.stage);
          const isCompleted = evt.completed;
          const isCurrent = evt.current;
          const hasDeficiency = evt.hasDeficiency;

          let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
          let textColor = 'text-slate-400';
          let titleColor = 'text-slate-300';

          if (hasDeficiency) {
            badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/50 ring-2 ring-rose-500/30';
            textColor = 'text-rose-300';
            titleColor = 'text-rose-200 font-bold';
          } else if (isCurrent) {
            badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/50 ring-2 ring-amber-500/30';
            textColor = 'text-amber-300';
            titleColor = 'text-amber-300 font-bold';
          } else if (isCompleted) {
            badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            textColor = 'text-slate-300';
            titleColor = 'text-emerald-300 font-semibold';
          }

          return (
            <div key={idx} className="relative group" id={`timeline-step-${evt.stage}`}>
              {/* Node Icon on vertical line */}
              <div 
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center -translate-x-1/2 shadow-md transition-all ${badgeColor}`}
              >
                {hasDeficiency ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>

              {/* Content Body */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs ${titleColor}`}>
                      {evt.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium animate-pulse">
                        Current Stage
                      </span>
                    )}
                    {hasDeficiency && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-medium">
                        Exception Case
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {evt.date}
                  </span>
                </div>

                {evt.officerDesignation && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <ShieldCheck className="w-3 h-3 text-slate-500" />
                    <span>Officer: <strong className="text-slate-300">{evt.officerDesignation}</strong></span>
                  </p>
                )}

                {evt.remarks && (
                  <div className={`mt-1 text-[11px] p-2 rounded-lg leading-relaxed ${
                    hasDeficiency 
                      ? 'bg-rose-950/30 text-rose-200 border border-rose-900/40' 
                      : 'bg-slate-800/60 text-slate-300 border border-slate-800'
                  }`}>
                    {evt.remarks}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
