import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LASEPA_APPROVED_CHEMICALS } from '../../data/chemicals';
import {
  ShieldCheck,
  FlaskConical,
  Clock,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Search,
  ExternalLink
} from 'lucide-react';

export const ChemicalSafetyMonitor: React.FC = () => {
  const { bookings, selectedCountry } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Active fumigation jobs with chemical logs
  const chemicalJobs = bookings.filter(b => b.chemicalRecord);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              State Chemical Safety Vault
            </span>
            <span className="text-xs text-slate-400">• LASEPA Pesticide Directorate</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Active Chemical Batch & Safe Re-Entry Monitoring
          </h2>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-semibold">{chemicalJobs.length} Fumigation Missions Logged</span>
        </div>
      </div>

      {/* Approved Chemicals Quick Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LASEPA_APPROVED_CHEMICALS.map(chem => (
          <div key={chem.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <span className="font-bold text-white text-xs">{chem.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                {chem.lasepaBatchCert}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{chem.activeIngredient} ({chem.activeConcentration})</p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-amber-400 font-semibold">{chem.toxicityClass}</span>
              <span className="text-slate-300 font-mono">Re-entry: {chem.safeReentryHours}h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Statewide Field Spraying Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Real-time Field Spraying & Applicator Logs</span>
        </h3>

        <div className="space-y-3">
          {chemicalJobs.map(b => (
            <div key={b.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">{b.bookingCode}</span>
                  <span className="text-white font-semibold ml-2">{b.address} ({b.city})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Applicator: {b.assignedVendor?.name || 'Verified Tech'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Chemical Batch:</span>
                  <span className="font-mono text-emerald-400">{b.chemicalRecord?.lasepaBatchNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Active Compound:</span>
                  <span>{b.chemicalRecord?.activeIngredient}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Dilution Ratio:</span>
                  <span>{b.chemicalRecord?.dilutionRatio}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Safety Window:</span>
                  <span className="text-amber-400 font-bold">{b.chemicalRecord?.reentryHours} Hours Ventilation</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
