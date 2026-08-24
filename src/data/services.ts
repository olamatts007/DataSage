import { ServicePackage, AddOnOption } from '../types';

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'airbnb_same_day_turnover',
    name: 'Airbnb & Short-Let Express Guest Turnover (11am - 3pm)',
    tagline: 'Guaranteed 2-hour guest-ready turnaround, hotel linen swap & restock',
    category: 'shortlet_hospitality',
    pricingModel: 'airbnb_turnover',
    basePriceNGN: 22000,
    perRoomRateNGN: 4000,
    perSquareMeterRateNGN: 130,
    requiresLasepaCert: false,
    requiresPoliceCert: true,
    icon: 'Key',
    description: 'Rapid turnaround service calibrated for Airbnb hosts and short-let operators in Lagos. Includes hotel hospital-corners bed making, fresh linen swap, bathroom sanitization, refrigerator clean-out, trash disposal, lockbox code check, Wi-Fi test, and Lost & Found digital report with photo proof.',
    recommendedInterval: 'Per Guest Checkout (Auto-Turnover)',
    features: [
      'Guaranteed 120-minute turnaround between 11:00 AM checkout and 3:00 PM check-in',
      'Hotel-grade bed making & fresh linen/towel setup',
      'Toiletries & amenities restocking checklist with host photo audit',
      'Instant Damage & Lost & Found photographic reporting',
      'Lockbox code reset and Wi-Fi speed performance validation'
    ]
  },
  {
    id: 'shortlet_ozone_odor_sanitization',
    name: 'Short-Let Bio-Ozone Sanitization & Odor Knockout',
    tagline: 'Eliminates cigarette smoke, cooking grease & deep mattress sanitization',
    category: 'shortlet_hospitality',
    pricingModel: 'airbnb_turnover',
    basePriceNGN: 32000,
    perRoomRateNGN: 5000,
    perSquareMeterRateNGN: 150,
    requiresLasepaCert: true,
    requiresPoliceCert: true,
    icon: 'Sparkles',
    description: 'Intensive air and fiber deodorization for party-damaged or smoker-occupied shortlets. Uses commercial Ozone generators and hospital-grade citrus bio-misting to eliminate stubborn odors within 60 minutes.',
    recommendedInterval: 'Between Heavy Guest Stays',
    safetyVentilationHours: 1.5,
    features: [
      'Commercial High-Output Ozone Generator 10,000mg/h treatment',
      'Upholstery and curtain bio-enzyme odor neutralization',
      'Deep kitchen grease and refrigerator carbon descale',
      'Official "Guest-Safe & Allergen-Free" verification badge for listing'
    ]
  },
  {
    id: 'boutique_hotel_daily_shift',
    name: 'Boutique Hotel & Service Apartment Daily Housekeeping SLA',
    tagline: 'Dedicated vetted shift crew for multi-room hotel floors',
    category: 'shortlet_hospitality',
    pricingModel: 'residential_room',
    basePriceNGN: 55000,
    perRoomRateNGN: 3000,
    perSquareMeterRateNGN: 120,
    requiresLasepaCert: true,
    requiresPoliceCert: true,
    icon: 'Building',
    description: 'Turnkey hotel housekeeping team deployment. Cleaners arrive in standardized uniform with LASEPA-certified hygiene badges to service guest rooms, corridors, lobby areas, and laundry.',
    recommendedInterval: 'Daily / Weekly Retainer',
    features: [
      'Multi-person police-vetted hospitality crew',
      'Room-by-room standardized guest amenities replenishing',
      'Corridor carpet steam extraction and lobby deodorizing',
      'LASEPA Hospitality Hygiene Compliance Certificate'
    ]
  },
  {
    id: 'industrial_warehouse_deep_clean',
    name: 'Industrial Warehouse & Logistics Bay Power-Scrub',
    tagline: 'Cost-reflective per m² heavy scrubbing, degreasing & epoxy floor shine',
    category: 'industrial',
    pricingModel: 'square_meter_industrial',
    basePriceNGN: 60000,
    perRoomRateNGN: 0,
    perSquareMeterRateNGN: 160,
    requiresLasepaCert: true,
    requiresPoliceCert: true,
    icon: 'Factory',
    description: 'Industrial-grade deep transformation for distribution centers, manufacturing bays, and logistics facilities. Uses ride-on rotary scrubbers, industrial degreasers, high-pressure washers, and oil-spill bio-enzymes.',
    recommendedInterval: 'Quarterly / Semi-Annual Contract',
    safetyVentilationHours: 2.0,
    features: [
      'Cost-reflective tiered m² pricing with economy-of-scale volume discounts',
      'Ride-on industrial scrubbing machines & wet extraction suite',
      'Forklift tire mark removal & machine oil spill neutralization',
      'LASEPA Industrial Effluent & Wastewater Haulage Compliance Manifest',
      'High-bay safety certified crew with full PPE and harness rigs'
    ],
    industrialSpecs: {
      minimumSquareMeters: 250,
      volumeDiscounts: [
        { minSqm: 500, discountPercent: 10 },
        { minSqm: 2000, discountPercent: 18 },
        { minSqm: 5000, discountPercent: 25 }
      ],
      supportedFacilities: ['Logistics Warehouses', 'Manufacturing Plants', 'FMCG Distribution Bays', 'Aircraft Hangars'],
      specialistEquipment: ['Kärcher B 250 R Ride-On Scrubber', '3000 PSI Hot-Water Pressure Rig', 'Scissor Lift High-Access Harness']
    }
  },
  {
    id: 'large_scale_silo_fumigation',
    name: 'Large-Scale Facility & Silo LASEPA Eco-Fumigation',
    tagline: 'Cost-reflective per m² thermal fogging, vector barrier & grain pest shield',
    category: 'fumigation',
    pricingModel: 'square_meter_industrial',
    basePriceNGN: 75000,
    perRoomRateNGN: 0,
    perSquareMeterRateNGN: 190,
    requiresLasepaCert: true,
    requiresPoliceCert: true,
    icon: 'Flame',
    description: 'LASEPA Class-A certified high-volume aerosol fogging for warehouses, agricultural silos, food packaging factories, and event centers. Eliminates weevils, rodents, beetles, and perimeter vectors.',
    recommendedInterval: 'Every 3 Months',
    safetyVentilationHours: 4.0,
    lasepaApprovedChemicals: ['PyreSafe-25 Ultra EC Industrial (Permethrin 25%)', 'Chlorfenapyr 240 SC', 'Aluminium Phosphide Pelletised (Silo Airtight Only)'],
    features: [
      'Cost-reflective per square meter scale for 500 m² to 20,000+ m²',
      'Trailer-mounted high-displacement pulse-jet thermal foggers',
      'Non-toxic kitchen/food-grade perimeter rodent baiting stations',
      'LASEPA Class-A Official Chemical Certification & Gas Clearance Audit',
      '90-Day Industrial Anti-Reinfestation Warranty Guarantee'
    ],
    industrialSpecs: {
      minimumSquareMeters: 300,
      volumeDiscounts: [
        { minSqm: 1000, discountPercent: 12 },
        { minSqm: 3000, discountPercent: 20 },
        { minSqm: 6000, discountPercent: 28 }
      ],
      supportedFacilities: ['Food Processing Plants', 'Grain Silos & Agritech Hubs', 'Pharmaceutical Storage', 'Event Pavilions'],
      specialistEquipment: ['PulsFOG K-30-SP High Output Cannon', 'Digital VOC Toxic Gas Clearance Monitor', 'SCBA Hazmat Respirator Suite']
    }
  },
  {
    id: 'lasepa_fumigation_standard',
    name: 'LASEPA Certified Residential Fumigation',
    tagline: 'Eco-safe chemical fogging, residual barrier & vector eradication',
    category: 'fumigation',
    pricingModel: 'residential_room',
    basePriceNGN: 35000,
    perRoomRateNGN: 6000,
    perSquareMeterRateNGN: 180,
    requiresLasepaCert: true,
    requiresPoliceCert: true,
    icon: 'ShieldAlert',
    description: 'Full interior & perimeter fogging by LASEPA accredited chemical handlers. Destroys mosquitoes, cockroaches, rodents, spiders, and silverfish using WHO/LASEPA Class-II biodegradable pyrethroids.',
    recommendedInterval: 'Every 3 Months',
    safetyVentilationHours: 3.5,
    lasepaApprovedChemicals: ['Permethrin 25% EC (LASEPA Reg: 2024/PC/089)', 'Cypermethrin 10% WP (BioSafe Class II)', 'Hydramethylnon Bait Gels (Child-safe kitchen formula)'],
    features: [
      'LASEPA Environmental Safety Compliance Certificate',
      'Cold thermal ULV fogging + residual perimeter barrier',
      'Child & pet-safe kitchen gel baiting (no food contamination)',
      'Pre-treatment safety protocol & post-spray ventilation audit',
      '3-Month Anti-Infestation Warranty Guarantee'
    ]
  },
  {
    id: 'deep_clean_sanitization',
    name: 'Deep Cleansing & Intensive Sanitization',
    tagline: 'Heavy-duty steam extraction, degreasing & hospital-grade scrub',
    category: 'cleaning',
    pricingModel: 'residential_room',
    basePriceNGN: 28000,
    perRoomRateNGN: 5500,
    perSquareMeterRateNGN: 150,
    requiresLasepaCert: false,
    requiresPoliceCert: true,
    icon: 'Sparkles',
    description: 'High-intensity multi-agent deep cleaning. Includes steam sanitization of tiles, intensive grease removal in kitchen hoods, bathroom descaling, window washing, and hospital-grade surface disinfection.',
    recommendedInterval: 'Monthly or Bi-Monthly',
    features: [
      'Police-vetted professional cleaning crew with body-cam audit',
      'High-pressure steam cleaner for tile grout & grease',
      'Eco-friendly descaling of all sanitary fittings & tiles',
      'Interior window & sill washing + dust extraction',
      'Hospital-grade surface sanitization'
    ]
  },
  {
    id: 'standard_home_clean',
    name: 'Uber-Express Standard Home Cleaning',
    tagline: 'Fast, on-demand tidy up, vacuum, mop & kitchen shine',
    category: 'cleaning',
    pricingModel: 'residential_room',
    basePriceNGN: 18000,
    perRoomRateNGN: 3500,
    perSquareMeterRateNGN: 120,
    requiresLasepaCert: false,
    requiresPoliceCert: true,
    icon: 'Home',
    description: 'On-demand rapid housekeeping for busy Lagos professionals. Thorough dusting, floor scrubbing & mopping, bed making, dish washing, kitchen wipe-down, and trash disposal.',
    recommendedInterval: 'Weekly / Bi-Weekly',
    features: [
      'Nearest vetted agent arrives in ~15-25 minutes',
      'All eco-friendly detergents & micro-fiber gear provided',
      'Living room, bedroom, and kitchen detailing',
      'Trash removal and aromatic floral deodorizing'
    ]
  }
];

