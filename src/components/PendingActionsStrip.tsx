import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Upload, 
  Building, 
  ShieldAlert, 
  X,
  FileCheck
} from 'lucide-react';
import { PendingAction } from '../types/index.ts';

interface PendingActionsStripProps {
  actions: PendingAction[];
  onResolveAction: (actionId: string, resolutionType: string) => void;
}

export const PendingActionsStrip: React.FC<PendingActionsStripProps> = ({
  actions,
  onResolveAction,
}) => {
  const { t } = useTranslation();
  const [activeModalAction, setActiveModalAction] = useState<PendingAction | null>(null);
  const [simulatedUploading, setSimulatedUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!actions || actions.length === 0) {
    return null;
  }

  const handleSimulateResolve = (resolutionType: string) => {
    if (!activeModalAction) return;
    setSimulatedUploading(true);
    setTimeout(() => {
      setSimulatedUploading(false);
      setSuccessMessage('Verification details submitted successfully. Updated on MoTA Unified Registry.');
      setTimeout(() => {
        onResolveAction(activeModalAction.id, resolutionType);
        setActiveModalAction(null);
        setSuccessMessage(null);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="mb-4" id="pending-actions-container">
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('dashboard.pendingActions')} ({actions.length})</span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
            Action Required
          </span>
        </div>

        <div className="space-y-2">
          {actions.map((act) => (
            <div
              key={act.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-amber-500/20 rounded-xl p-2.5 transition-all flex items-start justify-between gap-2"
              id={`pending-action-${act.id}`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5 shrink-0">
                  {act.type === 'income_mismatch' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : act.type === 'bank_revalidation' ? (
                    <Building className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Upload className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-slate-100 truncate">
                      {act.title}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {act.sourceSystem}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                      <Clock className="w-3 h-3" />
                      Deadline: {act.deadline}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalAction(act)}
                className="shrink-0 text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm mt-0.5"
                id={`resolve-btn-${act.id}`}
              >
                <span>Resolve</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Resolution Modal */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeModalAction.title}</h3>
                  <p className="text-[10px] text-amber-400 font-medium">
                    Scheme: {activeModalAction.schemeName} • {activeModalAction.sourceSystem}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                <span className="font-semibold text-slate-200 block mb-1">Issue Details:</span>
                {activeModalAction.description}
              </div>

              {activeModalAction.type === 'income_mismatch' && (
                <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl space-y-2">
                  <span className="font-semibold text-rose-300 block text-xs">
                    Non-Blocking Policy Notice:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Your application has NOT been blocked. An exception case has been opened in the District Welfare Officer (DWO) console. You can either:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => handleSimulateResolve('accept_edistrict')}
                      disabled={simulatedUploading}
                      className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span>1. Accept State e-District Certificate Value (₹1,80,000)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </button>
                    <button
                      onClick={() => handleSimulateResolve('reupload_certificate')}
                      disabled={simulatedUploading}
                      className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span>2. Re-upload Latest Revenue Authority Tehsildar Certificate</span>
                      <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {activeModalAction.type === 'bank_revalidation' && (
                <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl space-y-2">
                  <span className="font-semibold text-amber-300 block text-xs">
                    NPCI Aadhaar Bank Seeding:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    For DBT transfer, your bank account must be actively mapped in NPCI mapper with Aadhaar.
                  </p>
                  <button
                    onClick={() => handleSimulateResolve('seeded_confirmation')}
                    disabled={simulatedUploading}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Confirm Bank Branch Has Mapped NPCI Aadhaar</span>
                  </button>
                </div>
              )}

              {activeModalAction.type === 'upload_document' && (
                <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-xl space-y-2">
                  <span className="font-semibold text-blue-300 block text-xs">
                    Direct DigiLocker / Document Upload:
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Fetch official digital document directly from DigiLocker or upload clear PDF (Max 2MB).
                  </p>
                  <button
                    onClick={() => handleSimulateResolve('document_uploaded')}
                    disabled={simulatedUploading}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Document File</span>
                  </button>
                </div>
              )}

              {simulatedUploading && (
                <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-center gap-2 text-amber-300 text-xs font-medium">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing with MoTA Verification Orchestrator...</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalAction(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
