import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Shield, Sparkles, Heart, Globe, Award } from 'lucide-react';

export const Footer: React.FC<{
  onOpenMsds: () => void;
  onOpenSos: () => void;
}> = ({ onOpenMsds, onOpenSos }) => {
  const { selectedCountry } = useApp();

  return (
    <footer className="mt-16 bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Regulatory Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white">
                Kleen<span className="text-emerald-400">Pulse</span> Africa
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Africa's premier Uber-style on-demand network for certified household deep cleaning, Airbnb turnovers, warehouse industrial scrubbing, and pest fumigation. Operated by <strong>Matoluxx Integrated Services</strong> (Wema Bank <strong>0128090787</strong>). All service partners undergo mandatory vetting by the <strong>{selectedCountry.policeAgency}</strong> and hold verified <strong>{selectedCountry.environmentalAgency}</strong> pest control operator credentials.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
              <span>✓ 70/30 Fair Revenue Share</span>
              <span>•</span>
              <span>✓ WHO Class II Pyrethroids Only</span>
              <span>•</span>
              <span>✓ 90-Day Warranty</span>
            </div>
          </div>

          {/* Quick Regulatory Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Compliance & Safety</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={onOpenMsds} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  LASEPA Safe Chemical MSDS
                </button>
              </li>
              <li>
                <button onClick={onOpenSos} className="hover:text-red-400 transition-colors cursor-pointer text-red-400/90 font-medium">
                  Emergency Hazardous SOS
                </button>
              </li>
              <li>
                <span className="text-slate-400">Police Character Check (CRID)</span>
              </li>
              <li>
                <span className="text-slate-400">Environmental Sanitation Laws</span>
              </li>
            </ul>
          </div>

          {/* African Markets */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Operational Markets</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>🇳🇬 Nigeria (Lagos, Abuja, PH, Ibadan)</li>
              <li>🇬🇭 Ghana (Accra, Kumasi)</li>
              <li>🇰🇪 Kenya (Nairobi, Mombasa)</li>
              <li>🇿🇦 South Africa (Joburg, Cape Town)</li>
              <li>🇷🇼 Rwanda (Kigali Eco-City)</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} KleenPulse Africa (Matoluxx Integrated Services). Built in accordance with LASEPA statutory regulations.</p>
          <div className="flex items-center space-x-4">
            <span>Terms of Service (70/30 Driver Model)</span>
            <span>Privacy Policy</span>
            <span>Disinfection Standards CAP E14</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
