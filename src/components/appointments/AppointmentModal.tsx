import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Appointment, AppointmentServiceItem } from '../../types/petflow';
import { getCustomers, getCatalogItems } from '../../services/storage';
import { checkAppointmentConflict, createOrUpdateAppointment } from '../../services/appointmentService';
import { formatVND, addMinutesToLocalDatetime } from '../../utils/formatters';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: Appointment | null;
  initialDate?: string;
  onSaved: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
  initialDate,
  onSaved
}) => {
  const isEdit = Boolean(appointmentToEdit);
  const customers = getCustomers();
  const servicesList = getCatalogItems().filter(i => i.type === 'SERVICE');

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    appointmentToEdit?.customerId || (customers[0]?.id ?? '')
  );
  const [startDateTime, setStartDateTime] = useState(
    appointmentToEdit?.startDateTime ||
      (initialDate
        ? `${initialDate}T09:00`
        : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16))
  );
  const [notes, setNotes] = useState(appointmentToEdit?.notes || '');
  const [selectedServices, setSelectedServices] = useState<AppointmentServiceItem[]>(
    appointmentToEdit?.services || (servicesList[0] ? [{
      serviceId: servicesList[0].id,
      serviceName: servicesList[0].name,
      durationMinutes: servicesList[0].durationMinutes || 45,
      price: servicesList[0].sellingPrice,
      quantity: 1
    }] : [])
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedCustomerId(appointmentToEdit.customerId);
      setStartDateTime(appointmentToEdit.startDateTime);
      setNotes(appointmentToEdit.notes || '');
      setSelectedServices(appointmentToEdit.services || []);
    }
  }, [appointmentToEdit]);

  if (!isOpen) return null;

  // Calculate total duration (sum of duration * quantity)
  const totalDurationMinutes = selectedServices.reduce(
    (sum, s) => sum + (s.durationMinutes || 45) * s.quantity,
    0
  );

  const calculateExpectedEnd = (startIso: string, durationMin: number): string => {
    return addMinutesToLocalDatetime(startIso, durationMin);
  };

  const handleAddService = (serviceId: string) => {
    const srv = servicesList.find(s => s.id === serviceId);
    if (!srv) return;
    const existingIndex = selectedServices.findIndex(s => s.serviceId === serviceId);
    if (existingIndex >= 0) {
      const next = [...selectedServices];
      next[existingIndex].quantity += 1;
      setSelectedServices(next);
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId: srv.id,
          serviceName: srv.name,
          durationMinutes: srv.durationMinutes || 45,
          price: srv.sellingPrice,
          quantity: 1
        }
      ]);
    }
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const next = [...selectedServices];
    next[index].quantity = newQty;
    setSelectedServices(next);
  };

  const handleSubmit = (forceProceed = false) => {
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg('Vui lòng chọn khách hàng.');
      return;
    }
    if (selectedServices.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một dịch vụ dự kiến.');
      return;
    }

    // Overlap conflict check (SRS Section 6.2)
    if (!forceProceed) {
      const conflict = checkAppointmentConflict(
        startDateTime,
        totalDurationMinutes,
        appointmentToEdit?.id
      );
      if (conflict.hasConflict) {
        setConflictWarning(conflict.message || 'Lịch hẹn bị trùng giờ với lịch khác.');
        return;
      }
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const expectedEndDateTime = calculateExpectedEnd(startDateTime, totalDurationMinutes);

    const appointment: Appointment = {
      id: appointmentToEdit?.id || `apt_${Date.now()}`,
      customerId: selectedCustomerId,
      customerName: customer?.fullName || 'Khách hàng',
      customerPhone: customer?.phoneNumber || '',
      startDateTime,
      durationMinutes: totalDurationMinutes,
      expectedEndDateTime,
      services: selectedServices,
      notes: notes.trim() || undefined,
      isCanceled: appointmentToEdit?.isCanceled || false,
      linkedInvoiceId: appointmentToEdit?.linkedInvoiceId,
      createdAt: appointmentToEdit?.createdAt || new Date().toISOString()
    };

    const res = createOrUpdateAppointment(appointment, !isEdit);
    if (!res.success) {
      setErrorMsg(res.message || 'Lỗi khi lưu lịch hẹn.');
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Chỉnh sửa lịch hẹn' : 'Đặt lịch hẹn mới'}
              </h2>
              <p className="text-xs text-slate-500">Đặt lịch hẹn dịch vụ spa thú cưng</p>
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

        {/* Conflict Warning Confirmation Banner */}
        {conflictWarning && (
          <div className="mx-5 mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{conflictWarning}</p>
            </div>
            <div className="flex gap-2 pt-1 justify-end">
              <button
                type="button"
                onClick={() => setConflictWarning(null)}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold text-[11px]"
              >
                Chọn giờ khác
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
              >
                Vẫn tiếp tục lưu
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Khách hàng *</label>
            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs font-medium text-slate-900"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.phoneNumber}
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ngày & Giờ bắt đầu *</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={e => setStartDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs font-mono font-medium"
                required
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Services Selection (Section 6.1) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Dịch vụ dự kiến *</label>
              <span className="text-[11px] text-blue-700 font-mono font-bold">
                Thời lượng: {totalDurationMinutes} phút
              </span>
            </div>

            {/* Quick service selector */}
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddService(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
            >
              <option value="" disabled>+ Chọn thêm dịch vụ...</option>
              {servicesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes || 45}p - {formatVND(s.sellingPrice)})
                </option>
              ))}
            </select>

            {/* Selected services list */}
            <div className="space-y-2 divide-y divide-slate-100 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
              {selectedServices.map((srv, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{srv.serviceName}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {srv.durationMinutes} phút • {formatVND(srv.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, srv.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold font-mono">{srv.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(idx, srv.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Yêu cầu riêng của khách (nhút nhát, cần sấy ấm, da dị ứng...)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors min-h-[44px]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 py-3 rounded-xl bg-[#17365D] hover:bg-[#1f4e79] text-white font-bold transition-all shadow-md min-h-[44px]"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
