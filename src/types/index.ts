export type SchemeId = 'pre-matric' | 'post-matric' | 'top-class' | 'nfst' | 'nos';

export type SourcePortal = 'NSP' | 'SFMP' | 'NOS_PORTAL';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'institute_verification'
  | 'state_verification'
  | 'sanctioned'
  | 'dbt_initiated'
  | 'disbursed'
  | 'deficiency_raised'
  | 'rejected';

export interface TimelineEvent {
  stage: ApplicationStatus;
  label: string;
  date: string;
  completed: boolean;
  current?: boolean;
  hasDeficiency?: boolean;
  remarks?: string;
  officerDesignation?: string;
  sourceSystem?: SourcePortal;
}

export interface SchemeInfo {
  id: SchemeId;
  name: string;
  code: string;
  shortDesc: string;
  sourcePortal: SourcePortal;
  sourcePortalName: string;
  targetGroup: string;
  incomeCeiling: string;
  maxBenefit: string;
  academicLevel: string;
  color: string;
}

export interface PendingAction {
  id: string;
  schemeId: SchemeId;
  schemeName: string;
  title: string;
  description: string;
  type: 'upload_document' | 'income_mismatch' | 'bank_revalidation' | 'institute_noc';
  deadline: string;
  urgency: 'high' | 'medium' | 'low';
  sourceSystem: SourcePortal;
}

export interface PaymentRecord {
  id: string;
  schemeId: SchemeId;
  schemeName: string;
  academicYear: string;
  installmentNo: number;
  amount: number;
  component: 'Maintenance Allowance' | 'Tuition Fee' | 'Books & Equipment' | 'Contingency' | 'Overseas Living Expenses';
  disbursementDate: string;
  status: 'Disbursed' | 'DBT Initiated' | 'PFMS Processing' | 'Failed';
  bankName: string;
  accountNumberMasked: string; // e.g. "•••• 6789"
  utrNumber: string;
  sourceSystem: SourcePortal;
  pfmsTransactionId: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  email: string;
  tribe: string;
  pvtg: boolean; // Particularly Vulnerable Tribal Group
  casteCertNo: string;
  casteIssuedDate: string;
  state: string;
  district: string;
  pincode: string;
  apaarId?: string; // Automated Permanent Academic Account Registry
  udiseSchoolId?: string;
  aisheCode?: string; // All India Survey on Higher Education
  institutionName: string;
  currentCourse: string;
  currentYear: string;
  annualFamilyIncome: number;
  incomeCertNo: string;
  incomeValidUpto: string;
  bankAccount: {
    accountHolder: string;
    bankName: string;
    accountNoMasked: string;
    ifsc: string;
    aadhaarSeeded: boolean;
  };
  aadhaarMasked: string;
}

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  schemeId: SchemeId;
  schemeName: string;
  academicYear: string;
  currentStatus: ApplicationStatus;
  statusDescription: string;
  submissionDate: string;
  lastUpdated: string;
  sourceSystem: SourcePortal;
  sanctionedAmount?: number;
  disbursedAmount?: number;
  timeline: TimelineEvent[];
  pendingActionIds: string[];
}

export interface Persona {
  id: string;
  name: string;
  role: 'student' | 'parent';
  tagline: string;
  avatarSeed: string;
  profile: StudentProfile;
  activeSchemeId?: SchemeId;
  blockedReason?: string;
  applications: ApplicationRecord[];
  payments: PaymentRecord[];
  pendingActions: PendingAction[];
  // For parent persona
  isParent?: boolean;
  children?: {
    id: string;
    name: string;
    relationship: string;
    schemeId: SchemeId;
    schemeName: string;
    status: ApplicationStatus;
    statusLabel: string;
    institution: string;
    fundsDisbursed: number;
    pendingCount: number;
    profile: StudentProfile;
    applications: ApplicationRecord[];
    payments: PaymentRecord[];
    pendingActions: PendingAction[];
  }[];
}

