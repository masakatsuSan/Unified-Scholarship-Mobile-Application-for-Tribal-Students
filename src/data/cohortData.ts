import { 
  CohortStudent, 
  CoverageGapStats, 
  FunnelStageData, 
  ExceptionMetricData,
  RegistrationStage,
  OutreachStatus,
  SchemeId
} from '../types/index.ts';

// Deterministic PRNG for consistent seed generation
function pseudoRandom(seed: number) {
  let s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

const STATES_DISTRICTS: Record<string, string[]> = {
  Odisha: ['Sundargarh', 'Mayurbhanj', 'Koraput', 'Rayagada', 'Keonjhar'],
  Jharkhand: ['Khunti', 'Dumka', 'Ranchi', 'West Singhbhum', 'Gumla'],
  'Madhya Pradesh': ['Mandla', 'Dindori', 'Jhabua', 'Barwani', 'Chhindwara'],
  Chhattisgarh: ['Bastar', 'Dantewada', 'Sukma', 'Kanker'],
  Maharashtra: ['Gadchiroli', 'Nandurbar', 'Palghar'],
  Assam: ['Karbi Anglong', 'Dima Hasao', 'Kokrajhar'],
};

const INSTITUTIONS = [
  { name: 'NIT Rourkela', category: 'Higher Education' as const, state: 'Odisha', district: 'Sundargarh' },
  { name: 'IIT Kharagpur', category: 'Higher Education' as const, state: 'Odisha', district: 'Mayurbhanj' },
  { name: 'Ranchi University Campus', category: 'Higher Education' as const, state: 'Jharkhand', district: 'Ranchi' },
  { name: 'IGNTU Amarkantak', category: 'Higher Education' as const, state: 'Madhya Pradesh', district: 'Dindori' },
  { name: 'Bastar Vishwavidyalaya Jagdalpur', category: 'Higher Education' as const, state: 'Chhattisgarh', district: 'Bastar' },
  { name: 'Govt Autonomous College Baripada', category: 'Higher Education' as const, state: 'Odisha', district: 'Mayurbhanj' },
  { name: 'EMRS Kuarmunda Residential School', category: 'EMRS / Ashram' as const, state: 'Odisha', district: 'Sundargarh' },
  { name: 'EMRS Dumka Tribal Campus', category: 'EMRS / Ashram' as const, state: 'Jharkhand', district: 'Dumka' },
  { name: 'EMRS Bastar Model School', category: 'EMRS / Ashram' as const, state: 'Chhattisgarh', district: 'Bastar' },
  { name: 'Govt Tribal Ashram High School Gadchiroli', category: 'EMRS / Ashram' as const, state: 'Maharashtra', district: 'Gadchiroli' },
  { name: 'KGBV Girls Tribal School Khunti', category: 'EMRS / Ashram' as const, state: 'Jharkhand', district: 'Khunti' },
  { name: 'KGBV Tribal Girls Hostel Jhabua', category: 'EMRS / Ashram' as const, state: 'Madhya Pradesh', district: 'Jhabua' },
  { name: 'Govt Higher Secondary School Rayagada', category: 'Senior Secondary' as const, state: 'Odisha', district: 'Rayagada' },
  { name: 'Govt Boys Secondary School Mandla', category: 'Senior Secondary' as const, state: 'Madhya Pradesh', district: 'Mandla' },
  { name: 'Govt Vocational Training Institute Nandurbar', category: 'Vocational' as const, state: 'Maharashtra', district: 'Nandurbar' },
];

const TRIBES = ['Santhal', 'Gond', 'Munda', 'Ho', 'Oraon', 'Bhil', 'Kondh', 'Kolam', 'Baiga', 'Bodo'];
const FIRST_NAMES_F = ['Sunita', 'Anjali', 'Pooja', 'Laxmi', 'Meena', 'Mangli', 'Anita', 'Sarita', 'Sombari', 'Tulsi'];
const FIRST_NAMES_M = ['Birsa', 'Ramesh', 'Sukram', 'Shibu', 'Jadunath', 'Somra', 'Kartik', 'Babulal', 'Budhan', 'Mangal'];

export function generateSeededCohort(count: number = 2000): CohortStudent[] {
  const students: CohortStudent[] = [];

  for (let i = 1; i <= count; i++) {
    const r1 = pseudoRandom(i * 13 + 7);
    const r2 = pseudoRandom(i * 17 + 11);
    const r3 = pseudoRandom(i * 23 + 19);
    const r4 = pseudoRandom(i * 29 + 31);
    const r5 = pseudoRandom(i * 37 + 41);

    const isFemale = r1 > 0.48;
    const gender = isFemale ? ('Female' as const) : ('Male' as const);
    const fNames = isFemale ? FIRST_NAMES_F : FIRST_NAMES_M;
    const fName = fNames[Math.floor(r2 * fNames.length)];
    const tribe = TRIBES[Math.floor(r3 * TRIBES.length)];
    const studentNameMasked = `${fName} ${tribe.slice(0, 1)}****`;

    const instObj = INSTITUTIONS[Math.floor(r4 * INSTITUTIONS.length)];
    const state = instObj.state;
    const district = instObj.district;

    // APAAR Hash generation
    const hexChars = '0123456789abcdef';
    let hexHash = '';
    for (let h = 0; h < 32; h++) {
      hexHash += hexChars[Math.floor(pseudoRandom(i * 100 + h) * 16)];
    }
    const apaarHash = `SHA256:${hexHash}`;
    const apaarMasked = `APAAR-***-${1000 + (i % 9000)}`;

    // Scheme match based on institution
    let eligibleSchemeId: SchemeId = 'post-matric';
    let eligibleSchemeName = 'Post-Matric Scholarship for ST Students';
    if (instObj.category === 'EMRS / Ashram' || instObj.category === 'Senior Secondary') {
      if (r5 < 0.6) {
        eligibleSchemeId = 'pre-matric';
        eligibleSchemeName = 'Pre-Matric Scholarship for ST Students (Class IX & X)';
      } else {
        eligibleSchemeId = 'post-matric';
        eligibleSchemeName = 'Post-Matric Scholarship for ST Students';
      }
    } else {
      if (r5 < 0.28) {
        eligibleSchemeId = 'top-class';
        eligibleSchemeName = 'Top Class Education for ST Students';
      } else if (r5 < 0.38) {
        eligibleSchemeId = 'nfst';
        eligibleSchemeName = 'National Fellowship for Higher Education';
      } else if (r5 < 0.42) {
        eligibleSchemeId = 'nos';
        eligibleSchemeName = 'National Overseas Scholarship (NOS)';
      } else {
        eligibleSchemeId = 'post-matric';
        eligibleSchemeName = 'Post-Matric Scholarship for ST Students';
      }
    }

    // Income
    const annualFamilyIncome = 60000 + Math.floor(r3 * 180000);

    // Registration Status: ~71.5% registered, ~28.5% unregistered
    let registrationStatus: RegistrationStage = 'UNREGISTERED';
    let outreachStatus: OutreachStatus = 'NOT_CONTACTED';
    let outreachChannel: 'SMS' | 'WHATSAPP' | 'FIELD_VISIT' | undefined;
    let outreachLastDate: string | undefined;
    let conversionDate: string | undefined;

    if (r5 < 0.715) {
      // Registered
      if (r5 < 0.38) {
        registrationStatus = 'DISBURSED';
      } else if (r5 < 0.50) {
        registrationStatus = 'SANCTIONED';
      } else if (r5 < 0.58) {
        registrationStatus = 'DWO_EXCEPTION';
      } else if (r5 < 0.65) {
        registrationStatus = 'INSTITUTE_VERIFIED';
      } else if (r5 < 0.69) {
        registrationStatus = 'SUBMITTED';
      } else {
        registrationStatus = 'DRAFTED';
      }
      outreachStatus = 'CONVERTED';
      conversionDate = '2024-09-10';
    } else {
      // Unregistered (Coverage Gap)
      registrationStatus = 'UNREGISTERED';
      if (r1 < 0.3) {
        outreachStatus = 'NOT_CONTACTED';
      } else if (r1 < 0.6) {
        outreachStatus = 'SMS_SENT';
        outreachChannel = 'SMS';
        outreachLastDate = '2024-09-14';
      } else if (r1 < 0.85) {
        outreachStatus = 'WHATSAPP_SENT';
        outreachChannel = 'WHATSAPP';
        outreachLastDate = '2024-09-16';
      } else {
        outreachStatus = 'FIELD_MITRA_ASSIGNED';
        outreachChannel = 'FIELD_VISIT';
        outreachLastDate = '2024-09-17';
      }
    }

    students.push({
      id: `STU-COHORT-${String(i).padStart(4, '0')}`,
      apaarHash,
      apaarMasked,
      studentNameMasked,
      gender,
      tribe,
      state,
      district,
      institutionName: instObj.name,
      institutionCategory: instObj.category,
      eligibleSchemeId,
      eligibleSchemeName,
      annualFamilyIncome,
      registrationStatus,
      matchedAt: '2024-09-01',
      outreachStatus,
      outreachLastDate,
      outreachChannel,
      conversionDate,
    });
  }

  return students;
}

export const initialCohort = generateSeededCohort(2000);

export function calculateCoverageStats(cohort: CohortStudent[]): CoverageGapStats {
  const totalCohort = cohort.length;
  const registeredCount = cohort.filter(s => s.registrationStatus !== 'UNREGISTERED').length;
  const unregisteredCount = totalCohort - registeredCount;
  const coverageRate = Number(((registeredCount / totalCohort) * 100).toFixed(1));
  const gapRate = Number(((unregisteredCount / totalCohort) * 100).toFixed(1));

  const outreachInitiatedCount = cohort.filter(
    s => s.outreachStatus !== 'NOT_CONTACTED' && s.registrationStatus === 'UNREGISTERED'
  ).length;

  const outreachConvertedCount = cohort.filter(s => s.outreachStatus === 'CONVERTED').length;
  const conversionRate = Number(
    ((outreachConvertedCount / (outreachConvertedCount + outreachInitiatedCount || 1)) * 100).toFixed(1)
  );

  return {
    totalCohort,
    registeredCount,
    unregisteredCount,
    coverageRate,
    gapRate,
    outreachInitiatedCount,
    outreachConvertedCount,
    conversionRate,
  };
}

export function getFunnelData(cohort: CohortStudent[]): FunnelStageData[] {
  const total = cohort.length; // 2,000
  const matchedApaar = cohort.length; // 2,000 in unified registry
  const drafted = cohort.filter(s => s.registrationStatus !== 'UNREGISTERED').length; // ~1,430
  const submitted = cohort.filter(
    s => !['UNREGISTERED', 'DRAFTED'].includes(s.registrationStatus)
  ).length;
  const instituteVerified = cohort.filter(
    s => ['INSTITUTE_VERIFIED', 'DWO_EXCEPTION', 'SANCTIONED', 'DISBURSED'].includes(s.registrationStatus)
  ).length;
  const dwoCleared = cohort.filter(
    s => ['SANCTIONED', 'DISBURSED'].includes(s.registrationStatus)
  ).length;
  const disbursed = cohort.filter(s => s.registrationStatus === 'DISBURSED').length;

  return [
    {
      stageKey: 'enrolled',
      stageName: 'Enrolled ST Students (UDISE+ / AISHE)',
      count: total,
      percentageOfCohort: 100,
      dropOffFromPrevious: 0,
      primaryDropReason: 'Baseline Enrollment Cohort',
      statutorySlaDays: 'Annual Roster Sync',
    },
    {
      stageKey: 'portal_registered',
      stageName: 'Portal Registered & Hashed APAAR Matched',
      count: drafted + 240, // some initiated account setup
      percentageOfCohort: Number((((drafted + 240) / total) * 100).toFixed(1)),
      dropOffFromPrevious: total - (drafted + 240),
      primaryDropReason: 'Lack of digital awareness & remote connectivity in tribal blocks',
      statutorySlaDays: 'Instant Verification (NHA/DigiLocker)',
    },
    {
      stageKey: 'application_submitted',
      stageName: 'Application Form Submitted',
      count: submitted,
      percentageOfCohort: Number(((submitted / total) * 100).toFixed(1)),
      dropOffFromPrevious: (drafted + 240) - submitted,
      primaryDropReason: 'Income / Caste Certificate renewal pendency at Tehsildar',
      statutorySlaDays: 'Citizen Charter: 7 Days',
    },
    {
      stageKey: 'institute_verified',
      stageName: 'Institute Nodal Officer (INO) Verified',
      count: instituteVerified,
      percentageOfCohort: Number(((instituteVerified / total) * 100).toFixed(1)),
      dropOffFromPrevious: submitted - instituteVerified,
      primaryDropReason: 'Attendance cutoff (<75%) or AISHE college code mismatch',
      statutorySlaDays: '7 Working Days',
    },
    {
      stageKey: 'dwo_sanctioned',
      stageName: 'State / DWO Adjudicated & Sanctioned',
      count: dwoCleared,
      percentageOfCohort: Number(((dwoCleared / total) * 100).toFixed(1)),
      dropOffFromPrevious: instituteVerified - dwoCleared,
      primaryDropReason: 'State e-District income disparity or Bank NPCI seeding inactive',
      statutorySlaDays: '15 Working Days (MoTA SLA)',
    },
    {
      stageKey: 'dbt_disbursed',
      stageName: 'PFMS Direct Benefit Transfer Disbursed',
      count: disbursed,
      percentageOfCohort: Number(((disbursed / total) * 100).toFixed(1)),
      dropOffFromPrevious: dwoCleared - disbursed,
      primaryDropReason: 'Aadhaar Payment Bridge (APB) mapping bounce or dormant account',
      statutorySlaDays: '48 Hours Post-Sanction',
    },
  ];
}

export const exceptionMetricsData: ExceptionMetricData[] = [
  {
    category: 'income_discrepancy',
    categoryLabel: 'State e-District Income Mismatch',
    count: 142,
    percentage: 36.8,
    averageResolutionDays: 5.8,
    statutoryThresholdDays: 15,
    autoResolvedPct: 44,
    dwoApprovedPct: 48,
    rejectedPct: 8,
    frictionLevel: 'Severe',
  },
  {
    category: 'bank_npc_mapper',
    categoryLabel: 'Bank Account Not Seeded in NPCI Mapper',
    count: 98,
    percentage: 25.4,
    averageResolutionDays: 4.2,
    statutoryThresholdDays: 15,
    autoResolvedPct: 62,
    dwoApprovedPct: 34,
    rejectedPct: 4,
    frictionLevel: 'High',
  },
  {
    category: 'name_fuzzy_mismatch',
    categoryLabel: 'Name Phonetic / Spelling Variance (Aadhaar vs Marksheet)',
    count: 64,
    percentage: 16.6,
    averageResolutionDays: 2.9,
    statutoryThresholdDays: 15,
    autoResolvedPct: 78,
    dwoApprovedPct: 20,
    rejectedPct: 2,
    frictionLevel: 'Moderate',
  },
  {
    category: 'institute_noc_pending',
    categoryLabel: 'AISHE / UDISE+ College Affiliation Pending',
    count: 48,
    percentage: 12.4,
    averageResolutionDays: 8.5,
    statutoryThresholdDays: 15,
    autoResolvedPct: 30,
    dwoApprovedPct: 56,
    rejectedPct: 14,
    frictionLevel: 'High',
  },
  {
    category: 'multiple_scholarships',
    categoryLabel: 'One-Scholarship Rule Duplicate Benefit Check',
    count: 34,
    percentage: 8.8,
    averageResolutionDays: 3.1,
    statutoryThresholdDays: 15,
    autoResolvedPct: 52,
    dwoApprovedPct: 18,
    rejectedPct: 30,
    frictionLevel: 'Moderate',
  },
];
