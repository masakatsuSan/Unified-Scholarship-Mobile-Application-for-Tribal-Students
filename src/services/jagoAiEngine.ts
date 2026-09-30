import { 
  StudentProfile, 
  ApplicationRecord, 
  PaymentRecord, 
  PendingAction, 
  SchemeId, 
  JagoToolName, 
  JagoToolExecution 
} from '../types/index.ts';
import { schemesData } from '../data/seedData.ts';

export interface JagoContext {
  studentProfile: StudentProfile;
  applications: ApplicationRecord[];
  payments: PaymentRecord[];
  pendingActions: PendingAction[];
  language: string;
}

export interface JagoResponse {
  answerText: string;
  toolsExecuted: JagoToolExecution[];
  isPrivacyRefusal: boolean;
}

// ----------------------------------------------------
// Privacy Guard: Check if query targets other applicants
// ----------------------------------------------------
const knownOtherNames = [
  'priya', 'manoj', 'sunil', 'anita', 'birsa', 'vikram', 'rahul', 'somra', 
  'pooja', 'sukra', 'maya', 'anil', 'rohit', 'suresh', 'kabita', 'shankar', 'sunita',
  'friend', 'someone else', 'other student', 'another applicant', 'classmate'
];

export function checkPrivacyViolation(query: string, currentStudentName: string): boolean {
  const lower = query.toLowerCase();
  const currentTokens = currentStudentName.toLowerCase().split(/\s+/);

  // If asking specifically about another individual
  for (const name of knownOtherNames) {
    // If the name is part of current student's own name, it's not a violation
    if (currentTokens.includes(name)) continue;

    // Check if the query asks about this third party
    const patterns = [
      new RegExp(`\\b${name}'s\\b`, 'i'),
      new RegExp(`\\b${name} का\\b`, 'i'),
      new RegExp(`\\b${name} की\\b`, 'i'),
      new RegExp(`\\b${name} এর\\b`, 'i'),
      new RegExp(`\\babout ${name}\\b`, 'i'),
      new RegExp(`\\bstatus of ${name}\\b`, 'i'),
      new RegExp(`\\bpayment of ${name}\\b`, 'i'),
      new RegExp(`\\b${name}\\b.*(status|payment|account|money|scholarship|utr|bank)`, 'i'),
      new RegExp(`(status|payment|account|money|scholarship|utr|bank).*\\b${name}\\b`, 'i'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return true;
      }
    }
  }

  if (lower.includes('other student') || lower.includes('someone else') || lower.includes('another student') || lower.includes('दूसरे छात्र')) {
    return true;
  }

  return false;
}

// ----------------------------------------------------
// 5 Built-in Specialized MoTA Tools
// ----------------------------------------------------

export function toolGetApplicationStatus(
  ctx: JagoContext, 
  args: { applicationId?: string; schemeId?: string }
): { applications: any[] } {
  const apps = ctx.applications.filter(app => {
    if (args.applicationId && !app.applicationNumber.toLowerCase().includes(args.applicationId.toLowerCase())) {
      return false;
    }
    if (args.schemeId && app.schemeId !== args.schemeId) {
      return false;
    }
    return true;
  });

  return {
    applications: apps.map(a => ({
      applicationNumber: a.applicationNumber,
      schemeName: a.schemeName,
      academicYear: a.academicYear,
      currentStatus: a.currentStatus,
      statusDescription: a.statusDescription,
      submissionDate: a.submissionDate,
      sanctionedAmount: a.sanctionedAmount || 0,
      sourceSystem: a.sourceSystem,
      recentTimelineEvent: a.timeline[a.timeline.length - 1] || null,
    })),
  };
}

