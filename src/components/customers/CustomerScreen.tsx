import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Users,
  CheckSquare,
  Square,
  Trash2,
  Phone,
  MapPin,
  Dog,
  Cat,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { Customer } from '../../types/petflow';
import { getCustomers, getPetsByCustomerId, deleteCustomer } from '../../services/storage';
import { CustomerModal } from './CustomerModal';
import { CustomerDetailView } from './CustomerDetailView';

interface CustomerScreenProps {
  onOpenAppointments: () => void;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({ onOpenAppointments }) => {
  const [customers, setCustomers] = useState<Customer[]>(getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  const reload = () => {
    setCustomers(getCustomers());
  };

  useEffect(() => {
    reload();
    const handleDataChange = () => reload();
    window.addEventListener('petflow_data_change', handleDataChange);
    return () => window.removeEventListener('petflow_data_change', handleDataChange);
  }, []);

  // Approximate search by Name, Address, Phone, Email
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const nameMatch = c.fullName.toLowerCase().includes(term);
    const phoneMatch = c.phoneNumber.includes(term);
    const emailMatch = c.email.toLowerCase().includes(term);
    const addrMatch = `${c.address.streetDetail} ${c.address.ward} ${c.address.province}`
      .toLowerCase()
      .includes(term);
    return nameMatch || phoneMatch || emailMatch || addrMatch;
  });

  const isAllSelected =
    filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    selectedIds.forEach(id => deleteCustomer(id));
    setSelectedIds(new Set());
    setShowBatchDeleteModal(false);
    reload();
  };

  // If viewing details of a single customer
  if (activeCustomer) {
    return (
      <CustomerDetailView
        customer={activeCustomer}
        onBack={() => setActiveCustomer(null)}
        onCustomerDeleted={() => {
          setActiveCustomer(null);
          reload();
        }}
        onCustomerUpdated={updated => {
          setActiveCustomer(updated);
          reload();
        }}
      />
    );
  }

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-3.5">
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">Khách hàng & Thú cưng</h2>
          <p className="text-xs text-slate-500">{customers.length} khách hàng đã lưu</p>
        </div>

        {/* Nút "Xem lịch hẹn" theo thiết kế file chức năng & SRS Section 2.2 */}
        <button
          onClick={onOpenAppointments}
          className="py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-700/20 active:scale-[0.98] transition-all min-h-[40px]"
        >
          <Calendar className="w-4 h-4" />
          <span>Xem lịch hẹn</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên, địa chỉ, số điện thoại, email..."
          className="w-full px-3.5 py-2.5 pl-10 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17365D] shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Selection & Batch Action Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold py-1"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-[#17365D]" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
        </button>

        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowBatchDeleteModal(true)}
            className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa đã chọn ({selectedIds.size})</span>
          </button>
        )}
      </div>

      {/* Customers Cards List (SRS Section 5.1: hiển thị dạng thẻ, không phải bảng) */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
            <p className="text-xs font-semibold text-slate-700">Không tìm thấy khách hàng nào</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác.' : 'Bấm nút "+" để thêm khách hàng đầu tiên.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const isSelected = selectedIds.has(cust.id);
            const pets = getPetsByCustomerId(cust.id);
            return (
              <div
                key={cust.id}
                onClick={() => setActiveCustomer(cust)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#17365D] bg-blue-50/20 ring-1 ring-[#17365D]'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Checkbox trigger */}
                    <button
                      type="button"
                      onClick={e => toggleSelectOne(cust.id, e)}
                      className="mt-0.5 p-0.5 text-slate-400 hover:text-[#17365D] min-h-[28px] min-w-[28px] flex items-center justify-center shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#17365D]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{cust.fullName}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">({cust.code})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-mono font-medium">{cust.phoneNumber}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {cust.address.streetDetail ? `${cust.address.streetDetail}, ` : ''}
                          {cust.address.ward}, {cust.address.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pet Count Badge */}
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                      <Dog className="w-3.5 h-3.5 text-amber-600" />
                      {pets.length} pet
                    </span>
                  </div>
                </div>

                {/* Pet Quick Avatars preview */}
                {pets.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {pets.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 shrink-0 text-[10px]"
                      >
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-400">({p.species})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) to Add Customer */}
      <div className="fixed bottom-20 right-5 z-30">
        <button
          onClick={() => {
            setCustomerToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-[#17365D] hover:bg-[#1f4e79] text-white flex items-center justify-center shadow-xl shadow-[#17365D]/30 active:scale-95 transition-all"
          title="Thêm khách hàng"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customerToEdit={customerToEdit}
        onSaved={newCust => {
          reload();
          setActiveCustomer(newCust);
        }}
      />

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xóa {selectedIds.size} khách hàng đã chọn?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Các khách hàng và thú cưng tương ứng sẽ được ẩn an toàn nhằm bảo toàn lịch sử hóa đơn và số liệu báo cáo.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowBatchDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleBatchDelete}
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
