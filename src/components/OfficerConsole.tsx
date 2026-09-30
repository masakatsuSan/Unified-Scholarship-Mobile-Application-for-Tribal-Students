import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User, 
  Building2, 
  MapPin, 
  Filter, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  RefreshCw, 
  Eye, 
  Send, 
  Check, 
  X, 
  ExternalLink,
  History,
  Sliders,
  Scale,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  OfficerExceptionCase, 
  OfficerCaseStatus, 
  ExceptionCategory, 
  OfficerDecision 
} from '../types/index.ts';

interface OfficerConsoleProps {
  exceptions: OfficerExceptionCase[];
  onUpdateCaseStatus: (caseId: string, decision: OfficerDecision) => void;
  onClose: () => void;
}

export const OfficerConsole: React.FC<OfficerConsoleProps> = ({
  exceptions,
  onUpdateCaseStatus,
  onClose,
}) => {
  const { t } = useTranslation();

  // Selected case for side-by-side inspection
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    exceptions[0]?.id || ''
  );

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [slaFilter, setSlaFilter] = useState<'all' | 'critical'>('all');

  // Action Modals / Dialog state
  const [activeActionModal, setActiveActionModal] = useState<'APPROVE' | 'CORRECTION' | 'REJECT' | null>(null);
  const [actionRemarks, setActionRemarks] = useState<string>('');
  const [statutoryClause, setStatutoryClause] = useState<string>('MoTA Clause 4.1: Annual family income exceeds statutory threshold');
  const [correctionInstructions, setCorrectionInstructions] = useState<string>('Please upload Tahsil Revenue Circle verification endorsement letter for FY 2024-25.');
  const [deficiencyDeadline, setDeficiencyDeadline] = useState<string>('2024-10-15');

  // Preview uploaded document modal
  const [previewDocOpen, setPreviewDocOpen] = useState<boolean>(false);

  const selectedCase = exceptions.find(c => c.id === selectedCaseId) || exceptions[0];

  // Filtered exception list
  const filteredCases = exceptions.filter(c => {
    if (categoryFilter !== 'all' && c.exceptionCategory !== categoryFilter) {
      return false;
    }
    if (slaFilter === 'critical' && c.slaUrgency !== 'critical') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.applicantName.toLowerCase().includes(q);
      const matchAppNo = c.applicationNumber.toLowerCase().includes(q);
      const matchScheme = c.schemeName.toLowerCase().includes(q);
      const matchDist = c.district.toLowerCase().includes(q);
      if (!matchName && !matchAppNo && !matchScheme && !matchDist) return false;
    }
    return true;
  });

  // Action submission handlers
  const handleConfirmAction = () => {
    if (!selectedCase || !activeActionModal) return;

    const decision: OfficerDecision = {
      action: activeActionModal === 'APPROVE' ? 'APPROVED' : activeActionModal === 'CORRECTION' ? 'CORRECTION_REQUESTED' : 'REJECTED',
      officerId: 'DWO-JH-9921',
      officerName: 'Dr. K. S. Meena (District Welfare Officer)',
      timestamp: new Date().toISOString(),
      remarks: actionRemarks.trim() || (
        activeActionModal === 'APPROVE' 
          ? 'Exception scrutinized against State revenue master records and verified within statutory parameters. Approved for DBT disbursement.'
          : activeActionModal === 'CORRECTION'
          ? correctionInstructions
          : 'Application rejected per statutory MoTA guidelines.'
      ),
      statutoryClause: activeActionModal === 'REJECT' ? statutoryClause : undefined,
      correctionInstructions: activeActionModal === 'CORRECTION' ? correctionInstructions : undefined,
      deficiencyDeadline: activeActionModal === 'CORRECTION' ? deficiencyDeadline : undefined,
      auditHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-DWO-SANCTION`,
    };

    onUpdateCaseStatus(selectedCase.id, decision);
    setActiveActionModal(null);
    setActionRemarks('');
  };

  const pendingCount = exceptions.filter(c => c.status === 'PENDING_REVIEW').length;
  const criticalCount = exceptions.filter(c => c.status === 'PENDING_REVIEW' && c.slaUrgency === 'critical').length;
  const resolvedCount = exceptions.filter(c => c.status !== 'PENDING_REVIEW').length;

  return (
    <div className="space-y-4 pb-20" id="officer-console-view">
      {/* Officer Console Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-blue-300 font-medium mb-1">
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="font-semibold uppercase tracking-wider">MoTA Administrative Verification Portal</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono font-bold">
              District Welfare Officer (DWO) Role
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
              title="Return to Student View"
              id="close-officer-console-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Exception Review Console</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono border border-amber-500/40">
                MoTA Non-Blocking Stream
              </span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Adjudicate automated demographic mismatches, Tahsil income variances, and external gateway timeout exceptions without penalizing Scheduled Tribe students.
            </p>
          </div>

          {/* Officer Credentials Pill */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 text-xs shrink-0 font-mono flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              DW
            </div>
            <div>
              <span className="text-white font-bold block text-[11px]">Dr. K. S. Meena, DWO</span>
              <span className="text-slate-400 text-[10px] block">Tribal Welfare Division • Sundargarh / Khunti</span>
            </div>
          </div>
        </div>

        {/* Metric Badges Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-blue-500/20 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Pending Exceptions</span>
            <span className="font-bold text-amber-400 font-mono text-sm">{pendingCount}</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-rose-900/40 flex items-center justify-between">
            <span className="text-rose-300 text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>SLA Critical (&lt;4 days)</span>
            </span>
            <span className="font-bold text-rose-400 font-mono text-sm">{criticalCount}</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Adjudicated Today</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Console Layout: Two Columns (Left: Exception Queue, Right: Side-by-Side Review) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: EXCEPTION QUEUE (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Exception Queue ({filteredCases.length})
                </h3>
              </div>

              {/* SLA Critical Toggle Button */}
              <button
                onClick={() => setSlaFilter(prev => prev === 'critical' ? 'all' : 'critical')}
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-all border ${
                  slaFilter === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                id="filter-critical-sla-btn"
              >
                {slaFilter === 'critical' ? '● Showing Critical Only' : 'Filter Critical SLA'}
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, scheme, district, app no..."
                className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'income_discrepancy', label: 'Income' },
                { id: 'name_fuzzy_mismatch', label: 'Name Mismatch' },
                { id: 'gateway_outage', label: 'Gateway 503' },
                { id: 'bank_npc_mapper', label: 'Bank NPCI' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-lg border transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Cases List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No exceptions match the selected filter criteria.
                </div>
              ) : (
                filteredCases.map(c => {
                  const isSelected = c.id === selectedCaseId;
                  const daysLeft = c.slaTargetDays - c.slaAgeDays;
                  const isResolved = c.status !== 'PENDING_REVIEW';

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all space-y-2 ${
                        isSelected 
                          ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/30' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                      id={`exception-item-${c.id}`}
                    >
                      {/* Top Row: Applicant & SLA Status */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{c.applicantName}</span>
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 rounded font-mono">
                              {c.applicantTribe}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate font-mono">
                            {c.applicationNumber}
                          </span>
                        </div>

                        {/* SLA Age Badge */}
                        <div className="text-right shrink-0">
                          {isResolved ? (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              c.status === 'APPROVED' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : c.status === 'CORRECTION_REQUESTED'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {c.status.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              c.slaUrgency === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                                : c.slaUrgency === 'warning'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              <span>{daysLeft}d left</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Exception Title */}
                      <p className="text-[11px] text-slate-300 font-medium leading-snug line-clamp-2">
                        {c.exceptionTitle}
                      </p>

                      {/* SLA Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>SLA Age: Day {c.slaAgeDays}/{c.slaTargetDays}</span>
                          <span>{c.district}, {c.state}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              c.slaUrgency === 'critical' 
                                ? 'bg-rose-500' 
                                : c.slaUrgency === 'warning' 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (c.slaAgeDays / c.slaTargetDays) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE-BY-SIDE REVIEW & ADJUDICATION (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {selectedCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
              
              {/* Review Header Banner */}
              <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">
                      {selectedCase.applicantName}
                    </h3>
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
                      {selectedCase.schemeName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                      selectedCase.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : selectedCase.status === 'CORRECTION_REQUESTED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : selectedCase.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {selectedCase.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Institution: <span className="text-slate-200 font-medium">{selectedCase.institutionName}</span>
                  </p>
                </div>

                {/* SLA Metric Counter */}
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-right shrink-0 font-mono">
                  <span className="text-[10px] text-slate-400 block">SLA Elapsed</span>
                  <span className={`text-xs font-bold ${
                    selectedCase.slaUrgency === 'critical' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {selectedCase.slaAgeDays} of {selectedCase.slaTargetDays} Days ({selectedCase.slaTargetDays - selectedCase.slaAgeDays}d remaining)
                  </span>
                </div>
              </div>

              {/* Exception Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{selectedCase.exceptionTitle}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedCase.exceptionDescription}
                </p>
              </div>

              {/* SIDE-BY-SIDE COMPARISON TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Side-by-Side: Entered vs Source Data</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Cryptographic Cross-Validation
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCase.sideBySideFields.map((field, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all ${
                        field.hasDiscrepancy 
                          ? 'bg-amber-950/20 border-amber-500/50' 
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 text-[11px]">
                        <span className="font-semibold text-slate-300">{field.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">{field.sourceRegistry}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            field.hasDiscrepancy ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {field.hasDiscrepancy ? 'VARIANCE DETECTED' : '100% MATCH'}
                          </span>
                        </div>
                      </div>

                      {/* 2-Column Split: Entered vs Source */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 pt-1.5 border-t border-slate-800/80 text-xs font-mono">
                        {/* Entered */}
                        <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 block font-sans uppercase font-medium">
                            Applicant Entered Data
                          </span>
                          <span className="text-slate-100 font-bold block mt-0.5">
                            {field.enteredValue}
                          </span>
                        </div>

                        {/* Source */}
                        <div className={`p-2 rounded-xl border ${
                          field.hasDiscrepancy ? 'bg-amber-900/30 border-amber-500/40 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}>
                          <span className="text-[9px] text-slate-400 block font-sans uppercase font-medium">
                            Source Registry Return
                          </span>
                          <span className="font-bold block mt-0.5">
                            {field.sourceValue}
                          </span>
                        </div>
                      </div>

                      {/* Notes on Discrepancy */}
                      {field.notes && (
                        <p className="text-[11px] text-amber-300 mt-2 font-sans bg-amber-950/40 p-2 rounded-xl border border-amber-500/20">
                          ℹ️ <strong>Officer Guidance:</strong> {field.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploaded Physical Document Attachment Strip */}
              {selectedCase.uploadedDocTitle && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">{selectedCase.uploadedDocTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Category: {selectedCase.uploadedDocCategory} • Tehsildar Certified</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewDocOpen(true)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Scan</span>
                  </button>
                </div>
              )}

              {/* Officer Previous Decision Stamp if already adjudicated */}
              {selectedCase.decision && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Adjudication Recorded</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(selectedCase.decision.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs">
                    "{selectedCase.decision.remarks}"
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1 flex justify-between">
                    <span>Officer: {selectedCase.decision.officerName} ({selectedCase.decision.officerId})</span>
                    <span>Audit Hash: {selectedCase.decision.auditHash}</span>
                  </div>
                </div>
              )}

              {/* OFFICER ACTION BUTTONS SUITE */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Officer Adjudication Action:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Action 1: Approve */}
                  <button
                    onClick={() => {
                      setActionRemarks('Scrutinized against Tahsil revenue circle records. Discrepancy reconciled and verified within statutory parameters. Approved for DBT grant disbursement.');
                      setActiveActionModal('APPROVE');
                    }}
                    className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    id="officer-approve-btn"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Exception</span>
                  </button>

                  {/* Action 2: Request Correction */}
                  <button
                    onClick={() => {
                      setActionRemarks('');
                      setActiveActionModal('CORRECTION');
                    }}
                    className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    id="officer-request-correction-btn"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Request Correction</span>
                  </button>

                  {/* Action 3: Reject */}
                  <button
                    onClick={() => {
                      setActionRemarks('');
                      setActiveActionModal('REJECT');
                    }}
                    className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    id="officer-reject-btn"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject with Reason</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select an exception from the queue to inspect side-by-side data and adjudicate.
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ACTION DIALOG (Approve / Request Correction / Reject) */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" id="officer-action-modal">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {activeActionModal === 'APPROVE' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {activeActionModal === 'CORRECTION' && <Sliders className="w-5 h-5 text-amber-400" />}
                {activeActionModal === 'REJECT' && <XCircle className="w-5 h-5 text-rose-400" />}
                <h3 className="text-sm font-bold text-white">
                  {activeActionModal === 'APPROVE' && 'Confirm Exception Approval'}
                  {activeActionModal === 'CORRECTION' && 'Raise Deficiency & Request Student Correction'}
                  {activeActionModal === 'REJECT' && 'Statutory Rejection of Scholarship Application'}
                </h3>
              </div>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Applicant: <strong className="text-white">{selectedCase.applicantName}</strong> ({selectedCase.schemeName}) • Application ID: <strong className="font-mono text-amber-300">{selectedCase.applicationNumber}</strong>
            </p>

            {/* If Rejection, require statutory clause */}
            {activeActionModal === 'REJECT' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Mandatory Statutory Clause:
                </label>
                <select
                  value={statutoryClause}
                  onChange={(e) => setStatutoryClause(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="MoTA Clause 4.1: Annual family income exceeds statutory limit of ₹2,50,000">
                    Clause 4.1: Annual family income exceeds statutory limit of ₹2,50,000
                  </option>
                  <option value="MoTA Clause 2.3: Non-accredited institution or unapproved academic course">
                    Clause 2.3: Non-accredited institution or unapproved academic course
                  </option>
                  <option value="MoTA Clause 7.2: Duplicate scholarship claim under One-Scholarship-at-a-Time Rule">
                    Clause 7.2: Duplicate claim under One-Scholarship-at-a-Time Rule
                  </option>
                  <option value="MoTA Clause 5.4: Caste credentials could not be verified in State ST Master Registry">
                    Clause 5.4: Caste credentials could not be verified in State ST Master Registry
                  </option>
                </select>
              </div>
            )}

            {/* If Correction, allow specific deficiency instruction */}
            {activeActionModal === 'CORRECTION' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Correction Instructions for Student:
                  </label>
                  <textarea
                    rows={3}
                    value={correctionInstructions}
                    onChange={(e) => setCorrectionInstructions(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter explicit steps the student must take..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Student Correction Deadline:
                  </label>
                  <input
                    type="date"
                    value={deficiencyDeadline}
                    onChange={(e) => setDeficiencyDeadline(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            )}

            {/* Officer Remarks */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Official Case Remarks / Justification:
              </label>
              <textarea
                rows={3}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder="Enter justification recorded in the immutable audit log..."
                className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-white font-bold rounded-xl text-xs shadow-md ${
                  activeActionModal === 'APPROVE' 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : activeActionModal === 'CORRECTION'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
                id="confirm-officer-action-btn"
              >
                {activeActionModal === 'APPROVE' && 'Approve & Advance Application'}
                {activeActionModal === 'CORRECTION' && 'Send Correction Notice'}
                {activeActionModal === 'REJECT' && 'Confirm Statutory Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ATTACHED SCANNED DOCUMENT */}
      {previewDocOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{selectedCase.uploadedDocTitle}</h3>
              </div>
              <button onClick={() => setPreviewDocOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-slate-400">Applicant:</span>
                <span className="text-white font-bold">{selectedCase.applicantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Application ID:</span>
                <span className="text-amber-300">{selectedCase.applicationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">District / State:</span>
                <span className="text-slate-200">{selectedCase.district}, {selectedCase.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tehsildar Seal:</span>
                <span className="text-emerald-400">Verified Stamp Present</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Resolution Status:</span>
                <span className="text-blue-400">Ready for DWO Re-certification</span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
              Scanned certificate hash: <code>SHA256: 91b402e8810c9a...</code> matches upload receipt.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewDocOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
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
