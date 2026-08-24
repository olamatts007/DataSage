import React, { useEffect, useRef, useState } from 'react';
import { VendorProfile, Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Navigation, Sparkles, AlertCircle, Compass, Truck } from 'lucide-react';

export const InteractiveMap: React.FC<{
  customerCoords: { lat: number; lng: number };
  customerAddress?: string;
  activeBooking?: Booking | null;
  heightClass?: string;
}> = ({ customerCoords, customerAddress, activeBooking, heightClass = 'h-96' }) => {
  const { vendors, selectedCountry } = useApp();
  const [selectedPin, setSelectedPin] = useState<VendorProfile | null>(null);

  // Active online cleared vendors
  const onlineVendors = vendors.filter(v => v.isOnline && v.verification.overallStatus === 'cleared_active');

  // Relative positions in simulation canvas
  // Base center lat/lng
  const centerLat = customerCoords.lat;
  const centerLng = customerCoords.lng;

  // Function to map lat/lng to percentage X/Y inside map viewport
  const getPos = (lat: number, lng: number) => {
    // 0.05 lat/lng delta corresponds to map scale
    const deltaLat = (lat - centerLat) * 800; // scale factor
    const deltaLng = (lng - centerLng) * 800;
    
    // clamp to 10% - 90% for visual viewport
    const x = Math.min(Math.max(50 + deltaLng, 12), 88);
    const y = Math.min(Math.max(50 - deltaLat, 15), 85);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className={`relative w-full ${heightClass} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between select-none`}>
      {/* Map Background Grid & Stylized Canvas */}
      <div className="absolute inset-0 bg-[#0a0f1d] opacity-90">
        {/* Stylized Road Network SVG lines */}
        <svg className="w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main Simulated Expressways / Waterways */}
          <path d="M -10 150 Q 200 180, 500 140 T 1200 200" stroke="#059669" strokeWidth="4" fill="none" opacity="0.4" />
          <path d="M 100 -20 Q 250 250, 450 600" stroke="#0284c7" strokeWidth="3" fill="none" opacity="0.3" />
          <path d="M 400 0 L 350 700" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M 0 350 L 1000 380" stroke="#334155" strokeWidth="2" fill="none" />
          {/* Lagos Lagoon Water body simulation */}
          <path d="M 0 450 C 300 420, 600 500, 1000 480 L 1000 800 L 0 800 Z" fill="#042f2e" opacity="0.25" />
        </svg>
      </div>

      {/* Map Control Overlay */}
      <div className="relative z-10 p-3.5 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-white">
            Live Fleet Radar: <span className="text-emerald-400">{onlineVendors.length} Certified Units</span> in {selectedCountry.name}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-[11px] text-slate-300 font-medium">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>GPS Active (Lagos Zone)</span>
        </div>
      </div>

      {/* Map Pins Simulation */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        {/* Customer Location Pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all duration-700"
          style={getPos(customerCoords.lat, customerCoords.lng)}
        >
          <div className="relative group">
            {/* Outer animated radar ring */}
            <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping-slow pointer-events-none"></div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/50 border-2 border-white font-bold text-xs">
              📍
            </div>
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md border border-slate-700 whitespace-nowrap shadow-xl">
              <span className="font-semibold text-emerald-400">Your Location:</span> {customerAddress || 'Lekki Phase 1'}
            </div>
          </div>
        </div>

        {/* Assigned Vendor Route Path Simulation (if booking is active & assigned) */}
        {activeBooking && activeBooking.assignedVendor && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
            <line
              x1={getPos(activeBooking.assignedVendor.currentLocation.lat, activeBooking.assignedVendor.currentLocation.lng).left}
              y1={getPos(activeBooking.assignedVendor.currentLocation.lat, activeBooking.assignedVendor.currentLocation.lng).top}
              x2={getPos(customerCoords.lat, customerCoords.lng).left}
              y2={getPos(customerCoords.lat, customerCoords.lng).top}
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Nearby Online Cleared Vendors Pins */}
        {onlineVendors.map((vendor, idx) => {
          const isAssigned = activeBooking?.assignedVendor?.id === vendor.id;
          const pos = getPos(vendor.currentLocation.lat, vendor.currentLocation.lng);

          return (
            <div
              key={vendor.id}
              onClick={() => setSelectedPin(vendor)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-1000 ${
                isAssigned ? 'scale-110 z-30' : 'hover:scale-110'
              }`}
              style={pos}
            >
              <div className="relative group">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all ${
                    isAssigned
                      ? 'bg-emerald-500 text-slate-950 border-white shadow-emerald-500/50'
                      : 'bg-slate-900/90 text-emerald-400 border-emerald-600/80 hover:border-emerald-400'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>

                {/* Badge for LASEPA */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold border border-white">
                  ✓
                </div>

                {/* Info Card Hover / Click */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white shadow-2xl w-48 z-40">
                  <div className="flex items-center space-x-2">
                    <img src={vendor.avatar} alt={vendor.name} className="w-7 h-7 rounded-full object-cover border border-emerald-500" />
                    <div>
                      <h4 className="font-bold text-[11px] leading-tight truncate">{vendor.name}</h4>
                      <p className="text-[9px] text-emerald-400">{vendor.partnerTier} Partner (★ {vendor.rating})</p>
                    </div>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] space-y-0.5">
                    <p className="text-slate-300">
                      <span className="text-slate-500">LASEPA:</span> {vendor.verification.lasepaAccreditation.documentNumber}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Vehicle:</span> {vendor.vehicle.plateNumber}
                    </p>
                    <p className="text-emerald-400 font-semibold mt-1">
                      {isAssigned ? '⚡ Assigned to your clean' : '🟢 Ready for instant dispatch'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Footer Bar / Status */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] text-slate-300 font-medium">
            Active Hub: <strong className="text-white">{customerAddress || 'Lekki / Victoria Island Corridor, Lagos'}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <span className="hidden sm:inline text-slate-400">Average ETA: <strong className="text-emerald-400 font-bold">12 - 18 Mins</strong></span>
          <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
            100% Vetted Drivers
          </span>
        </div>
      </div>
    </div>
  );
};
