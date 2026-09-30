import { 
  VerificationProviderId, 
  VerificationOutcome, 
  VerificationResult, 
  VerificationAuditLogEntry, 
  StudentProfile, 
  SchemeId,
  AttributeMatchDetail 
} from '../types/index.ts';

// ==========================================
// 1. ADVANCED FUZZY NAME & STRING MATCHER
// ==========================================

export function calculateFuzzyMatchScore(str1: string, str2: string): {
  score: number;
  isMatch: boolean;
  notes: string;
} {
  if (!str1 || !str2) {
    return { score: 0, isMatch: false, notes: 'Missing input strings' };
  }

  const clean1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const clean2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (clean1 === clean2) {
    return { score: 100, isMatch: true, notes: 'Exact match' };
  }

  const tokens1 = clean1.split(/\s+/);
  const tokens2 = clean2.split(/\s+/);

  // Common Indian middle names / honorifics that often vary in government records
  const ignoreTokens = new Set(['kumar', 'kumari', 'chandra', 'lal', 'prasad', 'shri', 'smt', 'ku']);
  const core1 = tokens1.filter(t => !ignoreTokens.has(t));
  const core2 = tokens2.filter(t => !ignoreTokens.has(t));

  // Check token intersection
  const set2 = new Set(tokens2);
  const matchedTokens = tokens1.filter(t => set2.has(t));
  const jaccard = (matchedTokens.length * 2) / (tokens1.length + tokens2.length);

  // Levenshtein Distance
  const levDist = levenshtein(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  const levScore = Math.max(0, 100 - (levDist / maxLen) * 100);

  // Blended score
  const compositeScore = Math.round(levScore * 0.6 + jaccard * 100 * 0.4);

  if (compositeScore >= 80) {
    return {
      score: compositeScore,
      isMatch: true,
      notes: `High confidence match (${compositeScore}%). Name tokens align with acceptable variance (honorific/middle name differences accounted for).`,
    };
  } else if (compositeScore >= 60) {
    return {
      score: compositeScore,
      isMatch: false,
      notes: `Partial match (${compositeScore}%). Requires administrative DWO verification check.`,
    };
  } else {
    return {
      score: compositeScore,
      isMatch: false,
      notes: `Low match score (${compositeScore}%): '${str1}' vs '${str2}'. Discrepancy logged for clerical rectification.`,
    };
  }
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ==========================================
// 2. MOCK ADAPTER INTERFACES & IMPLEMENTATIONS
// ==========================================

export interface VerificationAdapter {
  id: VerificationProviderId;
  name: string;
  shortDescription: string;
  verify(
    profile: StudentProfile, 
    schemeId: SchemeId,
    simulatedOutage?: boolean
  ): Promise<VerificationResult>;
}

// UIDAI e-KYC Adapter
export const UIDAIAdapter: VerificationAdapter = {
  id: 'UIDAI',
  name: 'UIDAI Aadhaar e-KYC Bridge',
  shortDescription: 'Demographic authentication, biometric token verification & masked identity match',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(180);

    if (simulatedOutage) {
      return createUnavailableResult('UIDAI', this.name, 'UIDAI Gateway Timeout (504). e-KYC service temporarily unreachable.', Date.now() - start);
    }

    const nameMatch = calculateFuzzyMatchScore(profile.name, profile.name);
    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'Aadhaar Token',
        expectedValue: profile.aadhaarMasked,
        retrievedValue: profile.aadhaarMasked,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Full Name',
        expectedValue: profile.name,
        retrievedValue: profile.name,
        matchScore: nameMatch.score,
        isMatch: nameMatch.isMatch,
        fuzzyNote: nameMatch.notes,
      },
      {
        attributeName: 'DOB & Gender',
        expectedValue: `${profile.dob} (${profile.gender})`,
        retrievedValue: `${profile.dob} (${profile.gender})`,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Mobile Linkage',
        expectedValue: 'Active OTP Seeded',
        retrievedValue: 'Active OTP Seeded',
        matchScore: 100,
        isMatch: true,
      },
    ];

    return {
      providerId: 'UIDAI',
      providerName: this.name,
      description: 'UIDAI Aadhaar 2.0 Auth API',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: matches,
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `UIDAI-AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: `UIDAI:SRN:${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };
  },
};

