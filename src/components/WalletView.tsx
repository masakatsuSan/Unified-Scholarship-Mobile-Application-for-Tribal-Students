import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FolderLock, 
  ShieldCheck, 
  FileCheck, 
  Calendar, 
  Building2, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Eye, 
  Lock,
  Plus,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sliders,
  Check,
  X,
  History,
  Activity,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { 
  StudentProfile, 
  WalletDocument, 
  VerificationResult, 
  VerificationAuditLogEntry, 
  VerificationProviderId,
  SchemeId
} from '../types/index.ts';
import { 
  runParallelVerificationOrchestrator, 
  allAdapters, 
  OrchestrationResult 
} from '../services/verificationEngine.ts';

interface WalletViewProps {
  profile: StudentProfile;
}

export const WalletView: React.FC<WalletViewProps> = ({ profile }) => {
  const { t } = useTranslation();
  
  // Wallet sub-navigation: 'documents' or 'verification-engine'
  const [activeWalletTab, setActiveWalletTab] = useState<'documents' | 'verification-engine'>('documents');

  // Documents state
  const [documents, setDocuments] = useState<WalletDocument[]>([
    {
      id: 'doc-1',
      title: 'Scheduled Tribe (ST) Caste Certificate',
      category: 'Caste',
      docNumber: profile.casteCertNo,
      issuer: `Revenue Dept., Govt. of ${profile.state} (${profile.district})`,
      issuedDate: profile.casteIssuedDate,
      validUntil: 'Lifetime (Perpetual)',
      isExpired: false,
      source: 'DigiLocker',
      verificationStatus: 'VERIFIED',
      usedInSchemes: ['Pre-Matric ST', 'Post-Matric ST', 'Top Class', 'NFST', 'NOS'],
      fileSize: '480 KB',
      mimeType: 'application/pdf',
      digiLockerDocUri: `in.gov.dl.jh.caste.${profile.casteCertNo}`,
    },
    {
      id: 'doc-2',
      title: 'Annual Family Income Certificate',
      category: 'Income',
      docNumber: profile.incomeCertNo,
      issuer: `Tahsil Office, ${profile.district}, ${profile.state}`,
      issuedDate: '2024-04-10',
      validUntil: profile.incomeValidUpto,
      isExpired: false,
      source: 'e-District',
      verificationStatus: 'VERIFIED',
      usedInSchemes: ['Pre-Matric ST', 'Post-Matric ST'],
      fileSize: '320 KB',
      mimeType: 'application/pdf',
      digiLockerDocUri: `in.gov.dl.jh.income.${profile.incomeCertNo}`,
    },
    {
      id: 'doc-3',
      title: 'Aadhaar Identity Card (Masked e-KYC)',
      category: 'Identity',
      docNumber: profile.aadhaarMasked,
      issuer: 'Unique Identification Authority of India (UIDAI)',
      issuedDate: '2019-01-15',
      validUntil: 'Lifetime',
      isExpired: false,
      source: 'UIDAI',
      verificationStatus: 'VERIFIED',
      usedInSchemes: ['All MoTA Schemes (Aadhaar DBT APB)'],
      fileSize: '210 KB',
      mimeType: 'application/pdf',
    },
    {
      id: 'doc-4',
      title: 'APAAR / Academic Registry Card',
      category: 'Academic',
      docNumber: profile.apaarId || profile.udiseSchoolId || 'APAAR-2024-ST-99120',
      issuer: 'Ministry of Education & DigiLocker Registry',
      issuedDate: '2024-06-01',
      validUntil: 'Perpetual Student Record',
      isExpired: false,
      source: 'DigiLocker',
      verificationStatus: 'VERIFIED',
      usedInSchemes: ['Pre-Matric ST', 'Post-Matric ST', 'Top Class Education'],
      fileSize: '650 KB',
      mimeType: 'application/pdf',
    },
    {
      id: 'doc-5',
      title: 'Passbook & Aadhaar-Seeded Bank Mandate',
      category: 'Bank',
      docNumber: `${profile.bankAccount.bankName} (${profile.bankAccount.accountNoMasked})`,
      issuer: `${profile.bankAccount.bankName} • IFSC: ${profile.bankAccount.ifsc}`,
      issuedDate: '2023-08-10',
      validUntil: 'Active (NPCI Mapped)',
      isExpired: false,
      source: 'DigiLocker',
      verificationStatus: 'VERIFIED',
      usedInSchemes: ['Direct Benefit Transfer (DBT)'],
      fileSize: '390 KB',
      mimeType: 'application/pdf',
    },
  ]);

  // Syncing state
  const [isDigiLockerSyncing, setIsDigiLockerSyncing] = useState<boolean>(false);
  const [syncStepText, setSyncStepText] = useState<string>('');
  
  // Manual upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadCategory, setUploadCategory] = useState<WalletDocument['category']>('Caste');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDocNumber, setUploadDocNumber] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSimulatingOcr, setIsSimulatingOcr] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verification Engine state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<OrchestrationResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLogEntry[]>([]);
  const [simulatedOutages, setSimulatedOutages] = useState<Partial<Record<VerificationProviderId, boolean>>>({});
  const [selectedSchemeForCheck, setSelectedSchemeForCheck] = useState<SchemeId>('pre-matric');

  // Preview doc state
  const [previewDoc, setPreviewDoc] = useState<WalletDocument | null>(null);

  // Run initial verification on mount
  useEffect(() => {
    executeParallelVerification();
  }, [profile, selectedSchemeForCheck]);

  const executeParallelVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await runParallelVerificationOrchestrator(profile, selectedSchemeForCheck, simulatedOutages);
      setVerificationResult(res);
      setAuditLogs(prev => [...res.auditEntries, ...prev].slice(0, 30));
    } finally {
      setIsVerifying(false);
    }
  };

  // Mock DigiLocker Sync Flow
  const handleSyncDigiLocker = () => {
    setIsDigiLockerSyncing(true);
    setSyncStepText('Connecting to DigiLocker OAuth2 Gateway...');

    setTimeout(() => {
      setSyncStepText('Authenticating UIDAI Token & Registry Link...');
    }, 600);

    setTimeout(() => {
      setSyncStepText('Pulling Verified ST Certificate, Income Cert & APAAR Records...');
    }, 1200);

    setTimeout(() => {
      setIsDigiLockerSyncing(false);
      setSyncStepText('');
      // Show newly refreshed or updated document
      setDocuments(prev => prev.map(d => ({
        ...d,
        issuedDate: d.issuedDate,
        verificationStatus: 'VERIFIED',
      })));
      executeParallelVerification();
    }, 1800);
  };

  // Manual Upload Fallback
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    setUploadedFile(file);
    setIsSimulatingOcr(true);

    // Simulated OCR extraction
    setTimeout(() => {
      setIsSimulatingOcr(false);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!uploadDocNumber) {
        setUploadDocNumber(`DOC-MANUAL-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    }, 800);
  };

  const handleSaveUploadedDoc = () => {
    if (!uploadTitle || !uploadedFile) return;

    const newDoc: WalletDocument = {
      id: `doc-manual-${Date.now()}`,
      title: uploadTitle,
      category: uploadCategory,
      docNumber: uploadDocNumber || `MANUAL-${Date.now()}`,
      issuer: 'Manual Upload (Pending DWO Verification)',
      issuedDate: new Date().toISOString().split('T')[0],
      validUntil: '1 Year from Upload',
      isExpired: false,
      source: 'Manual Upload',
      verificationStatus: 'PENDING',
      usedInSchemes: ['Pre-Matric ST', 'Post-Matric ST'],
      fileSize: `${Math.round(uploadedFile.size / 1024)} KB`,
      mimeType: uploadedFile.type || 'application/pdf',
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    setUploadedFile(null);
    setUploadTitle('');
    setUploadDocNumber('');

    // Trigger verification
    executeParallelVerification();
  };

  const toggleOutage = (providerId: VerificationProviderId) => {
    setSimulatedOutages(prev => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  return (
    <div className="space-y-4 pb-20" id="wallet-view-container">
      {/* Wallet Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-blue-300 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <FolderLock className="w-4 h-4 text-blue-400" />
            <span>Digital Document Wallet & Verification Hub</span>
          </span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-semibold font-mono">
            DigiLocker + 7 MoTA Adapters
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Verified Documents Wallet
        </h2>
        <p className="text-[11px] text-slate-300 mt-1 max-w-xl leading-relaxed">
          Zero-repetitive uploads. Once verified, tribal certificates, APAAR marks, and income records are automatically reused across all five MoTA scholarship schemes.
        </p>

        {/* Action Buttons Row */}
        <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-300 flex items-center gap-3">
            <div>
              <span className="text-slate-400 text-[10px] block">Verified Assets</span>
              <span className="font-bold text-white font-mono">{documents.length} Records</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">Reuse Efficiency</span>
              <span className="font-bold text-emerald-400 font-mono">100% Reusable</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              id="manual-upload-trigger-btn"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual Upload Fallback</span>
            </button>

            <button
              onClick={handleSyncDigiLocker}
              disabled={isDigiLockerSyncing}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
              id="sync-digilocker-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDigiLockerSyncing ? 'animate-spin' : ''}`} />
              <span>{isDigiLockerSyncing ? 'Syncing...' : 'Sync DigiLocker'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Sync Progress banner */}
        {isDigiLockerSyncing && (
          <div className="mt-3 p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-xs text-blue-200 flex items-center gap-2 animate-in fade-in">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
            <span className="font-mono text-[11px]">{syncStepText}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs: Documents vs Verification Engine */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveWalletTab('documents')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeWalletTab === 'documents'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-wallet-documents"
        >
          <FolderLock className="w-4 h-4" />
          <span>My Digital Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveWalletTab('verification-engine')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeWalletTab === 'verification-engine'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-wallet-verification-engine"
        >
          <Activity className="w-4 h-4" />
          <span>Verification Engine & Audit Trail</span>
          {verificationResult?.overallStatus === 'EXCEPTIONS_NON_BLOCKING' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* SUB-VIEW 1: DOCUMENTS LIST */}
      {activeWalletTab === 'documents' && (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isExpiringSoon = doc.validUntil.includes('2025');
            return (
              <div 
                key={doc.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 transition-all shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">
                          {doc.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                          doc.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                          {doc.source}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {doc.docNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Issuer: {doc.issuer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expiry & Validity Info */}
                <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Issued: <strong className="text-slate-300">{doc.issuedDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-400">Validity:</span>
                    <span className={`font-semibold ${isExpiringSoon ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {doc.validUntil}
                    </span>
                  </div>
                </div>

                {/* Reuse Across Schemes Badge Row */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">
                    Reused automatically across {doc.usedInSchemes.length} MoTA scheme(s):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.usedInSchemes.map((sch, i) => (
                      <span 
                        key={i}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/60 flex items-center gap-1"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{sch}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-VIEW 2: VERIFICATION ENGINE & AUDIT TRAIL */}
      {activeWalletTab === 'verification-engine' && (
        <div className="space-y-4">
          
          {/* Statutory Non-Blocking Policy Banner */}
          <div className="p-4 rounded-3xl bg-amber-950/30 border border-amber-500/40 text-amber-100 ring-1 ring-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                MoTA Non-Blocking Verification Guarantee
              </h3>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Per Ministry of Tribal Affairs guidelines, external portal downtime (e.g. State e-District outages) or minor demographic discrepancies (e.g. middle name phonetic variations) generate an administrative review exception and <strong>never block the student from submitting an application</strong>.
            </p>
          </div>

          {/* Engine Controls & Simulated Outage Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Simulate Gateway Scenarios</h4>
              </div>
              <button
                onClick={executeParallelVerification}
                disabled={isVerifying}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                id="run-orchestrator-btn"
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Re-run All Checks in Parallel</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Toggle simulated third-party gateway outages to verify that the orchestrator creates an asynchronous exception without blocking the application flow:
            </p>

            {/* Outage Toggle Pills for 7 adapters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              {allAdapters.map(adapter => {
                const isOutage = simulatedOutages[adapter.id];
                return (
                  <button
                    key={adapter.id}
                    onClick={() => toggleOutage(adapter.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isOutage
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{adapter.id}</span>
                      <span className={`w-2 h-2 rounded-full ${isOutage ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <span className="text-[9px] block text-slate-400 mt-0.5 truncate">
                      {isOutage ? 'Simulating 503 Outage' : 'Online'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parallel Verification Results Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider px-1">
              Parallel Verification Adapters ({allAdapters.length} Providers)
            </h4>

            {verificationResult?.results.map((res) => {
              const isVerified = res.outcome === 'VERIFIED';
              const isMismatch = res.outcome === 'MISMATCH';
              const isUnavailable = res.outcome === 'UNAVAILABLE';
              const isNA = res.outcome === 'NOT_APPLICABLE';

              return (
                <div 
                  key={res.providerId}
                  className={`p-4 rounded-3xl border transition-all ${
                    isVerified 
                      ? 'bg-slate-900 border-slate-800' 
                      : isMismatch 
                      ? 'bg-amber-950/20 border-amber-500/50' 
                      : isUnavailable 
                      ? 'bg-rose-950/20 border-rose-500/50' 
                      : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-2xl shrink-0 mt-0.5 ${
                        isVerified 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : isMismatch 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : isUnavailable 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isVerified && <CheckCircle2 className="w-5 h-5" />}
                        {isMismatch && <AlertTriangle className="w-5 h-5" />}
                        {isUnavailable && <Clock className="w-5 h-5" />}
                        {isNA && <HelpCircle className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {res.providerName}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                            isVerified 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : isMismatch 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                              : isUnavailable 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {res.outcome}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {res.latencyMs}ms
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {res.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      Txn: {res.transactionId.substring(0, 16)}...
                    </span>
                  </div>

                  {/* If Mismatch or Unavailable, highlight non-blocking exception status */}
                  {(isMismatch || isUnavailable) && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{res.discrepancyReason}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {res.exceptionResolutionNote}
                      </p>
                      <div className="pt-1 text-[10px] text-emerald-400 font-medium">
                        ✓ Status: Non-Blocking Exception (Application proceed permitted)
                      </div>
                    </div>
                  )}

                  {/* Attribute matches breakdown */}
                  {res.attributeMatches.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider block">
                        Verified Data Attributes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {res.attributeMatches.map((attr, idx) => (
                          <div key={idx} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 flex items-start justify-between gap-2">
                            <div>
                              <span className="text-slate-400 text-[10px] block">{attr.attributeName}</span>
                              <span className="text-slate-200 font-mono text-[11px]">{attr.retrievedValue}</span>
                              {attr.fuzzyNote && (
                                <span className="text-[9px] text-amber-300 block mt-0.5 font-sans">
                                  {attr.fuzzyNote}
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              attr.isMatch ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                            }`}>
                              {attr.matchScore}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Verification Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Immutable Verification Audit Log
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {auditLogs.length} Events Recorded
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold">{log.providerId}</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      log.outcome === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-400'
                        : log.outcome === 'MISMATCH'
                        ? 'bg-amber-950 text-amber-400'
                        : log.outcome === 'UNAVAILABLE'
                        ? 'bg-rose-950 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.outcome}
                    </span>
                    <span className="text-slate-300 truncate font-sans">{log.summary}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex justify-between pt-0.5">
                    <span>Txn: {log.transactionId}</span>
                    <span>Hash: {log.rawResponseHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Manual Upload Fallback Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" id="manual-upload-modal">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 text-slate-100 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Manual Document Upload Fallback</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If DigiLocker or your State e-District portal is experiencing an outage, you can upload your physical certificate. It will be scheduled for administrative review without blocking your scholarship application.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Document Category:
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Caste">Scheduled Tribe Caste Certificate</option>
                  <option value="Income">Annual Family Income Certificate</option>
                  <option value="Academic">APAAR / Marks Sheet / Degree</option>
                  <option value="Bank">Bank Passbook / Cancelled Cheque</option>
                  <option value="Disability">UDID Disability Certificate</option>
                </select>
              </div>

              {/* Drag-and-Drop file box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                {uploadedFile ? (
                  <div>
                    <span className="font-bold text-white block">{uploadedFile.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {Math.round(uploadedFile.size / 1024)} KB • Ready to save
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Drop document here or click to browse
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      PDF, JPG, PNG up to 5MB supported
                    </span>
                  </div>
                )}
              </div>

              {isSimulatingOcr && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning document & extracting certificate registration number...</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Document Title:
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. ST Caste Certificate 2024"
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Registration / Certificate No:
                </label>
                <input
                  type="text"
                  value={uploadDocNumber}
                  onChange={(e) => setUploadDocNumber(e.target.value)}
                  placeholder="e.g. JH/CST/2024/99120"
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveUploadedDoc}
                disabled={!uploadedFile}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-md"
              >
                Save to Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div><span className="text-slate-500">Document No:</span> <span className="text-amber-300">{previewDoc.docNumber}</span></div>
              <div><span className="text-slate-500">Issuer:</span> <span className="text-slate-300">{previewDoc.issuer}</span></div>
              <div><span className="text-slate-500">Issued Date:</span> <span className="text-slate-300">{previewDoc.issuedDate}</span></div>
              <div><span className="text-slate-500">Validity:</span> <span className="text-emerald-400">{previewDoc.validUntil}</span></div>
              <div><span className="text-slate-500">Source:</span> <span className="text-blue-400">{previewDoc.source}</span></div>
              {previewDoc.digiLockerDocUri && (
                <div><span className="text-slate-500">DigiLocker URI:</span> <span className="text-slate-400 text-[10px] truncate block">{previewDoc.digiLockerDocUri}</span></div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
