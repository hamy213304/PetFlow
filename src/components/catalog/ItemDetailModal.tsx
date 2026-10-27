import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Scissors,
  Edit2,
  Trash2,
  Save,
  Calendar,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CatalogItem, CatalogItemType, CatalogGroup, ItemStatus } from '../../types/petflow';
import { getSuppliers, saveCatalogItem, deleteCatalogItem } from '../../services/storage';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onUpdated?: () => void;
  onSaved?: () => void;
  onDeleted: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdated,
  onSaved,
  onDeleted
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const suppliers = getSuppliers();

  // Edit fields
  const [name, setName] = useState('');
  const [type, setType] = useState<CatalogItemType>('GOODS');
  const [group, setGroup] = useState<CatalogGroup>('Thức ăn');
  const [subType, setSubType] = useState('');
  const [costPrice, setCostPrice] = useState<string>('0');
  const [sellingPrice, setSellingPrice] = useState<string>('0');
  const [status, setStatus] = useState<ItemStatus>('ACTIVE');
  const [supplierId, setSupplierId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('45');
  const [stockQuantity, setStockQuantity] = useState<string>('0');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setIsEditMode(false);
      setShowDeleteConfirm(false);
      setErrorMsg(null);
      setName(item.name || '');
      setType(item.type || 'GOODS');
      setGroup(item.group || 'Thức ăn');
      setSubType(item.subType || '');
      setCostPrice((item.costPrice || 0).toString());
      setSellingPrice((item.sellingPrice || 0).toString());
      setStatus(item.status || 'ACTIVE');
      setSupplierId(item.supplierId || '');
      setExpiryDate(item.expiryDate || '');
      setDurationMinutes((item.durationMinutes || 45).toString());
      setStockQuantity((item.stockQuantity || 0).toString());
      setPhotoUrl(item.photoUrl || '');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const supplier = suppliers.find(s => s.id === item.supplierId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên mặt hàng.');
      return;
    }
    const sellPriceNum = parseInt(sellingPrice, 10);
    if (isNaN(sellPriceNum) || sellPriceNum < 0) {
      setErrorMsg('Giá bán không hợp lệ.');
      return;
    }
    const costPriceNum = parseInt(costPrice, 10);
    if (type === 'GOODS' && (isNaN(costPriceNum) || costPriceNum < 0)) {
      setErrorMsg('Giá vốn hàng hóa là bắt buộc.');
      return;
    }

    const updatedItem: CatalogItem = {
      ...item,
      name: name.trim(),
      type,
      group,
      subType,
      costPrice: type === 'GOODS' ? costPriceNum : 0, // Dịch vụ không có giá vốn per Item 3
      sellingPrice: sellPriceNum,
      status,
      supplierId: type === 'GOODS' ? supplierId : undefined,
      expiryDate: type === 'GOODS' ? expiryDate : undefined,
      durationMinutes: type === 'SERVICE' ? (parseInt(durationMinutes, 10) || 45) : undefined,
      stockQuantity: type === 'GOODS' ? (parseInt(stockQuantity, 10) || 0) : 0,
      photoUrl: photoUrl.trim() || undefined
    };

    saveCatalogItem(updatedItem);
    if (onSaved) onSaved();
    else if (onUpdated) onUpdated();
    setIsEditMode(false);
  };

  const handleDelete = () => {
    const res = deleteCatalogItem(item.id);
    if (res.message) {
      alert(res.message);
    }
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-[#17365D] rounded-xl">
              {item.type === 'GOODS' ? <Package className="w-5 h-5" /> : <Scissors className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight truncate max-w-[200px]">
                  {item.name}
                </h2>
                <span className="text-[10px] font-mono text-slate-400">({item.code})</span>
              </div>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Chế độ chỉnh sửa thông tin' : 'Chế độ xem chi tiết mặt hàng'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {!isEditMode ? (
            /* VIEW ONLY MODE */
            <div className="space-y-4">
              {/* Product Photo & Status */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      {item.type === 'GOODS' ? <Package className="w-8 h-8" /> : <Scissors className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#17365D] font-bold text-[10px]">
                      {item.type === 'GOODS' ? 'Hàng hóa' : 'Dịch vụ'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {item.group}
                    </span>
                    {item.subType && item.subType !== item.group && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px]">
                        {item.subType}
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 block">Giá bán niêm yết:</span>
                    <span className="text-base font-extrabold font-mono text-emerald-700">
                      {formatVND(item.sellingPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                {item.type === 'GOODS' ? (
                  <>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Giá vốn hàng bán:</span>
                      <span className="font-mono font-bold text-slate-800">{formatVND(item.costPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Số lượng tồn kho:</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded ${
                          item.stockQuantity <= 0
                            ? 'bg-red-100 text-red-800'
                            : item.stockQuantity <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.stockQuantity} sản phẩm
                      </span>
                    </div>

                    {item.expiryDate && (
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500">Hạn sử dụng:</span>
                        <span className="font-mono font-medium">{formatDateVN(item.expiryDate)}</span>
                      </div>
                    )}

                    {supplier && (
                      <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> Nhà cung cấp:
                        </span>
                        <span className="font-semibold text-slate-800">{supplier.name}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Dịch vụ: KHÔNG CÓ GIÁ VỐN per Item 3 */}
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" /> Thời lượng dịch vụ:
                      </span>
                      <span className="font-mono font-bold text-slate-800">{item.durationMinutes} phút</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      * Dịch vụ spa thú cưng được tính theo giá bán, không áp dụng quản lý tồn kho và giá vốn.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form id="editItemForm" onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên mặt hàng *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giá bán *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    required
                  />
                </div>

                {type === 'GOODS' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Giá vốn *</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={costPrice}
                      onChange={e => setCostPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Thời lượng (phút)</label>
                    <input
                      type="number"
                      min="5"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                )}
              </div>

              {type === 'GOODS' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Số lượng tồn kho</label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hạn sử dụng</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái kinh doanh</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ItemStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="ACTIVE">Đang kinh doanh</option>
                  <option value="DISCONTINUED">Ngừng kinh doanh</option>
                </select>
              </div>

              {/* Photo Upload with Camera / Device File (Item 16) */}
              <ImageUploadPicker
                label="Hình ảnh mặt hàng"
                value={photoUrl}
                onChange={url => setPhotoUrl(url)}
              />
            </form>
          )}
        </div>

        {/* Bottom Actions per SRS 7.1 & Item 3:
            View Mode: "Xóa" & "Chỉnh sửa"
            Edit Mode: "Hủy" & "Lưu" (replaces Chỉnh sửa)
        */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs min-h-[44px]"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="editItemForm"
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md min-h-[44px]"
              >
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" /> Xóa mặt hàng
              </button>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="flex-1 py-3 rounded-xl bg-[#17365D] hover:bg-[#1f4e79] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md min-h-[44px]"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Popup for Deleting Item (Item 6) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận xóa mặt hàng?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa <b>"{item.name}"</b>? Nếu mặt hàng đã từng phát sinh hóa đơn trong quá khứ, hệ thống sẽ chuyển sang trạng thái "Ngừng kinh doanh" để bảo toàn lịch sử hóa đơn.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
