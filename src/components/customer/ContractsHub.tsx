import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceContract } from '../../types';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileCheck,
  PauseCircle,
  PlayCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Percent,
  Plus,
  Truck,
  RotateCcw
} from 'lucide-react';

export const ContractsHub: React.FC<{
  onCreateNewContract: () => void;
  onViewLiveTracker: () => void;
}> = ({ onCreateNewContract, onViewLiveTracker }) => {
  const {
    contracts,
    toggleContractStatus,
    dispatchContractVisit,
    formatCurrency,
    selectedCountry
  } = useApp();

  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);

  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'paused');

  const handleTriggerVisit = (contractId: string, visitNumber: number) => {
    dispatchContractVisit(contractId, visitNumber);
    onViewLiveTracker();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* SLA Contract Document Viewer Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => setSelectedContract(null)}>
          <div className="bg-slate-900 border border-emerald-600/70 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">LASEPA Corporate Service Level Agreement (SLA)</h3>
              </div>
              <button onClick={() => setSelectedContract(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">Contract Serial Number:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedContract.lasepaSlaCertNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <p><strong className="text-slate-200">Customer:</strong> {selectedContract.customerName}</p>
                <p><strong className="text-slate-200">Contract Title:</strong> {selectedContract.title}</p>
                <p><strong className="text-slate-200">Service Category:</strong> {selectedContract.service.name}</p>
                <p><strong className="text-slate-200">Frequency:</strong> <span className="uppercase text-emerald-400 font-bold">{selectedContract.frequency}</span></p>
                <p><strong className="text-slate-200">Duration:</strong> {selectedContract.duration.replace('_', ' ')}</p>
                <p><strong className="text-slate-200">Total Visits:</strong> {selectedContract.totalVisits} scheduled inspections</p>
                <p><strong className="text-slate-200">Designated Vetted Vendor:</strong> {selectedContract.assignedVendor?.name || 'Pool Dispatch'}</p>
                <p><strong className="text-slate-200">LASEPA License:</strong> {selectedContract.assignedVendor?.verification.lasepaAccreditation.documentNumber}</p>
              </div>

              <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60 text-[11px] space-y-1">
                <span className="font-bold text-emerald-300 block">Financial & Escrow Commitment:</span>
                <div className="flex justify-between text-slate-300">
                  <span>Standard Rate per Visit:</span>
                  <span className="line-through">{formatCurrency(selectedContract.financials.standardSingleVisitRateNGN)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discounted Contract Rate ({selectedContract.financials.contractDiscountPercent}% Savings):</span>
                  <span>{formatCurrency(selectedContract.financials.discountedPerVisitRateNGN)} / visit</span>
                </div>
                <div className="flex justify-between text-white font-extrabold pt-1 border-t border-emerald-900">
                  <span>Total Cumulative Contract Value:</span>
                  <span>{formatCurrency(selectedContract.financials.totalContractValueNGN)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  alert('Printing official LASEPA Long-Term Corporate Sanitation SLA Contract PDF...');
                  setSelectedContract(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow"
              >
                Download Official SLA Contract PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-600/50 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Enterprise & Household SLAs
            </span>
            <span className="text-xs text-slate-400">• Up to 25% Long-Term Discounts</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            Long-Term Service Contracts & Recurring Schedules
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automate your weekly housekeeping, monthly deep cleans, and quarterly LASEPA fumigations with guaranteed certified technicians
          </p>
        </div>

        <button
          onClick={onCreateNewContract}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs shadow-xl shadow-emerald-950 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE RECURRING CONTRACT (SAVE UP TO 25%)</span>
        </button>
      </div>

      {/* Contract Frequency Savings Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weekly Retainer</span>
          <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5 block">20% Discount</span>
          <span className="text-[9px] text-slate-500">Offices & Clinics</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Bi-Weekly</span>
          <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5 block">15% Discount</span>
          <span className="text-[9px] text-slate-500">Residential Flats</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Clean</span>
          <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5 block">10% Discount</span>
          <span className="text-[9px] text-slate-500">Deep Steam Care</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Quarterly LASEPA</span>
          <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5 block">12% Discount</span>
          <span className="text-[9px] text-slate-500">Vector Fumigation</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Bi-Annual SLA</span>
          <span className="text-base font-mono font-extrabold text-emerald-400 mt-0.5 block">8% Discount</span>
          <span className="text-[9px] text-slate-500">Factory Overhauls</span>
        </div>
      </div>

      {/* Active Contracts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active Contracts ({activeContracts.length})
        </h3>

        {activeContracts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-600" />
            <h4 className="text-sm font-bold text-white">No Active Contracts</h4>
            <p className="text-xs">Lock in recurring weekly, monthly, or quarterly cleans with dedicated technicians and save up to 25%.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeContracts.map(contract => {
              const nextUpcomingVisit = contract.visitsSchedule.find(v => v.status === 'upcoming');
              const isPaused = contract.status === 'paused';

              return (
                <div
                  key={contract.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                    isPaused ? 'border-slate-800 opacity-70' : 'border-emerald-600/40 hover:border-emerald-500'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {contract.contractCode}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          {contract.frequency.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{contract.title}</h4>
                      <p className="text-xs text-slate-400">{contract.address} ({contract.city})</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isPaused ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    }`}>
                      {contract.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Pricing and Savings */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Rate per Visit:</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(contract.financials.discountedPerVisitRateNGN)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Savings:</span>
                      <span className="font-mono font-bold text-emerald-400">+{formatCurrency(contract.financials.totalSavingsNGN)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Visits Progress:</span>
                      <span className="font-mono font-bold text-slate-200">{contract.completedVisits} / {contract.totalVisits} Completed</span>
                    </div>
                  </div>

                  {/* Assigned Vendor Card */}
                  {contract.assignedVendor && (
                    <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center space-x-2.5">
                        <img src={contract.assignedVendor.avatar} alt={contract.assignedVendor.name} className="w-8 h-8 rounded-lg object-cover border border-emerald-500" />
                        <div>
                          <span className="font-bold text-slate-200 block text-[11px]">{contract.assignedVendor.name}</span>
                          <span className="text-[10px] text-emerald-400">★ {contract.assignedVendor.rating} • Dedicated SLA Applicator</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {contract.preferredDayOfWeek}s ({contract.preferredTimeSlot.split(' ')[0]})
                      </span>
                    </div>
                  )}

                  {/* Upcoming Visit Callout */}
                  {nextUpcomingVisit && (
                    <div className="flex items-center justify-between bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/50 text-xs text-emerald-300">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block">Next Visit #{nextUpcomingVisit.visitNumber}: {nextUpcomingVisit.scheduledDate}</span>
                          <span className="text-[10px] text-slate-400">Escrow released per visit upon satisfaction</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTriggerVisit(contract.id, nextUpcomingVisit.visitNumber)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shadow cursor-pointer"
                      >
                        Dispatch Visit Now
                      </button>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View LASEPA SLA Document</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleContractStatus(contract.id, isPaused ? 'resume' : 'pause')}
                        className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded bg-slate-800"
                      >
                        {isPaused ? 'Resume Schedule' : 'Pause'}
                      </button>
                      <button
                        onClick={() => toggleContractStatus(contract.id, 'cancel')}
                        className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40"
                      >
                        Cancel SLA
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