export interface ConsentItem {
  id: string;
  title: string;
  agency: string;
  purpose: string;
  retention: string;
  dataPoints: string[];
  mandatory: boolean;
  granted: boolean;
}

// ==================== PHASE 2 TYPES ====================

export type EligibilityStatus = 'eligible' | 'not_eligible' | 'blocked_by_active_scholarship';

export interface EligibilityCriterion {
  id: string;
  title: string;
  description: string;
  category: 'caste' | 'income' | 'academic' | 'institution' | 'one_scholarship';
}

export interface SchemeEligibilityConfig {
  schemeId: SchemeId;
  schemeName: string;
  sourcePortal: SourcePortal;
  incomeCeilingAmount: number; // in INR (e.g. 250000)
  incomeCeilingLabel: string;
  minAcademicLevel: string;
  allowedAcademicLevels: string[];
  requiresST: boolean;
  requiresAccreditedInstitute?: string;
  requiresForeignAdmission?: boolean;
  requiresResearchTopic?: boolean;
  maxBenefitSummary: string;
  criteria: EligibilityCriterion[];
}

export interface EligibilityEvaluationResult {
  schemeId: SchemeId;
  schemeName: string;
  status: EligibilityStatus;
  statusBadge: string;
  passedChecks: { title: string; detail: string }[];
  failedChecks: { title: string; reason: string }[];
  activeSchemeName?: string;
  summaryText: string;
  canProceedToApply: boolean;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'readonly' | 'textarea' | 'checkbox';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required: boolean;
  helpText?: string;
  prefillFromProfileKey?: string;
  section?: string;
}

export interface FormStepSchema {
  id: string;
  title: string;
  description: string;
  fields: FormFieldSchema[];
}

export interface SchemeApplicationFormSchema {
  schemeId: SchemeId;
  schemeName: string;
  sourcePortal: SourcePortal;
  academicYear: string;
  steps: FormStepSchema[];
}

export interface DraftApplication {
  id: string;
  schemeId: SchemeId;
  schemeName: string;
  lastSaved: string;
  currentStepIndex: number;
  formData: Record<string, any>;
  isComplete: boolean;
}

export interface ApplicationReceiptData {
  applicationNumber: string;
  schemeId: SchemeId;
  schemeName: string;
  studentName: string;
  fatherName: string;
  tribe: string;
  apaarId: string;
  aadhaarMasked: string;
  institutionName: string;
  course: string;
  annualFamilyIncome: number;
  bankAccountMasked: string;
  bankName: string;
  submissionTimestamp: string;
  sourceSystem: SourcePortal;
  digitalReceiptHash: string;
  nextSteps: string[];
}

// ==========================================
// PHASE 3: VERIFICATION LAYER & WALLET TYPES
// ==========================================

export type VerificationOutcome = 'VERIFIED' | 'MISMATCH' | 'UNAVAILABLE' | 'NOT_APPLICABLE';

export type VerificationProviderId = 
  | 'UIDAI' 
  | 'EDISTRICT' 
  | 'AISHE' 
  | 'UDISE_PLUS' 
  | 'APAAR' 
  | 'UGC_NTA' 
  | 'UDID';

export interface AttributeMatchDetail {
  attributeName: string;
  expectedValue: string;
  retrievedValue: string;
  matchScore: number; // 0 to 100
  isMatch: boolean;
  fuzzyNote?: string;
}

export interface VerificationResult {
  providerId: VerificationProviderId;
  providerName: string;
  description: string;
  outcome: VerificationOutcome;
  confidenceScore: number;
  attributeMatches: AttributeMatchDetail[];
  discrepancyReason?: string;
  isExceptionCreated: boolean;
  isNonBlocking: boolean; // Always true: application never blocked by mismatch or outage
  exceptionResolutionNote?: string;
  timestamp: string;
  transactionId: string;
  latencyMs: number;
  registryReference?: string;
}

