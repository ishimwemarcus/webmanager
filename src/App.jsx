import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './views/Dashboard';
import Stock from './views/Stock';
import Sales from './views/Sales';
import Ledger from './views/Ledger';
import Wait from './views/Wait';
import Reports from './views/Reports';
import Clients from './views/Clients';
import Spoilage from './views/Spoilage';
import Cloture from './views/Cloture';
import Commander from './views/Commander';
import ClientPortal from './views/ClientPortal';
import Shifts from './views/Shifts';
import GlobalAlerts from './components/layout/GlobalAlerts';
import ConfirmModal from './components/common/ConfirmModal';
import ToastNotification from './components/layout/ToastNotification';
import { useStore } from './context/StoreContext';
import { useLanguage } from './context/LanguageContext';
import { Lock } from 'lucide-react';
import BootScreen from './components/layout/BootScreen';
import ShiftGateway from './components/layout/ShiftGateway';
import QRModal from './components/layout/QRModal';
import ShiftEndModal from './components/layout/ShiftEndModal';
import FloatingCalculator from './components/layout/FloatingCalculator';


function App() {
  const store = useStore();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [currentUser] = useState({ username: 'admin', role: 'Master' });
  const [appBooted, setAppBooted] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magicPass = params.get('pass');
    if (magicPass?.toUpperCase() === 'MARCUS' && !store.currentOperator) {
      localStorage.setItem('biztrack_user', JSON.stringify({
        name: 'MARC BOSS',
        username: 'master',
        role: 'Master'
      }));
      store.setCurrentOperator('MARC');
      
      // Remove param from URL without reloading
      const newUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, [store]);

  return (
    <>
    {!appBooted && <BootScreen onComplete={() => setAppBooted(true)} />}
    {appBooted && !store.currentOperator && !window.location.hash.includes('/portal/') && <ShiftGateway />}
    <QRModal />
    <ShiftEndModal 
      isOpen={store.isShiftEndModalOpen} 
      onClose={() => store.setIsShiftEndModalOpen(false)} 
    />

    <div className={`flex h-[100dvh] bg-transparent relative overflow-hidden transition-all duration-1000 ${appBooted && (store.currentOperator || window.location.hash.includes('/portal/')) ? 'opacity-100 scale-100' : 'opacity-0 scale-105 absolute inset-0 pointer-events-none'}`}>
      <GlobalAlerts />
      <ToastNotification />
      <FloatingCalculator />
      <ConfirmModal 
        isOpen={store.confirmState.isOpen}
        message={store.confirmState.message}
        onConfirm={store.confirmState.onConfirm}
        onCancel={store.confirmState.onCancel}
      />

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Slide-over / Fixed Sidebar */}
      {!window.location.hash.includes('/portal/') && (
        <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar className="h-full shadow-2xl lg:shadow-none" />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative">
        {!window.location.hash.includes('/portal/') && (
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        <main className={`flex-1 overflow-auto scrollbar-thin pb-safe ${window.location.hash.includes('/portal/') ? 'p-0' : 'p-3 lg:p-6'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/wait" element={<Wait />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/spoilage" element={<Spoilage />} />
            <Route path="/cloture" element={<Cloture />} />
            <Route path="/commander" element={<Commander />} />
            <Route path="/shifts" element={<Shifts />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/portal/:clientName/:phone?" element={<ClientPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
    </>
  );
}

export default App;
