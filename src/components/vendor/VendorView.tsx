import React from 'react';
import { VendorConsole } from './VendorConsole';
import { EarningsWallet } from './EarningsWallet';
import { VendorOnboardingForm } from './VendorOnboardingForm';
import { VendorContractsView } from './VendorContractsView';

export const VendorView: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMsds: () => void;
}> = ({ activeTab, setActiveTab, onOpenMsds }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {activeTab === 'vendor_console' && (
        <VendorConsole onOpenMsds={onOpenMsds} />
      )}

      {activeTab === 'vendor_contracts' && (
        <VendorContractsView />
      )}

      {activeTab === 'vendor_earnings' && (
        <EarningsWallet />
      )}

      {activeTab === 'vendor_verification' && (
        <VendorOnboardingForm onComplete={() => setActiveTab('vendor_console')} />
      )}
    </div>
  );
};