export interface VerificationAuditLogEntry {
  id: string;
  timestamp: string;
  providerId: VerificationProviderId;
  providerName: string;
  action: string;
  outcome: VerificationOutcome;
  transactionId: string;
  summary: string;
  actor: 'STUDENT' | 'SYSTEM_ORCHESTRATOR' | 'DWO_OFFICER' | 'INSTITUTE_NODAL';
  rawResponseHash: string;
  nonBlockingNotice?: string;
}

export interface VerificationProvider {
  id: VerificationProviderId;
  name: string;
  shortDescription: string;
  isAvailable: boolean; // can simulate downtime/503 outage
  verify(profile: StudentProfile, schemeId: SchemeId): Promise<VerificationResult>;
}

export interface WalletDocument {
  id: string;
  title: string;
  category: 'Caste' | 'Income' | 'Academic' | 'Identity' | 'Bank' | 'Disability';
  docNumber: string;
  issuer: string;
  issuedDate: string;
  validUntil: string;
  isExpired: boolean;
  source: 'DigiLocker' | 'Manual Upload' | 'e-District' | 'UIDAI';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'EXCEPTION' | 'EXPIRED';
  usedInSchemes: string[];
  fileUri?: string;
  fileSize?: string;
  mimeType?: string;
  digiLockerDocUri?: string;
}

// ==========================================
// PHASE 4: VERIFICATION OFFICER CONSOLE & JAGO
// ==========================================

export type SupportedLanguage = 'en' | 'hi' | 'or' | 'bn' | 'mr' | 'sat' | 'gon';

export type ExceptionCategory = 
  | 'income_discrepancy' 
  | 'name_fuzzy_mismatch' 
  | 'gateway_outage' 
  | 'bank_npc_mapper' 
  | 'institute_noc_pending'
  | 'multiple_scholarships';

export type OfficerCaseStatus = 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'CORRECTION_REQUESTED' 
  | 'REJECTED';

export interface SideBySideDataField {
  field: string;
  label: string;
  enteredValue: string;
  sourceValue: string;
  sourceRegistry: string;
  matchScore?: number;
  hasDiscrepancy: boolean;
  notes?: string;
}

export interface OfficerDecision {
  action: 'APPROVED' | 'CORRECTION_REQUESTED' | 'REJECTED';
  officerId: string;
  officerName: string;
  timestamp: string;
  remarks: string;
  statutoryClause?: string;
  correctionInstructions?: string;
  deficiencyDeadline?: string;
  auditHash: string;
}

export interface OfficerExceptionCase {
  id: string;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  applicantFather: string;
  applicantAadhaarMasked: string;
  applicantTribe: string;
  schemeId: SchemeId;
  schemeName: string;
  institutionName: string;
  district: string;
  state: string;
  submissionDate: string;
  slaAgeDays: number;
  slaTargetDays: number; // usually 15 days per MoTA citizen charter
  slaUrgency: 'critical' | 'warning' | 'normal';
  exceptionCategory: ExceptionCategory;
  exceptionTitle: string;
  exceptionDescription: string;
  status: OfficerCaseStatus;
  sideBySideFields: SideBySideDataField[];
  uploadedDocTitle?: string;
  uploadedDocCategory?: string;
  decision?: OfficerDecision;
}

export type JagoToolName = 
  | 'getApplicationStatus' 
  | 'getPaymentDetails' 
  | 'getDeficienciesAndExceptions' 
  | 'checkSchemeEligibility' 
  | 'getRequiredDocuments';

export interface JagoToolExecution {
  toolName: JagoToolName;
  inputArguments: Record<string, any>;
  outputResult: any;
  executionTimeMs: number;
  isPrivacyRefusal?: boolean;
}

export type JagoChatMessage = {
  id: string;
  sender: 'user' | 'jago' | 'system';
  text: string;
  timestamp: string;
  toolsExecuted?: JagoToolExecution[];
  isPrivacyViolationBlocked?: boolean;
  readAloudAudioState?: 'idle' | 'playing' | 'paused';
};

