import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Download,
  Building,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Lock,
  Unlock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export const FinancialLedger: React.FC = () => {
  const { bookings, formatCurrency, selectedCountry } = useApp();

  const totalGmv = bookings.reduce((sum, b) => sum + b.fare.totalFareNGN, 0);
  const totalPlatformCut = bookings.reduce((sum, b) => sum + b.fare.platformFeeNGN, 0);
  const totalVendorSettled = bookings
    .filter(b => b.payment.status === 'paid_and_settled')
    .reduce((sum, b) => sum + b.fare.vendorPayoutNGN + (b.fare.tipNGN || 0), 0);
  const totalEscrowHeld = bookings
    .filter(b => b.payment.status === 'escrow_locked' || b.payment.status === 'touch_up_hold')
    .reduce((sum, b) => sum + b.fare.vendorPayoutNGN, 0);
  const totalLasepaLevies = bookings.reduce((sum, b) => sum + b.fare.lasepaSafetyLevyNGN, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Official Platform Collection & Settlement Account Card */}
      <div className="bg-slate-900 border border-emerald-600/50 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Official Designated Settlement Account
              </span>
              <span className="text-xs text-slate-400">• 70/30 Revenue Split Model</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-1">
              Matoluxx Integrated Services
            </h3>
            <p className="text-xs text-slate-300">
              Bank: <strong className="text-emerald-400">Wema Bank Plc</strong> | Account Number: <strong className="text-white font-mono text-sm">0128090787</strong>
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-700">
          ✓ 70% Vendor / 30% Platform Split Active
        </span>
      </div>

      {/* Financial Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              70/30 Revenue-Sharing Model & Customer Escrow Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {formatCurrency(totalGmv)} <span className="text-xs text-slate-400 font-sans">Total Gross Transacted</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Exporting full NIBSS / Escrow settlement CSV audit...')}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV Audit</span>
            </button>
          </div>
        </div>

        {/* Breakdown Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Customer Satisfied & Released (70%)</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(totalVendorSettled)}
            </span>
            <span className="text-[10px] text-slate-400">70% vendor payouts settled</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-amber-800/40">
            <span className="text-amber-400 text-[11px] font-bold block flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Escrow Held Pending Sign-Off</span>
            </span>
            <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
              {formatCurrency(totalEscrowHeld)}
            </span>
            <span className="text-[10px] text-slate-400">Awaiting customer inspection</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">KleenPulse Platform Take (30%)</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
              {formatCurrency(totalPlatformCut)}
            </span>
            <span className="text-[10px] text-slate-400">Technology, insurance & support fee</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">LASEPA Monitoring Levy (1.5%)</span>
            <span className="text-xl font-bold font-mono text-teal-400 mt-1 block">
              {formatCurrency(totalLasepaLevies)}
            </span>
            <span className="text-[10px] text-slate-400">Remitted for chemical disposal audits</span>
          </div>
        </div>
      </div>

      {/* Itemized Transaction Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Itemized Clean & Fumigation Dispatches</span>
          </h3>
          <span className="text-xs text-slate-400">{bookings.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Dispatch Code</th>
                <th className="p-3">Service & Client</th>
                <th className="p-3">Gross Fare</th>
                <th className="p-3">Vendor 70%</th>
                <th className="p-3">Platform 30%</th>
                <th className="p-3">Satisfaction Status</th>
                <th className="p-3">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    {b.bookingCode}
                    <span className="block text-[10px] text-slate-500 font-normal">OTP: {b.completionOtp}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-white block">{b.service.name}</span>
                    <span className="text-[11px] text-slate-400">{b.customerName} ({b.city})</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {formatCurrency(b.fare.totalFareNGN)}
                  </td>
                  <td className="p-3 font-mono text-emerald-400 font-semibold">
                    {formatCurrency(b.fare.vendorPayoutNGN + (b.fare.tipNGN || 0))}
                  </td>
                  <td className="p-3 font-mono text-blue-400">
                    {formatCurrency(b.fare.platformFeeNGN)}
                  </td>
                  <td className="p-3">
                    {b.satisfactionSignoff?.isSatisfied ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>100% Satisfied</span>
                      </span>
                    ) : b.status === 'touch_up_in_progress' ? (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Touch-Up Requested</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Pending Inspection</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      b.payment.status === 'paid_and_settled'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : b.payment.status === 'touch_up_hold'
                        ? 'bg-red-950 text-red-300 border-red-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}>
                      {b.payment.status === 'paid_and_settled'
                        ? '✓ RELEASED TO VENDOR'
                        : b.payment.status === 'touch_up_hold'
                        ? '⚠️ TOUCH-UP HOLD'
                        : '🔒 HELD IN ESCROW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
