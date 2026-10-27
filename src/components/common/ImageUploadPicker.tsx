import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react';

interface ImageUploadPickerProps {
  label: string;
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  required?: boolean;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label,
  value,
  onChange,
  required = false
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có kích thước dưới 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="block font-semibold text-slate-700 text-xs">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative group flex items-center justify-center">
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Xóa ảnh"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-300" />
          )}
        </div>

        {/* Buttons for Camera, Gallery, or Link */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#17365D] rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors border border-blue-200/60"
            >
              <Camera className="w-3.5 h-3.5 text-blue-700" />
              Chụp ảnh
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors border border-emerald-200/60"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              Chọn từ máy
            </button>
          </div>

          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Hoặc dán đường dẫn (URL) ảnh..."
            className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};
