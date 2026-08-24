import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Award,
  CheckCircle,
  Building,
  AlertCircle,
  CreditCard,
  Download,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EarningsWallet: React.FC = () => {
  const { currentVendor, formatCurrency, requestVendorPayout, selectedCountry } = useApp();
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutBank, setPayoutBank] = useState<string>('Wema Bank Plc');
  const [accountNumber, setAccountNumber] = useState<string>('0128090787');
  const [accountName, setAccountName] = useState<string>('Matoluxx Integrated Services');
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  const nigerianBanks = [
    'Wema Bank Plc',
    'ALAT by Wema',
    'Guaranty Trust Bank (GTBank)',
    'Access Bank Plc',
    'Zenith Bank Plc',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Kuda Microfinance Bank',
    'Moniepoint MFB',
    'OPay Digital Services'
  ];

  const handleCashout = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      setStatusMessage({ text: 'Please enter a valid cashout amount', success: false });
      return;
    }
    if (amount > currentVendor.wallet.availableBalanceNGN) {
      setStatusMessage({ text: 'Amount exceeds available balance', success: false });
      return;
    }

    const res = requestVendorPayout(currentVendor.id, amount, payoutBank, accountNumber);
    if (res.success) {
      setStatusMessage({ text: res.message, success: true });
      setPayoutAmount('');
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch (err) {}
    } else {
      setStatusMessage({ text: res.message, success: false });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Wallet Balance Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-600/50 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              Vendor Revenue & Payout Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {formatCurrency(currentVendor.wallet.availableBalanceNGN)}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Available for instant 24/7 bank disbursement</p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <Award className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">{currentVendor.partnerTier} Tier Partner</span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {( (1 - currentVendor.commissionRate) * 100 ).toFixed(0)}% Revenue Take-Home Share
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Split Economics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Total Lifetime Earnings</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(currentVendor.wallet.totalEarnedNGN)}
            </span>
            <span className="text-[10px] text-slate-400">80% direct vendor payout</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Platform & Insurance Fee Split</span>
            <span className="text-lg font-bold font-mono text-blue-400 mt-1 block">
              {formatCurrency(currentVendor.wallet.platformFeesPaidNGN)}
            </span>
            <span className="text-[10px] text-slate-400">20% Uber-style KleenPulse fee</span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[11px] block">Jobs Completed & Rated</span>
            <span className="text-lg font-bold font-mono text-white mt-1 block">
              {currentVendor.totalJobs} Jobs (★ {currentVendor.rating})
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">{currentVendor.completionRate}% completion rate</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Instant Cashout & Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Instant Cashout Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Instant NIBSS Bank Transfer Cashout</h3>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
              statusMessage.success ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-200' : 'bg-red-950/60 border border-red-600 text-red-200'
            }`}>
              {statusMessage.success ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Active Verified Bank Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-600/40 text-xs space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Primary Payout Account:</span>
            <span className="font-extrabold text-white text-sm block">Matoluxx Integrated Services</span>
            <div className="flex items-center justify-between text-slate-300 pt-1">
              <span className="font-mono text-emerald-400 font-bold">0128090787</span>
              <span className="text-slate-400 font-semibold">Wema Bank Plc</span>
            </div>
          </div>

          <form onSubmit={handleCashout} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cashout Amount (NGN):</label>
              <div className="relative">
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setPayoutAmount(currentVendor.wallet.availableBalanceNGN.toString())}
                  className="absolute right-2 top-2 px-2 py-1 bg-slate-800 text-emerald-400 rounded text-[10px] font-bold"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Destination Bank:</label>
              <select
                value={payoutBank}
                onChange={e => setPayoutBank(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {nigerianBanks.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Name:</label>
              <input
                type="text"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Matoluxx Integrated Services"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">10-Digit NUBAN Account Number:</label>
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="0128090787"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>DISBURSE INSTANT CASHOUT TO WEMA BANK</span>
            </button>
          </form>
        </div>

        {/* Right Column: Payout History Ledger */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Disbursement & Settlement Ledger</h3>
            </div>
            <span className="text-xs text-slate-400">NIP Direct Rails</span>
          </div>

          {currentVendor.wallet.payoutHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No cashout transactions recorded yet.</p>
          ) : (
            <div className="space-y-2.5">
              {currentVendor.wallet.payoutHistory.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{formatCurrency(item.amountNGN)}</span>
                    <span className="text-[11px] text-slate-400">{item.bankName} • {item.date}</span>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{item.reference}</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    ✓ Instant Settled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
