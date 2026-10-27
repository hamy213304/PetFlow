import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Syringe,
  Dog,
  Cat,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Customer, Pet, VaccinationRecord } from '../../types/petflow';
import {
  getPetsByCustomerId,
  getVaccinationsByPetId,
  getLatestVaccinationDate,
  saveCustomer,
  deleteCustomer,
  deletePet
} from '../../services/storage';
import { deleteVaccinationWithRules } from '../../services/vaccineService';
import { formatDateVN } from '../../utils/formatters';
import { VIETNAM_PROVINCES } from '../../data/referenceData';
import { PetModal } from './PetModal';
import { VaccinationModal } from './VaccinationModal';

interface CustomerDetailViewProps {
  customer: Customer;
  onBack: () => void;
  onCustomerDeleted: () => void;
  onCustomerUpdated: (updated: Customer) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  onBack,
  onCustomerDeleted,
  onCustomerUpdated
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Edit form state
  const [fullName, setFullName] = useState(customer.fullName);
  const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber);
  const [email, setEmail] = useState(customer.email);
  const [province, setProvince] = useState(customer.address.province);
  const [ward, setWard] = useState(customer.address.ward);
  const [streetDetail, setStreetDetail] = useState(customer.address.streetDetail);

  // Modals state
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [isVacModalOpen, setIsVacModalOpen] = useState(false);
  const [vacToEdit, setVacToEdit] = useState<VaccinationRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPetDeleteConfirm, setShowPetDeleteConfirm] = useState<string | null>(null);
  const [showVacDeleteConfirm, setShowVacDeleteConfirm] = useState<string | null>(null);

  const pets = getPetsByCustomerId(customer.id);
  const currentProvinceData = VIETNAM_PROVINCES.find(p => p.name === province) || VIETNAM_PROVINCES[0];

  const handleSaveCustomer = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên và Số điện thoại.');
      return;
    }

    const updated: Customer = {
      ...customer,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      address: {
        province,
        ward,
        streetDetail: streetDetail.trim()
      },
      updatedAt: new Date().toISOString()
    };

    saveCustomer(updated);
    onCustomerUpdated(updated);
    setIsEditMode(false);
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(customer.id);
    onCustomerDeleted();
  };

  return (
    <div className="pb-24 max-w-md mx-auto space-y-4">
      {/* Top App Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <button
          onClick={selectedPet ? () => setSelectedPet(null) : onBack}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs min-h-[44px] -ml-1 pr-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {selectedPet ? 'Hồ sơ khách' : 'Danh sách khách'}
        </button>
        <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
          {selectedPet ? selectedPet.name : customer.fullName}
        </span>
        <span className="text-[11px] font-mono text-slate-400">{customer.code}</span>
      </div>

      {/* VIEW: Pet Detail View if a pet is selected */}
      {selectedPet ? (
        <div className="px-4 space-y-4 animate-in fade-in duration-150">
          {/* Pet Profile Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={selectedPet.photoUrl}
                  alt={selectedPet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedPet.species === 'Chó' ? (
                      <Dog className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <Cat className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {selectedPet.name}
                  </h3>
                  <button
                    onClick={() => {
                      setPetToEdit(selectedPet);
                      setIsPetModalOpen(true);
                    }}
                    className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                  </button>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{selectedPet.breed}</p>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mt-2 font-mono">
                  <span>Giới tính: <b className="text-slate-800">{selectedPet.gender}</b></span>
                  <span>•</span>
                  <span>Cân nặng: <b className="text-slate-800">{selectedPet.weightKg} kg</b></span>
                  <span>•</span>
                  <span>{selectedPet.neutered}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Ngày sinh:</span>
                <span className="font-medium font-mono">{formatDateVN(selectedPet.dob)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Màu lông:</span>
                <span className="font-medium">{selectedPet.color || 'Chưa cập nhật'}</span>
              </div>
              {selectedPet.identificationNotes && (
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block">Đặc điểm nhận dạng:</span>
                  <p className="font-medium text-slate-700">{selectedPet.identificationNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vaccination History Section (Section 5.5) */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lịch sử tiêm phòng</h3>
              </div>
              <button
                onClick={() => {
                  setVacToEdit(null);
                  setIsVacModalOpen(true);
                }}
                className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mũi tiêm
              </button>
            </div>

            {/* List of vaccinations */}
            {(() => {
              const vacs = getVaccinationsByPetId(selectedPet.id);
              if (vacs.length === 0) {
                return (
                  <div className="py-8 text-center text-slate-400">
                    <Syringe className="w-8 h-8 mx-auto text-slate-300 stroke-[1.2] mb-1.5" />
                    <p className="text-xs font-medium text-slate-600">Chưa có lịch sử tiêm phòng</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Bấm "Thêm mũi tiêm" để nhập thông tin sổ tiêm phòng.</p>
                  </div>
                );
              }
              return (
                <div className="space-y-2.5">
                  {vacs.map(v => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{v.vaccineType}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Ngày tiêm: {formatDateVN(v.vaccinationDate)} • Hiệu lực {v.validityYears} năm
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setVacToEdit(v);
                              setIsVacModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowVacDeleteConfirm(v.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-md"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {v.nextDueDate && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Lịch tiêm tiếp theo: <b className="font-mono">{formatDateVN(v.nextDueDate)}</b></span>
                        </div>
                      )}

                      {v.certificatePhotoUrl && (
                        <div className="flex items-center gap-2 pt-1">
                          <img
                            src={v.certificatePhotoUrl}
                            alt="Chứng nhận"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="text-[10px] text-slate-400">Giấy chứng nhận tiêm</span>
                        </div>
                      )}

                      {v.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                          "{v.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* VIEW: Customer Details & Pets List */
        <div className="px-4 space-y-4">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin khách hàng</span>
              <span className="text-xs text-slate-400 font-mono">Mã: {customer.code}</span>
            </div>

            {isEditMode ? (
              /* Edit Mode inputs */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                    />
                  </div>
                </div>

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
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
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
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    >
                      {currentProvinceData.wards.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Số nhà, tên đường</label>
                  <input
                    type="text"
                    value={streetDetail}
                    onChange={e => setStreetDetail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
                  />
                </div>
              </div>
            ) : (
              /* View-Only Mode fields */
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-900">{customer.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a href={`tel:${customer.phoneNumber}`} className="font-mono font-medium hover:underline text-blue-700">
                    {customer.phoneNumber}
                  </a>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{customer.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-slate-600 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {customer.address.streetDetail ? `${customer.address.streetDetail}, ` : ''}
                    {customer.address.ward}, {customer.address.province}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pets List Section */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Dog className="w-4 h-4 text-[#17365D]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thú cưng ({pets.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setPetToEdit(null);
                  setIsPetModalOpen(true);
                }}
                className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-[#17365D] text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm pet
              </button>
            </div>

            {pets.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs font-medium text-slate-500">Khách hàng chưa có thú cưng nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bấm "Thêm pet" để tạo hồ sơ cho bé.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pets.map(pet => {
                  const latestVacDate = getLatestVaccinationDate(pet.id);
                  return (
                    <div
                      key={pet.id}
                      onClick={() => setSelectedPet(pet)}
                      className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={pet.photoUrl}
                            alt={pet.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                            {pet.name}
                            <span className="text-[10px] text-slate-500 font-normal">({pet.species} - {pet.gender})</span>
                          </h4>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">{pet.breed}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                            <Syringe className="w-3 h-3 text-emerald-600" />
                            <span>Tiêm gần nhất: <b className="font-mono text-slate-700">{formatDateVN(latestVacDate)}</b></span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#17365D] font-bold shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Chi tiết & Tiêm &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Bar per SRS 5.1: Xóa & Chỉnh sửa -> Chỉnh sửa becomes Lưu */}
          <div className="pt-2 flex gap-2.5">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-3 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" /> Xóa khách
            </button>

            {isEditMode ? (
              <button
                onClick={handleSaveCustomer}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md min-h-[44px]"
              >
                <Save className="w-4 h-4" /> Lưu thông tin
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md min-h-[44px]"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Customer Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận xóa khách hàng?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa hồ sơ khách hàng <b>"{customer.fullName}"</b>? Hệ thống sẽ ẩn khách hàng và thú cưng để bảo toàn lịch sử hóa đơn.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Không, giữ lại
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Vaccination Confirm Modal */}
      {showVacDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận xóa mũi tiêm?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc muốn xóa bản ghi mũi tiêm này? Hệ thống sẽ tự động hủy các thông báo nhắc nhở liên quan.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowVacDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  deleteVaccinationWithRules(showVacDeleteConfirm);
                  setShowVacDeleteConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Modal */}
      <PetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        customerId={customer.id}
        petToEdit={petToEdit}
        onSaved={p => {
          if (selectedPet?.id === p.id) setSelectedPet(p);
        }}
      />

      {/* Vaccination Modal */}
      {selectedPet && (
        <VaccinationModal
          isOpen={isVacModalOpen}
          onClose={() => setIsVacModalOpen(false)}
          petId={selectedPet.id}
          petName={selectedPet.name}
          recordToEdit={vacToEdit}
          onSaved={() => {}}
        />
      )}
    </div>
  );
};
