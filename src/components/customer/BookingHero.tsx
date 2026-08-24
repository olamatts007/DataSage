import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServicePackage, AddOnOption, PropertyCategory, ContractFrequency, ContractDuration } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  CreditCard,
  Building,
  Home,
  Check,
  AlertCircle,
  TrendingUp,
  Percent,
  Plus,
  Factory,
  Maximize2,
  Layers,
  ArrowRight,
  Calculator,
  Calendar,
  Award,
  Repeat
} from 'lucide-react';

export const BookingHero: React.FC<{
  onBookingCreated: () => void;
}> = ({ onBookingCreated }) => {
  const {
    services,
    addOns,
    vendors,
    selectedCountry,
    formatCurrency,
    surgeConfig,
    createBooking,
    createServiceContract
  } = useApp();

  const [bookingMode, setBookingMode] = useState<'one_off' | 'recurring_contract'>('one_off');
  const [propertyCategory, setPropertyCategory] = useState<PropertyCategory>('residential');
  const [selectedService, setSelectedService] = useState<ServicePackage>(services[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  
  const [propertyType, setPropertyType] = useState<'Apartment' | 'Duplex' | 'Mansion' | 'Commercial Office' | 'Warehouse / Logistics Bay' | 'Factory / Industrial Plant' | 'Event Center & Hall' | 'Agricultural Silo / Storage'>('Apartment');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);

  const [squareMeters, setSquareMeters] = useState<number>(1200);
  const [ceilingHeight, setCeilingHeight] = useState<number>(6);
  const [industrialBayCount, setIndustrialBayCount] = useState<number>(3);
  const [hasHeavyOilGrease, setHasHeavyOilGrease] = useState<boolean>(true);

  const [contractFrequency, setContractFrequency] = useState<ContractFrequency>('monthly');
  const [contractDuration, setContractDuration] = useState<ContractDuration>('6_months');
  const [preferredDay, setPreferredDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Saturday');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'Morning (08:00 - 12:00)' | 'Afternoon (12:00 - 16:00)' | 'Evening / Night Shift (17:00 - 21:00)'>('Morning (08:00 - 12:00)');
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');

  const [infestationLevel, setInfestationLevel] = useState<'Low / Preventive' | 'Moderate' | 'Severe / Emergency'>('Moderate');
  const [selectedPests, setSelectedPests] = useState<string[]>(['Mosquitoes', 'Cockroaches', 'Rodents / Rats']);
  const [paymentMethod, setPaymentMethod] = useState<'paystack_card' | 'bank_transfer' | 'kleen_wallet'>('paystack_card');

  const [selectedLocation, setSelectedLocation] = useState(selectedCountry.sampleLocations[0] || {
    name: 'Admiralty Way, Lekki Phase 1, Lagos',
    city: 'Lagos',
    lat: 6.4474,
    lng: 3.4735
  });
  const [customAddress, setCustomAddress] = useState('');

  const isSquareMeter = propertyCategory === 'commercial_large_space' || selectedService.pricingModel === 'square_meter_industrial';

  const filteredServices = services.filter(srv => {
    if (propertyCategory === 'commercial_large_space') {
      return srv.pricingModel === 'square_meter_industrial' || srv.category === 'industrial' || srv.category === 'fumigation';
    }
    return srv.pricingModel === 'residential_room' || srv.pricingModel === 'airbnb_turnover' || srv.category === 'cleaning' || srv.category === 'fumigation' || srv.category === 'shortlet_hospitality';
  });

  const pestOptions = ['Mosquitoes', 'Cockroaches', 'Warehouse Weevils & Beetles', 'Subterranean Termites', 'Rodents / Rats', 'Ants & Spiders'];

  const togglePest = (pest: string) => {
    if (selectedPests.includes(pest)) {
      setSelectedPests(selectedPests.filter(p => p !== pest));
    } else {
      setSelectedPests([...selectedPests, pest]);
    }
  };

  const toggleAddOn = (addon: AddOnOption) => {
    if (selectedAddOns.some(a => a.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const baseFare = selectedService.basePriceNGN;
  let areaCalculatedCost = 0;
  let squareMeterRate = selectedService.perSquareMeterRateNGN || 160;
  let squareMeterGross = 0;
  let volumeDiscount = 0;
  let roomMultiplier = 0;

  if (isSquareMeter) {
    const heightFactor = ceilingHeight > 5 ? 1.12 : 1.0;
    squareMeterGross = Math.round(squareMeters * squareMeterRate * heightFactor);

    if (squareMeters >= 5000) volumeDiscount = Math.round(squareMeterGross * 0.25);
    else if (squareMeters >= 2000) volumeDiscount = Math.round(squareMeterGross * 0.18);
    else if (squareMeters >= 500) volumeDiscount = Math.round(squareMeterGross * 0.10);

    areaCalculatedCost = squareMeterGross - volumeDiscount;
  } else {
    roomMultiplier = bedrooms * selectedService.perRoomRateNGN;
    areaCalculatedCost = roomMultiplier;
  }

  const addOnsTotal = selectedAddOns.reduce((acc, curr) => acc + curr.priceNGN, 0);
  const chemicalFee = isSquareMeter ? 15000 : selectedService.category === 'fumigation' ? 6500 : 3000;
  const distanceFee = isSquareMeter ? 4000 : 1500;
  const standardSingleVisitTotal = baseFare + areaCalculatedCost + addOnsTotal + chemicalFee + distanceFee;

  let recurringDiscountPercent = 0;
  if (bookingMode === 'recurring_contract') {
    if (contractFrequency === 'weekly') recurringDiscountPercent = 20;
    else if (contractFrequency === 'bi_weekly') recurringDiscountPercent = 15;
    else if (contractFrequency === 'monthly') recurringDiscountPercent = 10;
    else if (contractFrequency === 'quarterly') recurringDiscountPercent = 12;
    else if (contractFrequency === 'bi_annual') recurringDiscountPercent = 8;

    if (contractDuration === '12_months') recurringDiscountPercent += 5;
  }

  const contractDiscountAmount = Math.round(standardSingleVisitTotal * (recurringDiscountPercent / 100));
  const effectivePerVisitSubtotal = standardSingleVisitTotal - contractDiscountAmount;

  const durationMonths = contractDuration === '3_months' ? 3 : contractDuration === '6_months' ? 6 : 12;
  let totalContractVisits = 1;
  if (bookingMode === 'recurring_contract') {
    if (contractFrequency === 'weekly') totalContractVisits = durationMonths * 4;
    else if (contractFrequency === 'bi_weekly') totalContractVisits = durationMonths * 2;
    else if (contractFrequency === 'monthly') totalContractVisits = durationMonths;
    else if (contractFrequency === 'quarterly') totalContractVisits = Math.max(1, Math.round(durationMonths / 3));
    else if (contractFrequency === 'bi_annual') totalContractVisits = Math.max(1, Math.round(durationMonths / 6));
  }

  const totalContractSavings = contractDiscountAmount * totalContractVisits;
  const currentSurge = surgeConfig.isActive && bookingMode === 'one_off' ? surgeConfig.multiplier : 1.0;
  const lasepaSafetyLevy = selectedService.requiresLasepaCert ? Math.round((baseFare + areaCalculatedCost) * 0.015) : 0;
  
  const subtotal = Math.round(effectivePerVisitSubtotal * currentSurge + lasepaSafetyLevy);
  // 70% Vendor Payout / 30% Platform Fee
  const platformFee = Math.round(subtotal * 0.30);
  const vendorPayout = subtotal - platformFee;
  const tax = Math.round(subtotal * 0.05);
  const totalFarePerVisit = subtotal + tax;
  const totalContractGrossValue = totalFarePerVisit * totalContractVisits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAddress = customAddress.trim() || selectedLocation.name;

    if (bookingMode === 'recurring_contract') {
      createServiceContract({
        title: `${contractFrequency.toUpperCase()} ${selectedService.name} SLA`,
        service: selectedService,
        selectedAddOns,
        propertyDetails: {
          category: propertyCategory,
          propertyType: isSquareMeter ? propertyType : (bedrooms > 3 ? 'Duplex' : 'Apartment'),
          bedrooms: isSquareMeter ? 0 : bedrooms,
          squareMeters: isSquareMeter ? squareMeters : bedrooms * 45 + 50
        },
        address: finalAddress,
        city: selectedLocation.city,
        frequency: contractFrequency,
        duration: contractDuration,
        preferredDayOfWeek: preferredDay,
        preferredTimeSlot: preferredTimeSlot,
        assignedVendorId: selectedVendorId
      });
      onBookingCreated();
    } else {
      createBooking({
        service: selectedService,
        selectedAddOns,
        propertyDetails: {
          category: propertyCategory,
          propertyType: isSquareMeter ? propertyType : (bedrooms > 3 ? 'Duplex' : 'Apartment'),
          bedrooms: isSquareMeter ? 0 : bedrooms,
          bathrooms: isSquareMeter ? 0 : bathrooms,
          squareMeters: isSquareMeter ? squareMeters : bedrooms * 45 + 50,
          ceilingHeightMeters: isSquareMeter ? ceilingHeight : 3,
          infestationLevel,
          targetPests: selectedPests,
          industrialSpecs: isSquareMeter ? {
            baysCount: industrialBayCount,
            hasHeavyOilGrease,
            requiresScissorLift: ceilingHeight > 6,
            requiresBiohazardDisposal: true
          } : undefined
        },
        address: finalAddress,
        city: selectedLocation.city,
        lga: isSquareMeter ? 'Ikeja Industrial LGA' : 'Eti-Osa LGA',
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        },
        paymentMethod
      });
      onBookingCreated();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Booking Type & Space Switcher Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Select Service Model</span>
            <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">Instant On-Demand vs Long-Term Service SLA</h2>
          </div>

          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBookingMode('one_off')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                bookingMode === 'one_off'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Dispatch</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingMode('recurring_contract')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                bookingMode === 'recurring_contract'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Long-Term SLA (Save up to 25%)</span>
            </button>
          </div>
        </div>

        {/* Toggle 2: Residential vs Industrial Square Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setPropertyCategory('residential');
              setSelectedService(services.find(s => s.pricingModel === 'residential_room') || services[0]);
            }}
            className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all text-left ${
              propertyCategory === 'residential'
                ? 'bg-slate-800 border-2 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-850'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center font-bold">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Residential Homes & Flats</span>
              <span className="text-[10px] text-slate-400 block">1-5 Bedrooms, Duplexes, Mansions</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setPropertyCategory('commercial_large_space');
              setSelectedService(services.find(s => s.pricingModel === 'square_meter_industrial') || services[0]);
            }}
            className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all text-left ${
              propertyCategory === 'commercial_large_space'
                ? 'bg-slate-800 border-2 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-slate-850'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-400 flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block">Warehouses & Large Facilities</span>
              <span className="text-[10px] text-slate-400 block">Cost-Reflective per m² (500 - 25,000 m²)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Customization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Location Selection */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Facility / Service Location</h3>
              </div>
              <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedCountry.name}</span>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select City Hub Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCountry.sampleLocations.map((loc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setCustomAddress('');
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      selectedLocation.name === loc.name && !customAddress
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="font-semibold truncate">{loc.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exact Street, Estate or Industrial Bay:
              </label>
              <input
                type="text"
                value={customAddress}
                onChange={e => setCustomAddress(e.target.value)}
                placeholder="e.g. Plot 12, Commercial Bay, Ikeja Industrial Estate"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* RECURRING CONTRACT CONFIGURATOR */}
          {bookingMode === 'recurring_contract' && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/70 rounded-2xl p-5 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Repeat className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">Long-Term Contract Frequency & SLA Schedule</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  {recurringDiscountPercent}% Discount Applied
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Recurring Schedule Frequency:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'weekly', label: 'Weekly', sub: '20% Off', visits: '4x / mo' },
                    { id: 'bi_weekly', label: 'Bi-Weekly', sub: '15% Off', visits: '2x / mo' },
                    { id: 'monthly', label: 'Monthly', sub: '10% Off', visits: '1x / mo' },
                    { id: 'quarterly', label: 'Quarterly', sub: '12% Off', visits: 'Every 3 mo' },
                    { id: 'bi_annual', label: 'Bi-Annual', sub: '8% Off', visits: 'Every 6 mo' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContractFrequency(item.id as ContractFrequency)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        contractFrequency === item.id
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="block font-bold text-xs">{item.label}</span>
                      <span className={`text-[10px] block mt-0.5 ${contractFrequency === item.id ? 'text-slate-900 font-extrabold' : 'text-emerald-400 font-semibold'}`}>
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: '3_months', label: '3 Months Commitment', bonus: 'Standard SLA' },
                  { id: '6_months', label: '6 Months Retainer', bonus: 'Priority Crew' },
                  { id: '12_months', label: '12 Months Annual SLA', bonus: '+5% Annual Bonus' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setContractDuration(item.id as ContractDuration)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      contractDuration === item.id
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{item.label}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">{item.bonus}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Day of Week:</label>
                  <select
                    value={preferredDay}
                    onChange={e => setPreferredDay(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Time Window:</label>
                  <select
                    value={preferredTimeSlot}
                    onChange={e => setPreferredTimeSlot(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                    <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                    <option value="Evening / Night Shift (17:00 - 21:00)">Evening / Night Shift (17:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lock-in Dedicated Certified Vendor for this SLA:
                </label>
                <select
                  value={selectedVendorId}
                  onChange={e => setSelectedVendorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {vendors.filter(v => v.verification.overallStatus === 'cleared_active').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.companyName}) — ★ {v.rating} (LASEPA: {v.verification.lasepaAccreditation.documentNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Service Selection */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Select Service Package</h3>
              </div>
              <span className="text-xs text-slate-400">Fixed Upfront Rates</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredServices.map(srv => {
                const isSelected = selectedService.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-white">{srv.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{srv.tagline}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Base Unit Rate</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {formatCurrency(srv.basePriceNGN)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Space Sizing (m² vs Bedrooms) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">
                  {isSquareMeter ? 'Industrial Square Meter Footprint (m²)' : 'Bedroom Sizing'}
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-bold">
                {isSquareMeter ? `${squareMeters.toLocaleString()} m²` : `${bedrooms} Bedrooms`}
              </span>
            </div>

            {isSquareMeter ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Total Floor Area (m²):</span>
                      <span className="text-[10px] text-slate-400">Cost-reflective at {formatCurrency(squareMeterRate)}/m²</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min={150}
                        max={30000}
                        step={50}
                        value={squareMeters}
                        onChange={e => setSquareMeters(Math.max(150, parseInt(e.target.value) || 150))}
                        className="w-28 bg-slate-900 border border-emerald-500/80 rounded-lg px-2.5 py-1 text-right font-mono font-extrabold text-emerald-400 text-sm focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-300 font-mono">m²</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={200}
                    max={10000}
                    step={100}
                    value={squareMeters}
                    onChange={e => setSquareMeters(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="block text-xs font-semibold text-slate-300 mb-2">Number of Bedrooms:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-base font-bold font-mono text-emerald-400">{bedrooms} Rooms</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="block text-xs font-semibold text-slate-300 mb-2">Number of Bathrooms:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-base font-bold font-mono text-emerald-400">{bathrooms} Baths</span>
                    <button
                      type="button"
                      onClick={() => setBathrooms(bathrooms + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Map & Cost-Reflective Fare Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <InteractiveMap
            customerCoords={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            customerAddress={customAddress || selectedLocation.name}
            heightClass="h-72"
          />

          {/* Upfront Fare / Contract Summary Card */}
          <div className="bg-slate-900/95 border border-emerald-600/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <span>{bookingMode === 'recurring_contract' ? 'Contract Pricing & Savings' : 'Upfront Guaranteed Fare'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {bookingMode === 'recurring_contract'
                    ? `${totalContractVisits} Visits over ${durationMonths} Months (${contractFrequency})`
                    : isSquareMeter ? `${squareMeters} m² Industrial Footprint` : `${bedrooms} Bedrooms`}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                {bookingMode === 'recurring_contract' ? 'Recurring SLA' : 'Instant Quote'}
              </span>
            </div>

            {/* Price Itemized List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Standard Single Visit Rate:</span>
                <span className="font-mono">{formatCurrency(standardSingleVisitTotal)}</span>
              </div>

              {bookingMode === 'recurring_contract' && (
                <div className="flex justify-between text-emerald-400 bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-800">
                  <span>Long-Term SLA Discount ({recurringDiscountPercent}%):</span>
                  <span className="font-mono font-bold">-{formatCurrency(contractDiscountAmount)} / visit</span>
                </div>
              )}

              {isSquareMeter && volumeDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Industrial Scale Discount:</span>
                  <span className="font-mono font-bold">-{formatCurrency(volumeDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Effective Rate per Visit:</span>
                <span className="font-mono font-bold text-white">{formatCurrency(totalFarePerVisit)}</span>
              </div>

              {bookingMode === 'recurring_contract' && (
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Scheduled Visits:</span>
                    <span className="font-mono font-bold text-white">{totalContractVisits} Inspections</span>
                  </div>

                  <div className="flex justify-between text-emerald-400">
                    <span>Total Cumulative SLA Savings:</span>
                    <span className="font-mono font-bold">+{formatCurrency(totalContractSavings)}</span>
                  </div>

                  <div className="flex justify-between text-white font-extrabold text-sm pt-1 border-t border-slate-800">
                    <span>Total Contract Value:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(totalContractGrossValue)}</span>
                  </div>
                </div>
              )}

              {bookingMode === 'one_off' && (
                <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Upfront Fare:</span>
                    <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                      {formatCurrency(totalFarePerVisit)}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
                    Escrow Protected
                  </span>
                </div>
              )}
            </div>

            {/* Uber 70/30 Revenue Split Explainer */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fair 70/30 Escrow Split:</span>
                </span>
                <span className="text-emerald-400 font-mono">70% / 30% Model</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '70%' }}></div>
                <div className="bg-blue-600 h-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>🟢 <strong>{formatCurrency(vendorPayout)} (70%)</strong> to Certified Technician</span>
                <span>🔵 <strong>{formatCurrency(platformFee)} (30%)</strong> KleenPulse SLA Fee</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={handleSubmit}
              type="button"
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950 cursor-pointer transition-all transform hover:scale-[1.01]"
            >
              {bookingMode === 'recurring_contract' ? <Calendar className="w-4 h-4 fill-slate-950" /> : <Zap className="w-4 h-4 fill-slate-950" />}
              <span>
                {bookingMode === 'recurring_contract'
                  ? `ACTIVATE ${contractFrequency.toUpperCase()} CONTRACT (SAVE ${formatCurrency(totalContractSavings)})`
                  : 'REQUEST IMMEDIATE DISPATCH NOW'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
