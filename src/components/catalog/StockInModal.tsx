import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, Calendar, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { CatalogItem } from '../../types/petflow';
import { performStockIn } from '../../services/stockService';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  defaultItemId?: string;
  onSuccess: () => void;
}

interface ItemStockInState {
  quantity: string;
  expiryDate: string;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  items,
  defaultItemId,
  onSuccess
}) => {
  // Only GOODS can be stocked in
  const targetGoods = items.filter(i => i.type === 'GOODS');

  const [itemInputs, setItemInputs] = useState<Record<string, ItemStockInState>>({});
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize or re-sync input rows when targetGoods or isOpen changes
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }
    const initial: Record<string, ItemStockInState> = {};
    targetGoods.forEach(g => {
      initial[g.id] = {
        quantity: '5',
        expiryDate: g.expiryDate || '2028-12-31'
      };
    });
    setItemInputs(initial);
    setErrorMsg(null);
    setSuccessMsg(null);
    setNotes('');
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleQuantityChange = (itemId: string, val: string) => {
    setItemInputs(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: val
      }
    }));
  };

  const handleExpiryChange = (itemId: string, val: string) => {
    setItemInputs(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        expiryDate: val
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (targetGoods.length === 0) {
      setErrorMsg('Không có mặt hàng nào phù hợp để nhập kho.');
      return;
    }

    // Validate quantities
    let totalQty = 0;
    for (const g of targetGoods) {
      const row = itemInputs[g.id];
      const qtyNum = parseInt(row?.quantity || '0', 10);
      if (isNaN(qtyNum) || qtyNum < 0) {
        setErrorMsg(`Số lượng nhập của "${g.name}" không hợp lệ.`);
        return;
      }
      totalQty += qtyNum;
    }

    if (totalQty === 0) {
      setErrorMsg('Vui lòng nhập số lượng lớn hơn 0 cho ít nhất một mặt hàng.');
      return;
    }

    // Perform stock in for all items with qty > 0
    let updatedCount = 0;
    for (const g of targetGoods) {
      const row = itemInputs[g.id];
      const qtyNum = parseInt(row?.quantity || '0', 10);
      if (qtyNum > 0) {
        const res = performStockIn({
          itemId: g.id,
          quantity: qtyNum,
          expiryDate: row?.expiryDate || undefined,
          notes: notes.trim() || undefined
        });
        if (res.success) {
          updatedCount++;
        }
      }
    }

    setSuccessMsg(`Đã nhập kho thành công cho ${updatedCount} mặt hàng (Tổng số lượng: ${totalQty})!`);
    onSuccess();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Calculate totals
  const totalQtyEntered = targetGoods.reduce((sum, g) => {
    const q = parseInt(itemInputs[g.id]?.quantity || '0', 10);
    return sum + (isNaN(q) ? 0 : q);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Phiếu nhập kho hàng loạt</h3>
              <p className="text-[11px] text-slate-500">
                Nhập kho cho {targetGoods.length} mặt hàng đã chọn
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {targetGoods.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Không có hàng hóa nào được tích chọn.</p>
              <p className="text-[11px] text-slate-400 mt-1">Hãy tích chọn ít nhất một sản phẩm trong tab Hàng hóa trước khi bấm Nhập kho.</p>
            </div>
          ) : (
            <form id="stock-in-form" onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2.5">
                {targetGoods.map(item => {
                  const rowState = itemInputs[item.id] || { quantity: '5', expiryDate: '' };
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Mã: {item.code}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-500">Tồn kho hiện tại:</span>
                          <span className="ml-1 font-mono font-bold text-slate-800">{item.stockQuantity}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-200/60">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Số lượng nhập thêm *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={rowState.quantity}
                            onChange={e => handleQuantityChange(item.id, e.target.value)}
                            placeholder="Số lượng"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-xs"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Hạn sử dụng
                          </label>
                          <input
                            type="date"
                            value={rowState.expiryDate}
                            onChange={e => handleExpiryChange(item.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú phiếu nhập chung</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ghi chú đợt nhập hàng, số hóa đơn chứng từ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Total summary bar */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <span>Tổng {targetGoods.length} mặt hàng:</span>
                <span className="font-mono text-sm font-bold text-emerald-800">
                  +{totalQtyEntered} sản phẩm
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs min-h-[44px]"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="stock-in-form"
            disabled={targetGoods.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md min-h-[44px] transition-colors"
          >
            Xác nhận nhập kho ({totalQtyEntered})
          </button>
        </div>
      </div>
    </div>
  );
};