// ==========================================
// PHASE 5: NOTIFICATIONS & MINISTRY DASHBOARD
// ==========================================

export type NotificationChannel = 'IN_APP' | 'SMS' | 'WHATSAPP';

export type NotificationEventType = 
  | 'DBT_DISBURSED' 
  | 'DWO_CORRECTION_REQUESTED' 
  | 'APPLICATION_SUBMITTED' 
  | 'DEFICIENCY_RESOLVED' 
  | 'SCHOLARSHIP_SANCTIONED' 
  | 'RENEWAL_ALERT' 
  | 'OUTREACH_NUDGE';

export interface NotificationDeliveryDetails {
  inApp: boolean;
  sms: {
    sent: boolean;
    dltHeader: string; // e.g. "AX-MOTAGOI", "JM-NSPST"
    timestamp: string;
    text: string;
    dltTemplateId: string;
  };
  whatsApp: {
    sent: boolean;
    timestamp: string;
    text: string;
    templateId: string;
    quickReplies?: string[];
  };
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  eventType: NotificationEventType;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  priority: 'critical' | 'high' | 'normal';
  delivery: NotificationDeliveryDetails;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    applicationId?: string;
    applicationNumber?: string;
    schemeName?: string;
    amount?: number;
    utrNumber?: string;
    deadline?: string;
    bankName?: string;
    dwoRemarks?: string;
  };
}

export type RegistrationStage = 
  | 'UNREGISTERED'
  | 'DRAFTED'
  | 'SUBMITTED'
  | 'INSTITUTE_VERIFIED'
  | 'DWO_EXCEPTION'
  | 'SANCTIONED'
  | 'DISBURSED';

export type OutreachStatus = 
  | 'NOT_CONTACTED'
  | 'SMS_SENT'
  | 'WHATSAPP_SENT'
  | 'FIELD_MITRA_ASSIGNED'
  | 'CONVERTED';

export interface CohortStudent {
  id: string;
  apaarHash: string; // e.g. SHA256:7f8a...9c2d
  apaarMasked: string; // e.g. APAAR-***-8492
  studentNameMasked: string; // e.g. Sunita M****
  gender: 'Female' | 'Male' | 'Other';
  tribe: string;
  state: string;
  district: string;
  institutionName: string;
  institutionCategory: 'Higher Education' | 'Senior Secondary' | 'EMRS / Ashram' | 'Vocational';
  eligibleSchemeId: SchemeId;
  eligibleSchemeName: string;
  annualFamilyIncome: number;
  registrationStatus: RegistrationStage;
  matchedAt?: string;
  outreachStatus: OutreachStatus;
  outreachLastDate?: string;
  outreachChannel?: 'SMS' | 'WHATSAPP' | 'FIELD_VISIT';
  conversionDate?: string;
  outreachHistory?: Array<{
    timestamp: string;
    channel: string;
    dltTemplateId: string;
    status: string;
    notes?: string;
  }>;
}

export interface CoverageGapStats {
  totalCohort: number;
  registeredCount: number;
  unregisteredCount: number;
  coverageRate: number; // e.g. 71.5%
  gapRate: number; // e.g. 28.5%
  outreachInitiatedCount: number;
  outreachConvertedCount: number;
  conversionRate: number;
}

export interface FunnelStageData {
  stageKey: string;
  stageName: string;
  count: number;
  percentageOfCohort: number;
  dropOffFromPrevious: number;
  primaryDropReason: string;
  statutorySlaDays: string;
}

export interface ExceptionMetricData {
  category: ExceptionCategory;
  categoryLabel: string;
  count: number;
  percentage: number;
  averageResolutionDays: number;
  statutoryThresholdDays: number;
  autoResolvedPct: number;
  dwoApprovedPct: number;
  rejectedPct: number;
  frictionLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
}




