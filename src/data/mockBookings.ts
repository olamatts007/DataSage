import { Booking } from '../types';
import { SERVICE_PACKAGES, ADD_ON_OPTIONS } from './services';
import { INITIAL_MOCK_VENDORS } from './mockVendors';

export const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-9941',
    bookingCode: 'KP-2026-9941',
    completionOtp: '4829',
    customerId: 'cust-101',
    customerName: 'Oluwaseun Adebayo',
    customerPhone: '+234 803 555 8890',
    customerEmail: 'seun.adebayo@gmail.com',
    address: 'Plot 14, Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    lga: 'Eti-Osa LGA',
    countryCode: 'NG',
    coordinates: {
      lat: 6.4474,
      lng: 3.4735
    },
    service: SERVICE_PACKAGES[5], // LASEPA Certified Residential Fumigation
    selectedAddOns: [ADD_ON_OPTIONS[5]], // Drainage larvicide
    propertyDetails: {
      category: 'residential',
      propertyType: 'Duplex',
      bedrooms: 4,
      bathrooms: 4,
      squareMeters: 320,
      infestationLevel: 'Moderate',
      targetPests: ['Mosquitoes', 'Cockroaches', 'Drain Flies']
    },
    fare: {
      baseFareNGN: 35000,
      roomMultiplierNGN: 24000, // 4 rooms * 6000
      addOnsTotalNGN: 15000,
      chemicalEquipmentFeeNGN: 4500,
      surgeMultiplier: 1.0,
      distanceFeeNGN: 1500,
      lasepaSafetyLevyNGN: 1200,
      subtotalNGN: 81200,
      platformFeeNGN: 24360, // 30% Platform Fee
      vendorPayoutNGN: 56840, // 70% Vendor Payout
      taxNGN: 3500,
      tipNGN: 0,
      totalFareNGN: 84700
    },
    status: 'awaiting_customer_satisfaction',
    scheduledTime: 'instant',
    assignedVendor: INITIAL_MOCK_VENDORS[0], // Babajide Adeyemi
    checklists: [
      { id: 'chk-1', title: 'Food & edible items sealed in airtight containers', category: 'prep', completed: true, photoRequired: true, photoUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&auto=format&fit=crop&q=80', timestamp: '14:02' },
      { id: 'chk-2', title: 'Pets & occupants evacuated from building', category: 'prep', completed: true, photoRequired: false, timestamp: '14:08' },
      { id: 'chk-3', title: 'LASEPA Class II chemical PyreSafe-25 batch verified', category: 'safety', completed: true, photoRequired: true, timestamp: '14:15' },
      { id: 'chk-4', title: 'Interior thermal fogging completed across 4 bedrooms & living room', category: 'execution', completed: true, photoRequired: true, timestamp: '14:45' },
      { id: 'chk-5', title: 'External drainage perimeter larvicide barrier applied', category: 'execution', completed: true, photoRequired: false, timestamp: '15:10' },
      { id: 'chk-6', title: 'Windows sealed for active chemical dwell time', category: 'safety', completed: true, photoRequired: false, timestamp: '15:20' },
      { id: 'chk-7', title: 'Premises ventilation & atmospheric clearance check', category: 'handover', completed: true, photoRequired: true, timestamp: '15:50' }
    ],
    proofPhotos: [
      {
        id: 'pf-1',
        roomOrArea: 'Living Room & Dining Area',
        type: 'after',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80',
        caption: 'Thermal mist complete and ventilated. Odor dissipated.',
        timestamp: '15:42'
      },
      {
        id: 'pf-2',
        roomOrArea: 'Kitchen & Pantry Cabinet Baseboards',
        type: 'chemical_applied',
        url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
        caption: 'Food safe gel bait applied in corner crevices without food exposure.',
        timestamp: '15:30'
      },
      {
        id: 'pf-3',
        roomOrArea: 'Compound Drainage & Gutter Grates',
        type: 'after',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
        caption: 'Larvicide biological tablet placed to stop mosquito breeding.',
        timestamp: '15:15'
      }
    ],
    chemicalRecord: {
      chemicalName: 'PyreSafe-25 Ultra EC (Permethrin 250 g/L)',
      activeIngredient: 'Permethrin 25% + Piperonyl Butoxide',
      lasepaBatchNumber: 'LASEPA/CHEM/2024/LG-902',
      epaRegistration: 'WHO/PQ/VCP-0091',
      dilutionRatio: '1:50 with Deodorized Solvent',
      targetPest: 'Mosquitoes, Cockroaches, Perimeter Vectors',
      reentryHours: 3.5,
      ppeUsed: ['3M Organic Vapor Respirator 6001', 'Nitrile Chemical Gauntlets', 'Hazmat Tyvek Suit'],
      safetyCertIssued: true
    },
    reentrySafeTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timestamps: {
      createdAt: '2026-08-22T13:45:00Z',
      assignedAt: '2026-08-22T13:46:12Z',
      enRouteAt: '2026-08-22T13:48:00Z',
      arrivedAt: '2026-08-22T14:00:00Z',
      startedAt: '2026-08-22T14:15:00Z',
      submittedForInspectionAt: '2026-08-22T15:55:00Z'
    },
    payment: {
      method: 'paystack_card',
      status: 'escrow_locked',
      transactionRef: 'PSTK_KP_994102941'
    }
  },
  {
    id: 'bk-9942',
    bookingCode: 'KP-2026-9942',
    completionOtp: '7104',
    customerId: 'cust-104',
    customerName: 'Dangote Agro-Allied & Logistics Hub',
    customerPhone: '+234 802 888 7766',
    customerEmail: 'facilities@dangotelogistics.ng',
    address: 'Plot 8, Commercial Road, Ikeja Industrial Estate',
    city: 'Lagos',
    lga: 'Ikeja LGA',
    countryCode: 'NG',
    coordinates: {
      lat: 6.5920,
      lng: 3.3540
    },
    service: SERVICE_PACKAGES[3], // Industrial Warehouse & Logistics Bay Power-Scrub
    selectedAddOns: [ADD_ON_OPTIONS[3]],
    propertyDetails: {
      category: 'commercial_large_space',
      propertyType: 'Warehouse / Logistics Bay',
      bedrooms: 0,
      bathrooms: 0,
      squareMeters: 2500,
      ceilingHeightMeters: 8,
      infestationLevel: 'Moderate',
      targetPests: ['Warehouse Beetles', 'Rodents / Rats'],
      industrialSpecs: {
        baysCount: 4,
        hasHeavyOilGrease: true,
        requiresScissorLift: true,
        requiresBiohazardDisposal: true
      }
    },
    fare: {
      baseFareNGN: 60000,
      roomMultiplierNGN: 0,
      squareMeterRateAppliedNGN: 160,
      squareMetersCalculated: 2500,
      squareMeterGrossNGN: 448000,
      volumeDiscountNGN: 80640,
      addOnsTotalNGN: 12000,
      chemicalEquipmentFeeNGN: 15000,
      surgeMultiplier: 1.0,
      distanceFeeNGN: 4000,
      lasepaSafetyLevyNGN: 6410,
      subtotalNGN: 464770,
      platformFeeNGN: 139431, // 30% Platform Fee
      vendorPayoutNGN: 325339, // 70% Vendor Payout
      taxNGN: 23238,
      tipNGN: 0,
      totalFareNGN: 488008
    },
    status: 'awaiting_customer_satisfaction',
    scheduledTime: 'instant',
    assignedVendor: INITIAL_MOCK_VENDORS[2], // Musa Abdullahi & Team
    checklists: [
      { id: 'ci-1', title: 'Ride-on heavy rotary scrubber degreasing of all 4 bays', category: 'execution', completed: true, photoRequired: true, timestamp: '11:20' },
      { id: 'ci-2', title: 'High-bay ceiling truss & rafter HEPA vacuuming via scissor lift', category: 'execution', completed: true, photoRequired: true, timestamp: '12:45' },
      { id: 'ci-3', title: 'Epoxy floor diamond buff and sealant application', category: 'execution', completed: true, photoRequired: true, timestamp: '14:10' },
      { id: 'ci-4', title: 'LASEPA industrial effluent disposal manifest signed', category: 'safety', completed: true, photoRequired: true, timestamp: '14:50' }
    ],
    proofPhotos: [
      {
        id: 'pf-ind-1',
        roomOrArea: 'Logistics Bay 1 & 2 Loading Docks',
        type: 'after',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
        caption: '2,500 m² floor degreased, tire marks removed, epoxy buffed.',
        timestamp: '14:30'
      }
    ],
    timestamps: {
      createdAt: '2026-08-22T08:00:00Z',
      assignedAt: '2026-08-22T08:05:00Z',
      enRouteAt: '2026-08-22T08:15:00Z',
      arrivedAt: '2026-08-22T08:45:00Z',
      startedAt: '2026-08-22T09:00:00Z',
      submittedForInspectionAt: '2026-08-22T15:00:00Z'
    },
    payment: {
      method: 'bank_transfer',
      status: 'escrow_locked',
      transactionRef: 'BNK_KP_994200192'
    }
  },
  {
    id: 'bk-9940',
    bookingCode: 'KP-2026-9940',
    completionOtp: '9134',
    customerId: 'cust-102',
    customerName: 'Dr. Folake Davies-Okoro',
    customerPhone: '+234 814 990 2211',
    customerEmail: 'folake.davies@lagosmed.org',
    address: '18 Isaac John Street, GRA Ikeja',
    city: 'Lagos',
    lga: 'Ikeja LGA',
    countryCode: 'NG',
    coordinates: {
      lat: 6.5898,
      lng: 3.3572
    },
    service: SERVICE_PACKAGES[6], // Deep Cleansing
    selectedAddOns: [ADD_ON_OPTIONS[3], ADD_ON_OPTIONS[4]],
    propertyDetails: {
      category: 'residential',
      propertyType: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 180
    },
    fare: {
      baseFareNGN: 28000,
      roomMultiplierNGN: 16500,
      addOnsTotalNGN: 20500,
      chemicalEquipmentFeeNGN: 3500,
      surgeMultiplier: 1.0,
      distanceFeeNGN: 1000,
      lasepaSafetyLevyNGN: 0,
      subtotalNGN: 69500,
      platformFeeNGN: 20850, // 30% Platform Fee
      vendorPayoutNGN: 48650, // 70% Vendor Payout
      taxNGN: 3000,
      tipNGN: 4000,
      totalFareNGN: 76500
    },
    status: 'completed',
    scheduledTime: 'instant',
    assignedVendor: INITIAL_MOCK_VENDORS[1], // Chioma Grace Okafor
    checklists: [
      { id: 'c1', title: 'Tile grout steam sanitization', category: 'execution', completed: true, photoRequired: true, timestamp: '10:30' },
      { id: 'c2', title: 'Kitchen hood degreasing and carbon removal', category: 'execution', completed: true, photoRequired: true, timestamp: '11:15' },
      { id: 'c3', title: '3-Piece Living Room Sofa hot water extraction', category: 'execution', completed: true, photoRequired: true, timestamp: '11:55' },
      { id: 'c4', title: 'Internal refrigerator hospital-grade sanitization', category: 'execution', completed: true, photoRequired: false, timestamp: '12:20' }
    ],
    proofPhotos: [
      {
        id: 'pf-4',
        roomOrArea: 'Kitchen Hood & Tile Grout',
        type: 'after',
        url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=80',
        caption: 'Steam descaling complete. 100% grease extracted.',
        timestamp: '12:15'
      }
    ],
    satisfactionSignoff: {
      isSatisfied: true,
      confirmedAt: '2026-08-21T13:05:00Z',
      approvedByCustomerName: 'Dr. Folake Davies-Okoro',
      checklistVerified: true,
      completionMethod: '4_digit_otp_verification',
      customerNotes: 'All surfaces sparkling clean and smell citrus-fresh.'
    },
    timestamps: {
      createdAt: '2026-08-21T09:30:00Z',
      assignedAt: '2026-08-21T09:31:00Z',
      enRouteAt: '2026-08-21T09:35:00Z',
      arrivedAt: '2026-08-21T09:50:00Z',
      startedAt: '2026-08-21T10:00:00Z',
      submittedForInspectionAt: '2026-08-21T12:55:00Z',
      completedAt: '2026-08-21T13:05:00Z'
    },
    rating: {
      stars: 5,
      cleanlinessRating: 5,
      safetyComplianceRating: 5,
      punctualityRating: 5,
      comment: 'Super thorough! Chioma and her team showed up in pristine uniforms with LASEPA badges and police clearance ID cards. My living room tiles are literally sparkling like new.',
      createdAt: '2026-08-21T13:10:00Z'
    },
    payment: {
      method: 'paystack_card',
      status: 'paid_and_settled',
      transactionRef: 'PSTK_KP_994018274',
      escrowReleasedAt: '2026-08-21T13:05:00Z'
    }
  }
];
