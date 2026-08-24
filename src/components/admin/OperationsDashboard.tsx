import React from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  TrendingUp,
  ShieldCheck,
  Truck,
  Users,
  DollarSign,
  AlertTriangle,
  Award,
  Sparkles,
  Activity,
  Layers
} from 'lucide-react';

export const OperationsDashboard: React.FC = () => {
  const {
    vendors,
    bookings,
    formatCurrency,
    selectedCountry,
    surgeConfig,
    setSurgeConfig
  } = useApp();

  const totalGmv = bookings.reduce((sum, b) => sum + b.fare.totalFareNGN, 0);
  const platformRevenue = bookings.reduce((sum, b) => sum + b.fare.platformFeeNGN, 0);
  const vendorDisbursements = bookings.reduce((sum, b) => sum + b.fare.vendorPayoutNGN, 0);
  const lasepaLeviesCollected = bookings.reduce((sum, b) => sum + b.fare.lasepaSafetyLevyNGN, 0);

  const activeCleans = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const clearedVendors = vendors.filter(v => v.verification.overallStatus === 'cleared_active');
  const pendingVetting = vendors.filter(v => v.verification.overallStatus === 'pending_review');

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Operations Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              State Operations Command
            </span>
            <span className="text-xs text-slate-400">• {selectedCountry.name} Market (70/30 Split Active)</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Dispatch, Fleet & Compliance Overview
          </h2>
        </div>

        {/* Dynamic Surge Toggle for Admin */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-xs font-bold text-white block">Surge Pricing Controller:</span>
            <span className="text-[10px] text-amber-400 font-semibold">{surgeConfig.isActive ? `${surgeConfig.multiplier}x Active` : 'Standard 1.0x'}</span>
          </div>
          <button
            onClick={() => setSurgeConfig(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              surgeConfig.isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {surgeConfig.isActive ? 'Surge Enabled' : 'Surge Off'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross GMV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gross Bookings GMV</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold font-mono text-white mt-2 block">
            {formatCurrency(totalGmv)}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            {bookings.length} Total Registered Cleans
          </span>
        </div>

        {/* Platform 30% Take */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">KleenPulse 30% Fee Take</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold font-mono text-blue-400 mt-2 block">
            {formatCurrency(platformRevenue)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            30% platform margin & insurance pool
          </span>
        </div>

        {/* Vendor 70% Disbursed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">70% Vendor Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-2 block">
            {formatCurrency(vendorDisbursements)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Paid directly to certified cleaners
          </span>
        </div>

        {/* LASEPA Environmental Monitoring Pool */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{selectedCountry.environmentalAgency} Levy (1.5%)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold font-mono text-teal-400 mt-2 block">
            {formatCurrency(lasepaLeviesCollected)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Remitted to Environmental Agency
          </span>
        </div>
      </div>

      {/* Main Operations Grid: Map & Live Active Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Real-Time Fleet Heatmap */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live State Dispatch & Fleet Activity</h3>
              </div>
              <span className="text-xs text-slate-400">
                {clearedVendors.length} Verified Units Live
              </span>
            </div>

            <InteractiveMap
              customerCoords={{ lat: 6.4474, lng: 3.4735 }}
              customerAddress="Lagos Metropolitan Operations Corridor"
              heightClass="h-96"
            />
          </div>
        </div>

        {/* Right: Active Bookings & Vetting Alert Deck */}
        <div className="lg:col-span-4 space-y-4">
          {/* Vetting Backlog Alert */}
          <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-600/50 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Verification Backlog</span>
              </span>
              <span className="text-xs font-mono font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800 text-amber-300">
                {pendingVetting.length} Pending
              </span>
            </div>

            <p className="text-xs text-slate-300">
              New cleaning and fumigation vendors awaiting LASEPA chemical audit and Nigeria Police Character Certificate clearance.
            </p>

            <div className="space-y-2 pt-1">
              {pendingVetting.map(v => (
                <div key={v.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{v.name}</span>
                    <span className="text-[10px] text-slate-400">{v.companyName}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded">
                    Audit Due
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white">Active Jobs in Progress</h3>
              <span className="font-mono text-emerald-400 font-bold">{activeCleans.length} Active</span>
            </div>

            <div className="space-y-2">
              {activeCleans.map(b => (
                <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-400">{b.bookingCode}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-300 px-1.5 py-0.5 bg-slate-800 rounded">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-white font-medium truncate">{b.service.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{b.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