export function toolGetPaymentDetails(
  ctx: JagoContext,
  args: { academicYear?: string; schemeId?: string }
): { payments: any[]; totalDisbursed: number; activeAadhaarBank: any } {
  const payments = ctx.payments.filter(p => {
    if (args.academicYear && p.academicYear !== args.academicYear) return false;
    if (args.schemeId && p.schemeId !== args.schemeId) return false;
    return true;
  });

  const totalDisbursed = payments
    .filter(p => p.status === 'Disbursed')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    payments: payments.map(p => ({
      schemeName: p.schemeName,
      academicYear: p.academicYear,
      installmentNo: p.installmentNo,
      amount: p.amount,
      component: p.component,
      disbursementDate: p.disbursementDate,
      status: p.status,
      bankName: p.bankName,
      accountNumberMasked: p.accountNumberMasked,
      utrNumber: p.utrNumber,
      pfmsTransactionId: p.pfmsTransactionId,
      sourceSystem: p.sourceSystem,
    })),
    totalDisbursed,
    activeAadhaarBank: {
      bankName: ctx.studentProfile.bankAccount.bankName,
      accountNoMasked: ctx.studentProfile.bankAccount.accountNoMasked,
      ifsc: ctx.studentProfile.bankAccount.ifsc,
      aadhaarSeeded: ctx.studentProfile.bankAccount.aadhaarSeeded,
    },
  };
}

export function toolGetDeficienciesAndExceptions(
  ctx: JagoContext,
  _args: Record<string, any>
): { pendingActions: any[]; activeExceptions: any[] } {
  const exceptionsInApps = ctx.applications.flatMap(app => 
    app.timeline.filter(t => t.hasDeficiency).map(t => ({
      applicationNumber: app.applicationNumber,
      schemeName: app.schemeName,
      stage: t.stage,
      remarks: t.remarks,
      officerDesignation: t.officerDesignation,
    }))
  );

  return {
    pendingActions: ctx.pendingActions.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      urgency: a.urgency,
      deadline: a.deadline,
      schemeName: a.schemeName,
    })),
    activeExceptions: exceptionsInApps,
  };
}

export function toolCheckSchemeEligibility(
  ctx: JagoContext,
  args: { schemeId?: SchemeId }
): { evaluatedSchemes: any[] } {
  const targetSchemes = args.schemeId 
    ? schemesData.filter(s => s.id === args.schemeId) 
    : schemesData;

  const profile = ctx.studentProfile;
  const activeApp = ctx.applications.find(a => 
    ['sanctioned', 'dbt_initiated', 'disbursed', 'state_verification'].includes(a.currentStatus)
  );

  const results = targetSchemes.map(sch => {
    const isIncomeEligible = 
      sch.id === 'pre-matric' ? profile.annualFamilyIncome <= 250000 :
      sch.id === 'post-matric' ? profile.annualFamilyIncome <= 250000 :
      sch.id === 'top-class' ? profile.annualFamilyIncome <= 600000 :
      sch.id === 'nfst' ? true : // Merit based
      sch.id === 'nos' ? profile.annualFamilyIncome <= 600000 : false;

    const isST = Boolean(profile.tribe);

    const isAcademicEligible = 
      sch.id === 'pre-matric' ? profile.currentCourse.toLowerCase().includes('class') || profile.currentCourse.toLowerCase().includes('ix') || profile.currentCourse.toLowerCase().includes('x') :
      sch.id === 'post-matric' ? !profile.currentCourse.toLowerCase().includes('class ix') :
      sch.id === 'top-class' ? Boolean(profile.aisheCode) :
      sch.id === 'nfst' ? true :
      sch.id === 'nos' ? true : false;

    const isBlockedByOneScholarship = Boolean(activeApp && activeApp.schemeId !== sch.id);

    const isOverallEligible = isIncomeEligible && isST && isAcademicEligible && !isBlockedByOneScholarship;

    return {
      schemeId: sch.id,
      schemeName: sch.name,
      isOverallEligible,
      isIncomeEligible,
      incomeCeiling: sch.incomeCeiling,
      studentIncome: profile.annualFamilyIncome,
      isST,
      tribe: profile.tribe,
      isAcademicEligible,
      currentCourse: profile.currentCourse,
      isBlockedByOneScholarship,
      activeScholarshipName: activeApp ? activeApp.schemeName : null,
      maxBenefit: sch.maxBenefit,
    };
  });

  return { evaluatedSchemes: results };
}

