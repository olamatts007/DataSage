import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, CountryCode } from '../../types';
import { COUNTRIES } from '../../data/countries';
import {
  Shield,
  ShieldCheck,
  User,
  Truck,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Globe,
  Radio,
  Menu,
  X,
  CreditCard,
  Building2,
  ChevronDown,
  Repeat,
  Home,
  Key
} from 'lucide-react';

export const Navbar: React.FC<{
  onOpenSos: () => void;
  onOpenMsds: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ onOpenSos, onOpenMsds, activeTab, setActiveTab }) => {
  const {
    role,
    setRole,
    selectedCountry,
    setCountryCode,
    activeBooking,
    vendors,
    contracts,
    shortletListings
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const clearedVendorsCount = vendors.filter(v => v.verification.overallStatus === 'cleared_active').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top Regulatory Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 border-b border-emerald-800/30 px-4 py-1 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto py-0.5 no-scrollbar">
          <span className="flex items-center space-x-1.5 font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{selectedCountry.environmentalAgency} Compliant</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center space-x-1.5 text-blue-300">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>{selectedCountry.policeAgency} Vetted Cleaners</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="hidden sm:inline-flex items-center space-x-1 text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{clearedVendorsCount} Certified Cleaners & Fumigators Live in {selectedCountry.name}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenMsds}
            className="hidden md:inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>LASEPA Safe Chemicals Directory</span>
          </button>
          <button
            onClick={onOpenSos}
            className="inline-flex items-center space-x-1 bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800/60 rounded px-2 py-0.5 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-red-400 animate-bounce" />
            <span>Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-extrabold text-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] items-center justify-center font-bold text-slate-950">✓</span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Kleen<span className="text-emerald-400">Pulse</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
                  Africa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Operated by Matoluxx Integrated Services
              </p>
            </div>
          </div>

          {/* Navigation Links based on Role */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {role === 'customer' && (
              <>
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'home'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'explore'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Book Clean
                </button>
                <button
                  onClick={() => setActiveTab('airbnb')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'airbnb'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Airbnb & Hotels</span>
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'contracts'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Recurring SLAs ({contracts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('live_tracker')}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'live_tracker'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Live Dispatch Radar
                  {activeBooking && activeBooking.status !== 'completed' && (
                    <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'history'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  My Certificates
                </button>
                <button
                  onClick={() => setActiveTab('african_expansion')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'african_expansion'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Pan-African Map
                </button>
              </>
            )}

            {role === 'vendor' && (
              <>
                <button
                  onClick={() => setActiveTab('vendor_console')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'vendor_console'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Driver / Partner Console
                </button>
                <button
                  onClick={() => setActiveTab('vendor_contracts')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                    activeTab === 'vendor_contracts'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Retainers & MRR</span>
                </button>
                <button
                  onClick={() => setActiveTab('vendor_earnings')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'vendor_earnings'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Earnings & Payouts
                </button>
                <button
                  onClick={() => setActiveTab('vendor_verification')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'vendor_verification'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Police & LASEPA Vetting
                </button>
              </>
            )}

            {(role === 'admin' || role === 'regulator_lasepa') && (
              <>
                <button
                  onClick={() => setActiveTab('admin_ops')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'admin_ops'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Fleet & Heatmap
                </button>
                <button
                  onClick={() => setActiveTab('admin_vetting')}
                  className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'admin_vetting'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  LASEPA / NPF Audit Desk
                  <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-extrabold">
                    {vendors.filter(v => v.verification.overallStatus === 'pending_review').length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('admin_revenue')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'admin_revenue'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Commission & Escrow Ledger
                </button>
                <button
                  onClick={() => setActiveTab('admin_chemicals')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'admin_chemicals'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Chemical Safety Vault
                </button>
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Country Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="font-semibold text-emerald-400">{selectedCountry.currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {countryDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-800">
                    Select African Market
                  </div>
                  {Object.values(COUNTRIES).map(c => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountryCode(c.code);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        c.code === selectedCountry.code
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span className="text-base">{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      <span className="font-mono text-emerald-400 font-semibold">{c.currency} ({c.currencySymbol})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 p-1 rounded-xl">
              <button
                onClick={() => {
                  setRole('customer');
                  setActiveTab('home');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'customer'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Customer</span>
              </button>

              <button
                onClick={() => {
                  setRole('vendor');
                  setActiveTab('vendor_console');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'vendor'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Vendor Pro</span>
              </button>

              <button
                onClick={() => {
                  setRole('admin');
                  setActiveTab('admin_vetting');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin' || role === 'regulator_lasepa'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden md:inline">Regulator / Admin</span>
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {role === 'customer' && (
            <>
              <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Overview</button>
              <button onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Book Clean</button>
              <button onClick={() => { setActiveTab('airbnb'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Airbnb & Hotels Hub</button>
              <button onClick={() => { setActiveTab('contracts'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Recurring SLAs & Contracts</button>
              <button onClick={() => { setActiveTab('live_tracker'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Live Dispatch Radar</button>
              <button onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">My Certificates</button>
              <button onClick={() => { setActiveTab('african_expansion'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Pan-African Map</button>
            </>
          )}

          {role === 'vendor' && (
            <>
              <button onClick={() => { setActiveTab('vendor_console'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Partner Console</button>
              <button onClick={() => { setActiveTab('vendor_contracts'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Retainers & MRR</button>
              <button onClick={() => { setActiveTab('vendor_earnings'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Earnings & Payouts</button>
              <button onClick={() => { setActiveTab('vendor_verification'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Police & LASEPA Vetting</button>
            </>
          )}

          {(role === 'admin' || role === 'regulator_lasepa') && (
            <>
              <button onClick={() => { setActiveTab('admin_ops'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Fleet & Heatmap</button>
              <button onClick={() => { setActiveTab('admin_vetting'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">LASEPA & NPF Vetting Desk</button>
              <button onClick={() => { setActiveTab('admin_revenue'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Commission & Escrow Ledger</button>
              <button onClick={() => { setActiveTab('admin_chemicals'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium">Chemical Safety Vault</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
