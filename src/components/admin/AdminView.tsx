import React from 'react';
import { OperationsDashboard } from './OperationsDashboard';
import { VerificationDesk } from './VerificationDesk';
import { FinancialLedger } from './FinancialLedger';
import { ChemicalSafetyMonitor } from './ChemicalSafetyMonitor';

export const AdminView: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {activeTab === 'admin_ops' && (
        <OperationsDashboard />
      )}

      {activeTab === 'admin_vetting' && (
        <VerificationDesk />
      )}

      {activeTab === 'admin_revenue' && (
        <FinancialLedger />
      )}

      {activeTab === 'admin_chemicals' && (
        <ChemicalSafetyMonitor />
      )}
    </div>
  );
};
