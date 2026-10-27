import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, FileText, Smartphone } from 'lucide-react';
import { getAndroidNativeProjectFiles, AndroidProjectFile } from '../services/androidNativeExporter';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({ isOpen, onClose }) => {
  const files = getAndroidNativeProjectFiles();
  const [selectedFile, setSelectedFile] = useState<AndroidProjectFile>(files[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PetFlow_Android_Native_Source_v1.0.2.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#17365D] rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Mã nguồn Android Native (Kotlin + Compose + Room)
              </h2>
              <p className="text-xs text-slate-500">Gói mã nguồn đầy đủ theo kiến trúc sạch Android</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row text-xs">
          {/* File selector sidebar */}
          <div className="w-full sm:w-60 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50 p-2 overflow-y-auto space-y-1 shrink-0">
            {files.map(f => (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left p-2 rounded-xl transition-all flex flex-col ${
                  selectedFile.path === f.path
                    ? 'bg-[#17365D] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span className="font-mono font-bold text-[11px] truncate">{f.path}</span>
                <span className={`text-[10px] truncate ${selectedFile.path === f.path ? 'text-white/80' : 'text-slate-400'}`}>
                  {f.description}
                </span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 text-slate-100">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="font-mono text-[11px] text-blue-400 font-semibold truncate">
                {selectedFile.path}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1 font-semibold text-[11px] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed text-slate-300">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={handleDownloadAll}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Tải về toàn bộ mã nguồn (.JSON)
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
