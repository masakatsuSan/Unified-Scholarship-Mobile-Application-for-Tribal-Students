import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Smartphone, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';
import { Persona } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (personaId?: string) => void;
  personas: Persona[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  personas,
}) => {
  const { t } = useTranslation();
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [bootstrappingStep, setBootstrappingStep] = useState<string | null>(null);
  const [digilockerModalOpen, setDigilockerModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setBootstrappingStep('Connecting to Ministry of Education APAAR & UDISE+ Registry...');
    setTimeout(() => {
      setBootstrappingStep('Retrieving verified ST Caste & Income certificates via e-District API...');
      setTimeout(() => {
        setBootstrappingStep('Verifying active Aadhaar-seeded bank account with NPCI Mapper...');
        setTimeout(() => {
          setIsLoading(false);
          setBootstrappingStep(null);
          onLoginSuccess('persona-1');
          onClose();
        }, 800);
      }, 800);
    }, 800);
  };

  const handleDigiLockerLogin = () => {
    setDigilockerModalOpen(true);
  };

  const handleDigiLockerConsentAndProceed = (personaId: string) => {
    setDigilockerModalOpen(false);
    setIsLoading(true);
    setBootstrappingStep('DigiLocker OAuth token verified. Fetching issued certificates & APAAR ID...');
    setTimeout(() => {
      setIsLoading(false);
      setBootstrappingStep(null);
      onLoginSuccess(personaId);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" id="auth-modal-backdrop">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 text-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          id="auth-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5 mx-auto mb-2 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400 font-bold text-lg">
              ST
            </div>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {bootstrappingStep ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-300 animate-pulse">
                Bootstrapping Unified Profile
              </p>
              <p className="text-[11px] text-slate-400 px-4 leading-relaxed font-mono">
                {bootstrappingStep}
              </p>
            </div>
            <div className="text-[10px] text-emerald-400 bg-emerald-950/40 py-1.5 px-3 rounded-xl border border-emerald-500/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Zero manual data entry via APAAR / UDISE+</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('auth.mobileNumber')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder={t('auth.enterMobile')}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-12 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      required
                      id="mobile-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || mobileNumber.length < 10}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  id="get-otp-btn"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isLoading ? 'Sending SMS...' : t('auth.getOtp')}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">OTP sent to +91 {mobileNumber}</span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-amber-400 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t('auth.enterOtp')}
                  </label>
                  <input
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center text-base tracking-widest text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    required
                    id="otp-input"
                  />
                  <span className="text-[10px] text-slate-500 block text-right mt-1">
                    Demo OTP: 123456
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || enteredOtp.length < 4}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  id="verify-otp-btn"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : t('auth.verifyOtp')}</span>
                </button>
              </form>
            )}

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {t('auth.orDivider')}
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              onClick={handleDigiLockerLogin}
              className="w-full py-2.5 bg-blue-700/30 hover:bg-blue-700/50 border border-blue-500/40 text-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              id="digilocker-login-btn"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{t('auth.digilockerLogin')}</span>
              <ExternalLink className="w-3 h-3 text-blue-400" />
            </button>

            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5 text-center">
                Instant Demo Login as:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {personas.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onLoginSuccess(p.id);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left text-[10px] truncate text-slate-300 hover:text-amber-300"
                  >
                    <span className="font-bold block truncate">{p.name}</span>
                    <span className="text-[9px] text-slate-500 truncate block">{p.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-800/80">
              {t('auth.consentNotice')}
            </p>
          </div>
        )}
      </div>

      {digilockerModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/50 rounded-3xl w-full max-w-sm p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  DL
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">DigiLocker Authorisation</h4>
                  <span className="text-[10px] text-blue-400">api.digitallocker.gov.in (OAuth 2.0)</span>
                </div>
              </div>
              <button
                onClick={() => setDigilockerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p className="text-[11px] text-slate-400">
                <strong>ST Scholarship Saathi (MoTA)</strong> is requesting access to your verified DigiLocker repository:
              </p>
              <ul className="space-y-1.5 text-[11px] bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <li className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scheduled Tribe (ST) Certificate (Digital Hash)</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>APAAR ID & Academic Marksheet Records</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State e-District Income Certificate</span>
                </li>
                <li className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Masked Aadhaar e-KYC & Photo</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDigilockerModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDigiLockerConsentAndProceed('persona-1')}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
                id="digilocker-allow-btn"
              >
                Allow & Bootstrap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