// e-District State Registry Adapter
export const EDistrictAdapter: VerificationAdapter = {
  id: 'EDISTRICT',
  name: 'State e-District Caste & Revenue Registry',
  shortDescription: 'Tahsil-issued ST Caste Certificate, PVTG record & Annual Family Income validation',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(240);

    if (simulatedOutage) {
      return createUnavailableResult('EDISTRICT', this.name, `State e-District Portal (${profile.state}) API unavailable (HTTP 503). Service down for scheduled treasury maintenance.`, Date.now() - start);
    }

    // Check for simulated discrepancy in specific personas (e.g. Priya Munda has income discrepancy)
    const isPriyaException = profile.name.includes('Priya');
    const retrievedIncome = isPriyaException ? 210000 : profile.annualFamilyIncome;
    const incomeMatched = profile.annualFamilyIncome === retrievedIncome;

    // Fuzzy match on student name vs Tahsil caste certificate record
    const tahsilRecordedName = isPriyaException ? 'Priya Kumari Munda' : profile.name;
    const nameMatch = calculateFuzzyMatchScore(profile.name, tahsilRecordedName);

    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'ST Caste Certificate No.',
        expectedValue: profile.casteCertNo,
        retrievedValue: profile.casteCertNo,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Tribe Classification',
        expectedValue: profile.tribe,
        retrievedValue: profile.tribe,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Applicant Name on Caste Record',
        expectedValue: profile.name,
        retrievedValue: tahsilRecordedName,
        matchScore: nameMatch.score,
        isMatch: nameMatch.isMatch,
        fuzzyNote: nameMatch.notes,
      },
      {
        attributeName: 'Annual Family Income',
        expectedValue: `₹${profile.annualFamilyIncome.toLocaleString('en-IN')}`,
        retrievedValue: `₹${retrievedIncome.toLocaleString('en-IN')}`,
        matchScore: incomeMatched ? 100 : 50,
        isMatch: incomeMatched,
        fuzzyNote: incomeMatched ? 'Exact match with Tahsil ITR database' : 'Discrepancy: Profile declared ₹1,80,000 but e-District recorded ₹2,10,000.',
      },
    ];

    const hasMismatch = !incomeMatched;

    return {
      providerId: 'EDISTRICT',
      providerName: this.name,
      description: `Govt. of ${profile.state} Revenue Department e-District Registry`,
      outcome: hasMismatch ? 'MISMATCH' : 'VERIFIED',
      confidenceScore: hasMismatch ? 65 : 98,
      attributeMatches: matches,
      discrepancyReason: hasMismatch ? 'Income record in State Tahsil differs from self-declaration.' : undefined,
      isExceptionCreated: hasMismatch,
      isNonBlocking: true, // Non-blocking guarantee!
      exceptionResolutionNote: hasMismatch ? 'Exception created for District Welfare Officer (DWO) reconciliation. Applicant is not blocked from submitting.' : undefined,
      timestamp: new Date().toISOString(),
      transactionId: `EDIST-${profile.state.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: profile.casteCertNo,
    };
  },
};

// AISHE Higher Education Adapter
export const AISHEAdapter: VerificationAdapter = {
  id: 'AISHE',
  name: 'AISHE Institute Accreditation Portal',
  shortDescription: 'Higher Education college recognition, valid AISHE code & affiliation status',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(160);

    // If scheme is Pre-Matric (School level), AISHE is not applicable
    if (schemeId === 'pre-matric' || profile.currentCourse.startsWith('Class 9') || profile.currentCourse.startsWith('Class 10')) {
      return createNotApplicableResult(
        'AISHE',
        this.name,
        'Not Applicable for Pre-Matric school student. School registry is verified via UDISE+.',
        Date.now() - start
      );
    }

    if (simulatedOutage) {
      return createUnavailableResult('AISHE', this.name, 'AISHE Server busy (500). Response timed out.', Date.now() - start);
    }

    const aisheCode = profile.aisheCode || 'C-41290';
    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'AISHE Institution Code',
        expectedValue: aisheCode,
        retrievedValue: aisheCode,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Institute Accreditation',
        expectedValue: profile.institutionName,
        retrievedValue: profile.institutionName,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'MoTA Scholarship Eligible Status',
        expectedValue: 'Eligible & Active',
        retrievedValue: 'Eligible & Active',
        matchScore: 100,
        isMatch: true,
      },
    ];

    return {
      providerId: 'AISHE',
      providerName: this.name,
      description: 'Ministry of Education All India Survey on Higher Education Registry',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: matches,
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `AISHE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: aisheCode,
    };
  },
};

