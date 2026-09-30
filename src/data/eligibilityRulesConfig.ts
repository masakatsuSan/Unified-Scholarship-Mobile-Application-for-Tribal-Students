import { 
  SchemeId, 
  StudentProfile, 
  SchemeEligibilityConfig, 
  EligibilityEvaluationResult 
} from '../types/index.ts';

export const schemeEligibilityConfigs: Record<SchemeId, SchemeEligibilityConfig> = {
  'pre-matric': {
    schemeId: 'pre-matric',
    schemeName: 'Pre-Matric Scholarship for ST Students',
    sourcePortal: 'NSP',
    incomeCeilingAmount: 250000,
    incomeCeilingLabel: '₹2,50,000 per annum',
    minAcademicLevel: 'Class 9',
    allowedAcademicLevels: ['Class 9', 'Class 10'],
    requiresST: true,
    maxBenefitSummary: '₹3,500/year (Day Scholar) / ₹7,000/year (Hosteller) + Books Grant',
    criteria: [
      {
        id: 'st-status',
        title: 'Tribal Community (ST) Status',
        description: 'Candidate must belong to a Scheduled Tribe as notified under Article 342 of the Constitution of India.',
        category: 'caste',
      },
      {
        id: 'income-limit',
        title: 'Annual Family Income Ceiling',
        description: 'Total parental/family annual income from all sources must not exceed ₹2,50,000/-.',
        category: 'income',
      },
      {
        id: 'academic-stage',
        title: 'Academic Level (Class 9 or 10)',
        description: 'Candidate must be enrolled as a regular, full-time student in Class 9 or Class 10 in a recognized Government, Local Body, or Aided School.',
        category: 'academic',
      },
      {
        id: 'one-scholarship',
        title: 'One-Scholarship-at-a-Time Rule',
        description: 'A student can hold only ONE central/state government scholarship at a time.',
        category: 'one_scholarship',
      },
    ],
  },
  'post-matric': {
    schemeId: 'post-matric',
    schemeName: 'Post-Matric Scholarship for ST Students',
    sourcePortal: 'NSP',
    incomeCeilingAmount: 250000,
    incomeCeilingLabel: '₹2,50,000 per annum',
    minAcademicLevel: 'Class 11',
    allowedAcademicLevels: ['Class 11', 'Class 12', 'ITI', 'Polytechnic', 'Diploma', 'Undergraduate (BA/B.Sc/B.Com/B.Tech)', 'Postgraduate (MA/M.Sc/M.Com/M.Tech)'],
    requiresST: true,
    maxBenefitSummary: 'Full non-refundable compulsory fees + Monthly Maintenance Allowance up to ₹13,500/year',
    criteria: [
      {
        id: 'st-status',
        title: 'Tribal Community (ST) Status',
        description: 'Candidate must belong to a Scheduled Tribe as notified under Article 342 of the Constitution of India.',
        category: 'caste',
      },
      {
        id: 'income-limit',
        title: 'Annual Family Income Ceiling',
        description: 'Total parental/family annual income from all sources must not exceed ₹2,50,000/-.',
        category: 'income',
      },
      {
        id: 'academic-stage',
        title: 'Post-Secondary Academic Enrollment',
        description: 'Candidate must be studying in Class 11, Class 12, ITI, Diploma, Undergraduate, or Postgraduate courses in recognized institutions.',
        category: 'academic',
      },
      {
        id: 'one-scholarship',
        title: 'One-Scholarship-at-a-Time Rule',
        description: 'Dual receipt of financial assistance under two distinct government schemes is strictly barred.',
        category: 'one_scholarship',
      },
    ],
  },
  'top-class': {
    schemeId: 'top-class',
    schemeName: 'National Fellowship & Top Class Education for ST Students',
    sourcePortal: 'SFMP',
    incomeCeilingAmount: 600000,
    incomeCeilingLabel: '₹6,00,000 per annum',
    minAcademicLevel: 'Undergraduate / Postgraduate in Notified Premier Institutes',
    allowedAcademicLevels: ['Undergraduate (BA/B.Sc/B.Com/B.Tech)', 'Postgraduate (MA/M.Sc/M.Com/M.Tech)', 'MBBS / Medical', 'LLB / Law', 'Management / MBA'],
    requiresST: true,
    requiresAccreditedInstitute: 'MoTA Notified Institutes (IITs, NITs, IIMs, AIIMS, NLUs, NID, etc.)',
    maxBenefitSummary: 'Full Tuition Fee (capped at ₹2.5L for pvt / actuals for govt) + Living Expenses ₹3,000/mo + Books ₹5,000 + Computer ₹45,000 one-time',
    criteria: [
      {
        id: 'st-status',
        title: 'Tribal Community (ST) Status',
        description: 'Candidate must belong to a Scheduled Tribe category.',
        category: 'caste',
      },
      {
        id: 'income-limit',
        title: 'Family Income Ceiling',
        description: 'Annual family income must not exceed ₹6,00,000/- per annum.',
        category: 'income',
      },
      {
        id: 'premier-institute',
        title: 'Admission in Notified Premier Institute',
        description: 'Candidate must have secured admission in one of the 250+ premier institutions notified by MoTA (e.g. IITs, NITs, AIIMS, IIMs, NLUs).',
        category: 'institution',
      },
      {
        id: 'one-scholarship',
        title: 'One-Scholarship-at-a-Time Rule',
        description: 'Beneficiary cannot concurrently receive another state or central government scholarship.',
        category: 'one_scholarship',
      },
    ],
  },
  'nfst': {
    schemeId: 'nfst',
    schemeName: 'National Fellowship for Higher Education of ST Students (NFST)',
    sourcePortal: 'SFMP',
    incomeCeilingAmount: 800000,
    incomeCeilingLabel: 'No strict income ceiling (Preference to < ₹6.0L)',
    minAcademicLevel: 'M.Phil / Ph.D.',
    allowedAcademicLevels: ['M.Phil', 'Ph.D. / Doctoral Research'],
    requiresST: true,
    requiresResearchTopic: true,
    maxBenefitSummary: 'Junior Research Fellow: ₹31,000/mo; Senior Research Fellow: ₹35,000/mo + HRA + Contingency ₹20,500/year',
    criteria: [
      {
        id: 'st-status',
        title: 'Tribal Community (ST) Status',
        description: 'Candidate must belong to a Scheduled Tribe.',
        category: 'caste',
      },
      {
        id: 'post-grad-merit',
        title: 'Post-Graduate Qualification',
        description: 'Candidate must have completed Post-Graduation with minimum 55% marks from a UGC-recognized university.',
        category: 'academic',
      },
      {
        id: 'research-admission',
        title: 'Regular M.Phil / Ph.D. Enrollment',
        description: 'Candidate must be admitted as a regular, full-time M.Phil or Ph.D. scholar in a recognized Indian University or Institute of National Importance.',
        category: 'institution',
      },
      {
        id: 'one-scholarship',
        title: 'One-Fellowship-at-a-Time Rule',
        description: 'Candidate cannot hold any other fellowship (e.g. UGC-NET JRF, CSIR, ICMR, or State Fellowship) simultaneously.',
        category: 'one_scholarship',
      },
    ],
  },
  'nos': {
    schemeId: 'nos',
    schemeName: 'National Overseas Scholarship for ST Candidates (NOS)',
    sourcePortal: 'NOS_PORTAL',
    incomeCeilingAmount: 600000,
    incomeCeilingLabel: '₹6,00,000 per annum',
    minAcademicLevel: 'Masters / Ph.D. Overseas',
    allowedAcademicLevels: ['Master Degree (Overseas)', 'Ph.D. / Doctoral (Overseas)'],
    requiresST: true,
    requiresForeignAdmission: true,
    maxBenefitSummary: 'Full Overseas Tuition Fees + Annual Maintenance Allowance (USD 15,400 / GBP 9,900) + Air Passage + Visa Fees + Medical Insurance',
    criteria: [
      {
        id: 'st-status',
        title: 'Tribal Community (ST) Status',
        description: 'Candidate must belong to a Scheduled Tribe as notified under Article 342.',
        category: 'caste',
      },
      {
        id: 'income-limit',
        title: 'Family Income Ceiling',
        description: 'Total family income from all sources must not exceed ₹6,00,000/- per annum.',
        category: 'income',
      },
      {
        id: 'qs-ranking',
        title: 'Foreign University QS World Ranking (Top 500)',
        description: 'Candidate must have secured unconditional admission in a foreign institution ranked among the top 500 in QS World University Rankings.',
        category: 'institution',
      },
      {
        id: 'min-qualifying-marks',
        title: 'Minimum 55% Marks in Qualifying Degree',
        description: 'Candidate must have secured at least 55% marks or equivalent grade in Bachelor degree (for Masters) or Masters degree (for Ph.D.).',
        category: 'academic',
      },
      {
        id: 'one-scholarship',
        title: 'Exclusive MoTA Fellowship Rule',
        description: 'Student cannot avail concurrent central/state overseas grants or foreign government fellowships.',
        category: 'one_scholarship',
      },
    ],
  },
};

