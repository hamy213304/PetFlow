import React, { useState, useEffect } from 'react';
import {
  User,
  KeyRound,
  Info,
  LogOut,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { UserAccount } from '../../types/petflow';
import {
  getUserAccount,
  saveUserAccount,
  saveCurrentSession
} from '../../services/storage';
import { VIETNAM_PROVINCES } from '../../data/referenceData';
import { validatePassword } from '../../utils/formatters';
import { PetFlowLogo } from '../common/PetFlowLogo';

interface AccountScreenProps {
  onLogout: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onLogout }) => {
  const [account, setAccount] = useState<UserAccount>(getUserAccount());

  // Personal info state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [fullName, setFullName] = useState(account.fullName);
  const [phoneNumber, setPhoneNumber] = useState(account.phoneNumber);
  const [email, setEmail] = useState(account.email);
  const [province, setProvince] = useState(account.address.province);
  const [ward, setWard] = useState(account.address.ward);
  const [streetDetail, setStreetDetail] = useState(account.address.streetDetail);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Change Password state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  // Logout confirmation modal state (Item 15)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const acc = getUserAccount();
    setAccount(acc);
    setFullName(acc.fullName);
    setPhoneNumber(acc.phoneNumber);
    setEmail(acc.email);
    setProvince(acc.address.province);
    setWard(acc.address.ward);
    setStreetDetail(acc.address.streetDetail);
  }, []);

  const currentProvinceData =
    VIETNAM_PROVINCES.find(p => p.name === province) || VIETNAM_PROVINCES[0];

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      alert('Họ tên và số điện thoại không được để trống.');
      return;
    }

    const updated: UserAccount = {
      ...account,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      address: {
        province,
        ward,
        streetDetail: streetDetail.trim()
      }
    };

    saveUserAccount(updated);
    setAccount(updated);
    setIsEditingInfo(false);
    setInfoMessage('Cập nhật thông tin cá nhân thành công!');
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleCancelEditInfo = () => {
    setFullName(account.fullName);
    setPhoneNumber(account.phoneNumber);
    setEmail(account.email);
    setProvince(account.address.province);
    setWard(account.address.ward);
    setStreetDetail(account.address.streetDetail);
    setIsEditingInfo(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (oldPassword !== account.passwordHash) {
      setPassError('Mật khẩu cũ không chính xác.');
      return;
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      setPassError(passCheck.message || 'Mật khẩu mới không an toàn.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Update password
    const updated = { ...account, passwordHash: newPassword };
    saveUserAccount(updated);

    // SRS Section 4.3 rule: xác nhận thành công thì tự động đăng xuất để đăng nhập lại
    saveCurrentSession(null);
    onLogout();
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    saveCurrentSession(null);
    onLogout();
  };

  return (
    <div className="pb-28 px-4 pt-3 max-w-md mx-auto space-y-4">
      {/* User Card Profile Header with Cute Dog & Cat Logo */}
      <div className="bg-gradient-to-r from-[#17365D] via-[#1F4E79] to-slate-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 p-1 border-2 border-white/20 flex items-center justify-center shrink-0">
            <PetFlowLogo size={46} showName={false} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
              Quản trị viên Spa
            </span>
            <h2 className="text-base font-bold truncate mt-1">{account.fullName}</h2>
            <p className="text-xs text-blue-200/80 font-mono">{account.phoneNumber} • {account.email}</p>
          </div>
        </div>
      </div>

      {infoMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* SECTION 1: Cập nhật thông tin cá nhân (SRS Section 4.3) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#17365D]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin tài khoản</h3>
          </div>
          {!isEditingInfo && (
            <button
              onClick={() => setIsEditingInfo(true)}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Cập nhật
            </button>
          )}
        </div>

        {isEditingInfo ? (
          <form onSubmit={handleSaveInfo} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Tỉnh / Thành phố</label>
                <select
                  value={province}
                  onChange={e => {
                    setProvince(e.target.value);
                    const pData = VIETNAM_PROVINCES.find(p => p.name === e.target.value);
                    if (pData?.wards[0]) setWard(pData.wards[0]);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  {VIETNAM_PROVINCES.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Xã / Phường</label>
                <select
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                >
                  {currentProvinceData.wards.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Địa chỉ chi tiết (số nhà, đường)</label>
              <input
                type="text"
                value={streetDetail}
                onChange={e => setStreetDetail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            {/* Nút Hủy và Xác nhận (SRS 4.3) */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCancelEditInfo}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#17365D] hover:bg-[#1f4e79] text-white font-bold shadow-md"
              >
                Xác nhận
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-mono text-slate-900 font-medium">{account.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{account.email}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {account.address.streetDetail ? `${account.address.streetDetail}, ` : ''}
                {account.address.ward}, {account.address.province}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Đổi mật khẩu (Item 14: sửa nút thành "Cập nhật mật khẩu") */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Đổi mật khẩu</h3>
          </div>
          <button
            onClick={() => {
              setIsChangingPass(!isChangingPass);
              setPassError(null);
            }}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            {isChangingPass ? 'Đóng' : 'Thay đổi'}
          </button>
        </div>

        {isChangingPass && (
          <form onSubmit={handleChangePassword} className="space-y-3 text-xs pt-1">
            {passError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang dùng"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới *</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, có hoa, thường, số, ký tự đặc biệt"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nhập lại mật khẩu mới *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            {/* Sửa tên nút thành Cập nhật mật khẩu theo User Request 14 */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-colors min-h-[44px]"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        )}
      </div>

      {/* SECTION: Thông tin ứng dụng (SRS Section 4.3) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin ứng dụng</h3>
        </div>

        <div className="flex items-center gap-3 py-1">
          <PetFlowLogo size={40} showName={false} />
          <div>
            <p className="font-bold text-slate-900 leading-snug">
              HỆ THỐNG QUẢN LÝ DỊCH VỤ THÚ CƯNG PETFLOW
            </p>
            <div className="flex gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
              <span>Phiên bản: 1.0.2</span>
              <span>•</span>
              <span>Cập nhật: 12/10/2026</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ứng dụng chuyên dụng quản lý hồ sơ thú cưng, đặt lịch spa, kiểm soát tồn kho thông minh, hoàn thành hóa đơn và theo dõi nhắc tiêm phòng định kỳ.
        </p>
      </div>

      {/* Logout Button (User Request 15) */}
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-3.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[48px] active:scale-[0.99]"
      >
        <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
      </button>

      {/* Logout Confirmation Modal (Item 15) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Đăng xuất tài khoản?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng PetFlow? Dữ liệu của bạn luôn được bảo toàn an toàn trên thiết bị.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs min-h-[44px]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md min-h-[44px]"
              >
                Đăng xuất ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
