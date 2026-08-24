export type UserRole = 'customer' | 'vendor' | 'admin' | 'regulator_lasepa';

export type CountryCode = 'NG' | 'GH' | 'KE' | 'ZA' | 'RW';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToNGN: number;
  flag: string;
  policeAgency: string;
  policeCertificateName: string;
  environmentalAgency: string;
  environmentalPermitName: string;
  majorCities: string[];
  sampleLocations: Array<{ name: string; city: string; lat: number; lng: number }>;
}

export type PricingModel = 'residential_room' | 'square_meter_industrial' | 'airbnb_turnover' | 'hybrid';

export type ContractFrequency = 'one_off' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'bi_annual';

export type ContractDuration = 'single_visit' | '3_months' | '6_months' | '12_months';

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  category: 'cleaning' | 'fumigation' | 'specialized' | 'industrial' | 'shortlet_hospitality';
  pricingModel: PricingModel;
  basePriceNGN: number;
  perRoomRateNGN: number;
  perSquareMeterRateNGN: number;
  requiresLasepaCert: boolean;
  requiresPoliceCert: boolean;
  icon: string;
  description: string;
  recommendedInterval: string;
  lasepaApprovedChemicals?: string[];
  safetyVentilationHours?: number;
  features: string[];
  industrialSpecs?: {
    minimumSquareMeters: number;
    volumeDiscounts: Array<{ minSqm: number; discountPercent: number }>;
    supportedFacilities: string[];
    specialistEquipment: string[];
  };
}

export interface AddOnOption {
  id: string;
  name: string;
  priceNGN: number;
  category: 'cleaning' | 'fumigation' | 'gear' | 'industrial' | 'hospitality';
  description: string;
  icon: string;
}

export interface VerificationDocument {
  id: string;
  type: 'police_clearance' | 'lasepa_permit' | 'nin_bvn' | 'cac_certificate' | 'chemical_safety_msds';
  title: string;
  documentNumber: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  fileUrl: string;
  status: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  companyName?: string;
  businessType: 'individual_agent' | 'certified_agency';
  rating: number;
  totalJobs: number;
  completionRate: number;
  partnerTier: 'Silver' | 'Gold' | 'Diamond Elite';
  commissionRate: number; // 0.30 for 30% platform cut, 70% vendor payout
  isOnline: boolean;
  isBusy: boolean;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  vehicle: {
    type: 'Mobile Disinfection Van' | 'Rapid Moto-Response' | 'Heavy Fumigation Truck' | 'Cleaning Crew Van' | 'Industrial Rig Trailer';
    plateNumber: string;
    model: string;
  };
  equipment: string[];
  verification: {
    policeClearance: VerificationDocument;
    lasepaAccreditation: VerificationDocument;
    ninVerified: boolean;
    bvnVerified: boolean;
    overallStatus: 'cleared_active' | 'pending_review' | 'action_required' | 'suspended';
    badgeIssuedAt: string;
  };
  wallet: {
    availableBalanceNGN: number;
    escrowBalanceNGN: number;
    totalEarnedNGN: number;
    platformFeesPaidNGN: number;
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
    payoutHistory: Array<{
      id: string;
      amountNGN: number;
      date: string;
      status: 'completed' | 'processing';
      reference: string;
      bankName: string;
    }>;
  };
}

export interface BookingFareBreakdown {
  baseFareNGN: number;
  roomMultiplierNGN: number;
  squareMeterRateAppliedNGN?: number;
  squareMetersCalculated?: number;
  squareMeterGrossNGN?: number;
  volumeDiscountNGN?: number;
  contractDiscountNGN?: number;
  addOnsTotalNGN: number;
  chemicalEquipmentFeeNGN: number;
  surgeMultiplier: number;
  distanceFeeNGN: number;
  lasepaSafetyLevyNGN: number;
  subtotalNGN: number;
  platformFeeNGN: number; // 30% Platform share
  vendorPayoutNGN: number; // 70% Vendor share
  taxNGN: number;
  tipNGN: number;
  totalFareNGN: number;
}

export interface BookingChecklistItem {
  id: string;
  title: string;
  category: 'prep' | 'execution' | 'safety' | 'handover' | 'hospitality_restock';
  completed: boolean;
  photoRequired: boolean;
  photoUrl?: string;
  timestamp?: string;
}

export interface ProofPhoto {
  id: string;
  roomOrArea: string;
  type: 'before' | 'after' | 'chemical_applied' | 'damage_report' | 'lost_and_found' | 'restock_linen';
  url: string;
  caption: string;
  timestamp: string;
}

export interface SatisfactionSignoff {
  isSatisfied: boolean;
  confirmedAt?: string;
  approvedByCustomerName?: string;
  checklistVerified: boolean;
  completionMethod: 'in_app_authorization' | '4_digit_otp_verification';
  customerNotes?: string;
  touchUpRequested?: boolean;
  touchUpDetails?: string;
}

export interface ChemicalUsageRecord {
  chemicalName: string;
  activeIngredient: string;
  lasepaBatchNumber: string;
  epaRegistration: string;
  dilutionRatio: string;
  targetPest: string;
  reentryHours: number;
  ppeUsed: string[];
  safetyCertIssued: boolean;
}

export type PropertyCategory = 'residential' | 'commercial_large_space' | 'shortlet_airbnb_hotel';

