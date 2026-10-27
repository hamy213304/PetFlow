import React, { useState } from 'react';
import { X, Package, Scissors, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { CatalogItem, CatalogItemType, CatalogGroup, ItemStatus } from '../../types/petflow';
import { getSuppliers, saveCatalogItem } from '../../services/storage';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: CatalogItem | null;
  onSaved: (item: CatalogItem) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSaved
}) => {
  const isEdit = Boolean(itemToEdit);
  const suppliers = getSuppliers();

  const [type, setType] = useState<CatalogItemType>(itemToEdit?.type || 'GOODS');
  const [name, setName] = useState(itemToEdit?.name || '');
  const [group, setGroup] = useState<CatalogGroup>(
    itemToEdit?.group || (type === 'GOODS' ? 'Thức ăn' : 'Dịch vụ')
  );
  const [subType, setSubType] = useState(itemToEdit?.subType || 'Hạt');
  const [costPrice, setCostPrice] = useState<string>(
    itemToEdit ? itemToEdit.costPrice.toString() : '50000'
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    itemToEdit ? itemToEdit.sellingPrice.toString() : '100000'
  );
  const [status, setStatus] = useState<ItemStatus>(itemToEdit?.status || 'ACTIVE');
  const [supplierId, setSupplierId] = useState(itemToEdit?.supplierId || (suppliers[0]?.id || ''));
  const [expiryDate, setExpiryDate] = useState(itemToEdit?.expiryDate || '2027-12-31');
  const [durationMinutes, setDurationMinutes] = useState<string>(
    itemToEdit?.durationMinutes ? itemToEdit.durationMinutes.toString() : '45'
  );
  const [stockQuantity, setStockQuantity] = useState<string>(
    itemToEdit ? itemToEdit.stockQuantity.toString() : '10'
  );
  const [photoUrl, setPhotoUrl] = useState(
    itemToEdit?.photoUrl ||
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTypeChange = (newType: CatalogItemType) => {
    setType(newType);
    if (newType === 'SERVICE') {
      setGroup('Dịch vụ');
      setSubType('Dịch vụ');
    } else {
      setGroup('Thức ăn');
      setSubType('Hạt');
    }
  };

  const handleGroupChange = (newGroup: CatalogGroup) => {
    setGroup(newGroup);
    if (newGroup === 'Thức ăn') setSubType('Hạt');
    else if (newGroup === 'Chăm sóc body') setSubType('Sữa tắm/Dầu gội');
    else if (newGroup === 'Tiêm chủng') setSubType('Vaccine');
    else setSubType('Dịch vụ');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên hàng hóa hoặc dịch vụ.');
      return;
    }

    const sellPriceNum = parseInt(sellingPrice, 10);
    if (isNaN(sellPriceNum) || sellPriceNum < 0) {
      setErrorMsg('Giá bán phải là số không âm.');
      return;
    }

    const costPriceNum = parseInt(costPrice, 10);
    if (type === 'GOODS' && (isNaN(costPriceNum) || costPriceNum < 0)) {
      setErrorMsg('Giá vốn hàng hóa là bắt buộc và không âm.');
      return;
    }

    const stockQtyNum = parseInt(stockQuantity, 10);
    if (type === 'GOODS' && isNaN(stockQtyNum)) {
      setErrorMsg('Số lượng tồn ban đầu không hợp lệ.');
      return;
    }

    const durationNum = parseInt(durationMinutes, 10);

    const generatedCode =
      itemToEdit?.code ||
      (type === 'GOODS'
        ? `SP${Math.floor(100 + Math.random() * 900)}`
        : `DV${Math.floor(100 + Math.random() * 900)}`);

    const item: CatalogItem = {
      id: itemToEdit?.id || `item_${Date.now()}`,
      code: generatedCode,
      name: name.trim(),
      type,
      group,
      subType,
      photoUrl: photoUrl.trim() || undefined,
      costPrice: costPriceNum || 0,
      sellingPrice: sellPriceNum,
      status,
      supplierId: type === 'GOODS' ? supplierId : undefined,
      expiryDate: type === 'GOODS' ? expiryDate : undefined,
      durationMinutes: type === 'SERVICE' ? (durationNum || 45) : undefined,
      stockQuantity: type === 'GOODS' ? stockQtyNum : 0,
      isDeleted: itemToEdit?.isDeleted || false,
      createdAt: itemToEdit?.createdAt || new Date().toISOString()
    };

    saveCatalogItem(item);
    onSaved(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              {type === 'GOODS' ? <Package className="w-5 h-5" /> : <Scissors className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Cập nhật danh mục' : 'Thêm hàng hóa / Dịch vụ'}
              </h2>
              <p className="text-xs text-slate-500">Mã tự sinh: {itemToEdit?.code || 'Tự động'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {/* Radio: Hàng hóa vs Dịch vụ (SRS 7.2) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Loại mục *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('GOODS')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  type === 'GOODS'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Package className="w-4 h-4 text-indigo-600" /> Hàng hóa (Có tồn kho)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('SERVICE')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  type === 'SERVICE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Scissors className="w-4 h-4 text-emerald-600" /> Dịch vụ spa / tiêm
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên hàng hóa / dịch vụ *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Hạt Royal Canin Mini Adult 2kg..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              required
            />
          </div>

          {type === 'GOODS' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhóm hàng hóa *</label>
                <select
                  value={group}
                  onChange={e => handleGroupChange(e.target.value as CatalogGroup)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                >
                  <option value="Thức ăn">Thức ăn</option>
                  <option value="Chăm sóc body">Chăm sóc body</option>
                  <option value="Tiêm chủng">Tiêm chủng</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại chi tiết (Sub-type)</label>
                <select
                  value={subType}
                  onChange={e => setSubType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                >
                  {group === 'Thức ăn' && (
                    <>
                      <option value="Hạt">Hạt</option>
                      <option value="Pate">Pate</option>
                      <option value="Súp thưởng">Súp thưởng</option>
                      <option value="Khác">Khác</option>
                    </>
                  )}
                  {group === 'Chăm sóc body' && (
                    <>
                      <option value="Sữa tắm/Dầu gội">Sữa tắm/Dầu gội</option>
                      <option value="Bàn chải">Bàn chải</option>
                      <option value="Khăn/Tấm lót">Khăn/Tấm lót</option>
                      <option value="Xịt dưỡng">Xịt dưỡng</option>
                      <option value="Nước rửa tai">Nước rửa tai</option>
                      <option value="Khác">Khác</option>
                    </>
                  )}
                  {group === 'Tiêm chủng' && (
                    <>
                      <option value="Vaccine">Vaccine</option>
                      <option value="Kim tiêm">Kim tiêm</option>
                      <option value="Bông">Bông</option>
                      <option value="Thuốc">Thuốc</option>
                      <option value="Khác">Khác</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giá vốn (VNĐ) {type === 'GOODS' && '*'}
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                required={type === 'GOODS'}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900"
                required
              />
            </div>
          </div>

          {type === 'GOODS' ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số lượng tồn kho</label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hạn sử dụng</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời lượng dịch vụ (phút)</label>
              <input
                type="number"
                min="5"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                placeholder="Ví dụ: 45 phút"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="ACTIVE">Đang kinh doanh</option>
                <option value="DISCONTINUED">Ngừng kinh doanh</option>
              </select>
            </div>

            {type === 'GOODS' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhà cung cấp</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                >
                  <option value="">-- Không gán NCC --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hình ảnh (URL / Tùy chọn)</label>
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="URL hình ảnh sản phẩm..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-[11px]"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors min-h-[44px]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#17365D] hover:bg-[#1f4e79] text-white font-bold transition-all shadow-md min-h-[44px]"
            >
              Lưu mặt hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
