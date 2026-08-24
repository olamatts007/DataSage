import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Award,
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';

export const VendorContractsView: React.FC = () => {
  const { currentVendor, contracts, formatCurrency, selectedCountry } = useApp();

  const myContracts = contracts.filter(c => c.assignedVendor?.id === currentVendor.id || c.status === 'active');

  const monthlyRecurringRevenue = myContracts.reduce((sum, c) => {
    if (c.frequency === 'weekly') return sum + c.financials.vendorPayoutPerVisitNGN * 4;
    if (c.frequency === 'bi_weekly') return sum + c.financials.vendorPayoutPerVisitNGN * 2;
    if (c.frequency === 'monthly') return sum + c.financials.vendorPayoutPerVisitNGN;
    if (c.frequency === 'quarterly') return sum + Math.round(c.financials.vendorPayoutPerVisitNGN / 3);
    return sum + Math.round(c.financials.vendorPayoutPerVisitNGN / 6);
  }, 0);

  const totalContractPipelineValue = myContracts.reduce((sum, c) => sum + (c.financials.vendorPayoutPerVisitNGN * c.totalVisits), 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-600/50 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              Partner Monthly Recurring Revenue (MRR)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {formatCurrency(monthlyRecurringRevenue)} / month
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">70% predictable recurring income from active client service contracts</p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white block">Active Contract Pipeline</span>
              <span className="text-sm font-mono font-extrabold text-emerald-400">
                {formatCurrency(totalContractPipelineValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Assigned Retainer Accounts</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">
              {myContracts.length} Corporate & Domestic SLAs
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Guaranteed Escrow Payouts</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Scheduled Visits This Month</span>
            <span className="text-lg font-bold font-mono text-blue-400 mt-1 block">
              {myContracts.length * 2} Recurring Dispatches
            </span>
            <span className="text-[10px] text-slate-400">Automated dispatch reminders</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Average 70% Payout per SLA Visit</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(myContracts.length ? totalContractPipelineValue / (myContracts.length * 4) : 60000)}
            </span>
            <span className="text-[10px] text-slate-400">Credited directly to wallet</span>
          </div>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Your Recurring Contract Retainers ({myContracts.length})
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myContracts.map(contract => (
            <div key={contract.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {contract.contractCode}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {contract.frequency}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{contract.title}</h4>
                  <p className="text-xs text-slate-400">{contract.customerName} • {contract.address}</p>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {contract.status.toUpperCase()}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Your 70% Take-Home per Visit:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    {formatCurrency(contract.financials.vendorPayoutPerVisitNGN)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Schedule:</span>
                  <span className="font-semibold text-slate-200">{contract.preferredDayOfWeek}s ({contract.preferredTimeSlot.split(' ')[0]})</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Completed: <strong className="text-white">{contract.completedVisits} of {contract.totalVisits} visits</strong></span>
                <span className="text-emerald-400 font-medium">LASEPA SLA Certified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
