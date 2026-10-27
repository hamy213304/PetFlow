import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Edit2,
  Trash2,
  Save,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Supplier, SupplierBusinessType } from '../../types/petflow';
import { saveSupplier, deleteSupplier } from '../../services/storage';
import { VIETNAM_PROVINCES } from '../../data/referenceData';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onUpdated?: () => void;
  onSaved?: () => void;
  onDeleted: () => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onUpdated,
  onSaved,
  onDeleted
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<SupplierBusinessType>('Công ty');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [province, setProvince] = useState(VIETNAM_PROVINCES[0].name);
  const [ward, setWard] = useState(VIETNAM_PROVINCES[0].wards[0]);
  const [streetDetail, setStreetDetail] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with incoming supplier prop (Fix for Item 7: resets properly on any card click!)
  useEffect(() => {
    if (isOpen && supplier) {
      setIsEditMode(false);
      setShowDeleteConfirm(false);
      setErrorMsg(null);
      setName(supplier.name || '');
      setBusinessType(supplier.businessType || 'Công ty');
      setPhoneNumber(supplier.phoneNumber || '');
      setEmail(supplier.email || '');
      setTaxCode(supplier.taxCode || '');
      setProvince(supplier.address?.province || VIETNAM_PROVINCES[0].name);
      setWard(supplier.address?.ward || VIETNAM_PROVINCES[0].wards[0]);
      setStreetDetail(supplier.address?.streetDetail || '');
      setNotes(supplier.notes || '');
    }
  }, [supplier, isOpen]);

  if (!isOpen || !supplier) return null;

  const currentProvinceData = VIETNAM_PROVINCES.find(p => p.name === province) || VIETNAM_PROVINCES[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên nhà cung cấp.');
      return;
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      name: name.trim(),
      businessType,
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      taxCode: taxCode.trim(),
      address: {
        province,
        ward,
        streetDetail: streetDetail.trim()
      },
      notes: notes.trim() || undefined
    };

    saveSupplier(updatedSupplier);
    if (onSaved) onSaved();
    else if (onUpdated) onUpdated();
    setIsEditMode(false);
  };

  const handleDelete = () => {
    deleteSupplier(supplier.id);
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight truncate max-w-[200px]">
                  {supplier.name}
                </h2>
                <span className="text-[10px] font-mono text-slate-400">({supplier.code})</span>
              </div>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Chế độ chỉnh sửa thông tin' : 'Chế độ xem chi tiết nhà cung cấp'}
              </p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {!isEditMode ? (
            /* VIEW ONLY MODE */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{supplier.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                    {supplier.businessType}
                  </span>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-200/60 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-mono font-medium text-slate-900">
                      {supplier.phoneNumber || 'Chưa cập nhật SĐT'}
                    </span>
                  </div>

                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{supplier.email}</span>
                    </div>
                  )}

                  {supplier.taxCode && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Mã số thuế: <b className="font-mono text-slate-800">{supplier.taxCode}</b></span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 pt-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {supplier.address?.streetDetail ? `${supplier.address.streetDetail}, ` : ''}
                      {supplier.address?.ward}, {supplier.address?.province}
                    </span>
                  </div>
                </div>

                {supplier.notes && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Ghi chú đối tác:</span>
                    <p className="text-slate-700 italic">"{supplier.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form id="editSupplierForm" onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên nhà cung cấp *</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Loại hình</label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as SupplierBusinessType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Công ty">Công ty</option>
                    <option value="Cá nhân/Hộ kinh doanh">Cá nhân/Hộ KD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã số thuế</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={e => setTaxCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* 63 Provinces & Wards */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tỉnh / Thành phố</label>
                  <select
                    value={province}
                    onChange={e => {
                      setProvince(e.target.value);
                      const pData = VIETNAM_PROVINCES.find(p => p.name === e.target.value);
                      if (pData?.wards[0]) setWard(pData.wards[0]);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {VIETNAM_PROVINCES.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Xã / Phường</label>
                  <select
                    value={ward}
                    onChange={e => setWard(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {currentProvinceData.wards.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={streetDetail}
                  onChange={e => setStreetDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </form>
          )}
        </div>

        {/* Bottom Actions per Item 5:
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
                form="editSupplierForm"
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
                <Trash2 className="w-4 h-4" /> Xóa nhà cung cấp
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

      {/* Confirmation Popup for Deleting Supplier (Item 6) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận xóa nhà cung cấp?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa nhà cung cấp <b>"{supplier.name}"</b>? Thao tác này sẽ ẩn nhà cung cấp khỏi danh mục.
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
