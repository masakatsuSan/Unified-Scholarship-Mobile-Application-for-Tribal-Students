import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Building2, 
  Hash, 
  X, 
  Calendar,
  Layers,
  Printer
} from 'lucide-react';
import { PaymentRecord, SchemeId } from '../types/index.ts';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  studentName: string;
  aadhaarMasked: string;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  studentName,
  aadhaarMasked,
}) => {
  const { t } = useTranslation();
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [receiptModalPayment, setReceiptModalPayment] = useState<PaymentRecord | null>(null);

  // Calculate unique years and schemes
  const years = Array.from(new Set(payments.map(p => p.academicYear)));
  const schemes = Array.from(new Set(payments.map(p => ({ id: p.schemeId, name: p.schemeName }))));

  const filteredPayments = payments.filter((p) => {
    const matchScheme = selectedSchemeFilter === 'all' || p.schemeId === selectedSchemeFilter;
    const matchYear = selectedYearFilter === 'all' || p.academicYear === selectedYearFilter;
    return matchScheme && matchYear;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4 pb-20" id="payments-view-container">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{t('payments.title')}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              PFMS / NPCI Live
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {t('payments.subtitle')}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Aadhaar Linked</span>
              <span className="text-slate-200 font-mono font-medium">{aadhaarMasked}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Disbursement Mode</span>
              <span className="text-emerald-400 font-semibold">Direct Benefit Transfer (DBT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Filters:</span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          {/* Scheme Filter */}
          <select
            value={selectedSchemeFilter}
            onChange={(e) => setSelectedSchemeFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none flex-1 sm:flex-initial"
            id="scheme-filter-dropdown"
          >
            <option value="all">{t('schemes.allSchemes')}</option>
            {schemes.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Academic Year Filter */}
          <select
            value={selectedYearFilter}
            onChange={(e) => setSelectedYearFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
            id="year-filter-dropdown"
          >
            <option value="all">{t('payments.allYears')}</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Records List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No payments match the selected criteria.
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isDisbursed = p.status === 'Disbursed';
            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-slate-200 transition-all shadow-sm"
                id={`payment-card-${p.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{p.schemeName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                        {p.sourceSystem}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Academic Session {p.academicYear} • Installment #{p.installmentNo} ({p.component})
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-amber-400 font-mono block">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                      isDisbursed 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {isDisbursed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      <span>{p.status}</span>
                    </span>
                  </div>
                </div>

                {/* Account & Transaction Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank Account</span>
                    <span className="text-slate-300 font-medium">
                      {p.bankName} ({p.accountNumberMasked})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Disbursal Date</span>
                    <span className="text-slate-300 font-medium">{p.disbursementDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank UTR / Transaction No.</span>
                    <span className="text-amber-300/90 font-mono font-medium">{p.utrNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">PFMS Reference ID</span>
                    <span className="text-slate-300 font-mono">{p.pfmsTransactionId}</span>
                  </div>
                </div>

                {/* Receipt Download Trigger */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => setReceiptModalPayment(p)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors"
                    id={`view-receipt-btn-${p.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('payments.receiptDownload')}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DBT Receipt Preview Modal */}
      {receiptModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* MoTA Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-800 relative">
              <button
                onClick={() => setReceiptModalPayment(null)}
                className="absolute top-0 right-0 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-amber-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold mb-1.5 shadow-md">
                ST
              </div>
              <h3 className="text-sm font-bold text-white">GOVERNMENT OF INDIA</h3>
              <p className="text-xs font-semibold text-amber-300">MINISTRY OF TRIBAL AFFAIRS (MoTA)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">DIRECT BENEFIT TRANSFER (DBT) PAYMENT ACKNOWLEDGEMENT</p>
            </div>

            {/* Receipt Body */}
            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Beneficiary Name</span>
                  <span className="font-bold text-white text-sm">{studentName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Aadhaar Number</span>
                  <span className="font-mono text-slate-200">{aadhaarMasked}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Scholarship Scheme</span>
                  <span className="font-medium text-slate-200 text-right max-w-[240px]">{receiptModalPayment.schemeName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Academic Session</span>
                  <span className="text-slate-200">{receiptModalPayment.academicYear}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Component</span>
                  <span className="text-slate-200">{receiptModalPayment.component}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Amount Transferred</span>
                  <span className="font-bold text-amber-400 text-lg font-mono">
                    ₹{receiptModalPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Banking & UTR specs */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Credited Bank:</span>
                  <span className="text-slate-200">{receiptModalPayment.bankName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Account Number:</span>
                  <span className="text-slate-200">{receiptModalPayment.accountNumberMasked}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bank UTR Number:</span>
                  <span className="text-amber-300 font-bold">{receiptModalPayment.utrNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PFMS Batch ID:</span>
                  <span className="text-slate-200">{receiptModalPayment.pfmsTransactionId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Disbursement Date:</span>
                  <span className="text-slate-200">{receiptModalPayment.disbursementDate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Originating Portal:</span>
                  <span className="text-emerald-400">{receiptModalPayment.sourceSystem}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                This is a digitally generated DBT receipt verified through the MoTA Unified Integration Hub. No physical signature is required.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setReceiptModalPayment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
