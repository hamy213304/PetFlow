import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Sparkles, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { getUserAccount, saveCurrentSession } from '../../services/storage';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { PetFlowLogo } from '../common/PetFlowLogo';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('0901234567');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedId = identifier.trim().toLowerCase();
    const account = getUserAccount();

    const matchesId =
      trimmedId === account.phoneNumber.toLowerCase() ||
      trimmedId === account.email.toLowerCase();

    if (!matchesId) {
      setErrorMsg('Số điện thoại hoặc email không tồn tại trong hệ thống.');
      return;
    }

    if (password !== account.passwordHash) {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng thử lại.');
      return;
    }

    // Save session
    saveCurrentSession({
      isLoggedIn: true,
      email: account.email,
      fullName: account.fullName
    });

    onLoginSuccess();
  };

  const fillDemoCredentials = () => {
    const account = getUserAccount();
    setIdentifier(account.phoneNumber);
    setPassword(account.passwordHash);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#17365D] via-[#1F4E79] to-slate-900 flex flex-col justify-between max-w-md mx-auto relative overflow-hidden select-none">
      {/* Decorative background paw watermark */}
      <div className="absolute top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 -left-12 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Branding Section (User Request 1: Logo hình chó mèo) */}
      <div className="pt-12 px-6 text-center text-white relative z-10">
        <div className="mx-auto flex justify-center">
          <PetFlowLogo size={76} showName={false} />
        </div>

        <h1 className="mt-4 text-2xl font-black tracking-tight text-white uppercase font-sans">
          PETFLOW
        </h1>
        <p className="text-xs text-blue-200/90 font-medium tracking-wide mt-1">
          HỆ THỐNG QUẢN LÝ DỊCH VỤ THÚ CƯNG
        </p>
        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-mono">
          Phiên bản 1.0.2 • Android Build
        </span>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-white rounded-t-[32px] p-6 shadow-2xl relative z-10 mt-6 border-t border-white/20">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Đăng nhập tài khoản</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vui lòng đăng nhập để bắt đầu phiên làm việc.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại hoặc Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="0901234567 hoặc admin@petflow.vn"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs font-medium text-slate-900"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] font-semibold text-[#1F4E79] hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#17365D] text-xs font-medium text-slate-900"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 min-h-[28px] min-w-[28px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#17365D] hover:bg-[#1f4e79] active:scale-[0.99] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#17365D]/20 mt-4 min-h-[48px]"
          >
            Đăng nhập hệ thống <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-[11px] text-slate-500 hover:text-[#17365D] font-medium flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Điền tài khoản quản trị mẫu (0901234567 / Password@123)
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={() => {
          const acc = getUserAccount();
          setPassword(acc.passwordHash);
        }}
      />
    </div>
  );
};
