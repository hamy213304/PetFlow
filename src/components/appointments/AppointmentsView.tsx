import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Receipt,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Appointment } from '../../types/petflow';
import { getAppointments } from '../../services/storage';
import {
  isAppointmentPastUnhandled,
  cancelAppointmentWithCleanup
} from '../../services/appointmentService';
import { formatTimeVN, formatDateVN } from '../../utils/formatters';
import { AppointmentModal } from './AppointmentModal';

interface AppointmentsViewProps {
  onBack: () => void;
  onOpenCreateInvoiceForAppointment: (apt: Appointment) => void;
  selectedAppointmentId?: string | null;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onBack,
  onOpenCreateInvoiceForAppointment,
  selectedAppointmentId
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterSpecificDayInMonth, setFilterSpecificDayInMonth] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const reload = () => {
    setAppointments(getAppointments());
  };

  useEffect(() => {
    reload();
    const handleDataChange = () => reload();
    window.addEventListener('petflow_data_change', handleDataChange);
    return () => window.removeEventListener('petflow_data_change', handleDataChange);
  }, []);

  // If a specific appointment ID was passed to highlight
  useEffect(() => {
    if (selectedAppointmentId) {
      const target = appointments.find(a => a.id === selectedAppointmentId);
      if (target) {
        const dStr = target.startDateTime.slice(0, 10);
        setSelectedDate(dStr);
        setSelectedMonth(dStr.slice(0, 7));
      }
    }
  }, [selectedAppointmentId, appointments]);

  // Appointments in view
  const displayedAppointments = appointments.filter(a => {
    if (a.isCanceled) return false;
    if (viewMode === 'week') {
      return a.startDateTime.slice(0, 10) === selectedDate;
    } else {
      // Month view mode
      if (filterSpecificDayInMonth) {
        return a.startDateTime.slice(0, 10) === filterSpecificDayInMonth;
      }
      return a.startDateTime.slice(0, 7) === selectedMonth;
    }
  });

  // Sort displayed appointments chronologically
  displayedAppointments.sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );

  // Week days generator around selectedDate
  const getDaysInCurrentWeek = (): { dateStr: string; dayNum: number; dayName: string; isSelected: boolean }[] => {
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 is Sun
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Mon as start

    const days = [];
    const names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const str = d.toISOString().slice(0, 10);
      days.push({
        dateStr: str,
        dayNum: d.getDate(),
        dayName: names[i],
        isSelected: str === selectedDate
      });
    }
    return days;
  };

  // Month grid generator for selectedMonth (YYYY-MM)
  const getMonthCalendarDays = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // In JS, getDay(): 0 is Sunday, 1 is Monday ...
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6

    const days: { dayNum: number | null; dateStr: string | null; count: number }[] = [];
    // Padding before 1st of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNum: null, dateStr: null, count: 0 });
    }
    // Days of month
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${selectedMonth}-${d.toString().padStart(2, '0')}`;
      const aptCount = appointments.filter(
        a => !a.isCanceled && a.startDateTime.slice(0, 10) === dStr
      ).length;
      days.push({
        dayNum: d,
        dateStr: dStr,
        count: aptCount
      });
    }
    return days;
  };

  // Day navigation for Week mode
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  // Month navigation for Month mode
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    const mStr = `${prev.getFullYear()}-${(prev.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonth(mStr);
    setFilterSpecificDayInMonth(null);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const mStr = `${next.getFullYear()}-${(next.getMonth() + 1).toString().padStart(2, '0')}`;
    setSelectedMonth(mStr);
    setFilterSpecificDayInMonth(null);
  };

  // Format month label: "Tháng MM/YYYY"
  const [curY, curM] = selectedMonth.split('-');
  const monthDisplayLabel = `Tháng ${curM}/${curY}`;

  return (
    <div className="pb-24 max-w-md mx-auto space-y-3.5 animate-in fade-in duration-150">
      {/* Top App Bar */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs min-h-[44px] -ml-1 pr-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <span className="text-xs font-bold text-slate-900">Lịch hẹn dịch vụ</span>
        <button
          onClick={() => {
            setAppointmentToEdit(null);
            setIsModalOpen(true);
          }}
          className="py-1.5 px-3 bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Đặt lịch
        </button>
      </div>

      <div className="px-4 space-y-3.5">
        {/* Calendar Mode & Date Navigator Header */}
        <div className="bg-white rounded-3xl p-3.5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            {viewMode === 'week' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDay}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {formatDateVN(selectedDate)}
                </span>
                <button
                  onClick={handleNextDay}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {monthDisplayLabel}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => {
                  setViewMode('week');
                  setFilterSpecificDayInMonth(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'week' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Tuần
              </button>
              <button
                onClick={() => {
                  setViewMode('month');
                  setSelectedMonth(selectedDate.slice(0, 7));
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'month' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Tháng
              </button>
            </div>
          </div>

          {/* Horizontal Week Scroller */}
          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 gap-1 pt-1 text-center">
              {getDaysInCurrentWeek().map(d => (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    d.isSelected
                      ? 'bg-[#17365D] text-white shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold">{d.dayName}</span>
                  <span className={`text-sm font-bold font-mono mt-0.5 ${d.isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {d.dayNum}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Month Calendar Grid */
            <div className="pt-1 space-y-2">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {getMonthCalendarDays().map((d, idx) => {
                  if (!d.dayNum || !d.dateStr) {
                    return <div key={`empty_${idx}`} className="h-8" />;
                  }
                  const isSelectedDay = filterSpecificDayInMonth === d.dateStr;
                  const isToday = d.dateStr === new Date().toISOString().slice(0, 10);
                  const hasApt = d.count > 0;

                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => {
                        const targetDate = d.dateStr;
                        if (!targetDate || isSelectedDay) {
                          setFilterSpecificDayInMonth(null);
                        } else {
                          setFilterSpecificDayInMonth(targetDate);
                          setSelectedDate(targetDate);
                        }
                      }}
                      className={`h-9 rounded-xl flex flex-col items-center justify-center text-xs font-mono transition-all relative ${
                        isSelectedDay
                          ? 'bg-[#17365D] text-white font-bold shadow-xs'
                          : isToday
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span>{d.dayNum}</span>
                      {hasApt && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isSelectedDay ? 'bg-amber-300' : 'bg-blue-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {filterSpecificDayInMonth && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600 font-medium">
                    Đang xem ngày: <b className="font-mono text-slate-900">{formatDateVN(filterSpecificDayInMonth)}</b>
                  </span>
                  <button
                    onClick={() => setFilterSpecificDayInMonth(null)}
                    className="text-blue-700 font-semibold hover:underline"
                  >
                    Xem cả tháng
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend / Status Note */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Sắp tới</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Quá giờ (chưa có hóa đơn)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Đã hoàn thành</span>
          </div>
        </div>

        {/* Appointments List Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800">
            {viewMode === 'week'
              ? `Lịch hẹn ngày ${formatDateVN(selectedDate)}`
              : filterSpecificDayInMonth
              ? `Lịch hẹn ngày ${formatDateVN(filterSpecificDayInMonth)}`
              : `Tất cả lịch hẹn ${monthDisplayLabel}`}
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {displayedAppointments.length} lịch hẹn
          </span>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {displayedAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {viewMode === 'week'
                  ? 'Không có lịch hẹn nào trong ngày này'
                  : 'Không có lịch hẹn nào trong khoảng thời gian này'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Bấm "Đặt lịch" ở góc trên để tạo lịch hẹn cho khách.
              </p>
            </div>
          ) : (
            displayedAppointments.map(apt => {
              const isPastGray = isAppointmentPastUnhandled(apt); // TC-12
              const isHandled = Boolean(apt.linkedInvoiceId);
              const aptDateStr = apt.startDateTime.slice(0, 10);

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl p-4 border transition-all relative shadow-xs ${
                    isHandled
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isPastGray
                      ? 'bg-slate-100/90 border-slate-300 text-slate-600' // TC-12 gray style
                      : 'bg-white border-blue-200/80 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Date tag in month view */}
                      {viewMode === 'month' && !filterSpecificDayInMonth && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mb-1">
                          {formatDateVN(aptDateStr)}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold font-mono ${
                            isPastGray ? 'text-slate-600' : 'text-[#17365D]'
                          }`}
                        >
                          {formatTimeVN(apt.startDateTime)} - {formatTimeVN(apt.expectedEndDateTime)}
                        </span>
                        {isHandled ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã xong
                          </span>
                        ) : isPastGray ? (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                            Quá giờ hẹn
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                            Đang chờ
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {apt.customerName}
                        <span className="text-[11px] font-normal text-slate-500 font-mono">
                          ({apt.customerPhone})
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setAppointmentToEdit(apt);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg text-xs"
                        title="Sửa lịch"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setCancelConfirmId(apt.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                        title="Hủy lịch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Services list */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-slate-500" /> Dịch vụ:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {apt.services.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200 text-[11px] text-slate-800"
                        >
                          {s.serviceName} {s.quantity > 1 ? `(x${s.quantity})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic bg-white/60 p-1.5 rounded-lg border border-slate-100">
                      Ghi chú: "{apt.notes}"
                    </p>
                  )}

                  {/* Quick Action: Create Invoice */}
                  {!isHandled && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                      <button
                        onClick={() => onOpenCreateInvoiceForAppointment(apt)}
                        className="py-1.5 px-3 bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Tạo hóa đơn & Thanh toán
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointmentToEdit={appointmentToEdit}
        initialDate={selectedDate}
        onSaved={reload}
      />

      {/* Cancel Confirmation Modal (TC-11) */}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Hủy lịch hẹn này?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lịch hẹn sẽ biến mất khỏi danh sách chính và mọi thông báo nhắc hẹn trước 30 phút sẽ được hủy tự động.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Không, giữ lại
              </button>
              <button
                onClick={() => {
                  cancelAppointmentWithCleanup(cancelConfirmId);
                  setCancelConfirmId(null);
                  reload();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
