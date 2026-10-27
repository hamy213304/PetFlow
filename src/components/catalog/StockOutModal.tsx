import React, { useState } from 'react';
import { X, ArrowUpFromLine, AlertCircle } from 'lucide-react';
import { CatalogItem } from '../../types/petflow';
import { performStockOut } from '../../services/stockService';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  defaultItemId?: string;
  onSuccess: () => void;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultItemId,
  onSuccess
}) => {
  const goodsItems = items.filter(i => i.type === 'GOODS');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    defaultItemId || (goodsItems[0]?.id || '')
  );
  const [quantity, setQuantity] = useState<string>('1');
  const [notes, setNotes] = useState<string>('Xuất hủy hàng hỏng hoặc nội bộ');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentItem = goodsItems.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Số lượng xuất kho phải là số nguyên lớn hơn 0.');
      return;
    }

    if (currentItem && qtyNum > currentItem.stockQuantity) {
      setErrorMsg(
        `Không thể xuất kho lớn hơn số lượng tồn hệ thống (Tồn: ${currentItem.stockQuantity}, yêu cầu: ${qtyNum}).`
      );
      return;
    }

    const res = performStockOut({
      itemId: selectedItemId,
      quantity: qtyNum,
      notes: notes.trim() || undefined
    });

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    alert(res.message);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 border border-slate-200 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Phiếu xuất kho thủ công</h3>
              <p className="text-[11px] text-slate-500">Xuất hủy, hao hụt hoặc luân chuyển</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mặt hàng xuất kho *</label>
            <select
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900"
            >
              {goodsItems.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} (Tồn hiện tại: {g.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          {currentItem && (
            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Tồn kho hiện tại:</span>
              <span className={`font-bold ${currentItem.stockQuantity <= 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {currentItem.stockQuantity}
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Số lượng xuất *</label>
            <input
              type="number"
              min="1"
              max={currentItem?.stockQuantity || 1}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              * Theo quy tắc SRS 8.1, không được xuất thủ công vượt quá số lượng hệ thống đang có.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lý do xuất kho</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Lý do xuất kho thủ công..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
            >
              Xác nhận xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
