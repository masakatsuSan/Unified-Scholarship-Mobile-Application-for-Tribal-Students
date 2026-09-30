import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  X, 
  Sliders, 
  Building2, 
  Info, 
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { 
  SchemeId, 
  StudentProfile, 
  EligibilityEvaluationResult 
} from '../types/index.ts';
import { 
  schemeEligibilityConfigs, 
  evaluateEligibility, 
  evaluateAllSchemes 
} from '../data/eligibilityRulesConfig.ts';

interface EligibilityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  activeSchemeId?: SchemeId;
  initialSchemeId?: SchemeId;
  onStartApplication: (schemeId: SchemeId) => void;
}

export const EligibilityCheckerModal: React.FC<EligibilityCheckerModalProps> = ({
  isOpen,
  onClose,
  profile,
  activeSchemeId,
  initialSchemeId,
  onStartApplication,
}) => {
  const { t } = useTranslation();
  const [selectedSchemeId, setSelectedSchemeId] = useState<SchemeId>(initialSchemeId || 'pre-matric');
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);

  // Simulator state overrides
  const [simulatedIncome, setSimulatedIncome] = useState<number>(profile.annualFamilyIncome);
  const [simulatedCourse, setSimulatedCourse] = useState<string>(profile.currentCourse);
  const [simulatedInstitution, setSimulatedInstitution] = useState<string>(profile.institutionName);
  const [simulatedHasActiveScholarship, setSimulatedHasActiveScholarship] = useState<boolean>(Boolean(activeSchemeId));

  if (!isOpen) return null;

  // Compute profile to evaluate against
  const activeProfileForEval: StudentProfile = isSimulatorMode ? {
    ...profile,
    annualFamilyIncome: simulatedIncome,
    currentCourse: simulatedCourse,
    institutionName: simulatedInstitution,
  } : profile;

  const currentActiveScheme = isSimulatorMode
    ? (simulatedHasActiveScholarship ? (activeSchemeId || 'pre-matric') : undefined)
    : activeSchemeId;

  // Run data-driven evaluation
  const allResults = evaluateAllSchemes(activeProfileForEval, currentActiveScheme);
  const selectedResult = allResults.find(r => r.schemeId === selectedSchemeId) || allResults[0];
  const selectedConfig = schemeEligibilityConfigs[selectedSchemeId];

  const handleResetSimulator = () => {
    setSimulatedIncome(profile.annualFamilyIncome);
    setSimulatedCourse(profile.currentCourse);
    setSimulatedInstitution(profile.institutionName);
    setSimulatedHasActiveScholarship(Boolean(activeSchemeId));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" id="eligibility-checker-modal">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t('eligibility.checkerTitle', 'Can I Apply? (Eligibility Evaluator)')}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold font-mono">
                  Data-Driven Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates your verified profile against MoTA statutory eligibility rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80 hover:bg-slate-700"
            id="close-eligibility-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scheme Selector Pills */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(Object.keys(schemeEligibilityConfigs) as SchemeId[]).map((id) => {
            const isSelected = id === selectedSchemeId;
            const evalRes = allResults.find(r => r.schemeId === id);
            return (
              <button
                key={id}
                onClick={() => setSelectedSchemeId(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
                id={`scheme-tab-${id}`}
              >
                <span>{schemeEligibilityConfigs[id].sourcePortal}</span>
                <span>•</span>
                <span className="truncate max-w-[130px]">{schemeEligibilityConfigs[id].schemeName.split(' ')[0]}</span>
                {evalRes?.status === 'eligible' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
                {evalRes?.status === 'blocked_by_active_scholarship' && (
                  <Lock className="w-2.5 h-2.5 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Main Evaluation Verdict Banner */}
          <div className={`p-4 rounded-3xl border transition-all ${
            selectedResult.status === 'eligible'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/20'
              : selectedResult.status === 'blocked_by_active_scholarship'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 ring-1 ring-rose-500/20'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-100 ring-1 ring-amber-500/20'
          }`} id="verdict-banner">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${
                  selectedResult.status === 'eligible' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : selectedResult.status === 'blocked_by_active_scholarship'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedResult.status === 'eligible' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : selectedResult.status === 'blocked_by_active_scholarship' ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {selectedResult.status === 'eligible'
                        ? 'Eligible to Apply'
                        : selectedResult.status === 'blocked_by_active_scholarship'
                        ? 'Blocked by One-Scholarship-at-a-Time Rule'
                        : 'Currently Not Eligible'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/60 font-mono font-medium border border-current/20">
                      {selectedConfig.sourcePortal}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white mt-1">
                    {selectedConfig.schemeName}
                  </h3>

                  <p className="text-xs leading-relaxed mt-1.5 opacity-90">
                    {selectedResult.summaryText}
                  </p>
                </div>
              </div>
            </div>

            {/* If Blocked by active scholarship, show plain language explanation */}
            {selectedResult.status === 'blocked_by_active_scholarship' && (
              <div className="mt-3.5 p-3 rounded-2xl bg-black/40 border border-rose-500/30 text-xs text-rose-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-300">
                  <Info className="w-3.5 h-3.5" />
                  <span>Statutory Provision: Article 342 MoTA Guidelines</span>
                </span>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  Scheduled Tribe scholarship schemes are funded under dedicated central allocations. To prevent double-dipping, an applicant cannot receive DBT disbursements from two schemes simultaneously. If you wish to switch schemes, you must surrender your active scholarship through your District Welfare Officer (DWO).
                </p>
              </div>
            )}
          </div>

          {/* Rule Evaluation Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Eligibility Criteria Audit</span>
              </h4>
              <span className="text-[10px] text-slate-400">
                {selectedResult.passedChecks.length} Passed • {selectedResult.failedChecks.length} Ineligible
              </span>
            </div>

            <div className="space-y-2">
              {/* Passed checks */}
              {selectedResult.passedChecks.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-emerald-300 block">{chk.title}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{chk.detail}</p>
                  </div>
                </div>
              ))}

              {/* Failed checks */}
              {selectedResult.failedChecks.map((fail, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-rose-300 block">{fail.title}</span>
                    <p className="text-[11px] text-rose-200/90 mt-0.5 leading-snug">{fail.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheme Benefits & Entitlements Info Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 space-y-2.5 text-xs">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span>Financial Entitlement & Assistance</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedConfig.maxBenefitSummary}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              <div>
                <span className="text-slate-500 block">Parental Income Limit</span>
                <span className="text-slate-200 font-medium">{selectedConfig.incomeCeilingLabel}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Eligible Stages</span>
                <span className="text-slate-200 font-medium">{selectedConfig.minAcademicLevel}</span>
              </div>
            </div>
          </div>

          {/* Interactive What-If / Eligibility Simulator Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">What-If Eligibility Simulator</h4>
              </div>
              <button
                onClick={() => setIsSimulatorMode(!isSimulatorMode)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                  isSimulatorMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
                id="toggle-simulator-btn"
              >
                {isSimulatorMode ? 'Simulator Active' : 'Test Other Scenarios'}
              </button>
            </div>

            {isSimulatorMode && (
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Adjust parameters to see if you would be eligible under future conditions:</span>
                  <button
                    onClick={handleResetSimulator}
                    className="text-amber-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Income Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Simulated Annual Family Income:</span>
                    <span className="font-mono font-bold text-amber-300">
                      ₹{simulatedIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="25000"
                    value={simulatedIncome}
                    onChange={(e) => setSimulatedIncome(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                    <span>₹50,000</span>
                    <span>₹2.5L (Pre/Post)</span>
                    <span>₹6.0L (Top/NOS)</span>
                    <span>₹10,00,000</span>
                  </div>
                </div>

                {/* Course Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Simulated Course:</label>
                    <select
                      value={simulatedCourse}
                      onChange={(e) => setSimulatedCourse(e.target.value)}
                      className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Class 9">Class 9 (Pre-Matric)</option>
                      <option value="Class 10">Class 10 (Pre-Matric)</option>
                      <option value="Class 11 Science">Class 11 (Post-Matric)</option>
                      <option value="B.Tech Computer Science">B.Tech (UG Post-Matric)</option>
                      <option value="MBBS 1st Year">MBBS (Premier / Top Class)</option>
                      <option value="Ph.D. Research Linguistics">Ph.D. Research (NFST)</option>
                      <option value="M.Sc. Overseas Degree">M.Sc. Overseas (NOS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Simulated Institution Type:</label>
                    <select
                      value={simulatedInstitution}
                      onChange={(e) => setSimulatedInstitution(e.target.value)}
                      className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Government High School, Simdega">Govt High School (Pre-Matric)</option>
                      <option value="St. Xavier's College, Ranchi">State College (Post-Matric)</option>
                      <option value="IIT Bombay (Premier Institute)">IIT Bombay (Top Class)</option>
                      <option value="AIIMS Bhopal (Premier Medical)">AIIMS Bhopal (Top Class)</option>
                      <option value="Jawaharlal Nehru University (JNU)">Central University (NFST)</option>
                      <option value="University of Oxford (Top 500 QS)">University of Oxford (NOS)</option>
                    </select>
                  </div>
                </div>

                {/* Active Scholarship Toggle in simulator */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[11px] text-slate-300">
                    Simulate holding an active scholarship in another scheme:
                  </span>
                  <button
                    onClick={() => setSimulatedHasActiveScholarship(!simulatedHasActiveScholarship)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                      simulatedHasActiveScholarship ? 'bg-rose-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform ${
                        simulatedHasActiveScholarship ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>

          {selectedResult.canProceedToApply ? (
            <button
              onClick={() => {
                onClose();
                onStartApplication(selectedSchemeId);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95"
              id="proceed-to-apply-btn"
            >
              <span>{t('eligibility.proceedToApply', 'Proceed to Apply (Prefilled from Profile)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium text-right">
              {selectedResult.status === 'blocked_by_active_scholarship'
                ? 'Application locked by active scholarship'
                : 'Ineligible under current criteria'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
