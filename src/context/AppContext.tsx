import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  CountryConfig,
  CountryCode,
  ServicePackage,
  AddOnOption,
  VendorProfile,
  Booking,
  BookingStatus,
  SurgeConfig,
  VerificationDocument,
  ProofPhoto,
  ServiceContract,
  ContractFrequency,
  ContractDuration,
  ShortletListing,
  TurnoverReport
} from '../types';
import { COUNTRIES } from '../data/countries';
import { SERVICE_PACKAGES, ADD_ON_OPTIONS } from '../data/services';
import { INITIAL_MOCK_VENDORS } from '../data/mockVendors';
import { INITIAL_MOCK_BOOKINGS } from '../data/mockBookings';
import { INITIAL_MOCK_CONTRACTS } from '../data/mockContracts';
import { INITIAL_MOCK_SHORTLETS, INITIAL_MOCK_TURNOVER_REPORTS } from '../data/mockShortlets';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedCountry: CountryConfig;
  setCountryCode: (code: CountryCode) => void;
  formatCurrency: (amountNGN: number) => string;
  vendors: VendorProfile[];
  currentVendor: VendorProfile;
  setCurrentVendorId: (id: string) => void;
  bookings: Booking[];
  activeBooking: Booking | null;
  setActiveBookingId: (id: string | null) => void;
  services: ServicePackage[];
  addOns: AddOnOption[];
  surgeConfig: SurgeConfig;
  setSurgeConfig: React.Dispatch<React.SetStateAction<SurgeConfig>>;
  
  // Airbnb & Hotel Short-Let Management
  shortletListings: ShortletListing[];
  turnoverReports: TurnoverReport[];
  addShortletListing: (data: Partial<ShortletListing>) => ShortletListing;
  updateListingGuestStatus: (listingId: string, status: ShortletListing['guestReadyStatus']) => void;
  dispatchShortletTurnover: (listingId: string) => Booking;

  // Long-Term Service Contracts
  contracts: ServiceContract[];
  createServiceContract: (params: {
    title: string;
    service: ServicePackage;
    selectedAddOns: AddOnOption[];
    propertyDetails: ServiceContract['propertyDetails'];
    address: string;
    city: string;
    frequency: ContractFrequency;
    duration: ContractDuration;
    preferredDayOfWeek: ServiceContract['preferredDayOfWeek'];
    preferredTimeSlot: ServiceContract['preferredTimeSlot'];
    assignedVendorId?: string;
  }) => ServiceContract;
  toggleContractStatus: (contractId: string, action: 'pause' | 'resume' | 'cancel') => void;
  dispatchContractVisit: (contractId: string, visitNumber: number) => Booking;

  // Core Booking Actions
  createBooking: (params: {
    service: ServicePackage;
    selectedAddOns: AddOnOption[];
    propertyDetails: Booking['propertyDetails'];
    address: string;
    city: string;
    lga: string;
    coordinates: { lat: number; lng: number };
    paymentMethod: Booking['payment']['method'];
  }) => Booking;
  
  updateBookingStatus: (bookingId: string, nextStatus: BookingStatus) => void;
  toggleChecklistItem: (bookingId: string, itemId: string, photoUrl?: string) => void;
  submitCustomerRating: (bookingId: string, rating: { stars: number; cleanliness: number; safety: number; punctuality: number; comment: string }) => void;
  
  // Customer Satisfaction & Escrow Release Feature
  confirmJobSatisfactionAndReleaseEscrow: (
    bookingId: string,
    options?: {
      completionMethod?: 'in_app_authorization' | '4_digit_otp_verification';
      customerNotes?: string;
      tipAmount?: number;
    }
  ) => { success: boolean; message: string };

  requestQualityTouchUp: (bookingId: string, touchUpDetails: string) => void;
  validateCompletionOtp: (bookingId: string, inputOtp: string) => { success: boolean; message: string };
  submitVendorCompletionProof: (bookingId: string, newPhotos?: ProofPhoto[]) => void;

  // Vendor Actions
  toggleVendorOnline: (vendorId: string) => void;
  registerNewVendor: (data: Partial<VendorProfile>) => VendorProfile;
  requestVendorPayout: (vendorId: string, amountNGN: number, bankName: string, accountNumber: string) => { success: boolean; message: string; ref: string };
  
  // Admin & Regulator Actions
  verifyVendorDocument: (vendorId: string, docType: 'police' | 'lasepa', action: 'approve' | 'reject', notes?: string) => void;
  
  // Dispatch Simulator
  incomingJobOffer: Booking | null;
  acceptIncomingJob: (bookingId: string) => void;
  declineIncomingJob: () => void;
  simulateAutoDispatch: (bookingId: string) => void;
  
  // UI Notifications & SOS
  triggerEmergencySos: (reason: string) => void;
  sosAlert: { active: boolean; message: string; timestamp: string } | null;
  clearSosAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [countryCode, setCountryCodeState] = useState<CountryCode>('NG');
  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem('kleenpulse_vendors_v8');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_VENDORS;
  });
  const [currentVendorId, setCurrentVendorIdState] = useState<string>('v-001');
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('kleenpulse_bookings_v8');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_BOOKINGS;
  });
  const [contracts, setContracts] = useState<ServiceContract[]>(() => {
    const saved = localStorage.getItem('kleenpulse_contracts_v8');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_CONTRACTS;
  });
  const [shortletListings, setShortletListings] = useState<ShortletListing[]>(() => {
    const saved = localStorage.getItem('kleenpulse_shortlets_v8');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_SHORTLETS;
  });
  const [turnoverReports, setTurnoverReports] = useState<TurnoverReport[]>(() => {
    const saved = localStorage.getItem('kleenpulse_reports_v8');
    return saved ? JSON.parse(saved) : INITIAL_MOCK_TURNOVER_REPORTS;
  });
  const [activeBookingId, setActiveBookingIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('kleenpulse_active_booking_id_v8');
    return saved || 'bk-9941';
  });
  const [incomingJobOffer, setIncomingJobOffer] = useState<Booking | null>(null);
  const [sosAlert, setSosAlert] = useState<{ active: boolean; message: string; timestamp: string } | null>(null);

  const [surgeConfig, setSurgeConfig] = useState<SurgeConfig>({
    isActive: true,
    multiplier: 1.15,
    reason: 'Lagos Rainy Season & Vector Infestation Surge (+15%)',
    affectedZones: ['Lekki Phase 1', 'Victoria Island', 'Ikoyi', 'Ikeja GRA', 'Ilupeju Industrial Area']
  });

  useEffect(() => {
    localStorage.setItem('kleenpulse_vendors_v8', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('kleenpulse_bookings_v8', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kleenpulse_contracts_v8', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('kleenpulse_shortlets_v8', JSON.stringify(shortletListings));
  }, [shortletListings]);

  useEffect(() => {
    if (activeBookingId) {
      localStorage.setItem('kleenpulse_active_booking_id_v8', activeBookingId);
    }
  }, [activeBookingId]);

  const selectedCountry = COUNTRIES[countryCode] || COUNTRIES.NG;

  const setCountryCode = (code: CountryCode) => {
    setCountryCodeState(code);
  };

  const currentVendor = vendors.find(v => v.id === currentVendorId) || vendors[0];
  const activeBooking = bookings.find(b => b.id === activeBookingId) || null;

  const formatCurrency = (amountNGN: number): string => {
    const converted = amountNGN * selectedCountry.exchangeRateToNGN;
    if (selectedCountry.code === 'NG') {
      return `₦${converted.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    }
    if (selectedCountry.code === 'GH') {
      return `GH₵${converted.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (selectedCountry.code === 'KE') {
      return `KSh ${converted.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
    }
    if (selectedCountry.code === 'ZA') {
      return `R ${converted.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (selectedCountry.code === 'RW') {
      return `FRw ${converted.toLocaleString('en-RW', { maximumFractionDigits: 0 })}`;
    }
    return `₦${amountNGN.toLocaleString()}`;
  };

  // Airbnb / Short-Let Listing Actions
  const addShortletListing = (data: Partial<ShortletListing>): ShortletListing => {
    const newId = `slet-${Date.now().toString().slice(-4)}`;
    const newListing: ShortletListing = {
      id: newId,
      name: data.name || 'New Lekki Luxury Shortlet',
      propertyType: data.propertyType || '2-Bedroom Luxury Suite',
      address: data.address || 'Admiralty Way, Lekki Phase 1, Lagos',
      city: data.city || 'Lagos',
      bedrooms: data.bedrooms || 2,
      bathrooms: data.bathrooms || 2,
      lockboxCode: data.lockboxCode || '4820',
      wifiSsid: data.wifiSsid || 'Guest_Fast_WiFi',
      wifiPassword: data.wifiPassword || 'StayClean2026',
      iCalSyncUrl: data.iCalSyncUrl || '',
      checkoutTime: data.checkoutTime || '11:00 AM',
      checkinTime: data.checkinTime || '03:00 PM',
      assignedCleanerId: data.assignedCleanerId || vendors[0]?.id,
      amenitiesToRestock: data.amenitiesToRestock || ['Fresh Towels', 'Soap & Shampoo', 'Bottled Water', 'Coffee Pods'],
      totalTurnoversCompleted: 0,
      guestRatingAvg: 5.0,
      lastCleanedDate: new Date().toISOString().split('T')[0],
      guestReadyStatus: 'turnover_needed'
    };

    setShortletListings(prev => [newListing, ...prev]);
    return newListing;
  };

  const updateListingGuestStatus = (listingId: string, status: ShortletListing['guestReadyStatus']) => {
    setShortletListings(prev => prev.map(l => {
      if (l.id === listingId) {
        return { ...l, guestReadyStatus: status };
      }
      return l;
    }));
  };

  const dispatchShortletTurnover = (listingId: string): Booking => {
    const listing = shortletListings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const turnoverService = SERVICE_PACKAGES.find(s => s.id === 'airbnb_same_day_turnover') || SERVICE_PACKAGES[0];

    const createdBooking = createBooking({
      service: turnoverService,
      selectedAddOns: [ADD_ON_OPTIONS[0]],
      propertyDetails: {
        category: 'shortlet_airbnb_hotel',
        propertyType: 'Airbnb / Short-Let Suite',
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareMeters: listing.bedrooms * 45 + 50,
        infestationLevel: 'Low / Preventive',
        targetPests: ['Mosquitoes', 'Cockroaches'],
        shortletSpecs: {
          guestCheckoutTime: listing.checkoutTime,
          nextGuestCheckinTime: listing.checkinTime,
          lockboxCode: listing.lockboxCode,
          hostSpecialInstructions: `Check lockbox ${listing.lockboxCode}. Restock: ${listing.amenitiesToRestock.join(', ')}`,
          restockItems: listing.amenitiesToRestock
        }
      },
      address: listing.address,
      city: listing.city,
      lga: 'Eti-Osa LGA',
      coordinates: { lat: 6.4474, lng: 3.4735 },
      paymentMethod: 'paystack_card'
    });

    updateListingGuestStatus(listingId, 'in_progress');

    setBookings(prev => prev.map(b => {
      if (b.id === createdBooking.id) {
        return {
          ...b,
          shortletListingId: listing.id,
          checklists: [
            { id: 'c-abnb-1', title: 'Strip beds & inspect for guest-forgotten items (Lost & Found)', category: 'hospitality_restock', completed: false, photoRequired: true },
            { id: 'c-abnb-2', title: 'Make beds with hotel hospital-corners & fresh sanitized linen', category: 'hospitality_restock', completed: false, photoRequired: true },
            { id: 'c-abnb-3', title: 'Deep descale bathrooms & restock toiletries (soap, shampoo, toilet rolls)', category: 'hospitality_restock', completed: false, photoRequired: true },
            { id: 'c-abnb-4', title: 'Clean out refrigerator & remove all expired food/spills', category: 'execution', completed: false, photoRequired: false },
            { id: 'c-abnb-5', title: 'Test AC remotes, TV remotes & verify Wi-Fi connectivity', category: 'handover', completed: false, photoRequired: false },
            { id: 'c-abnb-6', title: 'Lockbox secured & key code reset confirmation', category: 'handover', completed: false, photoRequired: true }
          ]
        };
      }
      return b;
    }));

    return createdBooking;
  };

  const createServiceContract = ({
    title,
    service,
    selectedAddOns,
    propertyDetails,
    address,
    city,
    frequency,
    duration,
    preferredDayOfWeek,
    preferredTimeSlot,
    assignedVendorId
  }: {
    title: string;
    service: ServicePackage;
    selectedAddOns: AddOnOption[];
    propertyDetails: ServiceContract['propertyDetails'];
    address: string;
    city: string;
    frequency: ContractFrequency;
    duration: ContractDuration;
    preferredDayOfWeek: ServiceContract['preferredDayOfWeek'];
    preferredTimeSlot: ServiceContract['preferredTimeSlot'];
    assignedVendorId?: string;
  }): ServiceContract => {
    const isSquareMeter = service.pricingModel === 'square_meter_industrial' || propertyDetails.category === 'commercial_large_space';
    
    const baseFare = service.basePriceNGN;
    let areaCost = 0;
    if (isSquareMeter) {
      const sqm = propertyDetails.squareMeters || 1000;
      areaCost = sqm * (service.perSquareMeterRateNGN || 160);
    } else {
      areaCost = propertyDetails.bedrooms * service.perRoomRateNGN;
    }
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.priceNGN, 0);
    const standardSingleVisitRate = baseFare + areaCost + addOnsTotal;

    let discountPercent = 0;
    if (frequency === 'weekly') discountPercent = 20;
    else if (frequency === 'bi_weekly') discountPercent = 15;
    else if (frequency === 'monthly') discountPercent = 10;
    else if (frequency === 'quarterly') discountPercent = 12;
    else if (frequency === 'bi_annual') discountPercent = 8;

    if (duration === '12_months') discountPercent += 5;

    const discountedPerVisitRate = Math.round(standardSingleVisitRate * (1 - discountPercent / 100));

    let totalVisits = 4;
    const durationMonths = duration === '3_months' ? 3 : duration === '6_months' ? 6 : 12;
    
    if (frequency === 'weekly') totalVisits = durationMonths * 4;
    else if (frequency === 'bi_weekly') totalVisits = durationMonths * 2;
    else if (frequency === 'monthly') totalVisits = durationMonths;
    else if (frequency === 'quarterly') totalVisits = Math.max(1, Math.round(durationMonths / 3));
    else if (frequency === 'bi_annual') totalVisits = Math.max(1, Math.round(durationMonths / 6));

    const totalContractValue = discountedPerVisitRate * totalVisits;
    const totalSavings = (standardSingleVisitRate - discountedPerVisitRate) * totalVisits;
    // 70% Vendor Payout / 30% Platform Fee
    const platformCut = Math.round(discountedPerVisitRate * 0.30);
    const vendorPayout = discountedPerVisitRate - platformCut;

    const matchedVendor = assignedVendorId ? vendors.find(v => v.id === assignedVendorId) : vendors[0];

    const schedule: ServiceContract['visitsSchedule'] = [];
    const now = new Date();
    for (let i = 1; i <= totalVisits; i++) {
      const visitDate = new Date(now.getTime() + (i * 7 * 24 * 60 * 60 * 1000 * (frequency === 'monthly' ? 4 : frequency === 'quarterly' ? 12 : frequency === 'bi_annual' ? 26 : frequency === 'bi_weekly' ? 2 : 1)));
      schedule.push({
        visitNumber: i,
        scheduledDate: visitDate.toISOString().split('T')[0],
        status: i === 1 ? 'upcoming' : 'upcoming'
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newContract: ServiceContract = {
      id: `cnt-${randomSuffix}`,
      contractCode: `KLP-SLA-2026-${randomSuffix}`,
      title: title || `${frequency.toUpperCase()} Service SLA (${service.name})`,
      customerId: 'cust-current',
      customerName: 'Adebayo Johnson',
      customerPhone: '+234 802 991 4455',
      customerEmail: 'adebayo.johnson@pulse.ng',
      address,
      city,
      service,
      selectedAddOns,
      propertyDetails,
      frequency,
      duration,
      totalVisits,
      completedVisits: 0,
      assignedVendor: matchedVendor,
      preferredDayOfWeek,
      preferredTimeSlot,
      financials: {
        standardSingleVisitRateNGN: standardSingleVisitRate,
        contractDiscountPercent: discountPercent,
        discountedPerVisitRateNGN: discountedPerVisitRate,
        totalContractValueNGN: totalContractValue,
        totalSavingsNGN: totalSavings,
        platformCutPerVisitNGN: platformCut, // 30%
        vendorPayoutPerVisitNGN: vendorPayout // 70%
      },
      visitsSchedule: schedule,
      status: 'active',
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lasepaSlaCertNumber: `LASEPA/CORP-SLA/2026/LG-${randomSuffix}`
    };

    setContracts(prev => [newContract, ...prev]);

    try {
      confetti({ particleCount: 90, spread: 75 });
    } catch (e) {}

    return newContract;
  };

  const toggleContractStatus = (contractId: string, action: 'pause' | 'resume' | 'cancel') => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled'
        };
      }
      return c;
    }));
  };

  const dispatchContractVisit = (contractId: string, visitNumber: number): Booking => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) throw new Error('Contract not found');

    const createdBooking = createBooking({
      service: contract.service,
      selectedAddOns: contract.selectedAddOns,
      propertyDetails: {
        category: contract.propertyDetails.category,
        propertyType: contract.propertyDetails.propertyType as any,
        bedrooms: contract.propertyDetails.bedrooms,
        bathrooms: 2,
        squareMeters: contract.propertyDetails.squareMeters,
        infestationLevel: 'Moderate',
        targetPests: ['Mosquitoes', 'Cockroaches', 'Rodents']
      },
      address: contract.address,
      city: contract.city,
      lga: 'Eti-Osa / Ikeja Central',
      coordinates: { lat: 6.4474, lng: 3.4735 },
      paymentMethod: 'paystack_card'
    });

    setBookings(prev => prev.map(b => {
      if (b.id === createdBooking.id) {
        return {
          ...b,
          contractId: contract.id,
          contractVisitNumber: visitNumber
        };
      }
      return b;
    }));

    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          visitsSchedule: c.visitsSchedule.map(v => {
            if (v.visitNumber === visitNumber) {
              return { ...v, status: 'in_progress', bookingId: createdBooking.id };
            }
            return v;
          })
        };
      }
      return c;
    }));

    return createdBooking;
  };

  const createBooking = ({
    service,
    selectedAddOns,
    propertyDetails,
    address,
    city,
    lga,
    coordinates,
    paymentMethod
  }: {
    service: ServicePackage;
    selectedAddOns: AddOnOption[];
    propertyDetails: Booking['propertyDetails'];
    address: string;
    city: string;
    lga: string;
    coordinates: { lat: number; lng: number };
    paymentMethod: Booking['payment']['method'];
  }): Booking => {
    const isSquareMeter = service.pricingModel === 'square_meter_industrial' || propertyDetails.category === 'commercial_large_space';
    const baseFare = service.basePriceNGN;
    
    let roomMultiplier = 0;
    let squareMeterRateApplied = 0;
    let squareMetersCalculated = propertyDetails.squareMeters || 500;
    let squareMeterGross = 0;
    let volumeDiscount = 0;
    let areaCost = 0;

    if (isSquareMeter) {
      squareMeterRateApplied = service.perSquareMeterRateNGN || 160;
      const heightFactor = (propertyDetails.ceilingHeightMeters && propertyDetails.ceilingHeightMeters > 5) ? 1.12 : 1.0;
      squareMeterGross = Math.round(squareMetersCalculated * squareMeterRateApplied * heightFactor);

      if (squareMetersCalculated >= 5000) {
        volumeDiscount = Math.round(squareMeterGross * 0.25);
      } else if (squareMetersCalculated >= 2000) {
        volumeDiscount = Math.round(squareMeterGross * 0.18);
      } else if (squareMetersCalculated >= 500) {
        volumeDiscount = Math.round(squareMeterGross * 0.10);
      }

      areaCost = squareMeterGross - volumeDiscount;
    } else {
      roomMultiplier = propertyDetails.bedrooms * service.perRoomRateNGN;
      areaCost = roomMultiplier;
    }

    const addOnsTotal = selectedAddOns.reduce((acc, item) => acc + item.priceNGN, 0);
    const chemicalFee = service.category === 'industrial' ? 15000 : service.category === 'fumigation' ? 6500 : 3000;
    const distanceFee = isSquareMeter ? 4000 : 1500;
    const currentSurge = surgeConfig.isActive ? surgeConfig.multiplier : 1.0;
    
    const lasepaSafetyLevy = service.requiresLasepaCert ? Math.round((baseFare + areaCost) * 0.015) : 0;
    const rawSubtotal = (baseFare + areaCost + addOnsTotal + chemicalFee + distanceFee) * currentSurge;
    const subtotalNGN = Math.round(rawSubtotal + lasepaSafetyLevy);
    
    // Revenue share breakdown: 30% platform cut, 70% vendor payout
    const platformFeeNGN = Math.round(subtotalNGN * 0.30);
    const vendorPayoutNGN = subtotalNGN - platformFeeNGN;
    const taxNGN = Math.round(subtotalNGN * 0.05);
    const totalFareNGN = subtotalNGN + taxNGN;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `bk-${randomSuffix}`,
      bookingCode: `KP-2026-${randomSuffix}`,
      completionOtp: generatedOtp,
      customerId: 'cust-current',
      customerName: 'Adebayo Johnson',
      customerPhone: '+234 802 991 4455',
      customerEmail: 'adebayo.johnson@pulse.ng',
      address,
      city,
      lga,
      countryCode: selectedCountry.code,
      coordinates,
      service,
      selectedAddOns,
      propertyDetails,
      fare: {
        baseFareNGN: baseFare,
        roomMultiplierNGN: roomMultiplier,
        squareMeterRateAppliedNGN: isSquareMeter ? squareMeterRateApplied : undefined,
        squareMetersCalculated: isSquareMeter ? squareMetersCalculated : undefined,
        squareMeterGrossNGN: isSquareMeter ? squareMeterGross : undefined,
        volumeDiscountNGN: isSquareMeter ? volumeDiscount : undefined,
        addOnsTotalNGN: addOnsTotal,
        chemicalEquipmentFeeNGN: chemicalFee,
        surgeMultiplier: currentSurge,
        distanceFeeNGN: distanceFee,
        lasepaSafetyLevyNGN: lasepaSafetyLevy,
        subtotalNGN,
        platformFeeNGN,
        vendorPayoutNGN,
        taxNGN,
        tipNGN: 0,
        totalFareNGN
      },
      status: 'searching_agent',
      scheduledTime: 'instant',
      checklists: isSquareMeter ? [
        { id: 'c-ind-1', title: 'Industrial floor degreasing & tire mark extraction across all bays', category: 'execution', completed: false, photoRequired: true },
        { id: 'c-ind-2', title: 'High-bay truss & rafter HEPA dust vacuuming completed', category: 'execution', completed: false, photoRequired: true },
        { id: 'c-ind-3', title: 'LASEPA Class-A industrial chemical batch & MSDS verification', category: 'safety', completed: false, photoRequired: true },
        { id: 'c-ind-4', title: 'Industrial effluent & wastewater safe haulage manifest signed', category: 'safety', completed: false, photoRequired: true },
        { id: 'c-ind-5', title: 'Square-meter perimeter handover walk-through inspection with facility manager', category: 'handover', completed: false, photoRequired: true }
      ] : [
        { id: 'c-prep-1', title: 'Food and open perishables safely stored/covered', category: 'prep', completed: false, photoRequired: true },
        { id: 'c-prep-2', title: 'Occupants & pets cleared from operational zone', category: 'prep', completed: false, photoRequired: false },
        { id: 'c-safe-1', title: 'LASEPA Chemical Batch & MSDS verification confirmed', category: 'safety', completed: false, photoRequired: true },
        { id: 'c-exec-1', title: 'High-precision misting & deep extraction completed', category: 'execution', completed: false, photoRequired: true },
        { id: 'c-exec-2', title: 'Perimeter barrier & corner crack injection applied', category: 'execution', completed: false, photoRequired: false },
        { id: 'c-hand-1', title: 'Ventilation protocol initiated & customer walkthrough inspected', category: 'handover', completed: false, photoRequired: true }
      ],
      proofPhotos: [
        {
          id: `pf-${Date.now()}-1`,
          roomOrArea: isSquareMeter ? 'Main Industrial Bay & High Truss' : 'Main Premises Walkway',
          type: 'before',
          url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
          caption: 'Pre-service baseline audit completed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      chemicalRecord: service.requiresLasepaCert ? {
        chemicalName: service.lasepaApprovedChemicals?.[0] || 'PyreSafe-25 Ultra EC Industrial',
        activeIngredient: 'Permethrin 25% + Piperonyl Butoxide',
        lasepaBatchNumber: `LASEPA/CHEM/2024/LG-IND-${Math.floor(100 + Math.random() * 900)}`,
        epaRegistration: 'WHO/PQ/VCP-0091',
        dilutionRatio: '1:50 with Deodorized Aqueous Solvent',
        targetPest: propertyDetails.targetPests?.join(', ') || 'Warehouse Weevils, Beetles, Rodents, Mosquitoes',
        reentryHours: service.safetyVentilationHours || 3.5,
        ppeUsed: ['3M Organic Vapor Respirator 6001', 'Nitrile Chemical Gauntlets', 'Hazmat Tyvek Suit', 'Fall Arrest Harness'],
        safetyCertIssued: true
      } : undefined,
      timestamps: {
        createdAt: new Date().toISOString()
      },
      payment: {
        method: paymentMethod,
        status: 'escrow_locked',
        transactionRef: `PSTK_KP_${Date.now()}`
      }
    };

    setBookings(prev => [newBooking, ...prev]);
    setActiveBookingIdState(newBooking.id);

    simulateAutoDispatch(newBooking.id);

    return newBooking;
  };

  const simulateAutoDispatch = (bookingId: string) => {
    const eligibleVendor = vendors.find(v => v.isOnline && v.verification.overallStatus === 'cleared_active') || vendors[0];
    
    setTimeout(() => {
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'agent_assigned',
            assignedVendor: eligibleVendor,
            timestamps: {
              ...b.timestamps,
              assignedAt: new Date().toISOString()
            }
          };
        }
        return b;
      }));

      setTimeout(() => {
        setBookings(prev => prev.map(b => {
          if (b.id === bookingId && b.status === 'agent_assigned') {
            return {
              ...b,
              status: 'agent_en_route',
              timestamps: {
                ...b.timestamps,
                enRouteAt: new Date().toISOString()
              }
            };
          }
          return b;
        }));
      }, 4000);
    }, 3000);
  };

  const updateBookingStatus = (bookingId: string, nextStatus: BookingStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updated = { ...b, status: nextStatus };
        const now = new Date().toISOString();
        if (nextStatus === 'agent_arrived') updated.timestamps.arrivedAt = now;
        if (nextStatus === 'service_in_progress') updated.timestamps.startedAt = now;
        if (nextStatus === 'chemical_evacuation_active') {
          const hours = b.chemicalRecord?.reentryHours || 3.5;
          updated.reentrySafeTimestamp = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        }
        if (nextStatus === 'awaiting_customer_satisfaction') {
          updated.timestamps.submittedForInspectionAt = now;
        }
        return updated;
      }
      return b;
    }));
  };

  const submitVendorCompletionProof = (bookingId: string, newPhotos?: ProofPhoto[]) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const photosToAdd: ProofPhoto[] = newPhotos || [
          {
            id: `pf-auto-${Date.now()}`,
            roomOrArea: b.propertyDetails.category === 'shortlet_airbnb_hotel' ? 'Airbnb Guest Ready Bedroom & Restocked Bath' : b.propertyDetails.category === 'commercial_large_space' ? `Industrial Bays (Total: ${b.propertyDetails.squareMeters} m²)` : 'Living Room & Kitchen',
            type: 'after',
            url: b.propertyDetails.category === 'shortlet_airbnb_hotel' ? 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=80' : b.propertyDetails.category === 'commercial_large_space' ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
            caption: b.propertyDetails.category === 'shortlet_airbnb_hotel' ? 'Guest-ready turnover, fresh linen, restocked amenities & lockbox secured.' : 'Full sparkle clean & safe mist ventilation verified.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];

        return {
          ...b,
          status: 'awaiting_customer_satisfaction',
          proofPhotos: [...b.proofPhotos, ...photosToAdd],
          timestamps: {
            ...b.timestamps,
            submittedForInspectionAt: new Date().toISOString()
          }
        };
      }
      return b;
    }));
  };

  const confirmJobSatisfactionAndReleaseEscrow = (
    bookingId: string,
    options?: {
      completionMethod?: 'in_app_authorization' | '4_digit_otp_verification';
      customerNotes?: string;
      tipAmount?: number;
    }
  ) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    const tip = options?.tipAmount || 0;
    const vendorPayoutWithTip = booking.fare.vendorPayoutNGN + tip;

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'completed',
          satisfactionSignoff: {
            isSatisfied: true,
            confirmedAt: new Date().toISOString(),
            approvedByCustomerName: b.customerName,
            checklistVerified: true,
            completionMethod: options?.completionMethod || 'in_app_authorization',
            customerNotes: options?.customerNotes || 'Customer inspected and confirmed 100% satisfaction.'
          },
          fare: {
            ...b.fare,
            tipNGN: tip,
            totalFareNGN: b.fare.totalFareNGN + tip
          },
          payment: {
            ...b.payment,
            status: 'paid_and_settled',
            escrowReleasedAt: new Date().toISOString()
          },
          timestamps: {
            ...b.timestamps,
            completedAt: new Date().toISOString()
          }
        };
      }
      return b;
    }));

    if (booking.assignedVendor) {
      const vendorId = booking.assignedVendor.id;
      setVendors(vList => vList.map(v => {
        if (v.id === vendorId) {
          return {
            ...v,
            totalJobs: v.totalJobs + 1,
            wallet: {
              ...v.wallet,
              availableBalanceNGN: v.wallet.availableBalanceNGN + vendorPayoutWithTip,
              totalEarnedNGN: v.wallet.totalEarnedNGN + vendorPayoutWithTip,
              platformFeesPaidNGN: v.wallet.platformFeesPaidNGN + booking.fare.platformFeeNGN
            }
          };
        }
        return v;
      }));
    }

    if (booking.contractId) {
      setContracts(prev => prev.map(c => {
        if (c.id === booking.contractId) {
          return {
            ...c,
            completedVisits: c.completedVisits + 1,
            visitsSchedule: c.visitsSchedule.map(v => {
              if (v.visitNumber === booking.contractVisitNumber) {
                return { ...v, status: 'completed', completedAt: new Date().toISOString().split('T')[0] };
              }
              return v;
            })
          };
        }
        return c;
      }));
    }

    if (booking.shortletListingId) {
      setShortletListings(prev => prev.map(l => {
        if (l.id === booking.shortletListingId) {
          return {
            ...l,
            guestReadyStatus: 'ready',
            totalTurnoversCompleted: l.totalTurnoversCompleted + 1,
            lastCleanedDate: new Date().toISOString().split('T')[0]
          };
        }
        return l;
      }));
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    return {
      success: true,
      message: `Satisfaction confirmed! Escrow payout of ${formatCurrency(vendorPayoutWithTip)} successfully released to ${booking.assignedVendor?.name || 'vendor'}.`
    };
  };

  const requestQualityTouchUp = (bookingId: string, touchUpDetails: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'touch_up_in_progress',
          payment: {
            ...b.payment,
            status: 'touch_up_hold'
          },
          satisfactionSignoff: {
            isSatisfied: false,
            checklistVerified: false,
            completionMethod: 'in_app_authorization',
            touchUpRequested: true,
            touchUpDetails
          }
        };
      }
      return b;
    }));
  };

  const validateCompletionOtp = (bookingId: string, inputOtp: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    if (booking.completionOtp.trim() !== inputOtp.trim()) {
      return { success: false, message: 'Incorrect 4-digit Completion OTP. Please ask the client for their valid satisfaction code.' };
    }

    return confirmJobSatisfactionAndReleaseEscrow(bookingId, {
      completionMethod: '4_digit_otp_verification',
      customerNotes: 'Verified via Customer 4-digit Satisfaction OTP'
    });
  };

  const toggleChecklistItem = (bookingId: string, itemId: string, photoUrl?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          checklists: b.checklists.map(c => {
            if (c.id === itemId) {
              return {
                ...c,
                completed: !c.completed,
                photoUrl: photoUrl || c.photoUrl,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            return c;
          })
        };
      }
      return b;
    }));
  };

  const submitCustomerRating = (bookingId: string, rating: { stars: number; cleanliness: number; safety: number; punctuality: number; comment: string }) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          rating: {
            stars: rating.stars,
            cleanlinessRating: rating.cleanliness,
            safetyComplianceRating: rating.safety,
            punctualityRating: rating.punctuality,
            comment: rating.comment,
            createdAt: new Date().toISOString()
          }
        };
      }
      return b;
    }));
  };

  const toggleVendorOnline = (vendorId: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return { ...v, isOnline: !v.isOnline };
      }
      return v;
    }));
  };

  const registerNewVendor = (data: Partial<VendorProfile>): VendorProfile => {
    const newId = `v-${Date.now().toString().slice(-4)}`;
    const newVendor: VendorProfile = {
      id: newId,
      name: data.name || 'New Registered Agent',
      email: data.email || 'partner@kleenpulse.ng',
      phone: data.phone || '+234 800 000 0000',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      companyName: data.companyName || 'Matoluxx Integrated Services',
      businessType: data.businessType || 'certified_agency',
      rating: 5.0,
      totalJobs: 0,
      completionRate: 100,
      partnerTier: 'Silver',
      commissionRate: 0.30, // 30% platform fee (70% vendor payout)
      isOnline: false,
      isBusy: false,
      currentLocation: data.currentLocation || {
        lat: 6.4474,
        lng: 3.4735,
        address: 'Lekki Phase 1, Lagos',
        city: 'Lagos'
      },
      vehicle: data.vehicle || {
        type: 'Mobile Disinfection Van',
        plateNumber: 'AGL-123-KD',
        model: 'Toyota HiAce LASEPA Van'
      },
      equipment: data.equipment || [
        'ULV Cold Fogger 5L',
        'Commercial Steam Extractor',
        'Full 3M Respirator Kit'
      ],
      verification: data.verification || {
        policeClearance: {
          id: `pol-${Date.now()}`,
          type: 'police_clearance',
          title: 'NPF Central Criminal Registry Clearance',
          documentNumber: 'NPF-CCR/LG/2026/' + Math.floor(10000 + Math.random() * 90000),
          issuer: 'Nigeria Police Force Alagbon CID',
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-08-22',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          status: 'pending'
        },
        lasepaAccreditation: {
          id: `las-${Date.now()}`,
          type: 'lasepa_permit',
          title: 'LASEPA Pest Control Operator Accreditation',
          documentNumber: 'LASEPA/PCO/2026/CAT-A/' + Math.floor(1000 + Math.random() * 9000),
          issuer: 'Lagos State Environmental Protection Agency',
          issuedDate: new Date().toISOString().split('T')[0],
          expiryDate: '2027-08-22',
          fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
          status: 'pending'
        },
        ninVerified: true,
        bvnVerified: true,
        overallStatus: 'pending_review',
        badgeIssuedAt: ''
      },
      wallet: {
        availableBalanceNGN: 0,
        escrowBalanceNGN: 0,
        totalEarnedNGN: 0,
        platformFeesPaidNGN: 0,
        bankAccount: data.wallet?.bankAccount || {
          bankName: 'Wema Bank Plc',
          accountNumber: '0128090787',
          accountName: 'Matoluxx Integrated Services'
        },
        payoutHistory: []
      }
    };

    setVendors(prev => [newVendor, ...prev]);
    setCurrentVendorIdState(newVendor.id);
    return newVendor;
  };

  const requestVendorPayout = (vendorId: string, amountNGN: number, bankName: string, accountNumber: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return { success: false, message: 'Vendor not found', ref: '' };
    if (vendor.wallet.availableBalanceNGN < amountNGN) {
      return { success: false, message: 'Insufficient balance', ref: '' };
    }

    const ref = `NIP/${bankName.slice(0, 4).toUpperCase()}/KLEEN/${Date.now().toString().slice(-8)}`;

    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          wallet: {
            ...v.wallet,
            availableBalanceNGN: v.wallet.availableBalanceNGN - amountNGN,
            payoutHistory: [
              {
                id: `pay-${Date.now()}`,
                amountNGN,
                date: new Date().toISOString().split('T')[0],
                status: 'completed',
                reference: ref,
                bankName
              },
              ...v.wallet.payoutHistory
            ]
          }
        };
      }
      return v;
    }));

    return { success: true, message: `Payout of ₦${amountNGN.toLocaleString()} successfully sent via NIBSS Instant Payment (NIP) to ${bankName} (${accountNumber}) - Matoluxx Integrated Services.`, ref };
  };

  const verifyVendorDocument = (vendorId: string, docType: 'police' | 'lasepa', action: 'approve' | 'reject', notes?: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const updated = { ...v };
        const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

        if (docType === 'police') {
          updated.verification.policeClearance = {
            ...updated.verification.policeClearance,
            status: action === 'approve' ? 'verified' : 'rejected',
            rejectionReason: action === 'reject' ? (notes || 'Police Character Certificate invalid or unverified in CRID') : undefined,
            verifiedBy: action === 'approve' ? 'Inspector K. Balogun (NPF Alagbon CID)' : undefined,
            verifiedAt: action === 'approve' ? now : undefined
          };
        } else if (docType === 'lasepa') {
          updated.verification.lasepaAccreditation = {
            ...updated.verification.lasepaAccreditation,
            status: action === 'approve' ? 'verified' : 'rejected',
            rejectionReason: action === 'reject' ? (notes || 'LASEPA Operator License lapsed or failed chemical audit') : undefined,
            verifiedBy: action === 'approve' ? 'Engr. D. Ogunleye (LASEPA Directorate)' : undefined,
            verifiedAt: action === 'approve' ? now : undefined
          };
        }

        const isPoliceOk = updated.verification.policeClearance.status === 'verified';
        const isLasepaOk = updated.verification.lasepaAccreditation.status === 'verified';

        if (isPoliceOk && isLasepaOk) {
          updated.verification.overallStatus = 'cleared_active';
          updated.verification.badgeIssuedAt = now;
        } else if (updated.verification.policeClearance.status === 'rejected' || updated.verification.lasepaAccreditation.status === 'rejected') {
          updated.verification.overallStatus = 'action_required';
        } else {
          updated.verification.overallStatus = 'pending_review';
        }

        return updated;
      }
      return v;
    }));
  };

  const acceptIncomingJob = (bookingId: string) => {
    updateBookingStatus(bookingId, 'agent_assigned');
    setIncomingJobOffer(null);
  };

  const declineIncomingJob = () => {
    setIncomingJobOffer(null);
  };

  const triggerEmergencySos = (reason: string) => {
    setSosAlert({
      active: true,
      message: `EMERGENCY ALERT: ${reason}. Rapid Response & LASEPA Chemical Hazardous Incident Unit dispatched.`,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const clearSosAlert = () => setSosAlert(null);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        selectedCountry,
        setCountryCode,
        formatCurrency,
        vendors,
        currentVendor,
        setCurrentVendorId: setCurrentVendorIdState,
        bookings,
        activeBooking,
        setActiveBookingId: setActiveBookingIdState,
        services: SERVICE_PACKAGES,
        addOns: ADD_ON_OPTIONS,
        surgeConfig,
        setSurgeConfig,
        contracts,
        createServiceContract,
        toggleContractStatus,
        dispatchContractVisit,
        shortletListings,
        turnoverReports,
        addShortletListing,
        updateListingGuestStatus,
        dispatchShortletTurnover,
        createBooking,
        updateBookingStatus,
        toggleChecklistItem,
        submitCustomerRating,
        confirmJobSatisfactionAndReleaseEscrow,
        requestQualityTouchUp,
        validateCompletionOtp,
        submitVendorCompletionProof,
        toggleVendorOnline,
        registerNewVendor,
        requestVendorPayout,
        verifyVendorDocument,
        incomingJobOffer,
        acceptIncomingJob,
        declineIncomingJob,
        simulateAutoDispatch,
        triggerEmergencySos,
        sosAlert,
        clearSosAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
