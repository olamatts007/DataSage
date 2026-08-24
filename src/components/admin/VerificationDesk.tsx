import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendorProfile } from '../../types';
import {
  ShieldCheck,
  Shield,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  UserCheck,
  Award,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VerificationDesk: React.FC = () => {
  const { vendors, verifyVendorDocument, selectedCountry } = useApp();
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile>(vendors[0]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'cleared'>('all');
  const [rejectNotes, setRejectNotes] = useState('');

  const filteredVendors = vendors.filter(v => {
    if (filter === 'pending') return v.verification.overallStatus === 'pending_review' || v.verification.overallStatus === 'action_required';
    if (filter === 'cleared') return v.verification.overallStatus === 'cleared_active';
    return true;
  });

  const handleApproveDoc = (docType: 'police' | 'lasepa') => {
    verifyVendorDocument(selectedVendor.id, docType, 'approve');
    try {
      confetti({ particleCount: 50, spread: 50 });
    } catch (e) {}
  };

  const handleRejectDoc = (docType: 'police' | 'lasepa') => {
    verifyVendorDocument(selectedVendor.id, docType, 'reject', rejectNotes || 'Document illegible or failed regulatory database lookup');
    setRejectNotes('');
  };

  // Sync selected vendor with updated store
  const currentSelected = vendors.find(v => v.id === selectedVendor.id) || selectedVendor;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Verification Desk Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {selectedCountry.environmentalAgency} & {selectedCountry.policeAgency} Regulatory Clearance Desk
            </h2>
            <p className="text-xs text-slate-400">
              Official audit portal to approve or reject vendor background checks before app activation
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({vendors.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Review ({vendors.filter(v => v.verification.overallStatus === 'pending_review').length})
          </button>
          <button
            onClick={() => setFilter('cleared')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === 'cleared' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cleared ({vendors.filter(v => v.verification.overallStatus === 'cleared_active').length})
          </button>
        </div>
      </div>

      {/* Two Column Layout: Vendor Queue & Detailed Document Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vendor List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Applicant Vendor Dossiers
          </h3>

          <div className="space-y-2.5">
            {filteredVendors.map(vendor => {
              const isSelected = currentSelected.id === vendor.id;
              const isCleared = vendor.verification.overallStatus === 'cleared_active';

              return (
                <div
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={vendor.avatar}
                        alt={vendor.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{vendor.name}</h4>
                        <p className="text-[11px] text-slate-400">{vendor.companyName || 'Independent Agent'}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCleared
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}>
                      {isCleared ? '✓ CLEARED' : '⏳ PENDING AUDIT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400">
                      Police: <strong className={vendor.verification.policeClearance.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>{vendor.verification.policeClearance.status}</strong>
                    </span>
                    <span className="text-slate-400">
                      LASEPA: <strong className={vendor.verification.lasepaAccreditation.status === 'verified' ? 'text-emerald-400' : 'text-amber-400'}>{vendor.verification.lasepaAccreditation.status}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Document Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header of selected vendor */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <img
                src={currentSelected.avatar}
                alt={currentSelected.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <div>
                <h3 className="text-base font-bold text-white">{currentSelected.name}</h3>
                <p className="text-xs text-slate-400">{currentSelected.email} • {currentSelected.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">Vehicle: <strong className="text-slate-200">{currentSelected.vehicle.model} ({currentSelected.vehicle.plateNumber})</strong></p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Overall Vetting Status:</span>
              <span className={`text-xs font-mono font-extrabold uppercase px-2.5 py-1 rounded-md mt-1 inline-block ${
                currentSelected.verification.overallStatus === 'cleared_active'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {currentSelected.verification.overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Document 1: Nigeria Police Force Criminal Registry Clearance */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">1. {selectedCountry.policeAgency} Character Certificate</h4>
                  <span className="text-[10px] font-mono text-slate-400">{currentSelected.verification.policeClearance.documentNumber}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentSelected.verification.policeClearance.status === 'verified'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {currentSelected.verification.policeClearance.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg">
              <p>Issuer: <span className="text-slate-200">{currentSelected.verification.policeClearance.issuer}</span></p>
              <p>Expiry: <span className="text-slate-200">{currentSelected.verification.policeClearance.expiryDate}</span></p>
              {currentSelected.verification.policeClearance.verifiedBy && (
                <p className="col-span-2 text-emerald-400">
                  Signed off by: {currentSelected.verification.policeClearance.verifiedBy} ({currentSelected.verification.policeClearance.verifiedAt})
                </p>
              )}
            </div>

            {/* Action Buttons for Police Doc */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => handleApproveDoc('police')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify & Clear Police Record</span>
              </button>

              <button
                onClick={() => handleRejectDoc('police')}
                className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold rounded-lg text-xs flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Document 2: LASEPA Environmental Fumigation & Chemical Permit */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">2. {selectedCountry.environmentalAgency} Pest Control Operator License</h4>
                  <span className="text-[10px] font-mono text-slate-400">{currentSelected.verification.lasepaAccreditation.documentNumber}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentSelected.verification.lasepaAccreditation.status === 'verified'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {currentSelected.verification.lasepaAccreditation.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg">
              <p>Issuer: <span className="text-slate-200">{currentSelected.verification.lasepaAccreditation.issuer}</span></p>
              <p>Expiry: <span className="text-slate-200">{currentSelected.verification.lasepaAccreditation.expiryDate}</span></p>
              {currentSelected.verification.lasepaAccreditation.verifiedBy && (
                <p className="col-span-2 text-emerald-400">
                  Signed off by: {currentSelected.verification.lasepaAccreditation.verifiedBy} ({currentSelected.verification.lasepaAccreditation.verifiedAt})
                </p>
              )}
            </div>

            {/* Action Buttons for LASEPA Doc */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => handleApproveDoc('lasepa')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verify & Clear LASEPA Chemical Permit</span>
              </button>

              <button
                onClick={() => handleRejectDoc('lasepa')}
                className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold rounded-lg text-xs flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
