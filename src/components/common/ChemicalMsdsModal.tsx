import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LASEPA_APPROVED_CHEMICALS, LasepaChemical } from '../../data/chemicals';
import { ShieldCheck, X, FileText, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const ChemicalMsdsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { selectedCountry } = useApp();
  const [selectedChem, setSelectedChem] = useState<LasepaChemical>(LASEPA_APPROVED_CHEMICALS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{selectedCountry.environmentalAgency} Chemical Safety Registry</span>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700">
                  MSDS Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official directory of approved pest control chemicals, active ingredients & safe re-entry windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chemical List */}
          <div className="space-y-2 md:col-span-1 border-r border-slate-800 pr-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Approved Chemical Formulations
            </h3>
            {LASEPA_APPROVED_CHEMICALS.map(chem => (
              <button
                key={chem.id}
                onClick={() => setSelectedChem(chem)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  selectedChem.id === chem.id
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{chem.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {chem.safeReentryHours === 0 ? 'No Wait' : `${chem.safeReentryHours}h safe`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{chem.activeIngredient}</p>
                <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{chem.lasepaBatchCert}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Chemical Detail View */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedChem.name}</h3>
                  <span className="text-xs text-emerald-400 font-medium">{selectedChem.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[11px]">
                    WHO / WHOPES: {selectedChem.whopesApproval}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Active Ingredient</span>
                  <span className="font-semibold text-slate-200">{selectedChem.activeIngredient}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Concentration</span>
                  <span className="font-semibold text-slate-200">{selectedChem.activeConcentration}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Toxicity Class</span>
                  <span className="font-semibold text-amber-400">{selectedChem.toxicityClass}</span>
                </div>
              </div>

              {/* Safe Reentry Badge */}
              <div className="flex items-center space-x-3 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-lg text-xs text-emerald-300 mb-4">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Required Safety Evacuation & Ventilation Window:</span>
                  <p className="text-slate-300 text-[11px]">
                    {selectedChem.safeReentryHours === 0
                      ? 'No evacuation required. Suitable for targeted kitchen gel applications.'
                      : `Premises must remain sealed for initial mist knockdown, then cross-ventilated for ${selectedChem.safeReentryHours} hours before human or pet re-entry.`}
                  </p>
                </div>
              </div>

              {/* Target Organisms */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Targeted Pest Organisms & Vectors:</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChem.targetOrganisms.map((pest, i) => (
                    <span key={i} className="text-[11px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                      {pest}
                    </span>
                  ))}
                </div>
              </div>

              {/* MSDS Summary */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Toxicological & MSDS Environmental Assessment:</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {selectedChem.msdsSummary}
                </p>
              </div>

              {/* Required PPE */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mandatory PPE for Certified Applicators:</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedChem.requiredPpe.map((item, i) => (
                    <span key={i} className="text-[11px] bg-amber-950/40 text-amber-300 border border-amber-800/50 px-2.5 py-1 rounded-lg">
                      🛡️ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Official State Environmental Protection Regulation — CAP E14 Laws of Lagos State.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium"
          >
            Close Registry
          </button>
        </div>
      </div>
    </div>
  );
};
