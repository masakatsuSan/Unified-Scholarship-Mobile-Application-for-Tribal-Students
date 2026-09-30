import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Filter, 
  Search, 
  Send, 
  Smartphone, 
  MessageSquare, 
  UserCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Hash, 
  BarChart3, 
  ArrowUpRight,
  School,
  MapPin,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { 
  CohortStudent, 
  RegistrationStage, 
  OutreachStatus, 
  SchemeId 
} from '../types/index.ts';
import { 
  calculateCoverageStats, 
  getFunnelData, 
  exceptionMetricsData 
} from '../data/cohortData.ts';

interface MinistryAdminDashboardProps {
  cohort: CohortStudent[];
  onTriggerOutreach: (studentIds: string[], channel: 'SMS' | 'WHATSAPP' | 'FIELD_VISIT') => void;
  onSimulateConversions: (count: number) => void;
  onClose?: () => void;
}

export const MinistryAdminDashboard: React.FC<MinistryAdminDashboardProps> = ({
  cohort,
  onTriggerOutreach,
  onSimulateConversions,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'coverage_outreach' | 'funnel' | 'exceptions'>('coverage_outreach');
  
  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination & selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [outreachToast, setOutreachToast] = useState<string | null>(null);

  // Derive unique states and districts
  const states = useMemo(() => {
    return Array.from(new Set(cohort.map(s => s.state))).sort();
  }, [cohort]);

  const districts = useMemo(() => {
    if (selectedState === 'ALL') {
      return Array.from(new Set(cohort.map(s => s.district))).sort();
    }
    return Array.from(new Set(cohort.filter(s => s.state === selectedState).map(s => s.district))).sort();
  }, [cohort, selectedState]);

  // Filter cohort
  const filteredCohort = useMemo(() => {
    return cohort.filter(s => {
      if (selectedState !== 'ALL' && s.state !== selectedState) return false;
      if (selectedDistrict !== 'ALL' && s.district !== selectedDistrict) return false;
      if (selectedCategory !== 'ALL' && s.institutionCategory !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && s.registrationStatus !== selectedStatus) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesApaar = s.apaarHash.toLowerCase().includes(q) || s.apaarMasked.toLowerCase().includes(q);
        const matchesName = s.studentNameMasked.toLowerCase().includes(q);
        const matchesInst = s.institutionName.toLowerCase().includes(q);
        const matchesTribe = s.tribe.toLowerCase().includes(q);
        if (!matchesApaar && !matchesName && !matchesInst && !matchesTribe) return false;
      }
      return true;
    });
  }, [cohort, selectedState, selectedDistrict, selectedCategory, selectedStatus, searchQuery]);

  // Coverage statistics for the filtered segment
  const stats = useMemo(() => {
    return calculateCoverageStats(filteredCohort);
  }, [filteredCohort]);

  // Funnel data
  const funnelData = useMemo(() => {
    return getFunnelData(filteredCohort);
  }, [filteredCohort]);

  // Paginated list
  const totalPages = Math.ceil(filteredCohort.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCohort.slice(start, start + pageSize);
  }, [filteredCohort, currentPage, pageSize]);

  // Handle select all on current page
  const handleSelectAllCurrentPage = () => {
    const pageIds = paginatedStudents.map(s => s.id);
    const allSelected = pageIds.every(id => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSendOutreachBatch = (channel: 'SMS' | 'WHATSAPP' | 'FIELD_VISIT') => {
    const targets = selectedStudentIds.length > 0 
      ? selectedStudentIds 
      : filteredCohort.filter(s => s.registrationStatus === 'UNREGISTERED').slice(0, 50).map(s => s.id);

    if (targets.length === 0) {
      alert('No unregistered students in current view to target.');
      return;
    }

    onTriggerOutreach(targets, channel);
    setSelectedStudentIds([]);
    setOutreachToast(`Dispatched ${channel} outreach nudge to ${targets.length} tribal students!`);
    setTimeout(() => setOutreachToast(null), 4000);
  };

  const handleSimulateBatchConversions = () => {
    onSimulateConversions(25);
    setOutreachToast(`Simulated 25 students successfully applying after receiving outreach nudge!`);
    setTimeout(() => setOutreachToast(null), 4000);
  };

  return (
    <div className="space-y-4" id="ministry-admin-dashboard">
      {/* Toast banner */}
      {outreachToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>{outreachToast}</span>
          </span>
          <button onClick={() => setOutreachToast(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <Building2 className="w-4 h-4" />
              <span>Ministry of Tribal Affairs • National Monitoring Wing</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/40">
                MoTA Apex Admin
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ST Scholarship Coverage-Gap & Analytics Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time cross-registry matching of 2,000 enrolled ST students against scholarship applications using cryptographic hashed APAAR identifiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateBatchConversions}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              id="simulate-conversions-btn"
              title="Simulate 25 unregistered students responding to nudges and registering on the portal"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Simulate +25 Conversions</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors"
              >
                Back to Student View
              </button>
            )}
          </div>
        </div>

        {/* DPDP Act 2023 Privacy Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200 font-semibold">Privacy Preserving Architecture:</strong> In compliance with the Digital Personal Data Protection (DPDP) Act 2023, school rosters (UDISE+) and higher education enrollment (AISHE) are cross-matched via irreversible SHA-256 hashed APAAR keys without exposing non-consented student PII.
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-slate-400 block font-medium">Total Enrolled ST Cohort</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono">
            {stats.totalCohort.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">UDISE+ & AISHE Registries</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-emerald-400 block font-medium">Scholarship Registered</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {stats.registeredCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-bold block mt-0.5">
            {stats.coverageRate}% Covered
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-rose-400 block font-medium">Coverage Gap (Left Behind)</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1 font-mono">
            {stats.unregisteredCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-rose-400/80 font-bold block mt-0.5">
            {stats.gapRate}% Unclaimed Aid
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow">
          <span className="text-[10px] text-blue-400 block font-medium">Active Outreach Nudges</span>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1 font-mono">
            {stats.outreachInitiatedCount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">SMS, WA & Field Mitra</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow col-span-2 sm:col-span-1">
          <span className="text-[10px] text-amber-400 block font-medium">Outreach Conversion</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1 font-mono">
            {stats.conversionRate}%
          </div>
          <span className="text-[10px] text-amber-300/80 block mt-0.5">
            {stats.outreachConvertedCount} Enrolled Successfully
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('coverage_outreach')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'coverage_outreach'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-coverage-outreach-btn"
        >
          <Users className="w-4 h-4" />
          <span>Coverage Gap & Outreach Roster ({filteredCohort.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('funnel')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'funnel'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-funnel-analytics-btn"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Scholarship Pipeline Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'exceptions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-exception-analytics-btn"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Exception-Rate & Friction Analytics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: COVERAGE GAP & OUTREACH ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'coverage_outreach' && (
        <div className="space-y-4">
          {/* Interactive Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Geographic & Institutional Cohort Slicing</span>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search APAAR Hash, Name, College, Tribe..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
              {/* State Filter */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('ALL');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All States ({states.length})</option>
                  {states.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Districts ({districts.length})</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Institution Category Filter */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Institution Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Higher Education">Higher Education (NIT/IIT/Univ)</option>
                  <option value="EMRS / Ashram">EMRS / Ashram Residential</option>
                  <option value="Senior Secondary">Senior Secondary High School</option>
                  <option value="Vocational">Vocational / ITI</option>
                </select>
              </div>

              {/* Registration Status Filter */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Scholarship Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-700/80 text-white rounded-xl text-xs px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UNREGISTERED">⚠️ Unregistered (Coverage Gap)</option>
                  <option value="DRAFTED">Drafted / In Progress</option>
                  <option value="SUBMITTED">Submitted to INO</option>
                  <option value="INSTITUTE_VERIFIED">Institute Verified</option>
                  <option value="DWO_EXCEPTION">DWO Exception Review</option>
                  <option value="SANCTIONED">Sanctioned</option>
                  <option value="DISBURSED">DBT Disbursed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Ribbon for Batch Outreach */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Selected:</span>
              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                {selectedStudentIds.length} students
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Viewing {paginatedStudents.length} of {filteredCohort.length}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleSendOutreachBatch('SMS')}
                className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors"
                title="Send SMS Nudge to selected students or top 50 unregistered"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Send SMS Nudge</span>
              </button>

              <button
                onClick={() => handleSendOutreachBatch('WHATSAPP')}
                className="px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors"
                title="Trigger official WhatsApp notice with direct application link"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Notice</span>
              </button>

              <button
                onClick={() => handleSendOutreachBatch('FIELD_VISIT')}
                className="px-2.5 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 transition-colors"
                title="Assign local Tribal Mitra or Anganwadi field worker for doorstep assistance"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Tribal Mitra</span>
              </button>

              <button
                onClick={() => {
                  const csvData = filteredCohort.map(s => 
                    `"${s.apaarHash}","${s.apaarMasked}","${s.studentNameMasked}","${s.state}","${s.district}","${s.institutionName}","${s.registrationStatus}","${s.outreachStatus}"`
                  ).join('\n');
                  const blob = new Blob([`"APAAR_Hash","Masked_APAAR","Masked_Name","State","District","Institution","Status","Outreach"\n` + csvData], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `MoTA_Outreach_Cohort_${selectedState}_${Date.now()}.csv`;
                  a.click();
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] rounded-xl border border-slate-700 flex items-center gap-1"
                title="Export list for state welfare department fieldwork"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Outreach Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3 w-8 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllCurrentPage}
                        checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(s.id))}
                        className="rounded border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Hashed APAAR ID</th>
                    <th className="p-3">Student & Tribe</th>
                    <th className="p-3">State & District</th>
                    <th className="p-3">Institution</th>
                    <th className="p-3">Eligible Scheme</th>
                    <th className="p-3">Portal Status</th>
                    <th className="p-3">Outreach Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id);
                    const isGap = s.registrationStatus === 'UNREGISTERED';
                    return (
                      <tr 
                        key={s.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-950/20' : isGap ? 'bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedStudentIds(prev => 
                                prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className="rounded border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Hashed APAAR */}
                        <td className="p-3 font-mono">
                          <div className="text-white font-semibold text-xs flex items-center gap-1">
                            <Hash className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>{s.apaarMasked}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 truncate max-w-[140px]" title={s.apaarHash}>
                            {s.apaarHash.slice(0, 16)}...
                          </div>
                        </td>

                        {/* Student Name & Tribe */}
                        <td className="p-3">
                          <span className="font-semibold text-white block">{s.studentNameMasked}</span>
                          <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 inline-block mt-0.5">
                            {s.tribe} • {s.gender}
                          </span>
                        </td>

                        {/* State & District */}
                        <td className="p-3">
                          <span className="text-white block font-medium">{s.district}</span>
                          <span className="text-[10px] text-slate-400">{s.state}</span>
                        </td>

                        {/* Institution */}
                        <td className="p-3">
                          <span className="text-slate-200 block truncate max-w-[160px]" title={s.institutionName}>
                            {s.institutionName}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            {s.institutionCategory}
                          </span>
                        </td>

                        {/* Scheme */}
                        <td className="p-3">
                          <span className="text-amber-300 font-medium truncate block max-w-[150px]" title={s.eligibleSchemeName}>
                            {s.eligibleSchemeName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Income: ₹{s.annualFamilyIncome.toLocaleString('en-IN')}/yr
                          </span>
                        </td>

                        {/* Registration Status */}
                        <td className="p-3">
                          {s.registrationStatus === 'UNREGISTERED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              Coverage Gap
                            </span>
                          )}
                          {s.registrationStatus === 'DISBURSED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Disbursed
                            </span>
                          )}
                          {s.registrationStatus === 'SANCTIONED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                              Sanctioned
                            </span>
                          )}
                          {s.registrationStatus === 'DWO_EXCEPTION' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                              DWO Exception
                            </span>
                          )}
                          {['SUBMITTED', 'INSTITUTE_VERIFIED', 'DRAFTED'].includes(s.registrationStatus) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                              {s.registrationStatus.replace('_', ' ')}
                            </span>
                          )}
                        </td>

                        {/* Outreach Status */}
                        <td className="p-3">
                          {s.outreachStatus === 'NOT_CONTACTED' && (
                            <span className="text-[10px] text-slate-500 font-mono">Not Contacted</span>
                          )}
                          {s.outreachStatus === 'SMS_SENT' && (
                            <span className="text-[10px] text-blue-300 font-medium flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-blue-400" />
                              <span>SMS Sent</span>
                            </span>
                          )}
                          {s.outreachStatus === 'WHATSAPP_SENT' && (
                            <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                              <span>WhatsApp Sent</span>
                            </span>
                          )}
                          {s.outreachStatus === 'FIELD_MITRA_ASSIGNED' && (
                            <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-amber-400" />
                              <span>Mitra Assigned</span>
                            </span>
                          )}
                          {s.outreachStatus === 'CONVERTED' && (
                            <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              <span>Converted</span>
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-3 text-right">
                          {isGap ? (
                            <button
                              onClick={() => {
                                onTriggerOutreach([s.id], 'SMS');
                                setOutreachToast(`Sent outreach nudge to ${s.studentNameMasked} (${s.apaarMasked})`);
                                setTimeout(() => setOutreachToast(null), 3000);
                              }}
                              className="px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Nudge</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">In Pipeline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-900 border border-slate-700 text-white rounded-lg text-xs px-2 py-1 focus:outline-none"
                >
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span className="hidden sm:inline">
                  Page {currentPage} of {totalPages} ({filteredCohort.length} records)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-xs text-white"
                >
                  Previous
                </button>
                <span className="px-2 font-mono text-white text-xs">{currentPage}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-xs text-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SCHOLARSHIP FUNNEL ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'funnel' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>End-to-End Tribal Scholarship Funnel & Drop-Off Analysis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tracks cohort attrition from academic registry enrollment to PFMS DBT disbursement.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-mono">
                Cohort Size: {filteredCohort.length} Enrolled
              </span>
            </div>

            {/* Funnel Stages List */}
            <div className="space-y-3.5 mt-5">
              {funnelData.map((stage, idx) => {
                const widthPct = Math.max(stage.percentageOfCohort, 8);
                const hasDropOff = stage.dropOffFromPrevious > 0;
                return (
                  <div key={stage.stageKey} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white text-sm">{stage.stageName}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-indigo-300">
                          {stage.count.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          {stage.percentageOfCohort}% of Cohort
                        </span>
                      </div>
                    </div>

                    {/* Funnel Horizontal Progress Bar */}
                    <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-400 transition-all duration-500 shadow-sm"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    {/* Bottom Analysis & Drop Reason */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>SLA Benchmark: <strong className="text-slate-300">{stage.statutorySlaDays}</strong></span>
                      </div>

                      {hasDropOff && (
                        <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>
                            Drop-off: <strong>-{stage.dropOffFromPrevious} students</strong> ({stage.primaryDropReason})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: EXCEPTION-RATE & FRICTION ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>District Welfare Officer (DWO) Exception Rate & Friction Index</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Analysis of non-blocking deficiencies, resolution SLAs, and automated exception clearing rates.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Statutory SLA Cap:</span>
                <span className="bg-blue-500/20 text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  15 Days (Citizen Charter)
                </span>
              </div>
            </div>

            {/* Exception Category Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
              {exceptionMetricsData.map((em) => (
                <div 
                  key={em.category} 
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        em.frictionLevel === 'Severe'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : em.frictionLevel === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {em.frictionLevel} Friction
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{em.categoryLabel}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-white block">{em.count} Cases</span>
                      <span className="text-[10px] text-amber-400 font-bold">{em.percentage}% of Exceptions</span>
                    </div>
                  </div>

                  {/* Resolution SLA metric */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Avg Resolution Time:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {em.averageResolutionDays} Days (Target ≤ {em.statutoryThresholdDays}d)
                    </span>
                  </div>

                  {/* Resolution Breakdown Bar */}
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Outcome Distribution:</span>
                      <span>
                        <span className="text-emerald-400 font-bold">{em.dwoApprovedPct}% Approved</span> • 
                        <span className="text-blue-400 font-bold ml-1">{em.autoResolvedPct}% Auto</span> • 
                        <span className="text-rose-400 font-bold ml-1">{em.rejectedPct}% Ineligible</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                      <div style={{ width: `${em.dwoApprovedPct}%` }} className="h-full bg-emerald-500" title="DWO Approved" />
                      <div style={{ width: `${em.autoResolvedPct}%` }} className="h-full bg-blue-500" title="Auto Resolved via e-District" />
                      <div style={{ width: `${em.rejectedPct}%` }} className="h-full bg-rose-500" title="Statutory Ineligible" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hotspot Summary Table */}
            <div className="mt-5 pt-5 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>District Friction Hotspots (High Exception Volume)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Mayurbhanj (Odisha)</span>
                    <span className="text-rose-400 font-mono">142 Cases</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Primary Friction: State e-District income certificate lag during monsoon</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Khunti (Jharkhand)</span>
                    <span className="text-amber-400 font-mono">98 Cases</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Primary Friction: Bank Aadhaar seeding inactive at rural CSP branches</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>Bastar (Chhattisgarh)</span>
                    <span className="text-amber-400 font-mono">76 Cases</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Primary Friction: AISHE college affiliation renewal pending at Directorate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