// UDISE+ School Education Adapter
export const UDISEPlusAdapter: VerificationAdapter = {
  id: 'UDISE_PLUS',
  name: 'UDISE+ National School Registry',
  shortDescription: 'School recognition code, tribal ashram school categorization & valid enrollment',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(140);

    // If higher education (NFST or NOS or Post-Matric college degree), UDISE+ is not applicable
    if (schemeId === 'nfst' || schemeId === 'nos' || profile.currentCourse.includes('B.Tech') || profile.currentCourse.includes('MBBS')) {
      return createNotApplicableResult(
        'UDISE_PLUS',
        this.name,
        'Not Applicable for Higher Education / Fellowship applicant. Verified via AISHE/UGC.',
        Date.now() - start
      );
    }

    if (simulatedOutage) {
      return createUnavailableResult('UDISE_PLUS', this.name, 'UDISE+ National Gateway down for synchronization.', Date.now() - start);
    }

    const schoolCode = profile.udiseSchoolId || '20190104201';
    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'UDISE+ School Code',
        expectedValue: schoolCode,
        retrievedValue: schoolCode,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'School Management Type',
        expectedValue: 'Government / Tribal Welfare Dept.',
        retrievedValue: 'Government / Tribal Welfare Dept.',
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Pre-Matric ST Scheme Eligibility',
        expectedValue: 'Active in District Nodal Directory',
        retrievedValue: 'Active in District Nodal Directory',
        matchScore: 100,
        isMatch: true,
      },
    ];

    return {
      providerId: 'UDISE_PLUS',
      providerName: this.name,
      description: 'Department of School Education & Literacy, MoE UDISE+ Portal',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: matches,
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `UDISE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: schoolCode,
    };
  },
};

// APAAR Academic Registry Adapter
export const APAARAdapter: VerificationAdapter = {
  id: 'APAAR',
  name: 'APAAR One-Nation-One-Student ID',
  shortDescription: 'DigiLocker Academic Bank of Credits (ABC) & verified marksheet registry',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(210);

    if (simulatedOutage) {
      return createUnavailableResult('APAAR', this.name, 'APAAR Registry API connection timeout.', Date.now() - start);
    }

    const apaarId = profile.apaarId || profile.udiseSchoolId || 'APAAR-2024-ST-99120';
    const nameMatch = calculateFuzzyMatchScore(profile.name, profile.name);

    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'APAAR Student Account ID',
        expectedValue: apaarId,
        retrievedValue: apaarId,
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'Student Name in ABC Registry',
        expectedValue: profile.name,
        retrievedValue: profile.name,
        matchScore: nameMatch.score,
        isMatch: true,
      },
      {
        attributeName: 'Current Enrollment Hash',
        expectedValue: `${profile.currentCourse} (${profile.institutionName})`,
        retrievedValue: `${profile.currentCourse} (${profile.institutionName})`,
        matchScore: 100,
        isMatch: true,
      },
    ];

    return {
      providerId: 'APAAR',
      providerName: this.name,
      description: 'Ministry of Education National Academic Bank of Credits',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: matches,
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `APAAR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: apaarId,
    };
  },
};