export function toolGetRequiredDocuments(
  _ctx: JagoContext,
  args: { schemeId?: SchemeId }
): { schemeId: SchemeId; schemeName: string; documents: any[] } {
  const schemeId = args.schemeId || 'post-matric';
  const scheme = schemesData.find(s => s.id === schemeId) || schemesData[1];

  const docs = [
    {
      title: 'Scheduled Tribe (ST) Caste Certificate',
      issuer: 'State Revenue Department / Tehsildar',
      mandatory: true,
      availableInDigiLocker: true,
      validity: 'Lifetime (Perpetual)',
      description: 'Digitally verified caste/tribe certificate with Barcode or Digital Signature.',
    },
    {
      title: 'Annual Family Income Certificate',
      issuer: 'Competent Tahsil / Revenue Authority',
      mandatory: schemeId !== 'nfst',
      availableInDigiLocker: true,
      validity: 'Current Financial Year (Expires March 31)',
      description: 'Revenue authority certificate confirming annual income below statutory ceiling.',
    },
    {
      title: 'APAAR ID / ABC Academic Registry Card',
      issuer: 'Ministry of Education & Academic Bank of Credits',
      mandatory: true,
      availableInDigiLocker: true,
      validity: 'Perpetual Academic Record',
      description: '12-digit APAAR ID confirming verified school/college enrollment & marks.',
    },
    {
      title: 'Aadhaar Card with Bank Seeding Confirmation',
      issuer: 'UIDAI & NPCI Mapper',
      mandatory: true,
      availableInDigiLocker: true,
      validity: 'Active Status',
      description: 'Masked Aadhaar linked with core banking system for Direct Benefit Transfer (DBT).',
    },
  ];

  if (schemeId === 'top-class') {
    docs.push({
      title: 'Premier Institute Admission & Fee Structure Letter',
      issuer: 'IIT / IIM / NIT / AIIMS Nodal Registrar',
      mandatory: true,
      availableInDigiLocker: false,
      validity: 'Academic Session',
      description: 'Breakdown of non-refundable tuition fees and living hostel expenses.',
    });
  } else if (schemeId === 'nfst') {
    docs.push({
      title: 'UGC-NET / CSIR-NET / GATE Qualified Score Card',
      issuer: 'National Testing Agency (NTA)',
      mandatory: true,
      availableInDigiLocker: true,
      validity: 'Valid Fellowship Window',
      description: 'Qualifying award certificate for full-time Ph.D. research.',
    });
  } else if (schemeId === 'nos') {
    docs.push({
      title: 'Unconditional Admission Offer from Top 500 QS University',
      issuer: 'Accredited Foreign University Registrar',
      mandatory: true,
      availableInDigiLocker: false,
      validity: 'Current Admission Term',
      description: 'Unconditional admission letter with 18-month valid Indian passport copy.',
    });
  }

  return {
    schemeId,
    schemeName: scheme.name,
    documents: docs,
  };
}

// ----------------------------------------------------
// Multilingual Grounded Answer Generator
// Strictly answers ONLY from tool outputs!
// ----------------------------------------------------