export type BookingStatus =
  | 'searching_agent'
  | 'agent_assigned'
  | 'agent_en_route'
  | 'agent_arrived'
  | 'pre_service_inspection'
  | 'service_in_progress'
  | 'chemical_evacuation_active'
  | 'awaiting_customer_satisfaction'
  | 'touch_up_in_progress'
  | 'completed'
  | 'cancelled';

export interface ShortletListing {
  id: string;
  name: string;
  propertyType: 'Studio Apartment' | '1-Bedroom Penthouse' | '2-Bedroom Luxury Suite' | '3-Bedroom Villa' | 'Boutique Hotel Room Suite';
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  lockboxCode: string;
  wifiSsid: string;
  wifiPassword: string;
  iCalSyncUrl?: string;
  checkoutTime: string;
  checkinTime: string;
  assignedCleanerId?: string;
  amenitiesToRestock: string[];
  totalTurnoversCompleted: number;
  guestRatingAvg: number;
  lastCleanedDate: string;
  guestReadyStatus: 'ready' | 'turnover_needed' | 'in_progress';
}

export interface TurnoverReport {
  id: string;
  bookingId: string;
  listingId: string;
  listingName: string;
  completedAt: string;
  cleanerName: string;
  lockboxSecured: boolean;
  acAndAppliancesTested: boolean;
  wifiTestedSpeedMbps: number;
  linenChangedCount: number;
  toiletriesRestocked: string[];
  damageReported?: Array<{ item: string; description: string; photoUrl: string }>;
  lostAndFoundItems?: Array<{ item: string; location: string; photoUrl: string }>;
  guestReadyVerificationCode: string;
}

export interface ContractVisitSchedule {
  visitNumber: number;
  scheduledDate: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'rescheduled';
  bookingId?: string;
  completedAt?: string;
}

export interface ServiceContract {
  id: string;
  contractCode: string;
  title: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  service: ServicePackage;
  selectedAddOns: AddOnOption[];
  propertyDetails: {
    category: PropertyCategory;
    propertyType: string;
    bedrooms: number;
    squareMeters: number;
  };
  frequency: ContractFrequency;
  duration: ContractDuration;
  totalVisits: number;
  completedVisits: number;
  assignedVendor?: VendorProfile;
  preferredDayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  preferredTimeSlot: 'Morning (08:00 - 12:00)' | 'Afternoon (12:00 - 16:00)' | 'Evening / Night Shift (17:00 - 21:00)';
  financials: {
    standardSingleVisitRateNGN: number;
    contractDiscountPercent: number;
    discountedPerVisitRateNGN: number;
    totalContractValueNGN: number;
    totalSavingsNGN: number;
    platformCutPerVisitNGN: number; // 30%
    vendorPayoutPerVisitNGN: number; // 70%
  };
  visitsSchedule: ContractVisitSchedule[];
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
  startDate: string;
  endDate: string;
  lasepaSlaCertNumber: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  contractId?: string;
  contractVisitNumber?: number;
  shortletListingId?: string;
  turnoverReport?: TurnoverReport;
  completionOtp: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  lga: string;
  countryCode: CountryCode;
  coordinates: {
    lat: number;
    lng: number;
  };
  service: ServicePackage;
  selectedAddOns: AddOnOption[];
  propertyDetails: {
    category: PropertyCategory;
    propertyType: 'Apartment' | 'Duplex' | 'Mansion' | 'Commercial Office' | 'Warehouse / Logistics Bay' | 'Factory / Industrial Plant' | 'Event Center & Hall' | 'Agricultural Silo / Storage' | 'Airbnb / Short-Let Suite' | 'Hotel Room Floor';
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    ceilingHeightMeters?: number;
    infestationLevel?: 'Low / Preventive' | 'Moderate' | 'Severe / Emergency';
    targetPests?: string[];
    shortletSpecs?: {
      guestCheckoutTime?: string;
      nextGuestCheckinTime?: string;
      lockboxCode?: string;
      hostSpecialInstructions?: string;
      restockItems?: string[];
    };
    industrialSpecs?: {
      baysCount?: number;
      hasHeavyOilGrease?: boolean;
      requiresScissorLift?: boolean;
      requiresBiohazardDisposal?: boolean;
    };
  };
  fare: BookingFareBreakdown;
  status: BookingStatus;
  scheduledTime: 'instant' | string;
  assignedVendor?: VendorProfile;
  checklists: BookingChecklistItem[];
  proofPhotos: ProofPhoto[];
  satisfactionSignoff?: SatisfactionSignoff;
  chemicalRecord?: ChemicalUsageRecord;
  reentrySafeTimestamp?: string;
  timestamps: {
    createdAt: string;
    assignedAt?: string;
    enRouteAt?: string;
    arrivedAt?: string;
    startedAt?: string;
    submittedForInspectionAt?: string;
    completedAt?: string;
  };
  rating?: {
    stars: number;
    cleanlinessRating: number;
    safetyComplianceRating: number;
    punctualityRating: number;
    comment: string;
    createdAt: string;
  };
  payment: {
    method: 'paystack_card' | 'bank_transfer' | 'kleen_wallet' | 'cash_on_arrival';
    status: 'escrow_locked' | 'paid_and_settled' | 'refunded' | 'touch_up_hold';
    transactionRef: string;
    escrowReleasedAt?: string;
  };
}

export interface SurgeConfig {
  isActive: boolean;
  multiplier: number;
  reason: string;
  affectedZones: string[];
}
