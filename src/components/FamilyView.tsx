import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Baby, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  Layers 
} from 'lucide-react';
import { Persona, ApplicationRecord } from '../types/index.ts';
import { LifecycleTimeline } from './LifecycleTimeline.tsx';
import { PendingActionsStrip } from './PendingActionsStrip.tsx';

interface FamilyViewProps {
  parentPersona: Persona;
  onViewTimeline: (app: ApplicationRecord) => void;
  onResolveChildAction: (childId: string, actionId: string) => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  parentPersona,
  onViewTimeline,
  onResolveChildAction,
}) => {
  const { t } = useTranslation();
  const children = parentPersona.children || [];
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || '');
  const [activeTimelineApp, setActiveTimelineApp] = useState<ApplicationRecord | null>(null);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const totalFamilyFunds = children.reduce((sum, c) => sum + c.fundsDisbursed, 0);
  const totalFamilyPendingActions = children.reduce((sum, c) => sum + c.pendingCount, 0);

  if (!selectedChild) {
    return (
      <div className="p-8 text-center text-slate-400">
        No linked children profiles found under this Guardian ID.
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20" id="family-view-container">
      {/* Guardian Master Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>{t('dashboard.familyViewTitle')}</span>
          </span>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-medium">
            2 Linked Children
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
          {parentPersona.name}
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Ration Card / Family Head ID: JH-SIM-FAM-88219 • {parentPersona.profile.tribe} (PVTG Protected)
        </p>

        {/* Aggregated Family Statistics */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-purple-500/20">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block">Total Family DBT Disbursed</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">
              ₹{totalFamilyFunds.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-purple-500/20">
            <span className="text-[10px] text-slate-400 block">Combined Pending Tasks</span>
            <span className={`text-lg font-extrabold font-mono ${
              totalFamilyPendingActions > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {totalFamilyPendingActions} Actions
            </span>
          </div>
        </div>
      </div>

      {/* Child Switcher Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300">
            {t('dashboard.switchChild')}
          </span>
          <span className="text-[10px] text-slate-400">
            Select to review scholarship lifecycle
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2" id="child-switcher-tabs">
          {children.map((child) => {
            const isSelected = child.id === selectedChild.id;
            return (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  setActiveTimelineApp(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isSelected 
                    ? 'bg-slate-800 border-amber-500/60 shadow-md ring-1 ring-amber-500/30' 
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
                id={`child-tab-${child.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate block max-w-[110px]">
                    {child.name}
                  </span>
                  {child.pendingCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {child.relationship}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                  ₹{child.fundsDisbursed.toLocaleString('en-IN')} DBT
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Child Detailed Context Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4">
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{selectedChild.name}</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {selectedChild.relationship}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{selectedChild.institution}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block">Status</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedChild.status === 'deficiency_raised' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {selectedChild.statusLabel}
            </span>
          </div>
        </div>

        {/* Pending Actions for Child */}
        {selectedChild.pendingActions.length > 0 && (
          <PendingActionsStrip 
            actions={selectedChild.pendingActions}
            onResolveAction={(actionId) => onResolveChildAction(selectedChild.id, actionId)}
          />
        )}

        {/* Active Scheme Card & Lifecycle View */}
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Active Enrolled Scheme
            </span>
            <span className="text-[10px] text-slate-400">NSP Unified ID</span>
          </div>

          <h4 className="text-sm font-bold text-white">{selectedChild.schemeName}</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Bank Account</span>
              <span className="text-slate-300">{selectedChild.profile.bankAccount.bankName}</span>
              <span className="text-[10px] block font-mono">{selectedChild.profile.bankAccount.accountNoMasked}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Aadhaar Seeding (NPCI)</span>
              <span className={`font-semibold ${
                selectedChild.profile.bankAccount.aadhaarSeeded ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {selectedChild.profile.bankAccount.aadhaarSeeded ? 'Seeded (Active)' : 'Not Seeded (Action Needed)'}
              </span>
            </div>
          </div>

          {selectedChild.applications[0] && (
            <div className="pt-2">
              <button
                onClick={() => setActiveTimelineApp(
                  activeTimelineApp ? null : selectedChild.applications[0]
                )}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                id={`child-timeline-toggle-${selectedChild.id}`}
              >
                <span>{activeTimelineApp ? 'Hide Timeline' : 'View Application Lifecycle Timeline'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTimelineApp ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Render Child Timeline when toggled */}
        {activeTimelineApp && (
          <LifecycleTimeline 
            timeline={activeTimelineApp.timeline}
            currentStatus={activeTimelineApp.currentStatus}
            applicationNumber={activeTimelineApp.applicationNumber}
            schemeName={activeTimelineApp.schemeName}
            sanctionedAmount={activeTimelineApp.sanctionedAmount}
          />
        )}
      </div>
    </div>
  );
};
