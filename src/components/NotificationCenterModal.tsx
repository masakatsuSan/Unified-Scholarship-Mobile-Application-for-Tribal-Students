import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  MessageSquare, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  Send,
  AlertTriangle,
  Globe,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { NotificationRecord, NotificationEventType, SupportedLanguage } from '../types/index.ts';
import { renderNotificationTemplate } from '../services/notificationTemplates.ts';
import { languageList } from '../i18n/translations.ts';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationRecord[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerSimulatedEvent: (eventType: NotificationEventType, customVars?: Record<string, any>) => void;
  onNavigateToAction?: (url?: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerSimulatedEvent,
  onNavigateToAction,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sms_stub' | 'whatsapp_stub' | 'simulate'>('inbox');
  const [selectedNotifId, setSelectedNotifId] = useState<string>(notifications[0]?.id || '');
  const [previewLang, setPreviewLang] = useState<SupportedLanguage>('en');

  if (!isOpen) return null;

  const selectedNotif = notifications.find(n => n.id === selectedNotifId) || notifications[0];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render language-aware dynamic copy for the currently selected notification
  const dynamicTemplate = selectedNotif ? renderNotificationTemplate(
    selectedNotif.eventType,
    previewLang,
    {
      studentName: 'Sunita Murmu',
      applicationNumber: selectedNotif.metadata?.applicationNumber || 'APP-2024-POST-0442',
      schemeName: selectedNotif.metadata?.schemeName || 'Post-Matric Scholarship for ST Students',
      amount: selectedNotif.metadata?.amount || '48,000',
      deadline: selectedNotif.metadata?.deadline || '2024-10-15',
      bankName: selectedNotif.metadata?.bankName || 'State Bank of India',
      utrNumber: selectedNotif.metadata?.utrNumber || 'SBIN00481920384',
      dwoRemarks: selectedNotif.metadata?.dwoRemarks || 'State e-District Income Discrepancy',
      maskedApaar: '8492',
      institutionName: 'NIT Rourkela',
      date: '18-Sep-2024',
    }
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        id="notification-center-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Event Notification Center</h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  Multi-Channel DLT Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                In-app alerts, TRAI-compliant SMS stubs & WhatsApp Business notices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              id="close-notif-center-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'inbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>In-App Inbox ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sms_stub')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'sms_stub'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>SMS Preview (DLT)</span>
            </button>

            <button
              onClick={() => setActiveTab('whatsapp_stub')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'whatsapp_stub'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp Official</span>
            </button>

            <button
              onClick={() => setActiveTab('simulate')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'simulate'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Simulate Events</span>
            </button>
          </div>

          {/* Language-Aware Template Switcher */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-slate-700/60 rounded-xl px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-400">Template Lang:</span>
            <select
              value={previewLang}
              onChange={(e) => setPreviewLang(e.target.value as SupportedLanguage)}
              className="bg-transparent text-[11px] font-bold text-amber-300 focus:outline-none cursor-pointer"
            >
              {languageList.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.nativeName} ({l.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: INBOX */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* List column */}
              <div className="md:col-span-6 space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                {notifications.map((n) => {
                  const isSelected = selectedNotif?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNotifId(n.id);
                        if (!n.isRead) onMarkAsRead(n.id);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                          : n.isRead
                          ? 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/60'
                          : 'bg-amber-950/20 border-amber-500/30 hover:bg-amber-950/30'
                      }`}
                    >
                      {!n.isRead && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400" />
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          n.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : n.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {n.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {n.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">{n.title}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {n.body}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-blue-400" />
                          <span>SMS: {n.delivery.sms.dltHeader}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp: Delivered</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail column */}
              <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                {selectedNotif && dynamicTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                          EVENT: {selectedNotif.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedNotif.timestamp}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {dynamicTemplate.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                        {dynamicTemplate.inAppBody}
                      </p>
                    </div>

                    {/* Metadata chips */}
                    <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Application Context
                      </div>
                      {selectedNotif.metadata?.applicationNumber && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Application No:</span>
                          <span className="font-mono text-white">{selectedNotif.metadata.applicationNumber}</span>
                        </div>
                      )}
                      {selectedNotif.metadata?.amount && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Sanctioned / Disbursed:</span>
                          <span className="font-bold text-emerald-400">₹{selectedNotif.metadata.amount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedNotif.metadata?.utrNumber && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">PFMS APB UTR:</span>
                          <span className="font-mono text-amber-300">{selectedNotif.metadata.utrNumber}</span>
                        </div>
                      )}
                      {selectedNotif.metadata?.deadline && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Deficiency Deadline:</span>
                          <span className="font-bold text-rose-300">{selectedNotif.metadata.deadline}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {selectedNotif.actionLabel && (
                      <button
                        onClick={() => {
                          onClose();
                          if (onNavigateToAction) onNavigateToAction(selectedNotif.actionUrl);
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                      >
                        <span>{selectedNotif.actionLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Select a notification from the left list to inspect details
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SMS STUB (TRAI / DLT COMPLIANT) */}
          {activeTab === 'sms_stub' && dynamicTemplate && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                {/* Telecom Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                      GOI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <span>{dynamicTemplate.smsDltHeader}</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 rounded font-sans">
                          Govt DLT Verified
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400">National SMS Gateway (CDAC)</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Today</span>
                </div>

                {/* Simulated SMS Message Bubble */}
                <div className="my-5">
                  <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-2xl text-xs text-slate-100 font-sans leading-relaxed relative">
                    <p className="whitespace-pre-wrap">{dynamicTemplate.smsText}</p>
                    <div className="mt-2.5 pt-2 border-t border-blue-500/20 flex items-center justify-between text-[10px] text-blue-300">
                      <span>Char count: {dynamicTemplate.smsText.length} / 160</span>
                      <span className="font-mono">TID: {dynamicTemplate.smsDltTemplateId}</span>
                    </div>
                  </div>
                </div>

                {/* Telecom Compliance Footer */}
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TRAI DLT Entity: Ministry of Tribal Affairs (Govt of India)</span>
                  </div>
                  <p>
                    Registered Service Implicit Route. Critical citizen benefit update under National Scholarship Policy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP OFFICIAL BUSINESS STUB */}
          {activeTab === 'whatsapp_stub' && dynamicTemplate && (
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-[#0b141a] border border-slate-800 rounded-3xl p-4 shadow-2xl relative">
                {/* WhatsApp Chat Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      MoTA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Ministry of Tribal Affairs</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">Official Business Account</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">Encrypted</span>
                </div>

                {/* WhatsApp Message Card */}
                <div className="my-4">
                  <div className="bg-[#202c33] p-4 rounded-2xl text-xs text-slate-200 leading-relaxed shadow-md border border-slate-700/40">
                    <p className="whitespace-pre-wrap">{dynamicTemplate.whatsAppText}</p>
                    <div className="text-right text-[10px] text-slate-400 mt-2">
                      10:14 AM • Delivered ✓✓
                    </div>
                  </div>

                  {/* Interactive Quick Reply CTA Buttons */}
                  <div className="space-y-1.5 mt-2">
                    {dynamicTemplate.whatsAppButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        className="w-full py-2 bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 font-semibold text-xs rounded-xl border border-slate-700/50 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{btn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-1">
                  Meta Verified Business API • Template: {dynamicTemplate.whatsAppTemplateId}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIMULATE EVENT GENERATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-Time Event Dispatch Simulator</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Trigger event-driven webhooks to simulate live notifications across In-App, SMS, and WhatsApp channels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onTriggerSimulatedEvent('DBT_DISBURSED', {
                      amount: 48000,
                      bankName: 'State Bank of India',
                      utrNumber: `SBIN${Math.floor(100000000 + Math.random() * 900000000)}`,
                    });
                    setActiveTab('inbox');
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 hover:bg-emerald-900/40 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Simulate DBT Disbursement
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Triggers ₹48,000 credit alert via PFMS / Aadhaar Payment Bridge
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onTriggerSimulatedEvent('DWO_CORRECTION_REQUESTED', {
                      deadline: '2024-10-25',
                      dwoRemarks: 'Income certificate discrepancy detected with e-District database',
                    });
                    setActiveTab('inbox');
                  }}
                  className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 hover:bg-rose-900/40 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-rose-300">
                      Simulate DWO Correction Notice
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Triggers non-blocking statutory correction reminder
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onTriggerSimulatedEvent('SCHOLARSHIP_SANCTIONED', {
                      amount: 60000,
                    });
                    setActiveTab('inbox');
                  }}
                  className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40 hover:bg-blue-900/40 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                      Simulate Formal Sanction Order
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Notifies applicant of administrative approval
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onTriggerSimulatedEvent('OUTREACH_NUDGE', {
                      deadline: '2024-10-31',
                    });
                    setActiveTab('inbox');
                  }}
                  className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/40 text-left transition-all group flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300">
                      Simulate Coverage Gap Nudge
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Sends outreach campaign SMS & WhatsApp to unregistered student
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
