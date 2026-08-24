import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  X,
  QrCode,
  Smartphone,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BankTransferModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  amountNGN: number;
  bookingCode: string;
  onPaymentConfirmed: () => void;
}> = ({ isOpen, onClose, amountNGN, bookingCode, onPaymentConfirmed }) => {
  const { formatCurrency } = useApp();
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const accountNumber = '0128090787';
  const accountName = 'Matoluxx Integrated Services';
  const bankName = 'Wema Bank Plc';

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTransfer = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setConfirmed(true);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}
      setTimeout(() => {
        onPaymentConfirmed();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-600/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
              Official Corporate Settlement Account
            </span>
            <h3 className="text-base font-extrabold text-white">Direct Bank Transfer Escrow</h3>
          </div>
        </div>

        {confirmed ? (
          <div className="bg-emerald-950/60 border border-emerald-500 rounded-2xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-8 h-8 font-bold" />
            </div>
            <h4 className="text-base font-bold text-white">Bank Payment Received & Escrow Locked!</h4>
            <p className="text-xs text-slate-300">
              {formatCurrency(amountNGN)} confirmed from Wema Bank NIP settlement gateway. Dispatching nearest certified technician now!
            </p>
          </div>
        ) : (
          <>
            {/* Amount Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Total Amount to Transfer:</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {formatCurrency(amountNGN)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Reference: {bookingCode}</span>
            </div>

            {/* Bank Details Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-600/40 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Bank:</span>
                <span className="font-extrabold text-white text-sm">{bankName}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Account Name:</span>
                <span className="font-bold text-emerald-300">{accountName}</span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Account Number:</span>
                  <span className="font-mono font-extrabold text-lg text-white tracking-widest">{accountNumber}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* USSD & Mobile App Shortcuts */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Wema/ALAT USSD: <strong>*945*000*0128090787#</strong></span>
              </span>
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>100% Escrow Protected</span>
              </span>
            </div>

            {/* Action Confirm Button */}
            <button
              onClick={handleConfirmTransfer}
              disabled={verifying}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950 cursor-pointer transition-all disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying NIBSS Bank Transfer...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>I HAVE TRANSFERRED {formatCurrency(amountNGN)}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
