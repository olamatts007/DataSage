export interface LasepaChemical {
  id: string;
  name: string;
  category: 'Class II Eco-Safe Pyrethroid' | 'Class III Botanical / Gel Bait' | 'Class II Non-Repellent Termiticide' | 'Hospital-Grade Bio-Sanitizer';
  activeIngredient: string;
  activeConcentration: string;
  lasepaBatchCert: string;
  whopesApproval: string;
  targetOrganisms: string[];
  safeReentryHours: number;
  toxicityClass: 'Slightly Hazardous (WHO II)' | 'Caution / Low Hazard (WHO III)' | 'Eco-Bio Non-Toxic';
  msdsSummary: string;
  requiredPpe: string[];
}

export const LASEPA_APPROVED_CHEMICALS: LasepaChemical[] = [
  {
    id: 'chem-001',
    name: 'PyreSafe-25 Ultra EC',
    category: 'Class II Eco-Safe Pyrethroid',
    activeIngredient: 'Permethrin + PBO Synergist',
    activeConcentration: '250 g/L',
    lasepaBatchCert: 'LASEPA/CHEM/2024/LG-902',
    whopesApproval: 'WHO/PQ/VCP-0091',
    targetOrganisms: ['Anopheles Mosquitoes', 'Cockroaches', 'Flies', 'Spiders', 'Ants'],
    safeReentryHours: 3.5,
    toxicityClass: 'Slightly Hazardous (WHO II)',
    msdsSummary: 'Photostable synthetic pyrethroid with rapid knockdown and residual repellent effect. Low mammalian toxicity, breaks down naturally into non-toxic soil metabolites.',
    requiredPpe: ['3M Organic Vapor Respirator (Class A1/P2)', 'Nitrile Chemical Gloves', 'Protective Overalls & Goggles']
  },
  {
    id: 'chem-002',
    name: 'TermiShield Max 200 SC',
    category: 'Class II Non-Repellent Termiticide',
    activeIngredient: 'Fipronil Ultra Micronized',
    activeConcentration: '200 g/L',
    lasepaBatchCert: 'LASEPA/CHEM/2024/LG-331',
    whopesApproval: 'WHO/PQ/TC-0044',
    targetOrganisms: ['Subterranean Termites', 'Drywood Termites', 'Wood-Boring Beetles'],
    safeReentryHours: 4.0,
    toxicityClass: 'Slightly Hazardous (WHO II)',
    msdsSummary: 'Non-repellent horizon barrier termiticide. Pests cannot detect the chemical and transfer active particles back to the subterranean colony nest, ensuring 100% queen colony destruction.',
    requiredPpe: ['Full Face Shield', 'Heavy Neoprene Gloves', 'Waterproof Safety Boots']
  },
  {
    id: 'chem-003',
    name: 'BioGel Roach-Matrix 2.15%',
    category: 'Class III Botanical / Gel Bait',
    activeIngredient: 'Hydramethylnon + Attractant Pheromone',
    activeConcentration: '2.15% w/w',
    lasepaBatchCert: 'LASEPA/CHEM/2024/LG-114',
    whopesApproval: 'WHO/PQ/BT-0012',
    targetOrganisms: ['German Cockroaches', 'American Cockroaches', 'Oriental Roaches'],
    safeReentryHours: 0, // No evacuation required for targeted gel!
    toxicityClass: 'Caution / Low Hazard (WHO III)',
    msdsSummary: 'Zero-odor, zero-aerosol targeted spot baiting. Can be applied directly in kitchens, cabinets, and appliances without vacating premises or washing dishes.',
    requiredPpe: ['Disposable Latex Gloves']
  },
  {
    id: 'chem-004',
    name: 'BedBug-Terminator Heat & Knock 240 SC',
    category: 'Class II Eco-Safe Pyrethroid',
    activeIngredient: 'Chlorfenapyr + Dinotefuran',
    activeConcentration: '240 g/L',
    lasepaBatchCert: 'LASEPA/CHEM/2024/LG-884',
    whopesApproval: 'WHO/PQ/BB-0072',
    targetOrganisms: ['Cimex Lectularius (Bedbugs & Nymphs)', 'Bedbug Eggs', 'Flea Larvae'],
    safeReentryHours: 5.0,
    toxicityClass: 'Slightly Hazardous (WHO II)',
    msdsSummary: 'Uncouples oxidative phosphorylation in pyrethroid-resistant bedbugs. Provides lethal kill within 48 hours and 120-day residual protection on mattress seams and baseboards.',
    requiredPpe: ['3M Half-Face Respirator 6200', 'Chemical Safety Goggles', 'Tyvek Coverall']
  },
  {
    id: 'chem-005',
    name: 'OxySteril-Bio Pro Disinfectant',
    category: 'Hospital-Grade Bio-Sanitizer',
    activeIngredient: 'Stabilized Hydrogen Peroxide & Silver Ions',
    activeConcentration: '7.5%',
    lasepaBatchCert: 'LASEPA/CHEM/2024/LG-510',
    whopesApproval: 'WHO/PQ/MD-0188',
    targetOrganisms: ['Staphylococcus', 'Salmonella', 'E. Coli', 'Mold Spores', 'Fungi', 'Viruses'],
    safeReentryHours: 1.0,
    toxicityClass: 'Eco-Bio Non-Toxic',
    msdsSummary: 'Breaks down into pure water and oxygen after reacting. Safe for hospitals, kitchens, nurseries, and server rooms with zero corrosive residue.',
    requiredPpe: ['Standard Face Mask', 'Rubber Gloves']
  }
];
