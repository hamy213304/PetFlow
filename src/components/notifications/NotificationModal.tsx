import React, { useState } from 'react';
import { X, Bell, CheckCheck, Calendar, Syringe, PackageX, AlertTriangle, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types/petflow';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/storage';
import { formatDateTimeVN } from '../../utils/formatters';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNavigateEntity: (type: string, id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onNavigateEntity
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'Lịch hẹn' | 'Tiêm phòng' | 'Tồn kho'>('ALL');
  const [notFoundAlert, setNotFoundAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const handleItemClick = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    setNotFoundAlert(null);
    onNavigateEntity(n.relatedEntityType, n.relatedEntityId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lịch hẹn':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'Tiêm phòng':
        return <Syringe className="w-4 h-4 text-emerald-600" />;
      case 'Tồn kho':
        return <PackageX className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#17365D]/10 rounded-xl text-[#17365D]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Trung tâm thông báo</h2>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} thông báo mới chưa đọc` : 'Không có thông báo mới'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              filterCategory === 'ALL'
                ? 'bg-[#17365D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilterCategory('Lịch hẹn')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              filterCategory === 'Lịch hẹn'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lịch hẹn
          </button>
          <button
            onClick={() => setFilterCategory('Tiêm phòng')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              filterCategory === 'Tiêm phòng'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tiêm phòng
          </button>
          <button
            onClick={() => setFilterCategory('Tồn kho')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              filterCategory === 'Tồn kho'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tồn kho
          </button>
        </div>

        {/* Actions bar */}
        {unreadCount > 0 && (
          <div className="px-5 py-2 bg-amber-50/60 border-b border-amber-100/60 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">{unreadCount} thông báo chưa đọc</span>
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="text-[#17365D] hover:underline font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}

        {/* Not found warning banner */}
        {notFoundAlert && (
          <div className="mx-4 my-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{notFoundAlert}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto stroke-[1.2] text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">Không có thông báo nào</p>
              <p className="text-xs text-slate-400 mt-1">Các thông báo nhắc hẹn, tiêm phòng và tồn kho sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            filtered.map(item => {
              const isUnread = !item.readAt;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-start gap-3 my-1 ${
                    isUnread
                      ? 'bg-blue-50/60 hover:bg-blue-50 border border-blue-100'
                      : 'bg-white hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5 border border-slate-200/60">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs leading-snug truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {item.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Chưa đọc" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-3">
                      {item.body}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{formatDateTimeVN(item.createdAt)}</span>
                      <span className="inline-flex items-center gap-0.5 text-[#17365D] font-medium">
                        Xem chi tiết <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors min-h-[44px]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