/**
 * Data-driven eligibility evaluation engine
 */
export function evaluateEligibility(
  schemeId: SchemeId,
  profile: StudentProfile,
  activeSchemeId?: SchemeId
): EligibilityEvaluationResult {
  const config = schemeEligibilityConfigs[schemeId];
  const passedChecks: { title: string; detail: string }[] = [];
  const failedChecks: { title: string; reason: string }[] = [];

  // Check 1: One-Scholarship-at-a-Time Rule
  const isBlockedByActive = Boolean(activeSchemeId && activeSchemeId !== schemeId);
  const activeSchemeObj = activeSchemeId ? schemeEligibilityConfigs[activeSchemeId] : undefined;

  if (isBlockedByActive && activeSchemeObj) {
    failedChecks.push({
      title: 'One-Scholarship-at-a-Time Rule Violation',
      reason: `You already hold an active scholarship in "${activeSchemeObj.schemeName}". MoTA guidelines strictly prohibit concurrent multi-scheme awards. You must complete your current academic cycle or surrender your active scholarship before enrolling.`,
    });
  } else {
    passedChecks.push({
      title: 'One-Scholarship Rule Compliance',
      detail: 'No conflicting active central/state scholarship is currently drawn.',
    });
  }

  // Check 2: Tribal Community (ST) Status
  if (profile.tribe && profile.tribe.trim().length > 0) {
    passedChecks.push({
      title: 'Scheduled Tribe (ST) Certificate',
      detail: `Verified community: ${profile.tribe} (Cert: ${profile.casteCertNo})`,
    });
  } else {
    failedChecks.push({
      title: 'ST Certificate Missing',
      reason: 'A valid Scheduled Tribe (ST) certificate issued by a competent state authority is mandatory.',
    });
  }

  // Check 3: Family Income Ceiling
  if (profile.annualFamilyIncome <= config.incomeCeilingAmount) {
    passedChecks.push({
      title: 'Income Limit Compliance',
      detail: `Family annual income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} is within the ceiling of ${config.incomeCeilingLabel}.`,
    });
  } else {
    failedChecks.push({
      title: 'Income Ceiling Exceeded',
      reason: `Family annual income ₹${profile.annualFamilyIncome.toLocaleString('en-IN')} exceeds the scheme ceiling of ${config.incomeCeilingLabel}.`,
    });
  }

  // Check 4: Academic Level & Course Fit
  const courseUpper = profile.currentCourse.toLowerCase();
  const yearUpper = profile.currentYear.toLowerCase();

  let academicMatched = false;
  let academicDetail = '';

  switch (schemeId) {
    case 'pre-matric':
      if (courseUpper.includes('class 9') || courseUpper.includes('class 10') || courseUpper.includes('9th') || courseUpper.includes('10th')) {
        academicMatched = true;
        academicDetail = `Enrolled in ${profile.currentCourse} at ${profile.institutionName}`;
      } else {
        failedChecks.push({
          title: 'Academic Level Ineligible',
          reason: `Pre-Matric is restricted to Class 9 and Class 10 students only. Current course is "${profile.currentCourse}".`,
        });
      }
      break;

    case 'post-matric':
      if (
        courseUpper.includes('class 11') || courseUpper.includes('class 12') ||
        courseUpper.includes('11th') || courseUpper.includes('12th') ||
        courseUpper.includes('b.tech') || courseUpper.includes('btech') ||
        courseUpper.includes('b.sc') || courseUpper.includes('ba') ||
        courseUpper.includes('diploma') || courseUpper.includes('polytechnic') ||
        courseUpper.includes('iti') || courseUpper.includes('b.com') ||
        courseUpper.includes('m.sc') || courseUpper.includes('ma') ||
        courseUpper.includes('m.tech')
      ) {
        academicMatched = true;
        academicDetail = `Enrolled in post-secondary course: ${profile.currentCourse}`;
      } else {
        failedChecks.push({
          title: 'Academic Level Ineligible',
          reason: `Post-Matric requires post-secondary enrollment (Class 11, 12, Diploma, UG, or PG). Current course: "${profile.currentCourse}".`,
        });
      }
      break;

    case 'top-class':
      if (
        profile.institutionName.includes('IIT') ||
        profile.institutionName.includes('NIT') ||
        profile.institutionName.includes('AIIMS') ||
        profile.institutionName.includes('IIM') ||
        profile.institutionName.includes('National') ||
        profile.institutionName.includes('Institute of Technology')
      ) {
        academicMatched = true;
        academicDetail = `Admitted in premier notified institution: ${profile.institutionName}`;
      } else {
        failedChecks.push({
          title: 'Institution Not in MoTA Premier Notified List',
          reason: `Top Class Education is only applicable to MoTA notified premier institutions (IITs, NITs, AIIMS, IIMs, NLUs, etc.). Current institution: "${profile.institutionName}".`,
        });
      }
      break;

    case 'nfst':
      if (courseUpper.includes('ph.d') || courseUpper.includes('phd') || courseUpper.includes('m.phil') || courseUpper.includes('research')) {
        academicMatched = true;
        academicDetail = `Enrolled in Doctoral / Research program: ${profile.currentCourse}`;
      } else {
        failedChecks.push({
          title: 'Post-Graduate Research Requirement Not Met',
          reason: `NFST requires full-time registration in M.Phil or Ph.D. programs. Current course: "${profile.currentCourse}".`,
        });
      }
      break;

    case 'nos':
      if (courseUpper.includes('overseas') || courseUpper.includes('master') || courseUpper.includes('m.sc') || profile.institutionName.toLowerCase().includes('university')) {
        academicMatched = true;
        academicDetail = `Academic credentials suitable for overseas master / doctoral track.`;
      } else {
        failedChecks.push({
          title: 'Qualifying Degree Requirement',
          reason: 'National Overseas Scholarship requires admission to a master or doctoral degree program in top 500 QS world universities.',
        });
      }
      break;
  }

  if (academicMatched) {
    passedChecks.push({
      title: 'Academic Qualification Verified',
      detail: academicDetail,
    });
  }

  // Determine overall status
  if (isBlockedByActive) {
    return {
      schemeId,
      schemeName: config.schemeName,
      status: 'blocked_by_active_scholarship',
      statusBadge: 'Blocked (Active Scholarship)',
      passedChecks,
      failedChecks,
      activeSchemeName: activeSchemeObj?.schemeName,
      summaryText: `You cannot apply for this scheme because you are actively receiving benefits under "${activeSchemeObj?.schemeName}".`,
      canProceedToApply: false,
    };
  }

  if (failedChecks.length > 0) {
    return {
      schemeId,
      schemeName: config.schemeName,
      status: 'not_eligible',
      statusBadge: 'Not Eligible',
      passedChecks,
      failedChecks,
      summaryText: `You do not currently satisfy one or more required eligibility conditions: ${failedChecks.map(f => f.title).join(', ')}.`,
      canProceedToApply: false,
    };
  }

  return {
    schemeId,
    schemeName: config.schemeName,
    status: 'eligible',
    statusBadge: 'Eligible to Apply',
    passedChecks,
    failedChecks: [],
    summaryText: `Congratulations! You meet all statutory eligibility criteria for ${config.schemeName}. You can proceed with your application.`,
    canProceedToApply: true,
  };
}

/**
 * Evaluate all 5 schemes simultaneously for the "Can I apply?" comparison dashboard
 */
export function evaluateAllSchemes(
  profile: StudentProfile,
  activeSchemeId?: SchemeId
): EligibilityEvaluationResult[] {
  const schemeKeys: SchemeId[] = ['pre-matric', 'post-matric', 'top-class', 'nfst', 'nos'];
  return schemeKeys.map(id => evaluateEligibility(id, profile, activeSchemeId));
}
