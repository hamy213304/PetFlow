import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, AlertCircle } from 'lucide-react';
import { AndroidStatusBar } from './components/layout/AndroidStatusBar';
import { BottomNavigation, MainTabType } from './components/layout/BottomNavigation';
import { LoginScreen } from './components/auth/LoginScreen';
import { ReportScreen } from './components/reports/ReportScreen';
import { CatalogScreen, CatalogSubTab } from './components/catalog/CatalogScreen';
import { CustomerScreen } from './components/customers/CustomerScreen';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { AccountScreen } from './components/account/AccountScreen';
import { NotificationModal } from './components/notifications/NotificationModal';
import { CreateInvoiceModal } from './components/catalog/CreateInvoiceModal';
import { getCurrentSession, getNotifications } from './services/storage';
import { Appointment, NotificationItem, Invoice } from './types/petflow';
import { PetFlowLogo } from './components/common/PetFlowLogo';

export default function App() {
  const [session, setSession] = useState(getCurrentSession());
  const [activeTab, setActiveTab] = useState<MainTabType>('reports');
  const [catalogSubTab, setCatalogSubTab] = useState<CatalogSubTab>('items');

  // Secondary sub-screen state (e.g., viewing Appointments calendar from Khách hàng)
  const [isViewingAppointments, setIsViewingAppointments] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Quick invoice creation from appointment
  const [appointmentForInvoice, setAppointmentForInvoice] = useState<Appointment | null>(null);
  const [isCreateInvoiceFromAptOpen, setIsCreateInvoiceFromAptOpen] = useState(false);

  // Notification center
  const [notifications, setNotifications] = useState<NotificationItem[]>(getNotifications());
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const reloadNotifications = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    reloadNotifications();
    const handleDataChange = () => {
      setSession(getCurrentSession());
      reloadNotifications();
    };
    window.addEventListener('petflow_data_change', handleDataChange);
    return () => window.removeEventListener('petflow_data_change', handleDataChange);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.readAt).length;

  // Handle entity routing from notification center
  const handleNavigateFromNotification = (type: string, id: string) => {
    setIsNotifModalOpen(false);
    if (type === 'appointment') {
      setIsViewingAppointments(true);
      setSelectedAppointmentId(id);
    } else if (type === 'vaccine') {
      setActiveTab('customers');
      setIsViewingAppointments(false);
    } else if (type === 'catalog') {
      setActiveTab('catalog');
      setCatalogSubTab('items');
      setIsViewingAppointments(false);
    } else if (type === 'invoice') {
      setActiveTab('catalog');
      setCatalogSubTab('invoices');
      setIsViewingAppointments(false);
    }
  };

  // If not logged in, render Android Login Screen
  if (!session || !session.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden sm:rounded-[36px] border border-slate-700 min-h-screen sm:min-h-[820px] flex flex-col">
          <AndroidStatusBar />
          <div className="flex-1 overflow-y-auto">
            <LoginScreen onLoginSuccess={() => setSession(getCurrentSession())} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-md bg-slate-100 shadow-2xl overflow-hidden sm:rounded-[36px] border border-slate-800 min-h-screen sm:min-h-[844px] sm:max-h-[890px] flex flex-col relative">
        {/* Android Status Bar */}
        <AndroidStatusBar />

        {/* Top App Bar */}
        <header className="bg-[#17365D] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 z-30 select-none">
          <div className="flex items-center gap-2">
            <PetFlowLogo size={32} showName={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">PETFLOW</span>
                <span className="text-[10px] text-blue-200/90 font-medium">Spa Manager</span>
              </div>
              <p className="text-[10px] text-blue-200/80 font-mono leading-none">
                {activeTab === 'reports'
                  ? 'Báo cáo & Tổng quan'
                  : activeTab === 'catalog'
                  ? 'Quản lý Hàng hóa & Hóa đơn'
                  : activeTab === 'customers'
                  ? isViewingAppointments
                    ? 'Lịch hẹn dịch vụ'
                    : 'Hồ sơ Khách & Thú cưng'
                  : 'Cài đặt Tài khoản'}
              </p>
            </div>
          </div>

          {/* Right Action: Notification Bell with Badge */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Trung tâm thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-[#17365D] font-mono">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>
        </header>

        {/* Screen Content Viewport */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'reports' && (
            <ReportScreen
              onOpenAppointment={aptId => {
                setIsViewingAppointments(true);
                setSelectedAppointmentId(aptId);
                setActiveTab('customers');
              }}
              onNavigateToTab={tab => {
                setActiveTab(tab);
                setIsViewingAppointments(false);
              }}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogScreen initialSubTab={catalogSubTab} />
          )}

          {activeTab === 'customers' && (
            isViewingAppointments ? (
              <AppointmentsView
                onBack={() => {
                  setIsViewingAppointments(false);
                  setSelectedAppointmentId(null);
                }}
                selectedAppointmentId={selectedAppointmentId}
                onOpenCreateInvoiceForAppointment={apt => {
                  setAppointmentForInvoice(apt);
                  setIsCreateInvoiceFromAptOpen(true);
                }}
              />
            ) : (
              <CustomerScreen
                onOpenAppointments={() => {
                  setIsViewingAppointments(true);
                  setSelectedAppointmentId(null);
                }}
              />
            )
          )}

          {activeTab === 'account' && (
            <AccountScreen onLogout={() => setSession(null)} />
          )}
        </main>

        {/* Fixed Android Bottom Navigation Bar */}
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={newTab => {
            setActiveTab(newTab);
            setIsViewingAppointments(false);
            setSelectedAppointmentId(null);
          }}
          unreadNotificationsCount={unreadNotifCount}
        />

        {/* Notification Center Modal */}
        <NotificationModal
          isOpen={isNotifModalOpen}
          onClose={() => setIsNotifModalOpen(false)}
          notifications={notifications}
          onNavigateEntity={handleNavigateFromNotification}
        />

        {/* Create Invoice from Appointment Modal */}
        {isCreateInvoiceFromAptOpen && appointmentForInvoice && (
          <CreateInvoiceModal
            isOpen={isCreateInvoiceFromAptOpen}
            onClose={() => {
              setIsCreateInvoiceFromAptOpen(false);
              setAppointmentForInvoice(null);
            }}
            linkedAppointment={appointmentForInvoice}
            onInvoiceCreated={createdInv => {
              setIsCreateInvoiceFromAptOpen(false);
              setAppointmentForInvoice(null);
              // Switch to invoices tab to view the created invoice
              setActiveTab('catalog');
              setCatalogSubTab('invoices');
              setIsViewingAppointments(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
