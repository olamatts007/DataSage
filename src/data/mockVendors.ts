import { VendorProfile } from '../types';

export const INITIAL_MOCK_VENDORS: VendorProfile[] = [
  {
    id: 'v-001',
    name: 'Babajide Emmanuel Adeyemi',
    email: 'babajide.clean@kleenpulse.ng',
    phone: '+234 803 459 1122',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    companyName: 'ShieldPro Environmental & Fumigation Services',
    businessType: 'certified_agency',
    rating: 4.95,
    totalJobs: 342,
    completionRate: 99.1,
    partnerTier: 'Diamond Elite',
    commissionRate: 0.25, // 25% platform fee (75% vendor split - Diamond Elite bonus)
    isOnline: true,
    isBusy: false,
    currentLocation: {
      lat: 6.4490,
      lng: 3.4710,
      address: 'Admiralty Way, Lekki Phase 1, Lagos',
      city: 'Lagos'
    },
    vehicle: {
      type: 'Mobile Disinfection Van',
      plateNumber: 'LND-842-EK',
      model: 'Toyota HiAce LASEPA Rapid Van'
    },
    equipment: [
      'Stihl SR 450 Cold Thermal Mist Fogger',
      'Kärcher Professional Puzzi 10/1 Steam Extractor',
      'Full Face Respirator with 3M Organic Vapor Cartridge 6001',
      'Digital Soil Moisture & Termite Acoustic Detector',
      'Commercial Ozone Bio-Disinfection Machine'
    ],
    verification: {
      policeClearance: {
        id: 'pol-001',
        type: 'police_clearance',
        title: 'NPF Central Criminal Registry Clearance',
        documentNumber: 'NPF-CCR/LG/2024/09841',
        issuer: 'The Nigeria Police Force CID Alagbon, Lagos',
        issuedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Inspector K. Balogun (CRID Unit #4)',
        verifiedAt: '2024-01-16 10:30'
      },
      lasepaAccreditation: {
        id: 'las-001',
        type: 'lasepa_permit',
        title: 'LASEPA Environmental Pest & Chemical Operator License',
        documentNumber: 'LASEPA/PCO/2024/CAT-A/00438',
        issuer: 'Lagos State Environmental Protection Agency (Alausa, Ikeja)',
        issuedDate: '2024-02-01',
        expiryDate: '2025-02-01',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Engr. D. Ogunleye (LASEPA Chemical Safety Directorate)',
        verifiedAt: '2024-02-03 14:15'
      },
      ninVerified: true,
      bvnVerified: true,
      overallStatus: 'cleared_active',
      badgeIssuedAt: '2024-02-03'
    },
    wallet: {
      availableBalanceNGN: 384500,
      escrowBalanceNGN: 48000,
      totalEarnedNGN: 4820000,
      platformFeesPaidNGN: 1446000,
      bankAccount: {
        bankName: 'Wema Bank Plc',
        accountNumber: '0128090787',
        accountName: 'Matoluxx Integrated Services'
      },
      payoutHistory: [
        {
          id: 'pay-001',
          amountNGN: 145000,
          date: '2026-08-18',
          status: 'completed',
          reference: 'NIP/WEMA/KLEEN/29481903',
          bankName: 'Wema Bank Plc'
        },
        {
          id: 'pay-002',
          amountNGN: 210000,
          date: '2026-08-11',
          status: 'completed',
          reference: 'NIP/WEMA/KLEEN/29103984',
          bankName: 'Wema Bank Plc'
        }
      ]
    }
  },
  {
    id: 'v-002',
    name: 'Chioma Grace Okafor',
    email: 'chioma.eco@kleenpulse.ng',
    phone: '+234 812 883 9944',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    companyName: 'Lagos Pristine Cleans & Bio-Shield',
    businessType: 'individual_agent',
    rating: 4.88,
    totalJobs: 198,
    completionRate: 98.4,
    partnerTier: 'Gold',
    commissionRate: 0.28, // 28% platform fee (72% vendor payout)
    isOnline: true,
    isBusy: false,
    currentLocation: {
      lat: 6.4320,
      lng: 3.4280,
      address: 'Ahmadu Bello Way, Victoria Island, Lagos',
      city: 'Lagos'
    },
    vehicle: {
      type: 'Cleaning Crew Van',
      plateNumber: 'KJA-512-AB',
      model: 'Suzuki Every Urban Van'
    },
    equipment: [
      'Rotary Floor Scrubber 17-inch with Nylon Brushes',
      'Industrial HEPA Anti-Allergen Vacuum',
      'Micro-Sprayer Electric Fogger (Child-safe gel formula kit)',
      'Hospital-Grade Bleach & Bio-Enzyme Disinfection Kit'
    ],
    verification: {
      policeClearance: {
        id: 'pol-002',
        type: 'police_clearance',
        title: 'NPF Central Criminal Registry Clearance',
        documentNumber: 'NPF-CCR/LG/2024/11094',
        issuer: 'The Nigeria Police Force CID Alagbon, Lagos',
        issuedDate: '2024-03-10',
        expiryDate: '2025-03-10',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'DSP S. Danjuma (NPF Registry)',
        verifiedAt: '2024-03-11 11:20'
      },
      lasepaAccreditation: {
        id: 'las-002',
        type: 'lasepa_permit',
        title: 'LASEPA Pest Control Operator License',
        documentNumber: 'LASEPA/PCO/2024/CAT-B/00892',
        issuer: 'Lagos State Environmental Protection Agency',
        issuedDate: '2024-03-14',
        expiryDate: '2025-03-14',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Dr. (Mrs) F. Alakija (LASEPA Enforcement)',
        verifiedAt: '2024-03-15 09:40'
      },
      ninVerified: true,
      bvnVerified: true,
      overallStatus: 'cleared_active',
      badgeIssuedAt: '2024-03-15'
    },
    wallet: {
      availableBalanceNGN: 198000,
      escrowBalanceNGN: 22000,
      totalEarnedNGN: 2450000,
      platformFeesPaidNGN: 735000,
      bankAccount: {
        bankName: 'Wema Bank Plc',
        accountNumber: '0128090787',
        accountName: 'Matoluxx Integrated Services'
      },
      payoutHistory: [
        {
          id: 'pay-003',
          amountNGN: 95000,
          date: '2026-08-16',
          status: 'completed',
          reference: 'NIP/WEMA/KLEEN/10948271',
          bankName: 'Wema Bank Plc'
        }
      ]
    }
  },
  {
    id: 'v-003',
    name: 'Musa Abdullahi & Team',
    email: 'musa.fumigate@kleenpulse.ng',
    phone: '+234 802 771 3300',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    companyName: 'Mainland Rapid Pest Destroyers',
    businessType: 'certified_agency',
    rating: 4.92,
    totalJobs: 415,
    completionRate: 99.5,
    partnerTier: 'Diamond Elite',
    commissionRate: 0.25,
    isOnline: true,
    isBusy: false,
    currentLocation: {
      lat: 6.5920,
      lng: 3.3540,
      address: 'Isaac John St, Ikeja GRA, Lagos',
      city: 'Lagos'
    },
    vehicle: {
      type: 'Heavy Fumigation Truck',
      plateNumber: 'AGL-930-YY',
      model: 'Isuzu NPR Chemical Rig'
    },
    equipment: [
      'Heavy-duty Pulse-Jet Thermal Fogger PulsFOG K-10-SP',
      'High-Pressure Termiticide Concrete Injector with 200L Tank',
      'Dual-Stage HEPA Bedbug Heat Extractor',
      'Gas Leak & VOC Atmospheric Safety Monitor'
    ],
    verification: {
      policeClearance: {
        id: 'pol-003',
        type: 'police_clearance',
        title: 'NPF Central Criminal Registry Clearance',
        documentNumber: 'NPF-CCR/LG/2023/88921',
        issuer: 'Nigeria Police Force Alagbon Close',
        issuedDate: '2024-01-20',
        expiryDate: '2025-01-20',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'ASP T. Bello',
        verifiedAt: '2024-01-22 16:00'
      },
      lasepaAccreditation: {
        id: 'las-003',
        type: 'lasepa_permit',
        title: 'LASEPA Master Fumigator Class A Accreditation',
        documentNumber: 'LASEPA/PCO/2023/CAT-A/00109',
        issuer: 'Lagos State Environmental Protection Agency',
        issuedDate: '2024-01-25',
        expiryDate: '2025-01-25',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Sanitarian O. Lawal (LASEPA Chief Inspector)',
        verifiedAt: '2024-01-26 12:00'
      },
      ninVerified: true,
      bvnVerified: true,
      overallStatus: 'cleared_active',
      badgeIssuedAt: '2024-01-26'
    },
    wallet: {
      availableBalanceNGN: 512000,
      escrowBalanceNGN: 65000,
      totalEarnedNGN: 7100000,
      platformFeesPaidNGN: 2130000,
      bankAccount: {
        bankName: 'Wema Bank Plc',
        accountNumber: '0128090787',
        accountName: 'Matoluxx Integrated Services'
      },
      payoutHistory: [
        {
          id: 'pay-004',
          amountNGN: 320000,
          date: '2026-08-19',
          status: 'completed',
          reference: 'NIP/WEMA/KLEEN/55940192',
          bankName: 'Wema Bank Plc'
        }
      ]
    }
  },
  {
    id: 'v-004',
    name: 'Tunde Kehinde',
    email: 'tunde.sparkle@kleenpulse.ng',
    phone: '+234 818 200 4499',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyName: 'Ikoyi Sparkle Cleaners',
    businessType: 'individual_agent',
    rating: 4.82,
    totalJobs: 112,
    completionRate: 97.2,
    partnerTier: 'Silver',
    commissionRate: 0.30, // 30% platform fee (70% vendor payout)
    isOnline: true,
    isBusy: false,
    currentLocation: {
      lat: 6.4520,
      lng: 3.4450,
      address: 'Bourdillon Road, Ikoyi, Lagos',
      city: 'Lagos'
    },
    vehicle: {
      type: 'Rapid Moto-Response',
      plateNumber: 'APP-102-QC',
      model: 'TVS Max 125 Clean Box'
    },
    equipment: [
      'Compact High-Speed Floor Polisher',
      'Microfiber Extraction Mopping Suite',
      'Bio-Safe Anti-Bacterial Citrus Misting Guns'
    ],
    verification: {
      policeClearance: {
        id: 'pol-004',
        type: 'police_clearance',
        title: 'NPF Central Criminal Registry Clearance',
        documentNumber: 'NPF-CCR/LG/2024/30911',
        issuer: 'Nigeria Police Force CID',
        issuedDate: '2024-04-01',
        expiryDate: '2025-04-01',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Inspector K. Balogun',
        verifiedAt: '2024-04-02 11:00'
      },
      lasepaAccreditation: {
        id: 'las-004',
        type: 'lasepa_permit',
        title: 'LASEPA Cleaning Operator Certification',
        documentNumber: 'LASEPA/CL/2024/0912',
        issuer: 'Lagos State Environmental Protection Agency',
        issuedDate: '2024-04-05',
        expiryDate: '2025-04-05',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Engr. D. Ogunleye',
        verifiedAt: '2024-04-06 15:30'
      },
      ninVerified: true,
      bvnVerified: true,
      overallStatus: 'cleared_active',
      badgeIssuedAt: '2024-04-06'
    },
    wallet: {
      availableBalanceNGN: 92000,
      escrowBalanceNGN: 0,
      totalEarnedNGN: 1350000,
      platformFeesPaidNGN: 405000,
      bankAccount: {
        bankName: 'Wema Bank Plc',
        accountNumber: '0128090787',
        accountName: 'Matoluxx Integrated Services'
      },
      payoutHistory: []
    }
  },
  {
    id: 'v-005',
    name: 'Amina Sani & Victoria BioClean',
    email: 'amina.bio@kleenpulse.ng',
    phone: '+234 809 111 7733',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    companyName: 'Victoria Environmental Hazard Controls',
    businessType: 'certified_agency',
    rating: 4.79,
    totalJobs: 84,
    completionRate: 96.0,
    partnerTier: 'Silver',
    commissionRate: 0.30,
    isOnline: false,
    isBusy: false,
    currentLocation: {
      lat: 6.5120,
      lng: 3.3750,
      address: 'Commercial Avenue, Yaba, Lagos',
      city: 'Lagos'
    },
    vehicle: {
      type: 'Cleaning Crew Van',
      plateNumber: 'EKY-772-BC',
      model: 'Ford Transit Cargo'
    },
    equipment: [
      'Industrial Pressure Washer 2500 PSI',
      'Vector Fog ULV Cold Misting Machine',
      'PPE Hazmat Level 2 Suits & 3M Cartridges'
    ],
    verification: {
      policeClearance: {
        id: 'pol-005',
        type: 'police_clearance',
        title: 'NPF Central Criminal Registry Clearance',
        documentNumber: 'NPF-CCR/LG/2024/77402',
        issuer: 'Nigeria Police Force CID Alagbon',
        issuedDate: '2024-05-12',
        expiryDate: '2025-05-12',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        rejectionReason: 'Awaiting updated biometric NIN slip verification'
      },
      lasepaAccreditation: {
        id: 'las-005',
        type: 'lasepa_permit',
        title: 'LASEPA Pest Control Operator License',
        documentNumber: 'LASEPA/PCO/2024/CAT-B/01124',
        issuer: 'Lagos State Environmental Protection Agency',
        issuedDate: '2024-05-15',
        expiryDate: '2025-05-15',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        verifiedBy: 'Dr. (Mrs) F. Alakija',
        verifiedAt: '2024-05-18 10:00'
      },
      ninVerified: true,
      bvnVerified: true,
      overallStatus: 'pending_review',
      badgeIssuedAt: ''
    },
    wallet: {
      availableBalanceNGN: 42000,
      escrowBalanceNGN: 0,
      totalEarnedNGN: 620000,
      platformFeesPaidNGN: 186000,
      bankAccount: {
        bankName: 'Wema Bank Plc',
        accountNumber: '0128090787',
        accountName: 'Matoluxx Integrated Services'
      },
      payoutHistory: []
    }
  }
];