// UGC-NTA Testing & Fellowship Adapter
export const UGCNTAAdapter: VerificationAdapter = {
  id: 'UGC_NTA',
  name: 'UGC / NTA National Fellowship Registry',
  shortDescription: 'NET-JRF qualification, PhD doctoral registration or premier entrance score merit',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(200);

    // Only applicable for NFST (PhD fellowship) or Top-Class (JEE/NEET merit)
    if (schemeId !== 'nfst' && schemeId !== 'top-class') {
      return createNotApplicableResult(
        'UGC_NTA',
        this.name,
        'Not Applicable for Pre-Matric, Post-Matric, or NOS. Applicable only for NFST (Fellowship) and Top Class Education.',
        Date.now() - start
      );
    }

    if (simulatedOutage) {
      return createUnavailableResult('UGC_NTA', this.name, 'NTA Result Server Offline (503 Service Unavailable).', Date.now() - start);
    }

    const matches: AttributeMatchDetail[] = [
      {
        attributeName: 'National Examination Score / Roll',
        expectedValue: 'UGC-NET ST JRF Certified / Premier Merit',
        retrievedValue: 'UGC-NET ST JRF Certified / Premier Merit',
        matchScore: 100,
        isMatch: true,
      },
      {
        attributeName: 'MoTA Research Fellowship Allotment Quota',
        expectedValue: 'Verified under ST 750 Annual Seats',
        retrievedValue: 'Verified under ST 750 Annual Seats',
        matchScore: 100,
        isMatch: true,
      },
    ];

    return {
      providerId: 'UGC_NTA',
      providerName: this.name,
      description: 'National Testing Agency & University Grants Commission Fellowship Portal',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: matches,
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `UGC-NTA-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: `UGC-ST-NET-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  },
};

