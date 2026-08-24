import { ShortletListing, TurnoverReport } from '../types';

export const INITIAL_MOCK_SHORTLETS: ShortletListing[] = [
  {
    id: 'slet-101',
    name: 'The Grand Oceanview Penthouse (Airbnb Superhost)',
    propertyType: '2-Bedroom Luxury Suite',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    city: 'Lagos',
    bedrooms: 2,
    bathrooms: 2,
    lockboxCode: '7492',
    wifiSsid: 'Oceanview_Guest_5G',
    wifiPassword: 'LekkiSuperhost2026',
    iCalSyncUrl: 'https://airbnb.com/calendar/ical/oceanview-lekki-49210.ics',
    checkoutTime: '11:00 AM',
    checkinTime: '03:00 PM',
    assignedCleanerId: 'v-001',
    amenitiesToRestock: ['Luxury Bathrobes', 'Nespresso Coffee Pods', 'Bottled Water', 'Hand Crafted Soap', 'Fresh Towels'],
    totalTurnoversCompleted: 48,
    guestRatingAvg: 4.96,
    lastCleanedDate: '2026-08-22',
    guestReadyStatus: 'ready'
  },
  {
    id: 'slet-102',
    name: 'Eko Atlantic High-Floor Executive Suite',
    propertyType: '1-Bedroom Penthouse',
    address: 'Eko Boulevard, Eko Atlantic City, Lagos',
    city: 'Lagos',
    bedrooms: 1,
    bathrooms: 1,
    lockboxCode: '8831',
    wifiSsid: 'EkoAtlantic_FastFiber',
    wifiPassword: 'AtlanticVIPStay#',
    iCalSyncUrl: 'https://airbnb.com/calendar/ical/eko-atlantic-8831.ics',
    checkoutTime: '11:00 AM',
    checkinTime: '02:00 PM',
    assignedCleanerId: 'v-002',
    amenitiesToRestock: ['Wine Glasses Polished', 'Mini Bar Restock', 'Shampoo & Conditioner', 'Dental Kit'],
    totalTurnoversCompleted: 62,
    guestRatingAvg: 4.92,
    lastCleanedDate: '2026-08-21',
    guestReadyStatus: 'turnover_needed'
  },
  {
    id: 'slet-103',
    name: 'Ikeja GRA Diplomatic Boutique Apartment',
    propertyType: '3-Bedroom Villa',
    address: 'Isaac John St, Ikeja GRA, Lagos',
    city: 'Lagos',
    bedrooms: 3,
    bathrooms: 3,
    lockboxCode: '5109',
    wifiSsid: 'IkejaGRA_Residence',
    wifiPassword: 'DiplomatSafeClean',
    iCalSyncUrl: 'https://booking.com/ical/ikeja-gra-diplomat-301.ics',
    checkoutTime: '12:00 PM',
    checkinTime: '04:00 PM',
    assignedCleanerId: 'v-003',
    amenitiesToRestock: ['Chef Kitchen Restock', 'Bath Sheets', 'Aromatherapy Diffuser Oil', 'Laundry Detergent Pods'],
    totalTurnoversCompleted: 35,
    guestRatingAvg: 4.89,
    lastCleanedDate: '2026-08-20',
    guestReadyStatus: 'ready'
  }
];

export const INITIAL_MOCK_TURNOVER_REPORTS: TurnoverReport[] = [
  {
    id: 'rep-991',
    bookingId: 'bk-9941',
    listingId: 'slet-101',
    listingName: 'The Grand Oceanview Penthouse (Airbnb Superhost)',
    completedAt: '2026-08-22 13:45',
    cleanerName: 'Babajide Emmanuel Adeyemi (ShieldPro Clean)',
    lockboxSecured: true,
    acAndAppliancesTested: true,
    wifiTestedSpeedMbps: 84.5,
    linenChangedCount: 4,
    toiletriesRestocked: ['Hand Sanitizer', 'Shower Gel', 'Toothbrush Kits', 'Nespresso Pods', '4x Bath Towels'],
    lostAndFoundItems: [
      {
        item: 'Apple AirPods Pro in White MagSafe Case',
        location: 'Master Bedroom Nightstand Drawer 2',
        photoUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80'
      }
    ],
    guestReadyVerificationCode: 'READY-LG-991-OK'
  }
];
