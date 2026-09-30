import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  RotateCcw, 
  X, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ConsentItem } from '../types/index.ts';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consents: ConsentItem[];
  onUpdateConsent: (updatedConsents: ConsentItem[]) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  consents,
  onUpdateConsent,
}) => {
  const { t } = useTranslation();
  const [localConsents, setLocalConsents] = useState<ConsentItem[]>(consents);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleConsent = (id: string) => {
    setLocalConsents(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, granted: !c.granted };
      }
      return c;
    }));
  };

  const handleSave = () => {
    onUpdateConsent(localConsents);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleRevokeAll = () => {
    const revoked = localConsents.map(c => ({ ...c, granted: false }));
    setLocalConsents(revoked);
    onUpdateConsent(revoked);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" id="consent-modal-backdrop">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          id="consent-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t('consent.title')}
            </h2>
            <p className="text-[11px] text-emerald-400 font-mono">
              {t('consent.actRef')}
            </p>
          </div>
        </div>

        {/* DPDP Statutory Declaration */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 my-3 text-[11px] text-slate-300 leading-relaxed space-y-1">
          <p>
            The Ministry of Tribal Affairs (MoTA) processes your verified academic and tribal identity records strictly for determining eligibility, automated verification, and Direct Benefit Transfer (DBT) sanctions.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Field-level encryption active. Masked Aadhaar only. No third-party data sharing.</span>
          </div>
        </div>

        {/* Scrollable list of consent items */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {localConsents.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                c.granted 
                  ? 'bg-slate-800/80 border-slate-700' 
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
              id={`consent-item-${c.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">{c.title}</h4>
                    {c.mandatory && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                        Statutory
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    Issuer: {c.agency}
                  </p>
                </div>

                {/* Consent Toggle Switch */}
                <button
                  onClick={() => handleToggleConsent(c.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    c.granted ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                  id={`toggle-consent-${c.id}`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full transition-transform transform shadow-sm ${
                      c.granted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Data points & purpose details */}
              <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Purpose:</span>
                  <p className="text-slate-300 leading-snug">{c.purpose}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Retrieved Data Points:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.dataPoints.map((dp, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                        {dp}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  <span className="text-slate-500 font-semibold">Retention: </span>
                  {c.retention}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleRevokeAll}
            className="text-xs text-rose-400 hover:text-rose-300 py-2 px-3 rounded-xl hover:bg-rose-950/30 transition-colors flex items-center gap-1"
            id="revoke-consent-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('consent.revokeConsent')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              id="save-consent-btn"
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved!' : 'Save & Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