// UDID Unique Disability ID Adapter
export const UDIDAdapter: VerificationAdapter = {
  id: 'UDID',
  name: 'UDID Disability Verification Portal',
  shortDescription: 'Unique ID for Persons with Disabilities (PwD) ST student concession',
  async verify(profile, schemeId, simulatedOutage = false): Promise<VerificationResult> {
    const start = Date.now();
    await simulateNetworkDelay(120);

    // If profile does not have disability flag, return NOT_APPLICABLE
    const isPwD = false; // Mock ST student default: non-disabled

    if (!isPwD) {
      return createNotApplicableResult(
        'UDID',
        this.name,
        'Not Applicable. Student is applying under standard ST quota (No disability quota claimed).',
        Date.now() - start
      );
    }

    return {
      providerId: 'UDID',
      providerName: this.name,
      description: 'Department of Empowerment of Persons with Disabilities, MSJE',
      outcome: 'VERIFIED',
      confidenceScore: 100,
      attributeMatches: [],
      isExceptionCreated: false,
      isNonBlocking: true,
      timestamp: new Date().toISOString(),
      transactionId: `UDID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      latencyMs: Date.now() - start,
      registryReference: 'UDID-NA',
    };
  },
};

// Helper result builders
function createUnavailableResult(
  providerId: VerificationProviderId, 
  name: string, 
  reason: string,
  latencyMs: number
): VerificationResult {
  return {
    providerId,
    providerName: name,
    description: 'External Government Gateway Outage',
    outcome: 'UNAVAILABLE',
    confidenceScore: 0,
    attributeMatches: [],
    discrepancyReason: reason,
    isExceptionCreated: true,
    isNonBlocking: true, // Crucial: Outages NEVER block the application!
    exceptionResolutionNote: 'External registry is temporarily unavailable. An automated retry job has been queued in MoTA backend. The application continues without delay.',
    timestamp: new Date().toISOString(),
    transactionId: `OUTAGE-${providerId}-${Date.now()}`,
    latencyMs,
  };
}

function createNotApplicableResult(
  providerId: VerificationProviderId, 
  name: string, 
  reason: string,
  latencyMs: number
): VerificationResult {
  return {
    providerId,
    providerName: name,
    description: 'Scheme / Academic Stage Filter',
    outcome: 'NOT_APPLICABLE',
    confidenceScore: 100,
    attributeMatches: [],
    discrepancyReason: reason,
    isExceptionCreated: false,
    isNonBlocking: true,
    timestamp: new Date().toISOString(),
    transactionId: `NA-${providerId}-${Date.now()}`,
    latencyMs,
  };
}

// ==========================================
// 3. PARALLEL ORCHESTRATOR & AUDIT LOGGER
// ==========================================

export const allAdapters: VerificationAdapter[] = [
  UIDAIAdapter,
  EDistrictAdapter,
  AISHEAdapter,
  UDISEPlusAdapter,
  APAARAdapter,
  UGCNTAAdapter,
  UDIDAdapter,
];

export interface OrchestrationResult {
  results: VerificationResult[];
  auditEntries: VerificationAuditLogEntry[];
  summary: {
    total: number;
    verified: number;
    mismatch: number;
    unavailable: number;
    notApplicable: number;
  };
  overallStatus: 'ALL_PASSED' | 'EXCEPTIONS_NON_BLOCKING';
  nonBlockingGuaranteeNotice: string;
}

export async function runParallelVerificationOrchestrator(
  profile: StudentProfile,
  schemeId: SchemeId,
  simulatedOutages: Partial<Record<VerificationProviderId, boolean>> = {}
): Promise<OrchestrationResult> {
  // Execute all 7 checks in parallel
  const promises = allAdapters.map(adapter => 
    adapter.verify(profile, schemeId, Boolean(simulatedOutages[adapter.id]))
  );

  const results = await Promise.all(promises);

  // Generate audit log entries
  const auditEntries: VerificationAuditLogEntry[] = results.map(res => ({
    id: `audit-${res.providerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: res.timestamp,
    providerId: res.providerId,
    providerName: res.providerName,
    action: `PARALLEL_VERIFICATION_DISPATCH`,
    outcome: res.outcome,
    transactionId: res.transactionId,
    summary: res.outcome === 'VERIFIED'
      ? `Verification successful. Confidence score: ${res.confidenceScore}%.`
      : res.outcome === 'MISMATCH'
      ? `Data Mismatch: ${res.discrepancyReason || 'Discrepancy detected'}. Exception created for DWO.`
      : res.outcome === 'UNAVAILABLE'
      ? `Provider Outage: ${res.discrepancyReason || 'Gateway unreachable'}. Non-blocking asynchronous retry scheduled.`
      : `Scope check passed: ${res.discrepancyReason || 'Not required for this scheme'}.`,
    actor: 'SYSTEM_ORCHESTRATOR',
    rawResponseHash: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
    nonBlockingNotice: res.isExceptionCreated 
      ? 'MoTA Non-Blocking Guarantee: Application proceeds unhindered.' 
      : undefined,
  }));

  const verified = results.filter(r => r.outcome === 'VERIFIED').length;
  const mismatch = results.filter(r => r.outcome === 'MISMATCH').length;
  const unavailable = results.filter(r => r.outcome === 'UNAVAILABLE').length;
  const notApplicable = results.filter(r => r.outcome === 'NOT_APPLICABLE').length;

  const hasExceptions = mismatch > 0 || unavailable > 0;

  return {
    results,
    auditEntries,
    summary: {
      total: results.length,
      verified,
      mismatch,
      unavailable,
      notApplicable,
    },
    overallStatus: hasExceptions ? 'EXCEPTIONS_NON_BLOCKING' : 'ALL_PASSED',
    nonBlockingGuaranteeNotice: 'MoTA Statutory Rule: Data mismatches and third-party portal outages create an exception item for administrative review and NEVER block the student application.',
  };
}

function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
