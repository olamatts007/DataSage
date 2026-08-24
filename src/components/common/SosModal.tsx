import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, PhoneCall, ShieldAlert, X, AlertTriangle, CheckCircle } from 'lucide-react';

export const SosModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { selectedCountry, triggerEmergencySos, sosAlert, clearSosAlert } = useApp();
  const [selectedIncident, setSelectedIncident] = useState('Chemical Inhalation / Asthmatic Reaction');
  const [comments, setComments] = useState('');
  const [dispatched, setDispatched] = useState(false);

  if (!isOpen) return null;

  const incidentTypes = [
    'Chemical Inhalation / Asthmatic Reaction',
    'Accidental Eye / Skin Contact with Fogging Mist',
    'Suspected Chemical Spill / Excessive Odor',
    'Security / Vendor Conduct Violation',
    'Property Safety / Fire Hazard Concern'
  ];

  const handleDispatchEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergencySos(`${selectedIncident} (${selectedCountry.name}) - ${comments || 'Immediate support requested'}`);
    setDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-red-800/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={() => {
            setDispatched(false);
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-400">Emergency & Incident Support</h2>
            <p className="text-xs text-slate-400">
              Direct connection to {selectedCountry.environmentalAgency} & Emergency Hotlines
            </p>
          </div>
        </div>

        {dispatched ? (
          <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-5 text-center space-y-4 my-2">
            <div className="w-12 h-12 bg-red-900/60 rounded-full flex items-center justify-center mx-auto text-red-300">
              <CheckCircle className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-300">Emergency Protocol Triggered</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                A high-priority incident token has been registered with the <strong>KleenPulse Safety Operations Command</strong> and <strong>{selectedCountry.environmentalAgency} Quick-Response Medical Cell</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left text-xs space-y-1">
              <p className="text-slate-400"><strong className="text-slate-200">Incident Type:</strong> {selectedIncident}</p>
              <p className="text-slate-400"><strong className="text-slate-200">Location Dispatch:</strong> Lagos Island / Mainland Safety Squad</p>
              <p className="text-slate-400"><strong className="text-slate-200">Emergency Hotline:</strong> 112 / 767 (Lagos State Toll-Free)</p>
            </div>

            <button
              onClick={() => {
                setDispatched(false);
                onClose();
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs"
            >
              Dismiss
            </button>
          </div>
        ) : (
          <form onSubmit={handleDispatchEmergency} className="space-y-4">
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-xs text-amber-300 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                All fumigation agents on KleenPulse use WHO Class-II / Class-III biodegradable pyrethroids. If you feel dizzy or experience skin irritation, immediately move to fresh air and rinse thoroughly.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Incident / Hazard Type:
              </label>
              <select
                value={selectedIncident}
                onChange={e => setSelectedIncident(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              >
                {incidentTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Describe immediate situation:
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="E.g. Resident coughing from residual mist in bedroom 2..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Direct Phone Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded-lg text-xs font-semibold"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Lagos 112 / 767</span>
              </a>

              <a
                href="tel:+234800527372"
                className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white py-2 rounded-lg text-xs font-semibold"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span>LASEPA Desk: 0800-LASEPA</span>
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-950 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Trigger Urgent SOS Dispatch</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
