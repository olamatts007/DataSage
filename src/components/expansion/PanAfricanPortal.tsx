import React from 'react';
import { useApp } from '../../context/AppContext';
import { COUNTRIES } from '../../data/countries';
import { CountryCode } from '../../types';
import {
  Globe,
  ShieldCheck,
  Shield,
  TrendingUp,
  MapPin,
  CheckCircle,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PanAfricanPortal: React.FC = () => {
  const { selectedCountry, setCountryCode } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 border border-emerald-600/50 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          <Globe className="w-4 h-4" />
          <span>Pan-African Expansion Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Standardizing Vetted Cleaning & Vector Control Across Africa
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          KleenPulse is architected for seamless multi-region deployment. Starting in Nigeria with <strong>LASEPA</strong> and <strong>Nigeria Police Force (NPF)</strong> compliance, our plug-and-play regulatory engine adapts to national environmental agencies and criminal records registries across West, East, and Southern Africa.
        </p>

        {/* Quick Country Switcher Tabs */}
        <div className="pt-4 flex flex-wrap gap-2.5">
          {Object.values(COUNTRIES).map(country => (
            <button
              key={country.code}
              onClick={() => setCountryCode(country.code as CountryCode)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                country.code === selectedCountry.code
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
              <span className="font-mono text-[11px] opacity-80">({country.currency})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Country Regulatory Spotlight */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{selectedCountry.name} Expansion Profile</h2>
              <p className="text-xs text-slate-400">Localized Compliance, Currency & Dispatch Hotspots</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">
            1 NGN = {selectedCountry.exchangeRateToNGN} {selectedCountry.currency}
          </span>
        </div>

        {/* Regulatory Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environmental Compliance */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">National Environmental Authority</h3>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Designated Statutory Agency:</span>
              <span className="text-sm font-bold text-emerald-300 mt-0.5 block">
                {selectedCountry.environmentalAgency}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Required Pest Operator Permit:</span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                {selectedCountry.environmentalPermitName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-900">
              ✓ Automated chemical formulation auditing, WHO Class II verification, and safe ventilation intervals enforced on all dispatches.
            </p>
          </div>

          {/* Police Criminal Records Authority */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400">
              <Shield className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Law Enforcement & Character Vetting</h3>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Designated Police Department:</span>
              <span className="text-sm font-bold text-blue-300 mt-0.5 block">
                {selectedCountry.policeAgency}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Mandatory Background Certificate:</span>
              <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                {selectedCountry.policeCertificateName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-900">
              ✓ Biometric national ID verification and criminal history clearance mandatory prior to job dispatch permissions.
            </p>
          </div>
        </div>

        {/* Major City Coverage Launch Hubs */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Target Metropolitan Launch Zones in {selectedCountry.name}:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCountry.majorCities.map((city, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 flex items-center space-x-1.5"
              >
                <span>📍</span>
                <span>{city}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
