import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Info, 
  Search,
  Building2,
  Filter
} from 'lucide-react';
import { ApplicationRecord, SchemeInfo, SchemeId } from '../types/index.ts';
import { LifecycleTimeline } from './LifecycleTimeline.tsx';

interface ApplicationsViewProps {
  applications: ApplicationRecord[];
  allSchemes: SchemeInfo[];
  activeSchemeId?: SchemeId;
  onViewTimeline: (app: ApplicationRecord) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  allSchemes,
  activeSchemeId,
  onViewTimeline,
}) => {
  const { t } = useTranslation();
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  const activeApp = applications.find(a => a.schemeId === activeSchemeId) || applications[0];

  return (
    <div className="space-y-4 pb-20" id="applications-view-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>My Scholarship Applications</span>
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
            {applications.length} Total Records
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
          Unified Application Registry
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Single window covering applications submitted across NSP, SFMP (Canara Bank), and MoTA Overseas Portal.
        </p>
      </div>

      {/* One Scholarship Rule Policy Banner */}
      <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('app.oneScholarshipRule')}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {t('app.oneScholarshipNotice')} You are currently active in <strong>{activeApp ? activeApp.schemeName : 'No Active Scheme'}</strong>.
        </p>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-slate-200 transition-all shadow-sm"
            id={`application-item-${app.id}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white truncate">{app.schemeName}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300 shrink-0">
                    {app.sourceSystem}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  Application ID: {app.applicationNumber} • Session {app.academicYear}
                </span>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                {app.currentStatus.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {app.statusDescription}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Submitted on: {app.submissionDate}
              </span>

              <button
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                className="text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                id={`app-timeline-btn-${app.id}`}
              >
                <span>{selectedApp?.id === app.id ? 'Hide Timeline' : 'View Lifecycle'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedApp?.id === app.id ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Inline Timeline when expanded */}
            {selectedApp?.id === app.id && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <LifecycleTimeline
                  timeline={app.timeline}
                  currentStatus={app.currentStatus}
                  applicationNumber={app.applicationNumber}
                  schemeName={app.schemeName}
                  sanctionedAmount={app.sanctionedAmount}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
