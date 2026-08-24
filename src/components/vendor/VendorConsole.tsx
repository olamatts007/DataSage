import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  Power,
  ShieldCheck,
  PhoneCall,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Truck,
  Sparkles,
  Camera,
  FileText,
  Percent,
  Check,
  Lock,
  Key,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

export const VendorConsole: React.FC<{
  onOpenMsds: () => void;
}> = ({ onOpenMsds }) => {
  const {
    currentVendor,
    toggleVendorOnline,
    bookings,
    updateBookingStatus,
    toggleChecklistItem,
    submitVendorCompletionProof,
    validateCompletionOtp,
    formatCurrency,
    selectedCountry
  } = useApp();

  const [inputOtp, setInputOtp] = useState('');
  const [otpValidationMsg, setOtpValidationMsg] = useState<{ text: string; success: boolean } | null>(null);

  const assignedJob = bookings.find(
    b => b.assignedVendor?.id === currentVendor.id && b.status !== 'completed' && b.status !== 'cancelled'
  );

  const isVerified = currentVendor.verification.overallStatus === 'cleared_active';

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedJob) return;
    if (!inputOtp.trim() || inputOtp.length !== 4) {
      setOtpValidationMsg({ text: 'Please enter the 4-digit code provided by the customer.', success: false });
      return;
    }

    const res = validateCompletionOtp(assignedJob.id, inputOtp);
    if (res.success) {
      setOtpValidationMsg({ text: res.message, success: true });
      setInputOtp('');
    } else {
      setOtpValidationMsg({ text: res.message, success: false });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Driver Status Hero Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentVendor.avatar}
              alt={currentVendor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-slate-900 ${
              currentVendor.isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-slate-600 text-white'
            }`}>
              {currentVendor.isOnline ? '●' : '○'}
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">{currentVendor.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                {currentVendor.partnerTier} Partner
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentVendor.companyName || 'Independent Certified Agent'}</p>

            {/* Regulatory Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isVerified ? (
                <>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{selectedCountry.environmentalAgency} Lic: {currentVendor.verification.lasepaAccreditation.documentNumber}</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>NPF Cleared: {currentVendor.verification.policeClearance.documentNumber}</span>
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Pending LASEPA / Police Clearance Desk Review</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Uber Driver Online / Offline Big Switch */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Dispatch Status:</span>
            <span className={`text-sm font-bold ${currentVendor.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
              {currentVendor.isOnline ? 'ONLINE (Accepting Jobs)' : 'OFFLINE (Resting)'}
            </span>
          </div>

          <button
            onClick={() => toggleVendorOnline(currentVendor.id)}
            disabled={!isVerified}
            className={`flex items-center space-x-2 px-5 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-xl cursor-pointer ${
              !isVerified
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : currentVendor.isOnline
                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 shadow-red-950'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-950'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{currentVendor.isOnline ? 'GO OFFLINE' : 'GO ONLINE NOW'}</span>
          </button>
        </div>
      </div>

      {/* Main Vendor Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live GPS & Active Job Execution Stepper */}
        <div className="lg:col-span-7 space-y-6">
          <InteractiveMap
            customerCoords={assignedJob?.coordinates || currentVendor.currentLocation}
            customerAddress={assignedJob?.address || currentVendor.currentLocation.address}
            activeBooking={assignedJob}
            heightClass="h-80"
          />

          {/* Active Job Terminal */}
          {assignedJob ? (
            <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    DISPATCH #{assignedJob.bookingCode}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{assignedJob.service.name}</h3>
                  <p className="text-xs text-slate-400">{assignedJob.address} ({assignedJob.city})</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Your 70% Payout:</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    {formatCurrency(assignedJob.fare.vendorPayoutNGN)}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    (🔒 Protected in Escrow)
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Action Stepper */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Live Mission Status:</span>
                  <span className="font-mono text-emerald-400 font-bold uppercase">{assignedJob.status.replace(/_/g, ' ')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => updateBookingStatus(assignedJob.id, 'agent_en_route')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      assignedJob.status === 'agent_en_route'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    1. En Route 🚚
                  </button>

                  <button
                    onClick={() => updateBookingStatus(assignedJob.id, 'agent_arrived')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      assignedJob.status === 'agent_arrived'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    2. Arrived 📍
                  </button>

                  <button
                    onClick={() => updateBookingStatus(assignedJob.id, 'service_in_progress')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      assignedJob.status === 'service_in_progress'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    3. Spray / Clean ⚡
                  </button>

                  <button
                    onClick={() => updateBookingStatus(assignedJob.id, 'chemical_evacuation_active')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      assignedJob.status === 'chemical_evacuation_active'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    4. Ventilate ⏳
                  </button>
                </div>

                {assignedJob.status !== 'awaiting_customer_satisfaction' && (
                  <button
                    onClick={() => submitVendorCompletionProof(assignedJob.id)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>SUBMIT JOB FOR CUSTOMER SATISFACTION INSPECTION</span>
                  </button>
                )}
              </div>

              {/* In-Person 4-Digit OTP Confirmation Card */}
              {assignedJob.status === 'awaiting_customer_satisfaction' && (
                <div className="bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-950 border-2 border-blue-600/70 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Key className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">In-Person Customer Satisfaction Verification</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    Once the customer has walked through and confirmed they are satisfied with the clean/fumigation, ask them for their <strong>4-digit Satisfaction OTP</strong>:
                  </p>

                  {otpValidationMsg && (
                    <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-1.5 ${
                      otpValidationMsg.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-700'
                    }`}>
                      {otpValidationMsg.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                      <span>{otpValidationMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit} className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={inputOtp}
                      onChange={e => setInputOtp(e.target.value)}
                      placeholder="e.g. 4829"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-base font-mono font-bold text-white tracking-widest focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Verify & Release Escrow
                    </button>
                  </form>
                </div>
              )}

              {/* Vendor Digital Checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Applicator Mandatory Safety & Quality Checklist:
                </span>
                {assignedJob.checklists.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(assignedJob.id, item.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                      item.completed ? 'bg-emerald-950/40 border-emerald-800 text-slate-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        item.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-transparent'
                      }`}>
                        ✓
                      </div>
                      <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{item.title}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleChecklistItem(assignedJob.id, item.id, 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&auto=format&fit=crop&q=80');
                      }}
                      className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center space-x-1"
                    >
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>Take Proof</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Standing By for Nearby Clean / Fumigation Bookings</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {currentVendor.isOnline
                  ? 'Your status is ONLINE. As soon as a client in your coverage radius books a service, you will receive a 30-second priority dispatch invitation.'
                  : 'Toggle your status to ONLINE above to start receiving instant job requests.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Wallet Snapshot & Equipment Manifest */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-700/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Wallet Balance</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Instant NIP Payout Ready
              </span>
            </div>

            <div>
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {formatCurrency(currentVendor.wallet.availableBalanceNGN)}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Settled to: <strong className="text-slate-200">{currentVendor.wallet.bankAccount.bankName}</strong> ({currentVendor.wallet.bankAccount.accountNumber})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Lifetime Net Earned:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(currentVendor.wallet.totalEarnedNGN)}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Platform Split (30%):</span>
                <span className="font-mono font-bold text-blue-400">{formatCurrency(currentVendor.wallet.platformFeesPaidNGN)}</span>
              </div>
            </div>
          </div>

          {/* Registered Equipment */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white">Registered PPE & Equipment Inventory</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                LASEPA Verified
              </span>
            </div>

            <div className="space-y-2">
              {currentVendor.equipment.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
