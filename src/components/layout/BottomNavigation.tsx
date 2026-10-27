import React from 'react';
import { BarChart3, Package, Users, UserCog } from 'lucide-react';

export type MainTabType = 'reports' | 'catalog' | 'customers' | 'account';

interface BottomNavigationProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  unreadNotificationsCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab
}) => {
  const tabs: { id: MainTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'catalog', label: 'Hàng hóa', icon: Package },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'account', label: 'Tài khoản', icon: UserCog }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg shadow-slate-900/10">
      <div className="grid grid-cols-4 items-center h-16 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full w-full py-1 transition-colors min-h-[48px] ${
                isActive ? 'text-[#17365D]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#17365D]/10 text-[#17365D]' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                </div>
              </div>
              <span
                className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'font-bold text-[#17365D]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
