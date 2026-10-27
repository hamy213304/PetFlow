import React, { useState } from 'react';
import { X, UserPlus, MapPin, Phone, Mail, User, AlertCircle } from 'lucide-react';
import { Customer } from '../../types/petflow';
import { VIETNAM_PROVINCES } from '../../data/referenceData';
import { saveCustomer } from '../../services/storage';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSaved: (savedCustomer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onSaved
}) => {
  const isEdit = Boolean(customerToEdit);

  const [fullName, setFullName] = useState(customerToEdit?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(customerToEdit?.phoneNumber || '');
  const [email, setEmail] = useState(customerToEdit?.email || '');
  const [province, setProvince] = useState(customerToEdit?.address.province || VIETNAM_PROVINCES[0].name);
  const [ward, setWard] = useState(customerToEdit?.address.ward || VIETNAM_PROVINCES[0].wards[0]);
  const [streetDetail, setStreetDetail] = useState(customerToEdit?.address.streetDetail || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentProvinceData = VIETNAM_PROVINCES.find(p => p.name === province) || VIETNAM_PROVINCES[0];

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const pData = VIETNAM_PROVINCES.find(p => p.name === newProv);
    if (pData && pData.wards.length > 0) {
      setWard(pData.wards[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên khách hàng.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    const customer: Customer = {
      id: customerToEdit?.id || `cust_${Date.now()}`,
      code: customerToEdit?.code || `KH${Math.floor(100 + Math.random() * 900)}`,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      address: {
        province,
        ward,
        streetDetail: streetDetail.trim()
      },
      createdAt: customerToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveCustomer(customer);
    onSaved(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#17365D]/10 rounded-xl text-[#17365D]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <p className="text-xs text-slate-500">Hồ sơ khách hàng theo chuẩn SRS PetFlow</p>
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
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên khách hàng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Thị Mai"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="0912345678"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                  required
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Address fields */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Địa chỉ liên hệ
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Tỉnh / Thành phố</label>
                <select
                  value={province}
                  onChange={e => handleProvinceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs"
                >
                  {currentProvinceData.wards.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Chi tiết số nhà / tên đường</label>
              <input
                type="text"
                value={streetDetail}
                onChange={e => setStreetDetail(e.target.value)}
                placeholder="Số 123 Đường Nguyễn Huệ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
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
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
