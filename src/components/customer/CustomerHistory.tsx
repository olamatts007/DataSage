import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { CertificateModal } from '../common/CertificateModal';
import {
  FileCheck,
  ShieldCheck,
  Calendar,
  MapPin,
  Sparkles,
  Award,
  ChevronRight,
  Star,
  Receipt,
  Download
} from 'lucide-react';

export const CustomerHistory: React.FC = () => {
  const { bookings, formatCurrency, selectedCountry, setActiveBookingId } = useApp();
  const [selectedCertBooking, setSelectedCertBooking] = useState<Booking | null>(null);

  const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'chemical_evacuation_active');

  return (
    <div className="space-y-6 animate-in fade-in">
      <CertificateModal
        isOpen={!!selectedCertBooking}
        onClose={() => setSelectedCertBooking(null)}
        booking={selectedCertBooking}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Digital Certificate Vault & Service History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access certified {selectedCountry.environmentalAgency} hygiene records & warranty certificates for your properties
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-semibold">{completedBookings.length} Cleans Documented</span>
        </div>
      </div>

      {completedBookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Past Records Found</h3>
          <p className="text-xs">Once your certified clean is finished, the official LASEPA compliance certificate will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedBookings.map(b => (
            <div
              key={b.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-600/50 rounded-2xl p-5 shadow-xl transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {b.bookingCode}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{b.service.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{b.address}, {b.city}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm block">
                    {formatCurrency(b.fare.totalFareNGN)}
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                    ✓ Paid & Certified
                  </span>
                </div>
              </div>

              {/* Chemical Record Tag if fumigation */}
              {b.chemicalRecord && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Chemical:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[180px]">{b.chemicalRecord.chemicalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">LASEPA Batch:</span>
                    <span className="font-mono text-emerald-400">{b.chemicalRecord.lasepaBatchNumber}</span>
                  </div>
                </div>
              )}

              {/* Rating Card if submitted */}
              {b.rating && (
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center space-x-1 text-amber-400 text-xs mb-1">
                    {Array.from({ length: b.rating.stars }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    <span className="text-slate-400 text-[10px] ml-1">Verified Review</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic">"{b.rating.comment}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCertBooking(b)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Download LASEPA Cert</span>
                </button>

                <button
                  onClick={() => setActiveBookingId(b.id)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>View Full Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
