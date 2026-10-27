import React from 'react';
import { X, Receipt, CheckCircle2, User, Phone, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { Invoice } from '../../types/petflow';
import { formatVND, formatDateTimeVN } from '../../utils/formatters';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">{invoice.invoiceCode}</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {formatDateTimeVN(invoice.completedAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Customer info */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thông tin khách hàng</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                {invoice.customerNameSnapshot}
              </span>
              <span className="text-slate-600 font-mono flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                {invoice.customerPhoneSnapshot}
              </span>
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Chi tiết mặt hàng & Dịch vụ ({invoice.lines.length})
            </span>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {invoice.lines.map((line, idx) => (
                <div key={idx} className="p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">{line.itemNameSnapshot}</span>
                    <span className="font-bold font-mono text-slate-900 text-xs">
                      {formatVND(line.lineTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      {line.quantity} × {formatVND(line.unitPriceSnapshot)}
                    </span>
                    {line.discount > 0 && (
                      <span className="text-rose-600 font-medium">
                        Giảm: -{formatVND(line.discount)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Breakdown Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-mono">{formatVND(invoice.subtotal)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Tổng giảm giá:</span>
                <span className="font-mono">-{formatVND(invoice.totalDiscount)}</span>
              </div>
            )}
            {invoice.otherCharge > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Phụ thu:</span>
                <span className="font-mono">+{formatVND(invoice.otherCharge)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>ĐÃ THANH TOÁN ĐỦ:</span>
              <span className="text-base text-emerald-700 font-mono">{formatVND(invoice.paidAmount)}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors min-h-[44px]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
