import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { SchemeInfo, ApplicationRecord, SourcePortal } from '../types/index.ts';

interface SchemeCardProps {
  scheme: SchemeInfo;
  application?: ApplicationRecord;
  activeSchemeId?: string;
  onViewTimeline: (app: ApplicationRecord) => void;
  onCheckEligibility?: (scheme: SchemeInfo) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  application,
  activeSchemeId,
  onViewTimeline,
  onCheckEligibility,
}) => {
  const { t } = useTranslation();
  const [showRuleInfo, setShowRuleInfo] = useState(false);

  // Check if blocked by the One-Scholarship-At-A-Time Rule
  const hasOtherActiveScholarship = Boolean(activeSchemeId && activeSchemeId !== scheme.id);
  const isCurrentlyEnrolled = application !== undefined;

  const getSourceBadgeStyle = (portal: SourcePortal) => {
    switch (portal) {
      case 'NSP':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'SFMP':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'NOS_PORTAL':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusChip = () => {
    if (!application) {
      if (hasOtherActiveScholarship) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
            <Lock className="w-3 h-3" />
            <span>Blocked (1-Scholarship Rule)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
          <span>Eligible to Apply</span>
        </span>
      );
    }

    switch (application.currentStatus) {
      case 'disbursed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Disbursed</span>
          </span>
        );
      case 'dbt_initiated':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>DBT Initiated</span>
          </span>
        );
      case 'sanctioned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Sanctioned</span>
          </span>
        );
      case 'deficiency_raised':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Deficiency / Action</span>
          </span>
        );
      case 'state_verification':
      case 'institute_verification':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Verification in Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
            <span>{application.currentStatus}</span>
          </span>
        );
    }
  };

  return (
    <div 
      className={`rounded-2xl border transition-all p-4 ${
        isCurrentlyEnrolled 
          ? 'bg-slate-900 border-amber-500/40 shadow-md ring-1 ring-amber-500/20' 
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
      }`}
      id={`scheme-card-${scheme.id}`}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span 
          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getSourceBadgeStyle(scheme.sourcePortal)}`}
          title={`Originating Legacy Government System: ${scheme.sourcePortalName}`}
        >
          Source: {scheme.sourcePortal}
        </span>
        {getStatusChip()}
      </div>

      {/* Scheme Name & Description */}
      <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
        {scheme.name}
      </h3>
      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
        {scheme.shortDesc}
      </p>

      {/* Key Attributes Strip */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[10px]">
        <div>
          <span className="text-slate-500 block">Target / Level</span>
          <span className="text-slate-300 font-medium truncate block">{scheme.academicLevel}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Annual Income Ceiling</span>
          <span className="text-slate-300 font-medium block">{scheme.incomeCeiling}</span>
        </div>
        <div className="col-span-2">
          <span className="text-slate-500 block">Max Benefit Amount</span>
          <span className="text-amber-400 font-semibold block">{scheme.maxBenefit}</span>
        </div>
      </div>

      {/* One Scholarship Rule Warning for other schemes */}
      {hasOtherActiveScholarship && !isCurrentlyEnrolled && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-300 font-medium text-[10px]">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>One-Scholarship-at-a-Time Rule</span>
            </span>
            <button
              onClick={() => setShowRuleInfo(!showRuleInfo)}
              className="text-[9px] text-slate-400 hover:text-white underline"
            >
              {showRuleInfo ? 'Hide' : 'Why blocked?'}
            </button>
          </div>
          {showRuleInfo && (
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
              You already hold an active scholarship under <strong>MoTA guidelines</strong>. Multiple concurrent government scholarships are not permitted. Complete your current academic year or surrender your active scholarship before applying.
            </p>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {application ? (
          <>
            <div className="min-w-0">
              <span className="text-[9px] text-slate-500 block font-mono">App #{application.applicationNumber}</span>
              <span className="text-[10px] text-emerald-400 font-medium truncate block">
                {application.statusDescription}
              </span>
            </div>
            <button
              onClick={() => onViewTimeline(application)}
              className="shrink-0 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
              id={`view-timeline-btn-${scheme.id}`}
            >
              <span>Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-[10px] text-slate-500">
              {hasOtherActiveScholarship ? 'Locked by active scholarship' : 'Portal applications open'}
            </span>
            <button
              onClick={() => onCheckEligibility && onCheckEligibility(scheme)}
              disabled={hasOtherActiveScholarship}
              className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
                hasOtherActiveScholarship
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
              id={`check-eligibility-btn-${scheme.id}`}
            >
              <span>Check Eligibility</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