export async function processJagoQuery(
  userQuery: string,
  ctx: JagoContext
): Promise<JagoResponse> {
  const lower = userQuery.toLowerCase().trim();
  const studentName = ctx.studentProfile.name;
  const lang = ctx.language || 'en';

  // 1. PRIVACY GUARD CHECK
  if (checkPrivacyViolation(userQuery, studentName)) {
    const refusalMsgs: Record<string, string> = {
      en: `🔒 Access Denied: In accordance with Section 6 of the Digital Personal Data Protection (DPDP) Act 2023 and Ministry of Tribal Affairs privacy guidelines, I am only authorized to access information for your authenticated profile (${studentName}). I am strictly prohibited from sharing or disclosing details of other applicants.`,
      hi: `🔒 अनुमति अस्वीकृत: डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 की धारा 6 और जनजातीय कार्य मंत्रालय (MoTA) की गोपनीयता नियमावली के तहत, मैं केवल आपके प्रमाणित प्रोफाइल (${studentName}) की जानकारी प्रदान करने के लिए अधिकृत हूँ। मुझे अन्य छात्रों का डेटा साझा करने की सख्त मनाही है।`,
      bn: `🔒 অ্যাক্সেস প্রত্যাখ্যাত: ডিজিটাল ব্যক্তিগত ডেটা সুরক্ষা (DPDP) আইন ২০২৩ এর ধারা ৬ এবং জনজাতি বিষয়ক মন্ত্রণালয়ের নির্দেশিকা অনুযায়ী, আমি শুধুমাত্র আপনার প্রোফাইলের (${studentName}) তথ্যের উত্তর দিতে পারি। অন্য আবেদনকারীর তথ্য প্রকাশ করা নিষিদ্ধ।`,
      or: `🔒 ପ୍ରବେଶ ଅନୁମତି ନାହିଁ: ଡିଜିଟାଲ ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ସୁରକ୍ଷା (DPDP) ଅଧିନିୟମ ୨୦୨୩ ଏବଂ ଜନଜାତି ବ୍ୟାପାର ମନ୍ତ୍ରଣାଳୟ ନିୟମ ଅନୁସାରେ, ମୁଁ କେବଳ ଆପଣଙ୍କ ପ୍ରମାଣିତ ପ୍ରୋଫାଇଲ୍ (${studentName}) ତଥ୍ୟ ଦେଇପାରିବି। ଅନ୍ୟ ଛାତ୍ରଙ୍କ ତଥ୍ୟ ଦେବା ନିଷେଧ।`,
      sat: `🔒 ᱫᱟᱣ ᱵᱟᱹᱱᱩᱜᱼᱟ (Access Denied): DPDP Act 2023 ᱟᱨ MoTA ᱨᱮᱱᱟᱜ ᱱᱤᱭᱚᱢ ᱞᱮᱠᱟᱛᱮ, ᱤᱧ ᱫᱚ ᱥᱩᱢᱩᱝ ᱟᱢᱟᱜ ᱮᱠᱟᱣᱩᱱᱴ (${studentName}) ᱨᱮᱱᱟᱜ ᱵᱟᱵᱚᱛ ᱜᱮ ᱞᱟᱹᱭ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾ ᱮᱴᱟᱜ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚᱣᱟᱜ ᱵᱟᱵᱚᱛ ᱠᱟᱛᱷᱟ ᱵᱟᱹᱧ ᱞᱟᱹᱭ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾`,
      gon: `🔒 अनुमति नइके: DPDP कानून 2023 अउर MoTA नियमावली मुताबिक, मय सिर्फ तोर प्रोफाइल (${studentName}) के जानकारी दे सकथों। दूसर लइका मन के जानकारी देना मना हे।`,
      mr: `🔒 प्रवेश नाकारला: डिजिटल वैयक्तिक डेटा संरक्षण (DPDP) कायदा २०२३ आणि आदिवासी कार्य मंत्रालयाच्या नियमांनुसार, मी केवळ तुमच्या प्रमाणित प्रोफाइलची (${studentName}) माहिती देऊ शकतो. इतर कोणत्याही विद्यार्थ्याचा डेटा उघड करण्यास सक्त मनाई आहे.`,
    };

    return {
      answerText: refusalMsgs[lang] || refusalMsgs.en,
      toolsExecuted: [{
        toolName: 'getApplicationStatus',
        inputArguments: { privacyCheck: 'FAILED_CROSS_IDENTITY_PROBE' },
        outputResult: { error: 'DPDP_ACT_2023_ACCESS_VIOLATION', requestedTarget: 'Unauthorized Student Profile' },
        executionTimeMs: 12,
        isPrivacyRefusal: true,
      }],
      isPrivacyRefusal: true,
    };
  }

  // 2. QUERY ROUTING TO BUILT-IN TOOLS
  const toolsExecuted: JagoToolExecution[] = [];

  // Determine which tools are needed
  const isStatusQuery = lower.includes('status') || lower.includes('track') || lower.includes('progress') || lower.includes('where is my application') || lower.includes('स्थिति') || lower.includes('कहाँ') || lower.includes('অবস্থা') || lower.includes('ସ୍ଥିତି');
  const isPaymentQuery = lower.includes('payment') || lower.includes('money') || lower.includes('rupee') || lower.includes('rs') || lower.includes('paisa') || lower.includes('disburs') || lower.includes('utr') || lower.includes('pfms') || lower.includes('dbt') || lower.includes('installment') || lower.includes('receive') || lower.includes('how much') || lower.includes('credited') || lower.includes('settled') || lower.includes('पैसा') || lower.includes('भुगतान') || lower.includes('कितना') || lower.includes('টাকা') || lower.includes('কত') || lower.includes('ଟଙ୍କା');
  const isDeficiencyQuery = lower.includes('deficiency') || lower.includes('mismatch') || lower.includes('exception') || lower.includes('action') || lower.includes('pending') || lower.includes('problem') || lower.includes('reject') || lower.includes('do next') || lower.includes('next step') || lower.includes('what should i do') || lower.includes('remaining') || lower.includes('todo') || lower.includes('to-do') || lower.includes('कमी') || lower.includes('त्रुटि') || lower.includes('समस्या') || lower.includes('আগে') || lower.includes('সমস্যা') || lower.includes('ତ୍ରୁଟି');
  const isEligibilityQuery = lower.includes('eligib') || lower.includes('can i apply') || lower.includes('apply for') || lower.includes('top class') || lower.includes('nfst') || lower.includes('nos') || lower.includes('qualif') || lower.includes('पात्र') || lower.includes('आवेदन') || lower.includes('যোগ্য') || lower.includes('ଯୋଗ୍ୟ');
  const isDocumentQuery = lower.includes('document') || lower.includes('certificate') || lower.includes('caste cert') || lower.includes('income cert') || lower.includes('apaar') || lower.includes('digilocker') || lower.includes('दस्तावेज') || lower.includes('प्रमाणपत्र') || lower.includes('নথি') || lower.includes('ପ୍ରମାଣପତ୍ର');

  // If general greeting or broad query, provide overview
  let answer = '';

  if (isPaymentQuery) {
    const t0 = performance.now();
    const result = toolGetPaymentDetails(ctx, {});
    const t1 = performance.now();
    toolsExecuted.push({
      toolName: 'getPaymentDetails',
      inputArguments: { studentId: ctx.studentProfile.id },
      outputResult: result,
      executionTimeMs: Math.round(t1 - t0),
    });

    if (result.payments.length === 0) {
      if (lang === 'hi') {
        answer = `आपके खाते में अभी तक कोई प्रत्यक्ष लाभ अंतरण (DBT) भुगतान दर्ज नहीं हुआ है। आपकी सक्रिय बैंक स्थिति: **${result.activeAadhaarBank.bankName}** (${result.activeAadhaarBank.accountNoMasked}), आधार सीडिंग: ${result.activeAadhaarBank.aadhaarSeeded ? 'सक्रिय (NPCI Verified)' : 'लंबित'}।`;
      } else {
        answer = `No direct DBT disbursements have been settled in your account yet. Your mapped bank account is **${result.activeAadhaarBank.bankName}** (${result.activeAadhaarBank.accountNoMasked}) with NPCI Aadhaar seeding: **${result.activeAadhaarBank.aadhaarSeeded ? 'Active' : 'Pending Bank Authorization'}**.`;
      }
    } else {
      const latest = result.payments[0];
      if (lang === 'hi') {
        answer = `💰 **डीबीटी छात्रवृत्ति भुगतान विवरण:**\n\n• **योजना:** ${latest.schemeName}\n• **राशि:** ₹${latest.amount.toLocaleString('en-IN')} (${latest.component})\n• **स्थिति:** ${latest.status}\n• **बैंक:** ${latest.bankName} (${latest.accountNumberMasked})\n• **PFMS UTR संख्या:** \`${latest.utrNumber}\`\n• **PFMS लेन-देन ID:** \`${latest.pfmsTransactionId}\`\n• **भुगतान तिथि:** ${latest.disbursementDate}\n\nकुल संवितरित राशि: **₹${result.totalDisbursed.toLocaleString('en-IN')}**।`;
      } else if (lang === 'bn') {
        answer = `💰 **ডিবিটি বৃত্তি প্রদান বিবরণ:**\n\n• **স্কিম:** ${latest.schemeName}\n• **পরিমাণ:** ₹${latest.amount.toLocaleString('en-IN')} (${latest.component})\n• **অবস্থা:** ${latest.status}\n• **ব্যাংক:** ${latest.bankName} (${latest.accountNumberMasked})\n• **PFMS UTR নং:** \`${latest.utrNumber}\`\n• **তারিখ:** ${latest.disbursementDate}`;
      } else if (lang === 'or') {
        answer = `💰 **ଡିବିଟି ଛାତ୍ରବୃତ୍ତି ପ୍ରଦାନ ବିବରଣୀ:**\n\n• **ଯୋଜନା:** ${latest.schemeName}\n• **ରାଶି:** ₹${latest.amount.toLocaleString('en-IN')}\n• **ସ୍ଥିତି:** ${latest.status}\n• **ବ୍ୟାଙ୍କ:** ${latest.bankName} (${latest.accountNumberMasked})\n• **PFMS UTR:** \`${latest.utrNumber}\``;
      } else {
        answer = `💰 **DBT Scholarship Payment Record:**\n\n• **Scheme:** ${latest.schemeName}\n• **Amount:** ₹${latest.amount.toLocaleString('en-IN')} (${latest.component})\n• **Status:** ${latest.status}\n• **Beneficiary Bank:** ${latest.bankName} (${latest.accountNumberMasked})\n• **PFMS UTR No:** \`${latest.utrNumber}\`\n• **PFMS Txn ID:** \`${latest.pfmsTransactionId}\`\n• **Disbursement Date:** ${latest.disbursementDate}\n\nTotal funds successfully settled to date: **₹${result.totalDisbursed.toLocaleString('en-IN')}**.`;
      }
    }
  } else if (isDeficiencyQuery) {
    const t0 = performance.now();
    const result = toolGetDeficienciesAndExceptions(ctx, {});
    const t1 = performance.now();
    toolsExecuted.push({
      toolName: 'getDeficienciesAndExceptions',
      inputArguments: { studentId: ctx.studentProfile.id },
      outputResult: result,
      executionTimeMs: Math.round(t1 - t0),
    });

    if (result.pendingActions.length === 0 && result.activeExceptions.length === 0) {
      if (lang === 'hi') {
        answer = `✅ आपके आवेदन में कोई सक्रिय त्रुटि (Deficiency) या समीक्षा अपवाद नहीं है। आपका आवेदन सामान्य प्रक्रिया में आगे बढ़ रहा है।`;
      } else {
        answer = `✅ Good news! There are currently **no pending deficiencies or blocking exceptions** on your application. All registry verifications are progressing normally.`;
      }
    } else {
      const act = result.pendingActions[0] || null;
      const exc = result.activeExceptions[0] || null;

      if (lang === 'hi') {
        answer = `⚠️ **समीक्षा अपवाद व लंबित कार्य (Non-Blocking):**\n\n${act ? `• **कार्य:** ${act.title}\n• **विवरण:** ${act.description}\n• **अंतिम तिथि:** ${act.deadline}\n• **प्राथमिकता:** ${act.urgency.toUpperCase()}\n\n` : ''}${exc ? `• **नोडल अधिकारी टिप्पणी:** ${exc.remarks}\n` : ''}📌 *जनजातीय कार्य मंत्रालय (MoTA) के गैर-अवरोधक नियम के तहत आपका आवेदन निरस्त नहीं होता है; यह जिला कल्याण अधिकारी (DWO) के प्रशासनिक संज्ञान में है।*`;
      } else {
        answer = `⚠️ **Active Exception & Action Required (MoTA Non-Blocking Policy):**\n\n${act ? `• **Action Required:** ${act.title}\n• **Details:** ${act.description}\n• **Deadline:** ${act.deadline}\n• **Urgency:** ${act.urgency.toUpperCase()}\n\n` : ''}${exc ? `• **Officer Review Note:** "${exc.remarks}"\n\n` : ''}📌 *Note: Per statutory MoTA guidelines, administrative exceptions never block your application. The District Welfare Officer (DWO) can reconcile or clear it.*`;
      }
    }
  } else if (isEligibilityQuery) {
    // Check which scheme
    let targetSchemeId: SchemeId | undefined;
    if (lower.includes('top class')) targetSchemeId = 'top-class';
    else if (lower.includes('nfst') || lower.includes('fellowship')) targetSchemeId = 'nfst';
    else if (lower.includes('nos') || lower.includes('overseas')) targetSchemeId = 'nos';
    else if (lower.includes('post matric') || lower.includes('post-matric')) targetSchemeId = 'post-matric';
    else if (lower.includes('pre matric')) targetSchemeId = 'pre-matric';

    const t0 = performance.now();
    const result = toolCheckSchemeEligibility(ctx, { schemeId: targetSchemeId });
    const t1 = performance.now();
    toolsExecuted.push({
      toolName: 'checkSchemeEligibility',
      inputArguments: { schemeId: targetSchemeId || 'all' },
      outputResult: result,
      executionTimeMs: Math.round(t1 - t0),
    });

    const evaluated = result.evaluatedSchemes[0];
    if (evaluated) {
      if (evaluated.isBlockedByOneScholarship) {
        if (lang === 'hi') {
          answer = `🔒 **एक-समय-एक-छात्रवृत्ति नियम (One-Scholarship Rule):**\n\nआप वर्तमान में **${evaluated.activeScholarshipName}** के सक्रिय लाभार्थी हैं। MoTA दिशानिर्देशों के अनुसार, आप एक समय में दो छात्रवृत्तियां प्राप्त नहीं कर सकते हैं।\n\n• आपकी वार्षिक पारिवारिक आय: ₹${evaluated.studentIncome.toLocaleString('en-IN')}\n• योजना आय सीमा: ${evaluated.incomeCeiling}\n• पात्रता स्थिति: **सक्रिय छात्रवृत्ति के कारण नई अर्जी अवरुद्ध है।**`;
        } else {
          answer = `🔒 **Eligibility Evaluation (${evaluated.schemeName}):**\n\n• **One-Scholarship-at-a-Time Rule:** You are already active in **${evaluated.activeScholarshipName}**. Simultaneous receipt of multiple scholarships is statutory blocked.\n• **Family Income Check:** ₹${evaluated.studentIncome.toLocaleString('en-IN')} (Eligible within ${evaluated.incomeCeiling})\n• **ST Status:** Verified (${evaluated.tribe} tribe)\n• **Verdict:** Criteria met, but **blocked until previous scheme cycle concludes**.`;
        }
      } else {
        if (lang === 'hi') {
          answer = `🎯 **पात्रता मूल्यांकन (${evaluated.schemeName}):**\n\n• **कुल पात्रता:** ${evaluated.isOverallEligible ? '✅ पात्र (Eligible)' : '❌ अपात्र (Not Eligible)'}\n• **आय सीमा जांच:** ${evaluated.isIncomeEligible ? 'उत्तीर्ण' : 'अनुत्तीर्ण'} (आपकी आय: ₹${evaluated.studentIncome.toLocaleString('en-IN')} / सीमा: ${evaluated.incomeCeiling})\n• **जनजाति:** ${evaluated.tribe} (एसटी प्रमाणित)\n• **अधिकतम लाभ:** ${evaluated.maxBenefit}`;
        } else {
          answer = `🎯 **Eligibility Evaluation (${evaluated.schemeName}):**\n\n• **Overall Verdict:** ${evaluated.isOverallEligible ? '✅ ELIGIBLE TO APPLY' : '❌ NOT ELIGIBLE'}\n• **Income Ceiling:** ₹${evaluated.studentIncome.toLocaleString('en-IN')} (Limit: ${evaluated.incomeCeiling}) → ${evaluated.isIncomeEligible ? 'PASSED' : 'EXCEEDED'}\n• **Caste Requirement:** Verified ST (${evaluated.tribe})\n• **Academic Level:** ${evaluated.currentCourse}\n• **Max Benefit:** ${evaluated.maxBenefit}`;
        }
      }
    }
  } else if (isDocumentQuery) {
    // Default to the scheme the student actually holds, not a hardcoded guess.
    let targetSchemeId: SchemeId = ctx.applications[0]?.schemeId || 'post-matric';
    if (lower.includes('top class')) targetSchemeId = 'top-class';
    else if (lower.includes('nfst')) targetSchemeId = 'nfst';
    else if (lower.includes('nos')) targetSchemeId = 'nos';
    else if (lower.includes('post matric')) targetSchemeId = 'post-matric';
    else if (lower.includes('pre matric')) targetSchemeId = 'pre-matric';

    const t0 = performance.now();
    const result = toolGetRequiredDocuments(ctx, { schemeId: targetSchemeId });
    const t1 = performance.now();
    toolsExecuted.push({
      toolName: 'getRequiredDocuments',
      inputArguments: { schemeId: targetSchemeId },
      outputResult: result,
      executionTimeMs: Math.round(t1 - t0),
    });

    if (lang === 'hi') {
      const docList = result.documents.map(d => `• **${d.title}**: ${d.issuer} (डिजीलॉकर: ${d.availableInDigiLocker ? 'उपलब्ध' : 'मैनुअल अपलोड'})`).join('\n');
      answer = `📁 **${result.schemeName} हेतु आवश्यक दस्तावेज:**\n\n${docList}\n\n*सत्यापित दस्तावेज आपके डिजिटल वॉलेट से स्वतः ले लिए जाते हैं, पुनः अपलोड करने की आवश्यकता नहीं है।*`;
    } else {
      const docList = result.documents.map(d => `• **${d.title}** (${d.validity}) — *${d.issuer}* [${d.availableInDigiLocker ? 'DigiLocker Synced' : 'Physical Scan'}]`).join('\n');
      answer = `📁 **Required Documents for ${result.schemeName}:**\n\n${docList}\n\n*Verified documents in your Wallet are automatically reused across all 5 MoTA schemes.*`;
    }
  } else if (isStatusQuery || ctx.applications.length > 0) {
    // Default: Check Application Status
    const t0 = performance.now();
    const result = toolGetApplicationStatus(ctx, {});
    const t1 = performance.now();
    toolsExecuted.push({
      toolName: 'getApplicationStatus',
      inputArguments: { studentId: ctx.studentProfile.id },
      outputResult: result,
      executionTimeMs: Math.round(t1 - t0),
    });

    const app = result.applications[0];
    if (app) {
      if (lang === 'hi') {
        answer = `नमस्ते **${studentName}**! मैं **जागो (JAGO)**, आपका जनजातीय छात्रवृत्ति सहायक हूँ।\n\n📋 **आवेदन स्थिति:**\n• **आवेदन सं.:** \`${app.applicationNumber}\`\n• **योजना:** ${app.schemeName}\n• **वर्तमान चरण:** **${app.currentStatus.toUpperCase()}**\n• **विवरण:** ${app.statusDescription}\n• **अंतिम अद्यतन:** ${app.recentTimelineEvent ? app.recentTimelineEvent.date : app.submissionDate}\n\nआप मुझसे भुगतान स्थिति, आवश्यक दस्तावेज, पात्रता या लंबित कार्यों के बारे में पूछ सकते हैं।`;
      } else if (lang === 'bn') {
        answer = `নমস্কার **${studentName}**! আমি **JAGO**, আপনার জনজাতি বৃত্তি সহায়ক।\n\n📋 **আবেদন অবস্থা:**\n• **নম্বর:** \`${app.applicationNumber}\`\n• **স্কিম:** ${app.schemeName}\n• **অবস্থা:** **${app.currentStatus.toUpperCase()}**\n• **বিবরণ:** ${app.statusDescription}`;
      } else if (lang === 'or') {
        answer = `ନମସ୍କାର **${studentName}**! ମୁଁ **JAGO**, ଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି ସହାୟକ।\n\n📋 **ଆବେଦନ ସ୍ଥିତି:**\n• **ନମ୍ବର:** \`${app.applicationNumber}\`\n• **ଯୋଜନା:** ${app.schemeName}\n• **ସ୍ଥିତି:** **${app.currentStatus.toUpperCase()}**\n• **ବିବରଣୀ:** ${app.statusDescription}`;
      } else {
        answer = `Greetings **${studentName}**! I am **JAGO**, your dedicated MoTA Tribal Scholarship Companion.\n\n📋 **Application Status Overview:**\n• **Application No:** \`${app.applicationNumber}\`\n• **Scheme:** ${app.schemeName} (${app.academicYear})\n• **Current Stage:** **${app.currentStatus.toUpperCase()}**\n• **Status Detail:** ${app.statusDescription}\n• **Source Portal:** ${app.sourceSystem}\n• **Sanctioned Grant:** ₹${app.sanctionedAmount.toLocaleString('en-IN')}\n\nYou can ask me about your DBT payments, pending exceptions, scheme eligibility, or required documents in your native language!`;
      }
    } else {
      answer = `Hello **${studentName}**! I am JAGO, your MoTA Tribal Scholarship Companion. You currently have no active applications on file. Would you like me to check your eligibility for the Pre-Matric or Post-Matric ST scholarship?`;
    }
  } else {
    // Nothing matched and there is no application to fall back on: say what JAGO can do.
    answer = `Namaste **${studentName}**. I did not find a record that answers that one, but I can help with:\n\n• **Where my application is** and its current stage\n• **DBT payment status**, installment amount, UTR and PFMS transaction ID\n• **What I should do next** if anything is pending on my file\n• **Which schemes I qualify for** across all five MoTA pathways\n• **Which documents I need**, and whether they are already in my wallet\n\nTry one of the suggested questions below.`;
  }

  return {
    answerText: answer,
    toolsExecuted,
    isPrivacyRefusal: false,
  };
}
