import React, { useState, useEffect } from 'react';
import { X, Dog, Cat, AlertCircle } from 'lucide-react';
import { Pet, Species, Gender, NeuteredStatus } from '../../types/petflow';
import { DOG_BREEDS, CAT_BREEDS } from '../../data/referenceData';
import { savePet } from '../../services/storage';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  petToEdit?: Pet | null;
  onSaved: (savedPet: Pet) => void;
}

export const PetModal: React.FC<PetModalProps> = ({
  isOpen,
  onClose,
  customerId,
  petToEdit,
  onSaved
}) => {
  const isEdit = Boolean(petToEdit);

  const [species, setSpecies] = useState<Species>('Chó');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(DOG_BREEDS[0]);
  const [gender, setGender] = useState<Gender>('Đực');
  const [neutered, setNeutered] = useState<NeuteredStatus>('Chưa triệt sản');
  const [weightKg, setWeightKg] = useState<string>('4.5');
  const [dob, setDob] = useState('2024-01-01');
  const [identificationNotes, setIdentificationNotes] = useState('');
  const [color, setColor] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever petToEdit or isOpen changes (Item 10)
  useEffect(() => {
    if (isOpen) {
      if (petToEdit) {
        setSpecies(petToEdit.species || 'Chó');
        setName(petToEdit.name || '');
        setBreed(petToEdit.breed || (petToEdit.species === 'Mèo' ? CAT_BREEDS[0] : DOG_BREEDS[0]));
        setGender(petToEdit.gender || 'Đực');
        setNeutered(petToEdit.neutered || 'Chưa triệt sản');
        setWeightKg(petToEdit.weightKg ? petToEdit.weightKg.toString() : '4.5');
        setDob(petToEdit.dob || '2024-01-01');
        setIdentificationNotes(petToEdit.identificationNotes || '');
        setColor(petToEdit.color || '');
        setPhotoUrl(
          petToEdit.photoUrl ||
            (petToEdit.species === 'Mèo'
              ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
              : 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80')
        );
      } else {
        // Reset for new pet
        setSpecies('Chó');
        setName('');
        setBreed(DOG_BREEDS[0]);
        setGender('Đực');
        setNeutered('Chưa triệt sản');
        setWeightKg('4.5');
        setDob('2024-01-01');
        setIdentificationNotes('');
        setColor('');
        setPhotoUrl('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80');
      }
      setErrorMsg(null);
    }
  }, [petToEdit, isOpen]);

  if (!isOpen) return null;

  const currentBreedList = species === 'Chó' ? DOG_BREEDS : CAT_BREEDS;

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const newBreeds = newSpecies === 'Chó' ? DOG_BREEDS : CAT_BREEDS;
    setBreed(newBreeds[0]);
    if (!petToEdit) {
      setPhotoUrl(
        newSpecies === 'Chó'
          ? 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80'
          : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên thú cưng.');
      return;
    }
    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum <= 0) {
      setErrorMsg('Cân nặng phải là số dương hợp lệ (kg).');
      return;
    }
    if (!dob) {
      setErrorMsg('Vui lòng chọn ngày sinh của thú cưng.');
      return;
    }
    if (!photoUrl) {
      setErrorMsg('Hình ảnh thú cưng là trường bắt buộc.');
      return;
    }

    const pet: Pet = {
      id: petToEdit?.id || `pet_${Date.now()}`,
      customerId,
      species,
      name: name.trim(),
      breed,
      gender,
      neutered,
      weightKg: weightNum,
      dob,
      identificationNotes: identificationNotes.trim() || undefined,
      color: color.trim() || undefined,
      photoUrl,
      createdAt: petToEdit?.createdAt || new Date().toISOString()
    };

    savePet(pet);
    onSaved(pet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              {species === 'Chó' ? <Dog className="w-5 h-5" /> : <Cat className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? `Chỉnh sửa thông tin bé ${petToEdit?.name}` : 'Thêm thú cưng mới'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Xem và cập nhật đầy đủ hồ sơ của bé' : 'Nhập hồ sơ thú cưng theo quy chuẩn'}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {/* Species Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Loài thú cưng *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSpeciesChange('Chó')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  species === 'Chó'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Dog className="w-4 h-4 text-blue-600" /> Chó (Canine)
              </button>
              <button
                type="button"
                onClick={() => handleSpeciesChange('Mèo')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  species === 'Mèo'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Cat className="w-4 h-4 text-emerald-600" /> Mèo (Feline)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên pet *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ví dụ: Mochi"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giống *</label>
              <select
                value={breed}
                onChange={e => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              >
                {currentBreedList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính *</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Triệt sản *</label>
              <select
                value={neutered}
                onChange={e => setNeutered(e.target.value as NeuteredStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              >
                <option value="Chưa triệt sản">Chưa triệt sản</option>
                <option value="Đã triệt sản">Đã triệt sản</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cân nặng (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày sinh *</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Màu sắc</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Vàng kem, Trắng xám..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đặc điểm nhận dạng</label>
              <input
                type="text"
                value={identificationNotes}
                onChange={e => setIdentificationNotes(e.target.value)}
                placeholder="Đốm ngực, tai cụp..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              />
            </div>
          </div>

          {/* Photo Picker with Camera & Device Upload (Item 16) */}
          <ImageUploadPicker
            label="Hình ảnh thú cưng"
            value={photoUrl}
            onChange={url => setPhotoUrl(url)}
            required
          />

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
              {isEdit ? 'Lưu thay đổi' : 'Xác nhận tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
