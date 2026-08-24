import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShortletListing } from '../../types';
import {
  Key,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Plus,
  Wifi,
  Lock,
  CheckCircle,
  AlertTriangle,
  Camera,
  Copy,
  Check,
  Star,
  RefreshCw,
  Search,
  ExternalLink,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AirbnbHostPortal: React.FC<{
  onTurnoverDispatched: () => void;
}> = ({ onTurnoverDispatched }) => {
  const {
    shortletListings,
    turnoverReports,
    addShortletListing,
    dispatchShortletTurnover,
    formatCurrency,
    vendors
  } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedReportListing, setSelectedReportListing] = useState<ShortletListing | null>(null);
  const [copiedBadge, setCopiedBadge] = useState(false);

  // New Listing Form State
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<ShortletListing['propertyType']>('2-Bedroom Luxury Suite');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [lockboxCode, setLockboxCode] = useState('7492');
  const [wifiSsid, setWifiSsid] = useState('Guest_WiFi_5G');
  const [wifiPassword, setWifiPassword] = useState('LagosSuperhost2026');
  const [iCalSyncUrl, setICalSyncUrl] = useState('https://airbnb.com/calendar/ical/listing-sample.ics');
  const [checkoutTime, setCheckoutTime] = useState('11:00 AM');
  const [checkinTime, setCheckinTime] = useState('03:00 PM');

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    addShortletListing({
      name,
      propertyType,
      address,
      bedrooms,
      bathrooms,
      lockboxCode,
      wifiSsid,
      wifiPassword,
      iCalSyncUrl,
      checkoutTime,
      checkinTime,
      assignedCleanerId: vendors[0]?.id
    });
    setAddModalOpen(false);
    setName('');
    setAddress('');
    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch (err) {}
  };

  const handleDispatch = (listingId: string) => {
    dispatchShortletTurnover(listingId);
    onTurnoverDispatched();
  };

  const copyGuestBadgeText = () => {
    const badgeText = `🛡️ VERIFIED CLEAN & PEST-FREE STAY: This property is professionally cleaned, sanitized, and certified before every check-in by KleenPulse Africa under LASEPA Environmental Standards & Nigeria Police-vetted hospitality staff.`;
    navigator.clipboard.writeText(badgeText);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* New Listing Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-600/70 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Add New Airbnb / Short-Let Listing</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Listing Name (as seen on Airbnb/Booking.com):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lekki Phase 1 Luxury Waterfront Suite"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Property Type:</label>
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Studio Apartment">Studio Apartment</option>
                    <option value="1-Bedroom Penthouse">1-Bedroom Penthouse</option>
                    <option value="2-Bedroom Luxury Suite">2-Bedroom Luxury Suite</option>
                    <option value="3-Bedroom Villa">3-Bedroom Villa</option>
                    <option value="Boutique Hotel Room Suite">Boutique Hotel Room Suite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lockbox / Smart Code:</label>
                  <input
                    type="text"
                    required
                    value={lockboxCode}
                    onChange={e => setLockboxCode(e.target.value)}
                    placeholder="7492"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Address:</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Plot 18, Admiralty Way, Lekki Phase 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Guest Checkout Time:</label>
                  <input
                    type="text"
                    value={checkoutTime}
                    onChange={e => setCheckoutTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Next Guest Check-in:</label>
                  <input
                    type="text"
                    value={checkinTime}
                    onChange={e => setCheckinTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Guest Wi-Fi Network:</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={e => setWifiSsid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Guest Wi-Fi Password:</label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={e => setWifiPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Airbnb / Booking.com iCal Sync URL (Optional):</label>
                <input
                  type="url"
                  value={iCalSyncUrl}
                  onChange={e => setICalSyncUrl(e.target.value)}
                  placeholder="https://airbnb.com/calendar/ical/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl text-xs shadow cursor-pointer"
              >
                SAVE LISTING & ENABLE AUTO-TURNOVER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-600/50 rounded-3xl p-8 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          <Key className="w-4 h-4" />
          <span>Airbnb Superhost & Hotel Housekeeping Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Seamless Same-Day Turnovers for Short-Lets & Boutique Hotels
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Guaranteed 120-minute turnaround between 11:00 AM checkout and 3:00 PM check-in. Hotel-grade bed styling, linen swap, amenities restocking, lockbox verification, and instant damage / Lost & Found photo audit.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs shadow-xl shadow-emerald-950 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW SHORT-LET LISTING</span>
          </button>

          <button
            onClick={copyGuestBadgeText}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl text-xs"
          >
            {copiedBadge ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
            <span>{copiedBadge ? 'Badge Text Copied!' : 'Copy Verified Clean Badge for Airbnb Listing'}</span>
          </button>
        </div>
      </div>

      {/* Host Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-bold text-white block">11am - 3pm Turnover Window</span>
          <p className="text-[11px] text-slate-400">Guaranteed guest-ready before your next check-in arrives.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center font-bold mb-1">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-bold text-white block">Lost & Found / Damage Audit</span>
          <p className="text-[11px] text-slate-400">Cleaners photograph forgotten items & inspect appliances.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center font-bold mb-1">
            <Key className="w-4 h-4" />
          </div>
          <span className="font-bold text-white block">Lockbox & Wi-Fi Check</span>
          <p className="text-[11px] text-slate-400">Code reset confirmation and Internet speed test.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white block">Ozone Smoke & Odor Knockout</span>
          <p className="text-[11px] text-slate-400">Neutralizes party and cigarette odors in 45 minutes.</p>
        </div>
      </div>

      {/* Shortlet Listings Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Your Managed Listings ({shortletListings.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Auto-Turnover Ready</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {shortletListings.map(listing => (
            <div
              key={listing.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-600/50 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {listing.propertyType}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{listing.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{listing.address}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    listing.guestReadyStatus === 'ready'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : listing.guestReadyStatus === 'in_progress'
                      ? 'bg-blue-950 text-blue-300 border-blue-700 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {listing.guestReadyStatus === 'ready' ? '✓ GUEST READY' : listing.guestReadyStatus === 'in_progress' ? '⚡ CLEANING IN PROGRESS' : '⏳ TURNOVER NEEDED'}
                  </span>
                </div>

                {/* Host Credentials Info */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lockbox Key Code:</span>
                    <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.2 rounded">{listing.lockboxCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest Wi-Fi:</span>
                    <span className="font-mono text-slate-200">{listing.wifiSsid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnover Window:</span>
                    <span className="text-emerald-400 font-semibold">{listing.checkoutTime} ➔ {listing.checkinTime}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>Total Turnovers: <strong>{listing.totalTurnoversCompleted}</strong></span>
                    <span className="text-amber-400 font-bold">★ {listing.guestRatingAvg}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleDispatch(listing.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>DISPATCH SAME-DAY TURNOVER CLEAN (₦22,000)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lost & Found and Inspection Reports */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Recent Turnover Inspection & Lost & Found Reports</h3>
          </div>
          <span className="text-xs text-slate-400">{turnoverReports.length} Reports Logged</span>
        </div>

        <div className="space-y-3">
          {turnoverReports.map(rep => (
            <div key={rep.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                <div>
                  <span className="font-bold text-white">{rep.listingName}</span>
                  <span className="text-[11px] text-slate-400 block">Cleaned by {rep.cleanerName} at {rep.completedAt}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                  {rep.guestReadyVerificationCode}
                </span>
              </div>

              {/* Lost & Found Card */}
              {rep.lostAndFoundItems && rep.lostAndFoundItems.length > 0 && (
                <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-xl flex items-start space-x-3 text-blue-200">
                  <img src={rep.lostAndFoundItems[0].photoUrl} alt="Lost item" className="w-12 h-12 rounded-lg object-cover border border-blue-500 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-white block">📦 Guest Lost & Found Item Logged:</span>
                    <p className="text-[11px] text-blue-300 mt-0.5">{rep.lostAndFoundItems[0].item} (Found at {rep.lostAndFoundItems[0].location})</p>
                    <span className="text-[10px] text-slate-400">Safely sealed in host locker.</span>
                  </div>
                </div>
              )}

              {/* Checklist Badges */}
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="bg-slate-900 text-emerald-300 border border-slate-800 px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Wi-Fi Tested: {rep.wifiTestedSpeedMbps} Mbps</span>
                </span>
                <span className="bg-slate-900 text-emerald-300 border border-slate-800 px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>{rep.linenChangedCount} Bed Linen Sets Replaced</span>
                </span>
                <span className="bg-slate-900 text-emerald-300 border border-slate-800 px-2 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Lockbox Secured</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
