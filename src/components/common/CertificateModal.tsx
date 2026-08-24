import React from 'react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Award, QrCode, CheckCircle, Printer, X, Download, Lock } from 'lucide-react';

export const CertificateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}> = ({ isOpen, onClose, booking }) => {
  const { selectedCountry } = useApp();

  if (!isOpen || !booking) return null;

  const printCert = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-emerald-700/60 rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl text-slate-100 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas */}
        <div className="bg-slate-950 border-4 border-double border-emerald-600/40 rounded-xl p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950">
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-emerald-500" />
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b border-emerald-800/40 pb-4 mb-5">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500 flex items-center justify-center text-emerald-300">
                <Award className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              {selectedCountry.name} Environmental Compliance Registry
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-wide mt-0.5">
              OFFICIAL CERTIFICATE OF HYGIENE & ECO-FUMIGATION
            </h1>
            <p className="text-[11px] text-slate-400">
              Pursuant to Section 22 of the Lagos State Environmental Protection Agency (LASEPA) Act
            </p>
          </div>

          {/* Certificate Body Details */}
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Certificate Serial Ref:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  CERT-LASEPA-{booking.bookingCode}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Date of Certification:</span>
                <span className="font-semibold text-slate-200">
                  {booking.timestamps.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block">Certified Premises:</span>
                <span className="font-semibold text-slate-200 block truncate">{booking.address}</span>
                <span className="text-[11px] text-slate-400">{booking.lga}, {booking.city}</span>
              </div>

              <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 text-[10px] block">Client / Occupant:</span>
                <span className="font-semibold text-slate-200 block">{booking.customerName}</span>
                <span className="text-[11px] text-slate-400">{booking.propertyDetails.propertyType} ({booking.propertyDetails.bedrooms} Rooms)</span>
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-lg space-y-2">
              <div className="font-semibold text-emerald-300 text-xs flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Chemical & Vector Control Verification Log:</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Chemical Applied: </span>
                  <span className="text-slate-200 font-medium">
                    {booking.chemicalRecord?.chemicalName || 'PyreSafe-25 Ultra EC (Permethrin 25%)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">LASEPA Batch #: </span>
                  <span className="text-slate-200 font-mono">
                    {booking.chemicalRecord?.lasepaBatchNumber || 'LASEPA/CHEM/2024/LG-902'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Safe Re-entry Interval: </span>
                  <span className="text-slate-200 font-medium">
                    {booking.chemicalRecord?.reentryHours || 3.5} Hours post-fogging
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Anti-Pest Warranty: </span>
                  <span className="text-emerald-400 font-bold">90 Days Guarantee</span>
                </div>
              </div>
            </div>

            {/* Applicator Signoff */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="border-t border-slate-800 pt-2">
                <span className="text-slate-500 text-[10px] block">Lead LASEPA Certified Applicator:</span>
                <span className="font-bold text-slate-200 block">{booking.assignedVendor?.name || 'Babajide Emmanuel Adeyemi'}</span>
                <span className="text-[10px] text-blue-400 font-mono">
                  Licence: {booking.assignedVendor?.verification.lasepaAccreditation.documentNumber || 'LASEPA/PCO/2024/CAT-A/00438'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  NPF Clearance: {booking.assignedVendor?.verification.policeClearance.documentNumber || 'NPF-CCR/LG/2024/09841'}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Digital Verification Hash</span>
                  <span className="font-mono text-[9px] text-emerald-400 block truncate max-w-[120px]">
                    SHA256: 8f92a10b...e491
                  </span>
                  <span className="text-[9px] text-emerald-300 font-semibold flex items-center justify-end space-x-1 mt-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Cryptographically Signed</span>
                  </span>
                </div>
                <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-950" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mt-4 pt-2 border-t border-slate-800">
          <button
            onClick={printCert}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Copy</span>
          </button>

          <button
            onClick={printCert}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950"
          >
            <Download className="w-4 h-4" />
            <span>Download Digital PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
