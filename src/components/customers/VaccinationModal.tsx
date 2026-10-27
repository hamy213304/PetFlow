import React, { useState, useEffect } from 'react';
import { X, Syringe, Calendar, AlertCircle } from 'lucide-react';
import { VaccinationRecord } from '../../types/petflow';
import { saveVaccinationWithRules } from '../../services/vaccineService';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface VaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  recordToEdit?: VaccinationRecord | null;
  onSaved: (savedRecord: VaccinationRecord) => void;
}

export const VaccinationModal: React.FC<VaccinationModalProps> = ({
  isOpen,
  onClose,
  petId,
  petName,
  recordToEdit,
  onSaved
}) => {
  const isEdit = Boolean(recordToEdit);

  const [vaccineType, setVaccineType] = useState('Vaccine 7 bệnh Vanguard Plus 5/L');
  const [vaccinationDate, setVaccinationDate] = useState(new Date().toISOString().slice(0, 10));
  const [validityYears, setValidityYears] = useState<number>(1);
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80'
  );
  const [notes, setNotes] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        setVaccineType(recordToEdit.vaccineType || 'Vaccine 7 bệnh Vanguard Plus 5/L');
        setVaccinationDate(recordToEdit.vaccinationDate || new Date().toISOString().slice(0, 10));
        setValidityYears(recordToEdit.validityYears || 1);
        setCertificatePhotoUrl(
          recordToEdit.certificatePhotoUrl ||
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80'
        );
        setNotes(recordToEdit.notes || '');
        setNextDueDate(recordToEdit.nextDueDate || '');
      } else {
        setVaccineType('Vaccine 7 bệnh Vanguard Plus 5/L');
        setVaccinationDate(new Date().toISOString().slice(0, 10));
        setValidityYears(1);
        setCertificatePhotoUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80');
        setNotes('');
        setNextDueDate('');
      }
      setErrorMsg(null);
    }
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!vaccineType.trim()) {
      setErrorMsg('Vui lòng chọn hoặc nhập loại vaccine.');
      return;
    }
    if (!vaccinationDate) {
      setErrorMsg('Vui lòng chọn ngày tiêm.');
      return;
    }
    if (!certificatePhotoUrl.trim()) {
      setErrorMsg('Ảnh giấy chứng nhận tiêm là trường bắt buộc theo SRS.');
      return;
    }

    const record: VaccinationRecord = {
      id: recordToEdit?.id || `vac_${Date.now()}`,
      petId,
      vaccineType: vaccineType.trim(),
      vaccinationDate,
      validityYears: Number(validityYears) || 1,
      certificatePhotoUrl: certificatePhotoUrl.trim(),
      notes: notes.trim() || undefined,
      nextDueDate: nextDueDate ? nextDueDate.trim() : undefined,
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveVaccinationWithRules(record);
    onSaved(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Cập nhật mũi tiêm' : 'Thêm mũi tiêm phòng'}
              </h2>
              <p className="text-xs text-slate-500">Cho thú cưng: <span className="font-semibold text-slate-800">{petName}</span></p>
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
            <label className="block font-semibold text-slate-700 mb-1">Loại vaccine *</label>
            <input
              type="text"
              value={vaccineType}
              onChange={e => setVaccineType(e.target.value)}
              placeholder="Tên vaccine..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              required
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                'Vaccine phòng Dại Rabisin',
                'Vaccine 7 bệnh Vanguard Plus 5/L',
                'Vaccine 4 bệnh cho mèo Nobivac',
                'Vaccine Lepto phòng xoắn khuẩn'
              ].map(v => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVaccineType(v)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày tiêm *</label>
              <input
                type="date"
                value={vaccinationDate}
                onChange={e => setVaccinationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời gian hiệu lực *</label>
              <select
                value={validityYears}
                onChange={e => setValidityYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              >
                <option value={1}>1 năm</option>
                <option value={2}>2 năm</option>
                <option value={3}>3 năm</option>
              </select>
            </div>
          </div>

          {/* Next Due Date Field */}
          <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày tiêm tiếp theo (Tùy chọn)
              </label>
              <span className="text-[10px] text-blue-700 font-medium">Nhập thủ công</span>
            </div>
            <input
              type="date"
              value={nextDueDate}
              onChange={e => setNextDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D] font-mono"
            />
            <p className="text-[10px] text-slate-500 leading-snug">
              • Để trống: Hệ thống không tạo thông báo nhắc lịch.<br />
              • Có ngày: Nhắc trước 7 ngày, đúng ngày đến hạn và 1 lần khi quá hạn.
            </p>
          </div>

          {/* Certificate Photo with Camera & Device Upload (Item 16) */}
          <ImageUploadPicker
            label="Ảnh giấy chứng nhận tiêm"
            value={certificatePhotoUrl}
            onChange={url => setCertificatePhotoUrl(url)}
            required
          />

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú thêm về phản ứng sau tiêm, nơi tiêm..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
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
              {isEdit ? 'Lưu thay đổi' : 'Lưu mũi tiêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
