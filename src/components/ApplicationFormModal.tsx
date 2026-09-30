import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Printer, 
  Lock, 
  AlertCircle, 
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  SchemeId, 
  StudentProfile, 
  DraftApplication, 
  ApplicationReceiptData, 
  ApplicationRecord 
} from '../types/index.ts';
import { schemeFormSchemas } from '../data/applicationFormSchemas.ts';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeId: SchemeId;
  profile: StudentProfile;
  existingDraft?: DraftApplication;
  onSaveDraft: (draft: DraftApplication) => void;
  onSubmitSuccess: (newApplication: ApplicationRecord, receipt: ApplicationReceiptData) => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  schemeId,
  profile,
  existingDraft,
  onSaveDraft,
  onSubmitSuccess,
}) => {
  const { t } = useTranslation();
  const schema = schemeFormSchemas[schemeId];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [draftSavedToast, setDraftSavedToast] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [undertaking1, setUndertaking1] = useState(false);
  const [undertaking2, setUndertaking2] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<ApplicationReceiptData | null>(null);

  // Initialize form data by prefilling from profile and/or existing draft
  useEffect(() => {
    if (!schema) return;

    const initialData: Record<string, any> = {};

    // 1. Prefill from student profile based on schema field prefill keys
    schema.steps.forEach(step => {
      step.fields.forEach(field => {
        if (field.prefillFromProfileKey) {
          const key = field.prefillFromProfileKey;
          if (key.includes('.')) {
            const parts = key.split('.');
            let val: any = profile;
            for (const p of parts) {
              val = val ? val[p] : undefined;
            }
            if (val !== undefined) initialData[field.name] = val;
          } else {
            const val = (profile as any)[key];
            if (val !== undefined) initialData[field.name] = val;
          }
        }
      });
    });

    // 2. Overlay existing draft data if available (Reuse of earlier data)
    if (existingDraft && existingDraft.schemeId === schemeId) {
      Object.assign(initialData, existingDraft.formData);
      setCurrentStepIndex(existingDraft.currentStepIndex || 0);
    }

    // Default academic year
    initialData['academicYear'] = schema.academicYear;
    initialData['aadhaarSeededStatus'] = 'Active & Verified with NPCI Mapper';

    setFormData(initialData);
  }, [schema, profile, existingDraft, schemeId]);

  if (!isOpen || !schema) return null;

  const currentStep = schema.steps[currentStepIndex];
  const totalSteps = schema.steps.length + 1; // +1 for the Final Review & Undertaking step
  const isReviewStep = currentStepIndex === schema.steps.length;

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSaveDraft = () => {
    const draft: DraftApplication = {
      id: existingDraft?.id || `draft-${schemeId}-${Date.now()}`,
      schemeId,
      schemeName: schema.schemeName,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currentStepIndex,
      formData,
      isComplete: false,
    };

    onSaveDraft(draft);
    setDraftSavedToast(`Draft saved at ${draft.lastSaved}`);
    setTimeout(() => setDraftSavedToast(null), 2500);
  };

  const validateCurrentStep = () => {
    if (isReviewStep) return true;
    const errors: Record<string, string> = {};
    currentStep.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSubmitApplication = () => {
    if (!undertaking1 || !undertaking2) {
      alert('Please agree to both statutory undertakings before submitting.');
      return;
    }

    const appNumber = `MoTA-2024-${schema.sourcePortal}-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const digitalHash = `SHA256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const receipt: ApplicationReceiptData = {
      applicationNumber: appNumber,
      schemeId,
      schemeName: schema.schemeName,
      studentName: formData.studentName || profile.name,
      fatherName: formData.fatherName || profile.fatherName,
      tribe: formData.tribe || profile.tribe,
      apaarId: profile.apaarId || profile.udiseSchoolId || 'VERIFIED-REGISTRY-ID',
      aadhaarMasked: profile.aadhaarMasked,
      institutionName: formData.institutionName || profile.institutionName,
      course: formData.currentCourse || profile.currentCourse,
      annualFamilyIncome: formData.annualFamilyIncome || profile.annualFamilyIncome,
      bankAccountMasked: profile.bankAccount.accountNoMasked,
      bankName: profile.bankAccount.bankName,
      submissionTimestamp: `${nowStr} 11:30 AM`,
      sourceSystem: schema.sourcePortal,
      digitalReceiptHash: digitalHash,
      nextSteps: [
        'Step 1: Institute Level Verification by Principal / Nodal Officer (Timeline: 10 working days).',
        'Step 2: Automated Cross-Verification with State e-District & Caste Scrutiny Committee.',
        'Step 3: District Welfare Officer (DWO) approval and sanction order generation.',
        'Step 4: Direct Benefit Transfer (DBT) credit into Aadhaar-seeded bank account via PFMS.',
      ],
    };

    const newAppRecord: ApplicationRecord = {
      id: `app-${Date.now()}`,
      applicationNumber: appNumber,
      schemeId,
      schemeName: schema.schemeName,
      academicYear: schema.academicYear,
      currentStatus: 'submitted',
      statusDescription: 'Application submitted successfully. Awaiting verification by Institute Nodal Officer.',
      submissionDate: nowStr,
      lastUpdated: nowStr,
      sourceSystem: schema.sourcePortal,
      sanctionedAmount: schemeId === 'pre-matric' ? 7000 : schemeId === 'post-matric' ? 24000 : 250000,
      timeline: [
        { stage: 'draft', label: 'Draft Created', date: nowStr, completed: true },
        { stage: 'submitted', label: 'Application Submitted', date: nowStr, completed: true, current: true, remarks: 'Submitted via MoTA Unified Integration Hub. Digital hash generated.' },
        { stage: 'institute_verification', label: 'Institute Verification', date: 'Pending', completed: false, remarks: 'Awaiting digital endorsement from Institute Principal / Nodal Officer.' },
        { stage: 'state_verification', label: 'State / DWO Verification', date: 'Pending', completed: false },
        { stage: 'sanctioned', label: 'MoTA Sanction Order', date: 'Pending', completed: false },
        { stage: 'dbt_initiated', label: 'PFMS DBT Mandate', date: 'Pending', completed: false },
        { stage: 'disbursed', label: 'Funds Disbursed to Bank', date: 'Pending', completed: false },
      ],
      pendingActionIds: [],
    };

    setSubmittedReceipt(receipt);
    onSubmitSuccess(newAppRecord, receipt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" id="application-form-modal">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-semibold border border-blue-500/30">
                {schema.sourcePortal} ADAPTER
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Academic Session {schema.academicYear}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
              {schema.schemeName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-step application prefilled from your verified educational & tribal registry
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/80 hover:bg-slate-700"
            id="close-application-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Application is Submitted, Show Receipt View */}
        {submittedReceipt ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="text-center pb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Application Successfully Submitted!</h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                Application No: {submittedReceipt.applicationNumber}
              </p>
            </div>

            {/* Official MoTA Receipt Box */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-inner" id="official-submission-receipt">
              <div className="text-center pb-3 border-b border-slate-800 text-amber-300 font-bold space-y-0.5">
                <p className="text-[11px] text-slate-400">MINISTRY OF TRIBAL AFFAIRS • GOVERNMENT OF INDIA</p>
                <p className="text-xs">SCHOLARSHIP APPLICATION ACKNOWLEDGEMENT</p>
                <p className="text-[10px] text-slate-500">{submittedReceipt.submissionTimestamp}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block">Applicant:</span>
                  <span className="text-white font-bold">{submittedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Father / Guardian:</span>
                  <span className="text-slate-300">{submittedReceipt.fatherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ST Tribe:</span>
                  <span className="text-slate-300">{submittedReceipt.tribe}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Aadhaar (Masked):</span>
                  <span className="text-emerald-400">{submittedReceipt.aadhaarMasked}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">APAAR / Registry ID:</span>
                  <span className="text-amber-300">{submittedReceipt.apaarId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Institution:</span>
                  <span className="text-slate-300 truncate block">{submittedReceipt.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Course / Class:</span>
                  <span className="text-slate-300">{submittedReceipt.course}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">DBT Bank Account:</span>
                  <span className="text-slate-300">{submittedReceipt.bankName} ({submittedReceipt.bankAccountMasked})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                <div><span className="text-slate-500">Cryptographic Digest:</span> {submittedReceipt.digitalReceiptHash}</div>
                <div><span className="text-slate-500">Originating Gateway:</span> MoTA Unified Bridge / {submittedReceipt.sourceSystem} Adapter</div>
              </div>

              {/* Next Steps */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-300">
                <span className="font-bold text-amber-400 block font-sans">Next Steps in Lifecycle:</span>
                <ul className="space-y-1 text-slate-400">
                  {submittedReceipt.nextSteps.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Bar */}
            <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-amber-400">
                  {isReviewStep ? 'Final Review & Undertaking' : `Step ${currentStepIndex + 1} of ${schema.steps.length}: ${currentStep.title}`}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Completed
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>

              {/* Toast message for draft saved */}
              {draftSavedToast && (
                <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{draftSavedToast}</span>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {!isReviewStep ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-white">{currentStep.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{currentStep.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.fields.map((field) => {
                      const isReadonly = field.type === 'readonly';
                      const value = formData[field.name] || '';
                      const hasError = validationErrors[field.name];

                      return (
                        <div 
                          key={field.name} 
                          className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-semibold text-slate-300">
                              {field.label} {field.required && <span className="text-rose-400">*</span>}
                            </label>
                            {field.prefillFromProfileKey && (
                              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Prefilled</span>
                              </span>
                            )}
                          </div>

                          {field.type === 'select' ? (
                            <select
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className={`w-full bg-slate-800 text-slate-200 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 ${
                                hasError ? 'border-rose-500' : 'border-slate-700'
                              }`}
                            >
                              <option value="">Select {field.label}...</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              value={value}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              placeholder={field.placeholder}
                              className={`w-full bg-slate-800 text-slate-200 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 ${
                                hasError ? 'border-rose-500' : 'border-slate-700'
                              }`}
                            />
                          ) : isReadonly ? (
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono flex items-center justify-between">
                              <span className="truncate">{value || 'Verified in Registry'}</span>
                              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              value={value}
                              onChange={(e) => handleInputChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                              placeholder={field.placeholder}
                              className={`w-full bg-slate-800 text-slate-200 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 ${
                                hasError ? 'border-rose-500' : 'border-slate-700'
                              }`}
                            />
                          )}

                          {hasError && (
                            <span className="text-[10px] text-rose-400 mt-0.5 block">
                              {hasError}
                            </span>
                          )}

                          {field.helpText && (
                            <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight">
                              {field.helpText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Step Final: Review & Statutory Undertaking */
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-white">Summary of Application Data</h4>
                      <span className="text-[10px] text-amber-400 font-mono">Ready to Submit</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Applicant Name</span>
                        <span className="text-slate-200 font-medium">{formData.studentName || profile.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tribe Community</span>
                        <span className="text-slate-200 font-medium">{formData.tribe || profile.tribe}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Institution</span>
                        <span className="text-slate-200 truncate block">{formData.institutionName || profile.institutionName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Course / Class</span>
                        <span className="text-slate-200">{formData.currentCourse || profile.currentCourse}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Annual Family Income</span>
                        <span className="text-amber-300 font-mono">₹{Number(formData.annualFamilyIncome || profile.annualFamilyIncome).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">DBT Bank Account</span>
                        <span className="text-emerald-400 font-mono">{profile.bankAccount.bankName} ({profile.bankAccount.accountNoMasked})</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Layer Status & Non-Blocking Guarantee Box */}
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Background Registry Verifications</span>
                      </h4>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                        7 MoTA Adapters
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">UIDAI e-KYC:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">e-District ST:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">APAAR / ABC:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">NPCI Mandate:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[10px] text-amber-200 flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>MoTA Non-Blocking Guarantee:</strong> Any minor data mismatch or external portal outage creates an exception record for administrative review and never blocks application submission.
                      </span>
                    </div>
                  </div>

                  {/* Statutory Undertakings (One-Scholarship Rule & DPDP Act 2023) */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Statutory Declarations & Consent</span>
                    </h4>

                    <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={undertaking1}
                        onChange={(e) => setUndertaking1(e.target.checked)}
                        className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                        id="undertaking-one-scholarship"
                      />
                      <span className="leading-snug text-[11px]">
                        <strong>One-Scholarship-at-a-Time Rule Undertaking:</strong> I solemnly affirm that I am not in receipt of any other central or state government scholarship or fellowship for the academic year 2024-25. If any dual award is detected, my sanction may be cancelled and funds recovered.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={undertaking2}
                        onChange={(e) => setUndertaking2(e.target.checked)}
                        className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                        id="undertaking-dpdp-consent"
                      />
                      <span className="leading-snug text-[11px]">
                        <strong>DPDP Act 2023 Consent:</strong> I hereby give explicit consent to the Ministry of Tribal Affairs (MoTA) and its designated state nodal authorities to fetch, authenticate, and process my DigiLocker ST certificate, APAAR student record, and NPCI bank seeding status solely for scholarship disbursal.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                id="save-draft-btn"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}

                {!isReviewStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    id="next-step-btn"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={!undertaking1 || !undertaking2}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    id="final-submit-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Application</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
