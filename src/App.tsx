import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { CustomerView } from './components/customer/CustomerView';
import { VendorView } from './components/vendor/VendorView';
import { AdminView } from './components/admin/AdminView';
import { Footer } from './components/common/Footer';
import { SosModal } from './components/common/SosModal';
import { ChemicalMsdsModal } from './components/common/ChemicalMsdsModal';
import { AlertOctagon, X, Bell } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, sosAlert, clearSosAlert, activeBooking } = useApp();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [msdsModalOpen, setMsdsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* SOS Modal */}
      <SosModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />

      {/* Chemical MSDS Directory Modal */}
      <ChemicalMsdsModal isOpen={msdsModalOpen} onClose={() => setMsdsModalOpen(false)} />

      {/* Global Navbar */}
      <Navbar
        onOpenSos={() => setSosModalOpen(true)}
        onOpenMsds={() => setMsdsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Live SOS Emergency Banner if triggered */}
      {sosAlert && sosAlert.active && (
        <div className="bg-red-950 border-b border-red-700 px-4 py-3 text-red-200 text-xs flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
            <span>
              <strong>EMERGENCY DISPATCH INITIATED:</strong> {sosAlert.message} (Timestamp: {sosAlert.timestamp})
            </span>
          </div>
          <button
            onClick={clearSosAlert}
            className="p-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Active Clean Quick Bar for Customer when on other tabs */}
      {role === 'customer' && activeTab !== 'live_tracker' && activeBooking && activeBooking.status !== 'completed' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-700/60 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-200 font-medium">
              Active Job #{activeBooking.bookingCode}: <strong className="text-emerald-400 uppercase">{activeBooking.status.replace(/_/g, ' ')}</strong>
            </span>
          </div>
          <button
            onClick={() => setActiveTab('live_tracker')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-lg font-bold text-xs shadow cursor-pointer"
          >
            View Live Tracker →
          </button>
        </div>
      )}

      {/* Main Dynamic View Switcher based on Role */}
      <main className="flex-1">
        {role === 'customer' && (
          <CustomerView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMsds={() => setMsdsModalOpen(true)}
          />
        )}

        {role === 'vendor' && (
          <VendorView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenMsds={() => setMsdsModalOpen(true)}
          />
        )}

        {(role === 'admin' || role === 'regulator_lasepa') && (
          <AdminView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenMsds={() => setMsdsModalOpen(true)}
        onOpenSos={() => setSosModalOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
