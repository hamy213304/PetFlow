import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, RefreshCw, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';
import { runAllTestCases, TestCaseResult } from '../services/testRunner';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestCaseResult[] | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await runAllTestCases();
      setResults(res);
    } catch (err) {
      console.error('Test suite failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const totalPassed = results?.filter(r => r.passed).length || 0;
  const totalCount = results?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Kiểm thử tự động 15 tình huống biên (SRS Mục 18)
              </h2>
              <p className="text-xs text-slate-500">Chạy kiểm thử logic, trừ kho, chống lặp và snapshot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Action button */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 block">Ma trận kiểm thử tự động</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kiểm tra từ TC-01 đến TC-15 theo đặc tả kỹ thuật và nghiệp vụ.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="py-2.5 px-4 bg-[#17365D] hover:bg-[#1f4e79] disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang chạy...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Bắt đầu chạy test
                </>
              )}
            </button>
          </div>

          {/* Results Summary */}
          {results && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                totalPassed === totalCount
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {totalPassed === totalCount ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {totalPassed === totalCount ? 'TẤT CẢ 15 TEST CASES ĐÃ ĐẠT!' : 'CÓ TEST CASE CHƯA ĐẠT'}
                  </h3>
                  <span className="text-[11px] font-mono">
                    Hoàn thành {totalPassed}/{totalCount} kịch bản kiểm thử biên
                  </span>
                </div>
              </div>
              <span className="text-base font-extrabold font-mono">
                {Math.round((totalPassed / totalCount) * 100)}%
              </span>
            </div>
          )}

          {/* Test cases list */}
          <div className="space-y-2.5">
            {!results && !isRunning && (
              <div className="py-12 text-center text-slate-400">
                <Terminal className="w-12 h-12 mx-auto stroke-[1.2] text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Sẵn sàng kiểm thử tự động</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Bấm nút "Bắt đầu chạy test" để hệ thống tự động thực thi 15 kịch bản biên và đối soát kết quả.
                </p>
              </div>
            )}

            {results?.map(r => (
              <div
                key={r.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  r.passed
                    ? 'bg-white border-slate-200'
                    : 'bg-red-50/60 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span className="font-mono font-bold text-[#17365D]">{r.id}</span>
                    <span className="font-bold text-slate-900 truncate">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {r.durationMs}ms
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Kỳ vọng: </span>
                    <span className="text-slate-700">{r.expected}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Thực tế: </span>
                    <span className={r.passed ? 'text-emerald-700 font-medium' : 'text-red-700 font-bold'}>
                      {r.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors min-h-[44px]"
          >
            Đóng bảng kiểm thử
          </button>
        </div>
      </div>
    </div>
  );
};
