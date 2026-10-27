import React, { useState, useEffect } from 'react';
import { X, KeyRound, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { getUserAccount, saveUserAccount } from '../../services/storage';
import { validatePassword } from '../../utils/formatters';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    setErrorMsg(null);
    if (!email || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    const account = getUserAccount();
    if (email.trim().toLowerCase() !== account.email.trim().toLowerCase()) {
      setErrorMsg('Địa chỉ email không khớp với tài khoản quản trị hệ thống.');
      return;
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setCountdown(60);
    setStep(2);
    setInfoMsg(`Mã OTP xác thực đã được tạo: ${code} (Hiệu lực trong 60 giây).`);
  };

  const handleResetPassword = () => {
    setErrorMsg(null);
    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMsg('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    if (otpInput.trim() !== generatedOtp) {
      setErrorMsg('Mã OTP không chính xác hoặc đã hết hạn.');
      return;
    }

    if (countdown <= 0) {
      setErrorMsg('Mã OTP đã hết thời gian hiệu lực. Vui lòng bấm gửi lại mã.');
      return;
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      setErrorMsg(passCheck.message || 'Mật khẩu mới không đủ điều kiện an toàn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Update password
    const account = getUserAccount();
    account.passwordHash = newPassword;
    saveUserAccount(account);

    alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-[#17365D] rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Quên mật khẩu</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập email tài khoản quản lý PetFlow của bạn để nhận mã OTP xác thực đổi mật khẩu:
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email tài khoản</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@petflow.vn"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full py-3 bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md min-h-[44px]"
            >
              Gửi mã OTP xác thực <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Mã OTP (6 chữ số)</label>
                {countdown > 0 ? (
                  <span className="text-[11px] text-amber-600 font-mono font-medium">Hết hạn sau: {countdown}s</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-[11px] text-[#17365D] hover:underline font-semibold">
                    Gửi lại mã
                  </button>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Ví dụ: 123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-center text-sm font-mono tracking-widest font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, có hoa, thường, số, ký tự đặc biệt"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2.5 bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Xác nhận đổi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
