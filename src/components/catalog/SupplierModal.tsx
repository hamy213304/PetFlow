import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Mail, AlertCircle, FileText } from 'lucide-react';
import { Supplier, SupplierBusinessType } from '../../types/petflow';
import { VIETNAM_PROVINCES } from '../../data/referenceData';
import { saveSupplier } from '../../services/storage';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
  onSaved: (supplier: Supplier) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
  onSaved
}) => {
  const isEdit = Boolean(supplierToEdit);

  const [name, setName] = useState(supplierToEdit?.name || '');
  const [businessType, setBusinessType] = useState<SupplierBusinessType>(
    supplierToEdit?.businessType || 'Công ty'
  );
  const [phoneNumber, setPhoneNumber] = useState(supplierToEdit?.phoneNumber || '');
  const [email, setEmail] = useState(supplierToEdit?.email || '');
  const [taxCode, setTaxCode] = useState(supplierToEdit?.taxCode || '');
  const [province, setProvince] = useState(
    supplierToEdit?.address.province || VIETNAM_PROVINCES[0].name
  );
  const [ward, setWard] = useState(
    supplierToEdit?.address.ward || VIETNAM_PROVINCES[0].wards[0]
  );
  const [streetDetail, setStreetDetail] = useState(supplierToEdit?.address.streetDetail || '');
  const [notes, setNotes] = useState(supplierToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProvinceData = VIETNAM_PROVINCES.find(p => p.name === province) || VIETNAM_PROVINCES[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên nhà cung cấp.');
      return;
    }

    const supplier: Supplier = {
      id: supplierToEdit?.id || `ncc_${Date.now()}`,
      code: supplierToEdit?.code || `NCC${Math.floor(100 + Math.random() * 900)}`,
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
      notes: notes.trim() || undefined,
      isDeleted: supplierToEdit?.isDeleted || false,
      createdAt: supplierToEdit?.createdAt || new Date().toISOString()
    };

    saveSupplier(supplier);
    onSaved(supplier);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
              </h2>
              <p className="text-xs text-slate-500">Mã tự sinh: {supplierToEdit?.code || 'Tự động'}</p>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên nhà cung cấp *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Công ty Cổ phần Thú Y Xanh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Loại hình kinh doanh</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value as SupplierBusinessType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
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
                placeholder="MST doanh nghiệp..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="02838991234"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@ncc.vn"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-purple-600" /> Địa chỉ nhà cung cấp
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Tỉnh / Thành phố</label>
                <select
                  value={province}
                  onChange={e => {
                    setProvince(e.target.value);
                    const pData = VIETNAM_PROVINCES.find(p => p.name === e.target.value);
                    if (pData?.wards[0]) setWard(pData.wards[0]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  {currentProvinceData.wards.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Số nhà / Đường</label>
              <input
                type="text"
                value={streetDetail}
                onChange={e => setStreetDetail(e.target.value)}
                placeholder="Tòa nhà, số đường..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú mặt hàng cung ứng, điều kiện chiết khấu..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
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
              Lưu nhà cung cấp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
