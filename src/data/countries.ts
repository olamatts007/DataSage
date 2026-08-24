import { CountryConfig } from '../types';

export const COUNTRIES: Record<string, CountryConfig> = {
  NG: {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    exchangeRateToNGN: 1,
    flag: '🇳🇬',
    policeAgency: 'Nigeria Police Force (NPF / CRID)',
    policeCertificateName: 'NPF Central Criminal Registry Character Certificate',
    environmentalAgency: 'LASEPA (Lagos State Environmental Protection Agency)',
    environmentalPermitName: 'LASEPA Pest Control & Chemical Operator License',
    majorCities: ['Lagos', 'Abuja FCT', 'Port Harcourt', 'Ibadan', 'Benin City', 'Enugu'],
    sampleLocations: [
      { name: 'Admiralty Way, Lekki Phase 1, Lagos', city: 'Lagos', lat: 6.4474, lng: 3.4735 },
      { name: 'Adeola Odeku St, Victoria Island, Lagos', city: 'Lagos', lat: 6.4281, lng: 3.4219 },
      { name: 'Isaac John St, GRA Ikeja, Lagos', city: 'Lagos', lat: 6.5898, lng: 3.3572 },
      { name: 'Bourdillon Road, Ikoyi, Lagos', city: 'Lagos', lat: 6.4549, lng: 3.4418 },
      { name: 'Herbert Macaulay Way, Yaba, Lagos', city: 'Lagos', lat: 6.5095, lng: 3.3711 },
      { name: 'Festac Town 21 Road, Amuwo Odofin, Lagos', city: 'Lagos', lat: 6.4716, lng: 3.2927 },
      { name: 'Maitama District, Abuja FCT', city: 'Abuja FCT', lat: 9.0882, lng: 7.4984 },
      { name: 'Trans-Amadi Industrial Layout, Port Harcourt', city: 'Port Harcourt', lat: 4.8156, lng: 7.0498 }
    ]
  },
  GH: {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    exchangeRateToNGN: 0.011, // ~ 100 NGN = 1.1 GHS
    flag: '🇬🇭',
    policeAgency: 'Ghana Police Service CID',
    policeCertificateName: 'Police Clearance Certificate (CID Form 14)',
    environmentalAgency: 'Environmental Protection Agency (EPA Ghana)',
    environmentalPermitName: 'EPA Pesticides & Vector Control Operator Permit',
    majorCities: ['Accra', 'Kumasi', 'Takoradi', 'Tema'],
    sampleLocations: [
      { name: 'Airport Residential Area, Accra', city: 'Accra', lat: 5.6037, lng: -0.1870 },
      { name: 'East Legon Hills, Accra', city: 'Accra', lat: 5.6358, lng: -0.1580 },
      { name: 'Cantonments, Accra', city: 'Accra', lat: 5.5786, lng: -0.1742 }
    ]
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    exchangeRateToNGN: 0.095,
    flag: '🇰🇪',
    policeAgency: 'Directorate of Criminal Investigations (DCI Kenya)',
    policeCertificateName: 'DCI Police Clearance Certificate (Certificate of Good Conduct)',
    environmentalAgency: 'NEMA Kenya & Pest Control Products Board (PCPB)',
    environmentalPermitName: 'PCPB Commercial Pest Control Operator License',
    majorCities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
    sampleLocations: [
      { name: 'Westlands, Nairobi', city: 'Nairobi', lat: -1.2674, lng: 36.8110 },
      { name: 'Kilimani, Nairobi', city: 'Nairobi', lat: -1.2921, lng: 36.7876 },
      { name: 'Karen, Nairobi', city: 'Nairobi', lat: -1.3197, lng: 36.7065 }
    ]
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    exchangeRateToNGN: 0.013,
    flag: '🇿🇦',
    policeAgency: 'South African Police Service (SAPS)',
    policeCertificateName: 'SAPS Criminal Record Centre Clearance Certificate',
    environmentalAgency: 'Dept of Forestry, Fisheries & Environment (DFFE) & SAPCA',
    environmentalPermitName: 'SAPCA Registered Pest Control Operator (PCO Act 36)',
    majorCities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
    sampleLocations: [
      { name: 'Sandton City, Johannesburg', city: 'Johannesburg', lat: -26.1076, lng: 28.0567 },
      { name: 'Rosebank, Johannesburg', city: 'Johannesburg', lat: -26.1465, lng: 28.0416 },
      { name: 'Sea Point, Cape Town', city: 'Cape Town', lat: -33.9167, lng: 18.3917 }
    ]
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'FRw',
    exchangeRateToNGN: 0.92,
    flag: '🇷🇼',
    policeAgency: 'Rwanda National Police (RNP)',
    policeCertificateName: 'RNP Casier Judiciaire Clearance Certificate',
    environmentalAgency: 'Rwanda Environment Management Authority (REMA)',
    environmentalPermitName: 'REMA Eco-Sanitation & Chemical Compliance Cert',
    majorCities: ['Kigali', 'Rubavu', 'Musanze', 'Huye'],
    sampleLocations: [
      { name: 'Kiyovu, Kigali', city: 'Kigali', lat: -1.9544, lng: 30.0619 },
      { name: 'Nyarutarama, Kigali', city: 'Kigali', lat: -1.9360, lng: 30.1030 },
      { name: 'Kimihurura, Kigali', city: 'Kigali', lat: -1.9536, lng: 30.0897 }
    ]
  }
};
