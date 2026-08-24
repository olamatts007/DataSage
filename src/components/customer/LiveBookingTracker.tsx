import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { CertificateModal } from '../common/CertificateModal';
import {
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Shield,
  FileCheck,
  Star,
  Award,
  AlertTriangle,
  Radio,
  Truck,
  RotateCcw,
  Lock,
  Unlock,
  Key,
  Camera,
  ThumbsUp,
  HelpCircle,
  Check,
  X,
  Building
} from 'lucide-react';

export const LiveBookingTracker: React.FC<{
  onOpenMsds: () => void;
}> = ({ onOpenMsds }) => {
  const {
    activeBooking,
    updateBookingStatus,
    toggleChecklistItem,
    submitCustomerRating,
    confirmJobSatisfactionAndReleaseEscrow,
    requestQualityTouchUp,
    formatCurrency,
    selectedCountry
  } = useApp();

  const [certModalOpen, setCertModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(7200);
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [touchUpModalOpen, setTouchUpModalOpen] = useState(false);
  const [touchUpReason, setTouchUpReason] = useState('');
  const [satisfactionNotes, setSatisfactionNotes] = useState('');
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  const [qualityChecks, setQualityChecks] = useState({
    roomsCleaned: true,
    odorVentilated: true,
    wasteDisposed: true,
    fixturesInspected: true
  });

  useEffect(() => {
    if (activeBooking?.status === 'chemical_evacuation_active') {
      const interval = setInterval(() => {
        setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeBooking?.status]);

  if (!activeBooking) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto my-12 text-slate-300">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
          <Truck className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-base font-bold text-white">No Active Cleaning / Fumigation Job</h3>
        <p className="text-xs text-slate-400">
          You don't currently have an active dispatch order in progress. Create a new instant booking to track live.
        </p>
      </div>
    );
  }

  const { assignedVendor, status, fare, service, payment, completionOtp, proofPhotos } = activeBooking;

  const handleConfirmSatisfaction = () => {
    confirmJobSatisfactionAndReleaseEscrow(activeBooking.id, {
      completionMethod: 'in_app_authorization',
      customerNotes: satisfactionNotes || 'Job inspected & confirmed 100% satisfactory by client.',
      tipAmount: selectedTip
    });
  };

  const handleRequestTouchUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touchUpReason.trim()) return;
    requestQualityTouchUp(activeBooking.id, touchUpReason);
    setTouchUpModalOpen(false);
    setTouchUpReason('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomerRating(activeBooking.id, {
      stars: ratingStars,
      cleanliness: ratingStars,
      safety: ratingStars,
      punctuality: ratingStars,
      comment: ratingComment || 'Excellent and thorough service. High level of professionalism!'
    });
    setRatingSubmitted(true);
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const allQualityChecksPassed = Object.values(qualityChecks).every(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in">
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        booking={activeBooking}
      />

      {activePhotoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setActivePhotoPreview(null)}>
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activePhotoPreview} alt="Work Proof Preview" className="w-full h-auto max-h-[75vh] object-contain" />
          </div>
        </div>
      )}

      {touchUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Request Immediate Quality Touch-Up</h3>
              </div>
              <button onClick={() => setTouchUpModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your payment of <strong className="text-white">{formatCurrency(fare.totalFareNGN)}</strong> remains safely <strong>LOCKED in Escrow</strong>. The technician will not receive payout until they rectify the specified areas to your complete satisfaction.
            </p>

            <form onSubmit={handleRequestTouchUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specify what area needs attention:
                </label>
                <textarea
                  rows={3}
                  required
                  value={touchUpReason}
                  onChange={e => setTouchUpReason(e.target.value)}
                  placeholder="e.g. Master bathroom grout was missed, or chemical mist in dining area needs extra ventilation..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTouchUpModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow"
                >
                  Submit Touch-Up Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {activeBooking.bookingCode}
            </span>
            <span className="text-xs text-slate-400">• {service.name}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {status === 'searching_agent' && '🔍 Searching for Nearest LASEPA Vetted Agent...'}
            {status === 'agent_assigned' && '✅ Agent Confirmed & Preparing Disinfection Gear'}
            {status === 'agent_en_route' && '🚚 Vetted Agent is En Route to Your Location'}
            {status === 'agent_arrived' && '📍 Agent Has Arrived on Site'}
            {status === 'pre_service_inspection' && '📋 Pre-Service Chemical & Safety Audit'}
            {status === 'service_in_progress' && '⚡ Cleaning & Fumigation Operation in Progress'}
            {status === 'chemical_evacuation_active' && '⏳ Post-Fumigation Safe Re-entry Ventilation Active'}
            {status === 'awaiting_customer_satisfaction' && '🛡️ Job Completed by Vendor — Awaiting Your Quality Sign-Off'}
            {status === 'touch_up_in_progress' && '⚠️ Free Quality Touch-Up in Progress'}
            {status === 'completed' && '🎉 Service Certified & Escrow Released to Vendor'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Destination: <span className="text-slate-200 font-semibold">{activeBooking.address} ({activeBooking.city})</span>
          </p>
        </div>

        {/* Action Controls for Demo */}
        <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
            Workflow Stepper:
          </span>
          {status === 'searching_agent' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'agent_assigned')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Simulate Match
            </button>
          )}
          {status === 'agent_assigned' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'agent_en_route')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Simulate En Route
            </button>
          )}
          {status === 'agent_en_route' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'agent_arrived')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Simulate Arrival
            </button>
          )}
          {status === 'agent_arrived' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'service_in_progress')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Start Operation
            </button>
          )}
          {status === 'service_in_progress' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'awaiting_customer_satisfaction')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Submit for Satisfaction
            </button>
          )}
          {status === 'chemical_evacuation_active' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'awaiting_customer_satisfaction')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Submit for Inspection
            </button>
          )}
          {status === 'touch_up_in_progress' && (
            <button
              onClick={() => updateBookingStatus(activeBooking.id, 'awaiting_customer_satisfaction')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow"
            >
              Re-submit for Review
            </button>
          )}
          {status === 'completed' && (
            <button
              onClick={() => setCertModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>View LASEPA Cert</span>
            </button>
          )}
        </div>
      </div>

      {/* Escrow Guarantee Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border border-blue-600/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-500 flex items-center justify-center text-blue-300 shrink-0">
            {payment.status === 'paid_and_settled' ? (
              <Unlock className="w-5 h-5 text-emerald-400" />
            ) : (
              <Lock className="w-5 h-5 text-blue-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wide text-blue-400">
                {payment.status === 'paid_and_settled' ? 'Escrow Released & Settled' : 'KleenPulse Customer Escrow Protection'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {formatCurrency(fare.vendorPayoutNGN)} Protected
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {payment.status === 'paid_and_settled'
                ? `You verified and released payment to ${assignedVendor?.name || 'vendor'} on ${payment.escrowReleasedAt?.slice(0, 10)}.`
                : 'Payment is securely held by the platform. The vendor does NOT receive their payout until you walk through the premises, inspect the work, and confirm 100% satisfaction.'}
            </p>
          </div>
        </div>

        {/* 4-Digit Satisfaction OTP */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          <Key className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block leading-tight">Your Satisfaction OTP:</span>
            <span className="text-sm font-mono font-extrabold text-emerald-400 tracking-wider">
              {completionOtp}
            </span>
          </div>
        </div>
      </div>

      {/* Awaiting Customer Satisfaction Inspection Console */}
      {(status === 'awaiting_customer_satisfaction' || status === 'touch_up_in_progress') && (
        <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Confirm Job Completion & Quality Satisfaction
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect the results before releasing the vendor payout of <strong className="text-emerald-400 font-mono">{formatCurrency(fare.vendorPayoutNGN)}</strong>
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700">
              🔒 Payout Held in Escrow
            </span>
          </div>

          {/* Interactive Inspection Checklist */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-200 block">
              Step 1: Walkthrough Quality Inspection Checklist:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <label className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={qualityChecks.roomsCleaned}
                  onChange={e => setQualityChecks({ ...qualityChecks, roomsCleaned: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-slate-300">All designated rooms and surfaces clean</span>
              </label>

              <label className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={qualityChecks.odorVentilated}
                  onChange={e => setQualityChecks({ ...qualityChecks, odorVentilated: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-slate-300">Chemical fogging ventilated & no odor hazard</span>
              </label>

              <label className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={qualityChecks.wasteDisposed}
                  onChange={e => setQualityChecks({ ...qualityChecks, wasteDisposed: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-slate-300">Sanitary waste hauled in LASEPA bio-bags</span>
              </label>

              <label className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={qualityChecks.fixturesInspected}
                  onChange={e => setQualityChecks({ ...qualityChecks, fixturesInspected: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span className="text-slate-300">Tiles, counters, and fixtures sparkling</span>
              </label>
            </div>
          </div>

          {/* Vendor Proof Photos Gallery */}
          {proofPhotos && proofPhotos.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Step 2: Review Vendor Completion Proof Photos:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {proofPhotos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhotoPreview(photo.url)}
                    className="group relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 cursor-pointer hover:border-emerald-500 transition-all shadow-md"
                  >
                    <img src={photo.url} alt={photo.roomOrArea} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-2.5 text-[11px] bg-slate-950/95 space-y-0.5">
                      <span className="font-bold text-white block truncate">{photo.roomOrArea}</span>
                      <p className="text-[10px] text-slate-400 truncate">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Tip */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Step 3: Add optional appreciation tip for {assignedVendor?.name || 'the cleaner'}:
            </span>
            <div className="flex flex-wrap gap-2">
              {[0, 1000, 2000, 5000, 10000].map(tip => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => setSelectedTip(tip)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTip === tip
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tip === 0 ? 'No Tip' : `+${formatCurrency(tip)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setTouchUpModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Not Satisfied? Request Free Touch-Up</span>
            </button>

            <button
              type="button"
              disabled={!allQualityChecksPassed}
              onClick={handleConfirmSatisfaction}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl cursor-pointer transition-all transform hover:scale-[1.02] ${
                allQualityChecksPassed
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>I AM 100% SATISFIED — RELEASE ESCROW PAYMENT ({formatCurrency(fare.vendorPayoutNGN + selectedTip)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Map & Driver Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Radar Map */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveMap
            customerCoords={activeBooking.coordinates}
            customerAddress={activeBooking.address}
            activeBooking={activeBooking}
            heightClass="h-96"
          />

          {/* Active Job Safety Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Job Safety & Execution Checklist</h3>
              </div>
              <span className="text-xs text-slate-400">
                {activeBooking.checklists.filter(c => c.completed).length} / {activeBooking.checklists.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {activeBooking.checklists.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(activeBooking.id, item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    item.completed
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs font-bold ${
                        item.completed
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {item.completed && '✓'}
                    </div>
                    <div>
                      <span className={`text-xs block ${item.completed ? 'line-through text-slate-400' : 'font-medium text-slate-200'}`}>
                        {item.title}
                      </span>
                      {item.timestamp && (
                        <span className="text-[10px] text-emerald-400">Completed at {item.timestamp}</span>
                      )}
                    </div>
                  </div>

                  {item.photoRequired && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      📷 Photo Audit
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Card & Invoicing */}
        <div className="lg:col-span-5 space-y-4">
          {assignedVendor && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={assignedVendor.avatar}
                      alt={assignedVendor.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold border border-slate-900">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{assignedVendor.name}</h3>
                    <p className="text-xs text-slate-400">{assignedVendor.companyName || 'Verified Elite Partner'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center">
                        ★ {assignedVendor.rating}
                      </span>
                      <span className="text-[11px] text-slate-500">•</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {assignedVendor.totalJobs} Cleans Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${assignedVendor.phone}`}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center transition-colors shadow"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => alert(`Opening secure in-app chat with ${assignedVendor.name}`)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 flex items-center justify-center transition-colors shadow"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedCountry.environmentalAgency} License:</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {assignedVendor.verification.lasepaAccreditation.documentNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>{selectedCountry.policeAgency} Cert:</span>
                  </span>
                  <span className="font-mono text-blue-300 font-bold">
                    {assignedVendor.verification.policeClearance.documentNumber}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Completion & Digital Certificate Box */}
          {status === 'completed' && (
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Satisfaction Verified & Payment Released</h3>
                  <p className="text-xs text-emerald-300">Official LASEPA Certificate Issued</p>
                </div>
              </div>

              <button
                onClick={() => setCertModalOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>VIEW / PRINT OFFICIAL LASEPA CERTIFICATE</span>
              </button>

              {!activeBooking.rating && !ratingSubmitted ? (
                <form onSubmit={handleRatingSubmit} className="pt-2 border-t border-slate-800 space-y-3">
                  <span className="block text-xs font-bold text-slate-200">Rate your cleaning experience:</span>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRatingStars(num)}
                        className={`p-1 rounded-lg text-lg transition-transform hover:scale-125 ${
                          num <= ratingStars ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-amber-400 font-bold ml-2">{ratingStars} / 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    placeholder="Share feedback on cleanliness, chemical odor, and punctuality..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg text-xs"
                  >
                    Submit Verified Rating
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Thank you! Your verified sign-off helps uphold state cleaning excellence.</span>
                </div>
              )}
            </div>
          )}

          {/* Official Bank Account & Escrow Payment Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white">Payment & Escrow Account</span>
              <span className={`font-mono font-bold ${payment.status === 'paid_and_settled' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {payment.status === 'paid_and_settled' ? '✓ Released & Settled' : '🔒 Escrow Locked'}
              </span>
            </div>

            {/* Official Platform Collection Account */}
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-600/40 space-y-1 text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Designated Escrow Account:</span>
              <span className="font-extrabold text-white text-xs block">Matoluxx Integrated Services</span>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="font-mono text-emerald-400 font-bold">0128090787</span>
                <span className="text-slate-400 font-semibold">Wema Bank Plc</span>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-300 pt-1">
              <div className="flex justify-between">
                <span>Total Fare:</span>
                <span className="font-mono font-bold text-white">{formatCurrency(fare.totalFareNGN)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vendor 80% Payout:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(fare.vendorPayoutNGN + (fare.tipNGN || 0))}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform 20% Fee:</span>
                <span className="font-mono text-blue-400">{formatCurrency(fare.platformFeeNGN)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-[10px] text-slate-500">{activeBooking.payment.transactionRef}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
