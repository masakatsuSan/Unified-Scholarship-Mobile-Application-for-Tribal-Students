import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HelpCircle, 
  PhoneCall, 
  Mail, 
  Sparkles, 
  ChevronDown, 
  BookOpen, 
  Bot,
  ShieldCheck
} from 'lucide-react';
import { 
  StudentProfile, 
  ApplicationRecord, 
  PaymentRecord, 
  PendingAction 
} from '../types/index.ts';
import { JagoChatbot } from './JagoChatbot.tsx';

interface HelpViewProps {
  studentProfile: StudentProfile;
  applications: ApplicationRecord[];
  payments: PaymentRecord[];
  pendingActions: PendingAction[];
}

export const HelpView: React.FC<HelpViewProps> = ({
  studentProfile,
  applications,
  payments,
  pendingActions,
}) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'jago' | 'faqs'>('jago');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why does the app say "Blocked by One-Scholarship-at-a-Time Rule"?',
      a: 'Under Ministry of Tribal Affairs guidelines, an ST student is legally eligible to draw benefits from only ONE government scholarship/fellowship at a given time. If you already have an active Pre-Matric or Post-Matric or Fellowship sanction, the portal prevents duplicate applications to ensure fair distribution of funds.',
    },
    {
      q: 'How does ST Scholarship Saathi unify NSP, SFMP, and NOS?',
      a: 'MoTA Unified Integration Hub sits on top of National Scholarship Portal (NSP), Canara Bank SFMP, and NOS Portal via automated verification adapters. You can track applications, raise corrections, and monitor DBT installments in one unified place.',
    },
    {
      q: 'What should I do if an "Income Certificate Mismatch" is flagged?',
      a: 'Do not panic. Under MoTA\'s non-blocking principle, your application is NOT rejected. Instead, an exception case is opened for the District Welfare Officer (DWO) to review. You can either accept the State e-District verified income or upload a revised certificate via the Pending Actions strip.',
    },
    {
      q: 'Why is Aadhaar seeding required in my bank account for DBT?',
      a: 'Direct Benefit Transfer (DBT) funds are routed through NPCI Aadhaar Payments Bridge (APB). Your bank account must be actively seeded with your Aadhaar in the bank\'s core banking system to avoid payment bounce.',
    },
    {
      q: 'What is APAAR ID and why is it used?',
      a: 'APAAR (Automated Permanent Academic Account Registry) is the "One Nation, One Student ID" issued by the Ministry of Education. It automatically fetches your school/college verification, UDISE+/AISHE codes, and marks, removing the need to upload paper marksheets.',
    },
  ];

  return (
    <div className="space-y-4 pb-20" id="help-view-container">
      {/* Sub-navigation: JAGO AI vs FAQs & Helpline */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('jago')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'jago'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-jago-ai-btn"
        >
          <Sparkles className="w-4 h-4" />
          <span>JAGO AI Assistant (Voice & Chat)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'faqs'
              ? 'bg-slate-800 text-white shadow-md border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
          id="tab-faqs-btn"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>FAQs & Helpline</span>
        </button>
      </div>

      {/* SUB-VIEW 1: JAGO CHATBOT */}
      {activeSubTab === 'jago' && (
        <JagoChatbot
          studentProfile={studentProfile}
          applications={applications}
          payments={payments}
          pendingActions={pendingActions}
        />
      )}

      {/* SUB-VIEW 2: FAQS & HELPLINE */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          {/* Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Helpdesk & Grievance Support</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Toll-Free 24x7
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              MoTA Student Saathi Support
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official support for Scheduled Tribe scholarship beneficiaries across all States and Union Territories.
            </p>

            {/* Helpline cards */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Toll-Free Helpline</span>
                  <span className="font-bold text-white font-mono text-xs">1800-11-7777</span>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Support Email</span>
                  <span className="font-bold text-white font-mono text-xs truncate block">scholarship-mota@nic.in</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-3.5 flex items-center justify-between gap-2 hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="font-medium text-white text-xs leading-snug">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-amber-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>

                  {openFaq === idx && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