export const ADD_ON_OPTIONS: AddOnOption[] = [
  {
    id: 'host_toiletries_pack',
    name: 'Airbnb Premium Restock Pack (Linen, Soap & Bottled Water)',
    priceNGN: 6500,
    category: 'hospitality',
    description: 'Luxury guest toiletries, hand wash, fresh toilet rolls, trash liners, and welcome water bottles.',
    icon: 'Sparkles'
  },
  {
    id: 'ozone_smoke_removal',
    name: 'Ozone Smoke & Odor Neutralizer Machine Cycle (45 mins)',
    priceNGN: 9500,
    category: 'hospitality',
    description: 'High-potency shock treatment to eliminate shisha, cannabis, or cigarette smoke odors before next guest.',
    icon: 'Waves'
  },
  {
    id: 'linen_laundry_dropoff',
    name: 'Used Linen Wash, Dry, Iron & Next-Turnover Delivery',
    priceNGN: 8000,
    category: 'hospitality',
    description: 'Professional laundering of 2 bedsheet sets and 4 bath towels with delivery before next check-in.',
    icon: 'BedDouble'
  },
  {
    id: 'sofa_steam_wash',
    name: '3-Piece Living Room Sofa Steam Wash',
    priceNGN: 12000,
    category: 'cleaning',
    description: 'Deep fiber stain extraction and odor neutralization using high-heat steam.',
    icon: 'Armchair'
  },
  {
    id: 'refrigerator_oven_detailing',
    name: 'Internal Refrigerator & Oven Carbon Descale',
    priceNGN: 8500,
    category: 'cleaning',
    description: 'Food-safe enzyme degreasing of baked-on grease and fridge bio-disinfection.',
    icon: 'Refrigerator'
  },
  {
    id: 'drainage_septic_larvicide',
    name: 'Compound Drainage Larvicide & Mosquito Misting',
    priceNGN: 15000,
    category: 'fumigation',
    description: 'LASEPA approved biological larvicide in gutters to eliminate mosquito breeding.',
    icon: 'Waves'
  }
];
