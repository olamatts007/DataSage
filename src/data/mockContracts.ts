import { ServiceContract } from '../types';
import { SERVICE_PACKAGES, ADD_ON_OPTIONS } from './services';
import { INITIAL_MOCK_VENDORS } from './mockVendors';

export const INITIAL_MOCK_CONTRACTS: ServiceContract[] = [
  {
    id: 'cnt-8801',
    contractCode: 'KLP-SLA-2026-8801',
    title: 'Quarterly LASEPA Certified Industrial Fumigation SLA',
    customerId: 'cust-104',
    customerName: 'Dangote Agro-Allied & Logistics Hub',
    customerPhone: '+234 802 888 7766',
    customerEmail: 'facilities@dangotelogistics.ng',
    address: 'Plot 8, Commercial Road, Ikeja Industrial Estate',
    city: 'Lagos',
    service: SERVICE_PACKAGES[4], // Large-Scale Facility & Silo LASEPA Eco-Fumigation
    selectedAddOns: [],
    propertyDetails: {
      category: 'commercial_large_space',
      propertyType: 'Warehouse / Logistics Bay',
      bedrooms: 0,
      squareMeters: 3500
    },
    frequency: 'quarterly',
    duration: '12_months',
    totalVisits: 4,
    completedVisits: 2,
    assignedVendor: INITIAL_MOCK_VENDORS[2], // Musa Abdullahi & Team
    preferredDayOfWeek: 'Saturday',
    preferredTimeSlot: 'Morning (08:00 - 12:00)',
    financials: {
      standardSingleVisitRateNGN: 680000,
      contractDiscountPercent: 12,
      discountedPerVisitRateNGN: 598400,
      totalContractValueNGN: 2393600,
      totalSavingsNGN: 326400,
      platformCutPerVisitNGN: 179520, // 30% Platform Fee
      vendorPayoutPerVisitNGN: 418880 // 70% Vendor Payout
    },
    visitsSchedule: [
      { visitNumber: 1, scheduledDate: '2026-02-14', status: 'completed', completedAt: '2026-02-14' },
      { visitNumber: 2, scheduledDate: '2026-05-16', status: 'completed', completedAt: '2026-05-16' },
      { visitNumber: 3, scheduledDate: '2026-08-29', status: 'upcoming' },
      { visitNumber: 4, scheduledDate: '2026-11-21', status: 'upcoming' }
    ],
    status: 'active',
    createdAt: '2026-01-10T10:00:00Z',
    startDate: '2026-02-14',
    endDate: '2027-02-14',
    lasepaSlaCertNumber: 'LASEPA/CORP-SLA/2026/LG-8801'
  },
  {
    id: 'cnt-8802',
    contractCode: 'KLP-SLA-2026-8802',
    title: 'Weekly Corporate Office Sparkling Deep Clean Retainer',
    customerId: 'cust-105',
    customerName: 'Fintech Tower Victoria Island',
    customerPhone: '+234 812 900 1122',
    customerEmail: 'admin@fintechtower.ng',
    address: 'Adeola Odeku St, Victoria Island, Lagos',
    city: 'Lagos',
    service: SERVICE_PACKAGES[6], // Deep Cleansing
    selectedAddOns: [ADD_ON_OPTIONS[3]],
    propertyDetails: {
      category: 'commercial_large_space',
      propertyType: 'Commercial Office',
      bedrooms: 0,
      squareMeters: 650
    },
    frequency: 'weekly',
    duration: '6_months',
    totalVisits: 26,
    completedVisits: 14,
    assignedVendor: INITIAL_MOCK_VENDORS[1], // Chioma Grace Okafor
    preferredDayOfWeek: 'Friday',
    preferredTimeSlot: 'Evening / Night Shift (17:00 - 21:00)',
    financials: {
      standardSingleVisitRateNGN: 110000,
      contractDiscountPercent: 20,
      discountedPerVisitRateNGN: 88000,
      totalContractValueNGN: 2288000,
      totalSavingsNGN: 572000,
      platformCutPerVisitNGN: 26400, // 30% Platform Fee
      vendorPayoutPerVisitNGN: 61600 // 70% Vendor Payout
    },
    visitsSchedule: [
      { visitNumber: 13, scheduledDate: '2026-08-14', status: 'completed', completedAt: '2026-08-14' },
      { visitNumber: 14, scheduledDate: '2026-08-21', status: 'completed', completedAt: '2026-08-21' },
      { visitNumber: 15, scheduledDate: '2026-08-28', status: 'upcoming' },
      { visitNumber: 16, scheduledDate: '2026-09-04', status: 'upcoming' }
    ],
    status: 'active',
    createdAt: '2026-05-01T09:00:00Z',
    startDate: '2026-05-15',
    endDate: '2026-11-15',
    lasepaSlaCertNumber: 'LASEPA/CORP-SLA/2026/LG-8802'
  },
  {
    id: 'cnt-8803',
    contractCode: 'KLP-SLA-2026-8803',
    title: 'Bi-Annual Heavy Industrial Plant Overhaul & Decontamination',
    customerId: 'cust-106',
    customerName: 'West African Breweries & Bottling Facility',
    customerPhone: '+234 803 777 4411',
    customerEmail: 'maintenance@wabrew.com',
    address: 'Trans-Amadi Industrial Layout, Port Harcourt',
    city: 'Port Harcourt',
    service: SERVICE_PACKAGES[3], // Industrial Warehouse Power-Scrub
    selectedAddOns: [],
    propertyDetails: {
      category: 'commercial_large_space',
      propertyType: 'Factory / Industrial Plant',
      bedrooms: 0,
      squareMeters: 6000
    },
    frequency: 'bi_annual',
    duration: '12_months',
    totalVisits: 2,
    completedVisits: 1,
    assignedVendor: INITIAL_MOCK_VENDORS[0], // Babajide Adeyemi
    preferredDayOfWeek: 'Sunday',
    preferredTimeSlot: 'Morning (08:00 - 12:00)',
    financials: {
      standardSingleVisitRateNGN: 1150000,
      contractDiscountPercent: 8,
      discountedPerVisitRateNGN: 1058000,
      totalContractValueNGN: 2116000,
      totalSavingsNGN: 184000,
      platformCutPerVisitNGN: 317400, // 30% Platform Fee
      vendorPayoutPerVisitNGN: 740600 // 70% Vendor Payout
    },
    visitsSchedule: [
      { visitNumber: 1, scheduledDate: '2026-03-22', status: 'completed', completedAt: '2026-03-22' },
      { visitNumber: 2, scheduledDate: '2026-09-27', status: 'upcoming' }
    ],
    status: 'active',
    createdAt: '2026-02-15T14:00:00Z',
    startDate: '2026-03-22',
    endDate: '2027-03-22',
    lasepaSlaCertNumber: 'LASEPA/CORP-SLA/2026/LG-8803'
  }
];
