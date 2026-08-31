#!/usr/bin/env python3
"""
SourceKettle taxonomy builder.

Single source of truth for the SourceKettle category tree (Taxonomy A),
the application/line tree (Taxonomy B), and the attribute schema (Taxonomy C).

Emits:  ../data/taxonomy.json      - machine-readable, for the app + DB seed
        ../data/taxonomy.csv       - flat, for spreadsheets and supplier onboarding

Run:    python3 taxonomy_builder.py
Validates before writing: unique codes, resolvable parents, single root per pillar,
no orphans, no cycles, mandatory attributes present, Taxonomy B refs valid.
"""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"

# --------------------------------------------------------------------------- #
# Taxonomy B - Application / production line tree
# --------------------------------------------------------------------------- #
APPLICATIONS: dict[str, str] = {
    "B01": "Water treatment & municipal",
    "B02": "Detergent, soap & home care",
    "B03": "Paints, coatings & inks",
    "B04": "Plastics, compounding & masterbatch",
    "B05": "Textile, leather & apparel",
    "B06": "Paper, pulp & packaging",
    "B07": "Oil, gas & petrochemical",
    "B08": "Mining & mineral processing",
    "B09": "Chemical processing & fine chemicals",
    "B10": "Food & beverage processing",
    "B11": "Personal care & cosmetics",
    "B12": "Pharmaceutical & nutraceutical",
    "B13": "Electronics & semiconductors",
    "B14": "Automotive & metal finishing",
    "B15": "Construction & infrastructure",
    "B16": "Power generation & utilities",
    "B17": "Agriculture & agri-inputs",
    "B18": "General manufacturing / MRO",
}

# Attribute keys that must be resolvable for a segment before a SKU can go live.
ATTRS_CHEM_CORE = [
    "cas_number", "grade", "purity_min_pct", "physical_form", "un_number",
    "dg_class", "ghs_pictograms", "flash_point_c", "storage_class",
    "packaging_options", "moq", "uom", "hs_code", "country_of_origin",
    "documentation",
]
ATTRS_CHEM_DG = ATTRS_CHEM_CORE + ["packing_group", "h_statements", "p_statements"]
ATTRS_MATERIAL_CORE = [
    "material_grade", "physical_form", "packaging_options", "moq", "uom",
    "hs_code", "country_of_origin", "documentation",
]
ATTRS_POLYMER = ATTRS_MATERIAL_CORE + ["melt_flow_index", "additive_package"]
ATTRS_EQUIPMENT = [
    "capacity_or_rating", "material_of_construction", "certifications",
    "condition", "lead_time_weeks", "power_supply", "warranty_months",
    "documentation", "installation_offered",
]
ATTRS_CONSUMABLE = [
    "size_spec", "material_of_construction", "pack_qty", "uom", "hs_code",
    "certifications", "documentation",
]
ATTRS_SERVICE = ["scope_of_work", "sla_hours", "service_area", "licences", "documentation"]

# --------------------------------------------------------------------------- #
# Taxonomy A - Category tree
# (code, name, kind, parent, applications, attributes, note)
# --------------------------------------------------------------------------- #
TREE: list[dict] = [
    # ======================= S1 BULK & COMMODITY ========================== #
    {"code": "S1", "name": "Raw Materials - Bulk & Commodity Chemicals", "kind": "pillar", "parent": None,
     "note": "High volume, low margin, spec-interchangeable. Tanker / ISO tank / bag / IBC. Buy on landed cost + reliability."},
    {"code": "S10", "name": "Feedstocks & Petrochemical Base", "kind": "segment", "parent": "S1",
     "apps": ["B07", "B09"], "attrs": ATTRS_CHEM_DG,
     "note": "Solvent naphtha, methanol, toluene, xylene, acetone, MEG/DEG, glycerine, phenol, formalin, EO/PO derivatives, fatty acids, fatty alcohols. Mostly DG Class 3."},
    {"code": "S11", "name": "Acids, Alkalis & Inorganics", "kind": "segment", "parent": "S1",
     "apps": ["B01", "B06", "B08", "B09", "B14", "B16"], "attrs": ATTRS_CHEM_DG},
    {"code": "S11.1", "name": "Mineral Acids", "kind": "subsegment", "parent": "S11",
     "apps": ["B01", "B08", "B09", "B14", "B16"], "attrs": ATTRS_CHEM_DG,
     "note": "Hydrochloric 33%, sulphuric 98%, nitric 68%, phosphoric 85% tech/food. DG Class 8, storage class SC-1."},
    {"code": "S11.2", "name": "Alkalis", "kind": "subsegment", "parent": "S11",
     "apps": ["B01", "B02", "B06", "B09", "B14"], "attrs": ATTRS_CHEM_DG,
     "note": "Caustic soda flakes 98% / lye 47-50%, potassium hydroxide, soda ash light & dense. DG Class 8, storage class SC-2."},
    {"code": "S11.3", "name": "Salts & Inorganic Compounds", "kind": "subsegment", "parent": "S11",
     "apps": ["B01", "B03", "B06", "B09", "B16"], "attrs": ATTRS_CHEM_CORE,
     "note": "Sodium sulphate, bicarbonate, metabisulphite, hypochlorite 12.5%, alum, PAC, ferric chloride, lime, zinc oxide, titanium dioxide."},
    {"code": "S11.4", "name": "Industrial Gases", "kind": "subsegment", "parent": "S11",
     "apps": ["B07", "B09", "B13", "B14", "B16"], "attrs": ATTRS_CHEM_DG,
     "note": "Nitrogen, oxygen, argon, CO2, hydrogen, LPG, acetylene, calibration mixes. Cylinder / dewar / bulk. DG Class 2, storage SC-5."},
    {"code": "S12", "name": "Solvents", "kind": "segment", "parent": "S1",
     "apps": ["B02", "B03", "B05", "B09", "B13", "B14"], "attrs": ATTRS_CHEM_DG,
     "note": "Best entry category: high repeat purchase, clear specs, strong price opacity."},
    {"code": "S12.1", "name": "Hydrocarbon & Aliphatic Solvents", "kind": "subsegment", "parent": "S12",
     "apps": ["B03", "B05", "B14"], "attrs": ATTRS_CHEM_DG,
     "note": "Hexane, heptane, kerosene, white spirit, D40/D60/D80, isoparaffins. DG Class 3, SC-3."},
    {"code": "S12.2", "name": "Oxygenated Solvents", "kind": "subsegment", "parent": "S12",
     "apps": ["B02", "B03", "B09", "B11", "B12"], "attrs": ATTRS_CHEM_DG,
     "note": "Methanol, ethanol (denatured/absolute/ENA), IPA, butanol, ethyl & butyl acetate, MEK, MIBK, acetone. DG Class 3."},
    {"code": "S12.3", "name": "Glycol Ethers & High Boilers", "kind": "subsegment", "parent": "S12",
     "apps": ["B03", "B13"], "attrs": ATTRS_CHEM_CORE,
     "note": "2-ethylhexanol, DPM, TPM, glycol ether families. Lower volatility, some combustible rather than flammable."},
    {"code": "S12.4", "name": "Halogenated Solvents", "kind": "subsegment", "parent": "S12",
     "apps": ["B13", "B14"], "attrs": ATTRS_CHEM_CORE + ["regulatory_restrictions"],
     "note": "Methylene chloride, chloroform, TCE. Several are restricted/authorisation-gated - catalogue must carry a restricted flag and buyer acknowledgement."},
    {"code": "S12.5", "name": "Green & Bio-based Solvents", "kind": "subsegment", "parent": "S12",
     "apps": ["B02", "B03", "B10", "B11"], "attrs": ATTRS_CHEM_CORE,
     "note": "d-limonene, ethyl lactate, methyl soyate, glycerol formal, dibasic esters. Fastest-growing solvent sub-segment on ESG demand."},
    {"code": "S13", "name": "Polymers, Resins & Elastomers", "kind": "segment", "parent": "S1",
     "apps": ["B04", "B06", "B14", "B15"], "attrs": ATTRS_POLYMER},
    {"code": "S13.1", "name": "Commodity Thermoplastics", "kind": "subsegment", "parent": "S13",
     "apps": ["B04", "B06"], "attrs": ATTRS_POLYMER,
     "note": "HDPE/LDPE/LLDPE, PP homo & copolymer, PS, EPS, ABS, PET. Sold by grade + MFI."},
    {"code": "S13.2", "name": "Engineering Plastics", "kind": "subsegment", "parent": "S13",
     "apps": ["B04", "B13", "B14"], "attrs": ATTRS_POLYMER,
     "note": "PA6/PA66, PC, POM, PBT, PMMA, PPS, PEEK, PVDF, PTFE. Higher margin, spec-critical."},
    {"code": "S13.3", "name": "PVC & Plasticisers", "kind": "subsegment", "parent": "S13",
     "apps": ["B04", "B15"], "attrs": ATTRS_POLYMER,
     "note": "Suspension PVC, CPVC, DOP/DOTP/DINP/ATBC. Some plasticisers phasing out - track restriction lists."},
    {"code": "S13.4", "name": "Thermoset Resins", "kind": "subsegment", "parent": "S13",
     "apps": ["B03", "B04", "B15"], "attrs": ATTRS_POLYMER + ["pot_life_minutes"],
     "note": "Epoxy resin + hardeners, unsaturated polyester, phenolic, PU systems (MDI/TDI/polyol). Isocyanates are hazardous - SC-6 handling."},
    {"code": "S13.5", "name": "Elastomers & Rubber", "kind": "subsegment", "parent": "S13",
     "apps": ["B04", "B14"], "attrs": ATTRS_MATERIAL_CORE,
     "note": "Natural rubber, SBR, NBR, EPDM, silicone gum, reclaimed rubber."},
    {"code": "S13.6", "name": "Recycled & Bio-based Polymers", "kind": "subsegment", "parent": "S13",
     "apps": ["B04", "B06"], "attrs": ATTRS_POLYMER + ["recycled_content_pct"],
     "note": "rPET, rPP, regrind, PLA, PHA, bio-PE. Growing on ESG mandates; requires traceability of recycled content."},
    {"code": "S14", "name": "Bulk Additives, Fillers & Pigments", "kind": "segment", "parent": "S1",
     "apps": ["B03", "B04", "B06", "B15"], "attrs": ATTRS_MATERIAL_CORE,
     "note": "GCC/PCC, talc, kaolin, fumed & precipitated silica, barium sulphate, mica, wollastonite, carbon black, TiO2, iron oxides, organic & inorganic pigments, masterbatches."},

    # ==================== S2 SPECIALTY & FORMULATED ======================= #
    {"code": "S2", "name": "Raw Materials - Specialty & Formulated Chemicals", "kind": "pillar", "parent": None,
     "note": "Lower volume, higher margin, function-driven, harder to substitute. Qualification, not just price."},
    {"code": "S20", "name": "Surfactants & Detergent Bases", "kind": "segment", "parent": "S2",
     "apps": ["B02", "B11"], "attrs": ATTRS_CHEM_CORE,
     "note": "LABSA 90%, SLES 70% (2EO/3EO), SLS, AES, CAPB, AEO, APG, alcohol ethoxylates, sulfosuccinates, amine oxides, quats (BTC/DDAC), gemini & silicone surfactants."},
    {"code": "S21", "name": "Specialty Additives & Performance Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B03", "B04", "B13"], "attrs": ATTRS_CHEM_CORE},
    {"code": "S21.1", "name": "Polymer Additives", "kind": "subsegment", "parent": "S21",
     "apps": ["B04"], "attrs": ATTRS_CHEM_CORE,
     "note": "Antioxidants, UV stabilisers, HALS, heat stabilisers, flame retardants (APP/ATH/brominated/phosphorus), nucleating agents, slip & antiblock."},
    {"code": "S21.2", "name": "Processing Aids", "kind": "subsegment", "parent": "S21",
     "apps": ["B03", "B04", "B11"], "attrs": ATTRS_CHEM_CORE,
     "note": "Compatibilisers, coupling agents, defoamers, dispersants, rheology modifiers, biocides, preservatives (MIT/CMIT, phenoxyethanol), antistats."},
    {"code": "S21.3", "name": "Functional Fillers & Nanomaterials", "kind": "subsegment", "parent": "S21",
     "apps": ["B04", "B13"], "attrs": ATTRS_CHEM_CORE + ["particle_size_nm"],
     "note": "Nanosilica, nanoclay, CNT, graphene. Low volume, high value, sample-heavy, nano-specific safety data required."},
    {"code": "S22", "name": "Coatings, Ink & Adhesive Raw Materials", "kind": "segment", "parent": "S2",
     "apps": ["B03"], "attrs": ATTRS_CHEM_CORE,
     "note": "Alkyds, acrylics, PU dispersions, nitrocellulose, rosins, TiO2, extenders, coalescents, thickeners (HEC/ASE/HEUR), pigments & dyes, photoinitiators, UV monomers & oligomers."},
    {"code": "S23", "name": "Water Treatment & Process Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B01", "B16"], "attrs": ATTRS_CHEM_CORE,
     "note": "RECOMMENDED FIRST CATEGORY. Coagulants (alum/PAC/ferric), flocculants (anionic/cationic/nonionic PAM), antiscalants, corrosion inhibitors, oxygen scavengers, biocides, pH adjusters, IX resins, activated carbon, membrane cleaners, chelants, boiler & cooling tower treatment."},
    {"code": "S24", "name": "Industrial & Institutional Cleaning", "kind": "segment", "parent": "S2",
     "apps": ["B01", "B10", "B18"], "attrs": ATTRS_CHEM_CORE,
     "note": "Alkaline cleaners, acid descalers, solvent degreasers, CIP detergents & sanitisers, foam control, laundry, handwash & sanitisers, floor care, enzymatic cleaners."},
    {"code": "S25", "name": "Textile, Leather, Paper & Pulp Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B05", "B06"], "attrs": ATTRS_CHEM_CORE,
     "note": "Sizing agents, wet-strength resins, retention aids, optical brighteners, dye-fixing agents, tanning agents (incl. chrome-free), fatliquors, defoamers, bleaching stabilisers, softener bases."},
    {"code": "S26", "name": "Food, Feed & Personal Care Ingredients", "kind": "segment", "parent": "S2",
     "apps": ["B10", "B11", "B17"], "attrs": ATTRS_CHEM_CORE + ["allergen_declaration", "grade_certificate"],
     "note": "GRADE-GATED. Acidulants, preservatives, sweeteners, hydrocolloids, emulsifiers, vitamins, amino acids, flavours, colours, cosmetic actives, emollients, waxes, silicones. Requires food/pharma/cosmetic grade cert + allergen declaration + batch traceability."},
    {"code": "S27", "name": "Oils, Lubricants & Metalworking Fluids", "kind": "segment", "parent": "S2",
     "apps": ["B14", "B16", "B18"], "attrs": ATTRS_CHEM_CORE + ["viscosity_grade"],
     "note": "Base oils (Group I-III, PAO, esters), greases, hydraulic & gear oils, compressor & transformer oils, metalworking fluids (soluble/semi-synthetic/neat), quenching oils, rust preventives, heat transfer fluids."},
    {"code": "S28", "name": "Adhesives & Sealants (Finished)", "kind": "segment", "parent": "S2",
     "apps": ["B04", "B14", "B15", "B18"], "attrs": ATTRS_CHEM_CORE + ["cure_time_minutes"],
     "note": "Epoxies, PU, silicones, cyanoacrylates, hot-melts & EVA, PVAc, MS polymers, anaerobics, tapes."},
    {"code": "S29", "name": "Construction & Infrastructure Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B15"], "attrs": ATTRS_CHEM_CORE,
     "note": "Concrete admixtures (PCE, lignosulphonate, naphthalene), waterproofing, grouts, repair mortars, tile adhesives, curing compounds, protective coatings, geochemicals."},
    {"code": "S30", "name": "Agrochemicals & Plant Nutrition", "kind": "segment", "parent": "S2",
     "apps": ["B17"], "attrs": ATTRS_CHEM_CORE + ["licence_required", "registration_number"],
     "note": "LICENCE-GATED. NPK & water-soluble fertilisers, micronutrients, insecticides/fungicides/herbicides, PGRs, biostimulants, soil conditioners. Verify seller AND buyer licences before enabling transactions."},
    {"code": "S31", "name": "Laboratory & Reagent Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B09", "B12", "B13"], "attrs": ATTRS_CHEM_CORE + ["cert_of_analysis_batch"],
     "note": "AR/LR grades, analytical standards, reference materials, indicators, buffer salts, chromatography media, HPLC/GC-grade solvents, titration reagents."},
    {"code": "S32", "name": "Pharma & Fine Chemicals", "kind": "segment", "parent": "S2",
     "apps": ["B12"], "attrs": ATTRS_CHEM_CORE + ["gmp_documentation", "dmf_cep_reference", "licence_required"],
     "note": "HIGHEST COMPLIANCE BURDEN. APIs, pharma intermediates, excipients (MCC, lactose, starch, Mg stearate), bio-buffers. GMP docs, CEP/DMF, country licences. Enter only with a regulatory partner."},
    {"code": "S33", "name": "Catalysts, Enzymes & Biotech Inputs", "kind": "segment", "parent": "S2",
     "apps": ["B09", "B10", "B16"], "attrs": ATTRS_CHEM_CORE + ["activity_units"],
     "note": "Precious-metal & base-metal catalysts, zeolites, supported catalysts, industrial enzymes (amylase/protease/lipase/cellulase), fermentation media & nutrients, starter cultures."},

    # ===================== S3 MACHINES & EQUIPMENT ======================== #
    {"code": "S3", "name": "Machines & Process Equipment", "kind": "pillar", "parent": None,
     "note": "Capex. Long cycle, high value. Sell as brokerage + escrow + third-party inspection, not marketplace inventory."},
    {"code": "S34", "name": "Reaction, Mixing & Blending Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B02", "B03", "B09", "B11", "B12"], "attrs": ATTRS_EQUIPMENT,
     "note": "SS316 / glass-lined / jacketed reactors, agitated vessels, high-shear mixers, planetary mixers, homogenisers, ribbon & conical blenders, dissolvers, bead/ball/hammer mills, crystallisers, evaporators, spray dryers."},
    {"code": "S35", "name": "Separation, Filtration & Drying Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B01", "B09", "B10", "B12"], "attrs": ATTRS_EQUIPMENT,
     "note": "Distillation columns & internals, wiped-film evaporators, filter press / Nutsche / candle filters, decanter & basket & disc-stack centrifuges, hydrocyclones, extraction units, tray/FBD/vacuum/flash dryers, UF/NF/RO skids, dust collectors."},
    {"code": "S36", "name": "Heat Transfer & Thermal Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B09", "B10", "B16"], "attrs": ATTRS_EQUIPMENT,
     "note": "Shell & tube / plate heat exchangers, cooling towers, chillers, thermic fluid heaters, industrial ovens & furnaces, steam boilers, heat recovery, jacketed piping & tracing."},
    {"code": "S37", "name": "Fluid Handling, Transfer & Storage", "kind": "segment", "parent": "S3",
     "apps": ["B01", "B02", "B07", "B09", "B18"], "attrs": ATTRS_EQUIPMENT + ["wetted_materials", "atex_rating"],
     "note": "Centrifugal, gear, AODD diaphragm, lobe, peristaltic, screw, magnetic-drive sealless pumps (correct for corrosive/flammable duty); ball/gate/butterfly/diaphragm/pinch/safety-relief valves; hose & couplings; IBCs, drums, silos, agitators, level & containment."},
    {"code": "S38", "name": "Instrumentation, Control & Automation", "kind": "segment", "parent": "S3",
     "apps": ["B01", "B09", "B13", "B16", "B18"], "attrs": ATTRS_EQUIPMENT + ["atex_rating", "calibration_certificate"],
     "note": "Flow (magnetic/coriolis/ultrasonic), level (radar/ultrasonic/float), pressure & temperature transmitters, analytical (pH/ORP/conductivity/turbidity/DO), control valves & actuators, PLC/DCS, HMI/SCADA, VFDs, load cells, gas detection & safety interlocks."},
    {"code": "S39", "name": "Filling, Packaging & Labelling Lines", "kind": "segment", "parent": "S3",
     "apps": ["B02", "B10", "B11", "B18"], "attrs": ATTRS_EQUIPMENT,
     "note": "Drum & IBC filling stations, bottling & capping, sachet FFS, carton sealers, shrink-wrap, palletisers, labellers, metal detectors, checkweighers, coders & printers."},
    {"code": "S40", "name": "Material Handling Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B18"], "attrs": ATTRS_EQUIPMENT,
     "note": "Forklifts (electric/diesel), stackers, pallet trucks, conveyors, hoists & EOT cranes, industrial vacuum, AGVs."},
    {"code": "S41", "name": "Utilities, Energy & Effluent Treatment", "kind": "segment", "parent": "S3",
     "apps": ["B01", "B16", "B18"], "attrs": ATTRS_EQUIPMENT,
     "note": "Air compressors & dryers, N2/O2 generators, RO & DM plants, ETP/STP equipment (clarifiers, DAF, MBBR media), sludge dewatering, incinerators, solar thermal, UPS & generators."},
    {"code": "S42", "name": "Laboratory & QC Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B09", "B10", "B12", "B18"], "attrs": ATTRS_EQUIPMENT + ["calibration_certificate"],
     "note": "Fume hoods, hotplates & stirrers, ovens & muffle furnaces, viscometers, spectrophotometers, HPLC/GC, titrators, particle size analysers, moisture analysers, balances, colour measurement."},
    {"code": "S43", "name": "Line-Specific Process Machinery", "kind": "segment", "parent": "S3",
     "apps": ["B02", "B03", "B04", "B10", "B11"], "attrs": ATTRS_EQUIPMENT,
     "note": "The vertical bundles - detergent & liquid washing lines, paint dispersion lines, food processing lines, cosmetic cream/lotion lines, plastic compounding & extrusion, water bottling, blending & packaging skids. This is where 'we sell the line' becomes literal."},
    {"code": "S44", "name": "Used, Refurbished & Rental Equipment", "kind": "segment", "parent": "S3",
     "apps": ["B18"], "attrs": ATTRS_EQUIPMENT + ["inspection_report", "year_of_manufacture"],
     "note": "Second-hand reactors & centrifuges, refurbished instruments, rental dosing skids & temporary utilities. High margin, underserved, natural fit for escrow + inspection."},

    # ================ S4 CONSUMABLES, MRO & PACKAGING ===================== #
    {"code": "S4", "name": "Consumables, MRO & Packaging", "kind": "pillar", "parent": None,
     "note": "Low unit value, highest order frequency, creates daily engagement. Availability beats price here."},
    {"code": "S45", "name": "Packaging Materials", "kind": "segment", "parent": "S4",
     "apps": ["B02", "B03", "B10", "B11", "B18"], "attrs": ATTRS_CONSUMABLE + ["un_rating_for_dg"],
     "note": "HDPE & steel drums (200/210/220 L), IBCs, jerry cans 5-30 L, PP/PE bags & FIBCs, liners, drum bungs/caps/rings/seals, pails & tubs, bottles & closures, sachet film, shrink & stretch film, corrugated, wooden & plastic pallets, strapping & tapes. UN-rated packaging is mandatory for DG fills."},
    {"code": "S46", "name": "PPE & Safety Equipment", "kind": "segment", "parent": "S4",
     "apps": ["B18"], "attrs": ATTRS_CONSUMABLE + ["protection_standard"],
     "note": "Nitrile/latex/neoprene/butyl & chemical gauntlets, coveralls (Type 3/4/5/6), respirators (half/full mask, PAPR, cartridges), safety shoes & boots, face shields, goggles, chemical aprons, spill kits, eyewash & safety showers, first aid, LOTO, portable gas detectors."},
    {"code": "S47", "name": "Filtration & Separation Consumables", "kind": "segment", "parent": "S4",
     "apps": ["B01", "B03", "B09", "B10"], "attrs": ATTRS_CONSUMABLE + ["micron_rating"],
     "note": "Filter bags (PP/PE/PTFE, 1-800 um), cartridge filters, filter cloths & plates, RO/UF membranes & spares, activated carbon, filter aid (diatomite, perlite), sieve & screen meshes."},
    {"code": "S48", "name": "Gaskets, Seals & Hose", "kind": "segment", "parent": "S4",
     "apps": ["B09", "B18"], "attrs": ATTRS_CONSUMABLE + ["chemical_compatibility"],
     "note": "Spiral-wound & ring-joint gaskets, EPDM/NBR/Viton/PTFE seals, O-ring kits, hose assemblies, quick couplings. Chemical compatibility chart is the killer merchandising feature."},
    {"code": "S49", "name": "Electrical & Instrumentation Consumables", "kind": "segment", "parent": "S4",
     "apps": ["B18"], "attrs": ATTRS_CONSUMABLE + ["atex_rating"],
     "note": "Contactors, relays, MCB/MCCB, cables & glands, cable trays, sensors & transmitters, calibrators, indicator lamps."},
    {"code": "S50", "name": "Maintenance & Workshop Supplies", "kind": "segment", "parent": "S4",
     "apps": ["B18"], "attrs": ATTRS_CONSUMABLE,
     "note": "Industrial adhesives, threadlockers, lubricants & greases, aerosols, cutting & grinding discs, drill bits & taps, abrasives, welding electrodes & wire, paints, cleaners & degreasers, janitorial."},
    {"code": "S51", "name": "QC & Laboratory Consumables", "kind": "segment", "parent": "S4",
     "apps": ["B09", "B10", "B12"], "attrs": ATTRS_CONSUMABLE,
     "note": "Glassware, volumetric flasks & pipettes, syringe filters & membranes, reagents, standards, sample containers, lab gloves, wipes, chromatography consumables."},
    {"code": "S52", "name": "Packing & Despatch Consumables", "kind": "segment", "parent": "S4",
     "apps": ["B18"], "attrs": ATTRS_CONSUMABLE,
     "note": "Labels & thermal ribbons, coding ink, void fill, bubble wrap, edge protectors, desiccants, VCI anti-corrosion packaging."},

    # ========================== S5 SERVICES =============================== #
    {"code": "S5", "name": "Services", "kind": "pillar", "parent": None,
     "note": "The services layer is what stops disintermediation. High margin and binds the transaction to the platform."},
    {"code": "S55", "name": "Sourcing & Brokerage", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE,
     "note": "RFQ management, supplier qualification, factory audits, cost benchmarking, reverse auctions."},
    {"code": "S56", "name": "Logistics & Dangerous Goods Transport", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE + ["dg_transport_licence"],
     "note": "DG-certified trucking, tank cleaning, hazmat warehousing, ISO tank leasing, freight forwarding, customs brokerage, cargo insurance."},
    {"code": "S57", "name": "Testing, Inspection & QC", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE + ["accreditation_scope"],
     "note": "Third-party lab analysis (SGS / Intertek / Bureau Veritas class), pre-shipment inspection, batch retention sampling, CoA verification."},
    {"code": "S58", "name": "Regulatory & Compliance", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE,
     "note": "SDS authoring & translation, REACH only-representative, TSCA statements, product registration, GHS labelling & classification, HS classification."},
    {"code": "S59", "name": "Engineering, Installation & After-Sales", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE,
     "note": "Commissioning, AMC/CMC contracts, spares management, operator training, equipment validation."},
    {"code": "S60", "name": "Trade Finance & Insurance", "kind": "segment", "parent": "S5",
     "apps": ["B18"], "attrs": ATTRS_SERVICE + ["regulated_entity_partner"],
     "note": "Supplier credit, invoice discounting, escrow & milestone payment, LC management, product liability cover. Always through a licensed partner."},
    {"code": "S61", "name": "Waste, Recovery & Circularity", "kind": "segment", "parent": "S5",
     "apps": ["B01", "B18"], "attrs": ATTRS_SERVICE + ["waste_handling_licence"],
     "note": "Spent-solvent recovery, effluent treatment services, packaging take-back, chemical destruction & disposal."},

    # ============== S6 OVERSTOCK, OFF-SPEC & SECONDARY ==================== #
    {"code": "S6", "name": "Overstock, Off-Spec & Secondary Materials", "kind": "pillar", "parent": None,
     "note": "Underserved supply-side wedge. Every item must carry a deviation disclosure and cannot be recommended for grade-gated end uses (S26, S30, S32)."},
    {"code": "S65", "name": "Surplus & Slow-Moving Stock", "kind": "segment", "parent": "S6",
     "apps": ["B18"], "attrs": ATTRS_CHEM_CORE + ["shelf_life_remaining_pct", "deviation_disclosure"],
     "note": "Original packaging, documented provenance, near-expiry or slow-moving."},
    {"code": "S66", "name": "Off-Spec & Downgraded Material", "kind": "segment", "parent": "S6",
     "apps": ["B18"], "attrs": ATTRS_CHEM_CORE + ["shelf_life_remaining_pct", "deviation_disclosure"],
     "note": "Sold with full CoA deviation disclosure. Platform must block recommendation into grade-gated end uses."},
    {"code": "S67", "name": "Recovered & Reclaimed Solvents & Oils", "kind": "segment", "parent": "S6",
     "apps": ["B03", "B14", "B18"], "attrs": ATTRS_CHEM_DG + ["recovery_source"],
     "note": "Re-distilled solvents, re-refined lubricants. Requires distillation report and residual-contaminant profile."},
    {"code": "S68", "name": "Recycled Resins, Regrind & Reclaimed Rubber", "kind": "segment", "parent": "S6",
     "apps": ["B04", "B06"], "attrs": ATTRS_MATERIAL_CORE + ["recycled_content_pct", "contamination_profile"],
     "note": "Regrind, pelletised recyclate, reclaimed rubber. MFI and contamination profile mandatory."},
]

# --------------------------------------------------------------------------- #
# Storage-segregation classes (EHS lens) and hazard reference data
# --------------------------------------------------------------------------- #
STORAGE_CLASSES = {
    "SC-1": ("Corrosive acids", "Separate bunded area; never with alkalis or hypochlorite"),
    "SC-2": ("Corrosive alkalis", "Bunded, dry, away from acids and reactive metals"),
    "SC-3": ("Flammable liquids", "Fire-rated store, ATEX electricals, bonding and earthing"),
    "SC-4": ("Oxidisers", "Away from flammables and organic material"),
    "SC-5": ("Compressed gases", "Upright, chained, ventilated, segregated by gas type"),
    "SC-6": ("Toxic and CMR substances", "Locked store with access log"),
    "SC-7": ("Water-reactive materials", "Dry store, no water-based fire suppression"),
    "SC-8": ("General non-DG", "Standard racking"),
}

GHS_PICTOGRAMS = {
    "GHS01": "Exploding bomb - explosives",
    "GHS02": "Flame - flammable",
    "GHS03": "Flame over circle - oxidising",
    "GHS04": "Gas cylinder - gases under pressure",
    "GHS05": "Corrosion - corrosive",
    "GHS06": "Skull and crossbones - acute toxicity",
    "GHS07": "Exclamation mark - irritant / sensitiser",
    "GHS08": "Health hazard - CMR / STOT",
    "GHS09": "Environment - hazardous to aquatic environment",
}

ATTRIBUTION_SCHEMA = {
    "cas_number":            {"type": "string",  "required_for": "S1,S2,S6", "note": "Chemical identity; primary key for spec matching"},
    "grade":                 {"type": "enum",    "required_for": "S1,S2,S6", "values": ["technical", "industrial", "USP", "BP", "EP", "food", "pharma", "cosmetic", "AR", "LR", "HPLC", "electronic"]},
    "purity_min_pct":        {"type": "decimal", "required_for": "S1,S2,S6"},
    "physical_form":         {"type": "enum",    "required_for": "S1,S2,S3,S4,S6", "values": ["solid", "liquid", "gas", "powder", "granule", "flake", "paste", "emulsion", "equipment"]},
    "un_number":             {"type": "string",  "required_for": "S1,S2,S6", "note": "Must validate against the UN Dangerous Goods list. Never free-typed."},
    "dg_class":              {"type": "enum",    "required_for": "S1,S2,S6", "values": ["1", "2", "3", "4.1", "4.2", "4.3", "5.1", "5.2", "6.1", "6.2", "7", "8", "9", "non-DG"]},
    "packing_group":         {"type": "enum",    "required_for": "DG only", "values": ["I", "II", "III", "n/a"]},
    "ghs_pictograms":        {"type": "enum[]",  "required_for": "S1,S2,S6", "values": list(GHS_PICTOGRAMS)},
    "h_statements":          {"type": "string[]", "required_for": "DG only"},
    "p_statements":          {"type": "string[]", "required_for": "DG only"},
    "flash_point_c":         {"type": "decimal", "required_for": "S1,S2,S6"},
    "storage_class":         {"type": "enum",    "required_for": "S1,S2,S6", "values": list(STORAGE_CLASSES)},
    "packaging_options":     {"type": "object[]", "required_for": "S1,S2,S3,S4,S6", "note": "[{unit, net_weight_kg, un_rated, tare_kg}]"},
    "moq":                   {"type": "number",  "required_for": "S1,S2,S3,S4,S6"},
    "uom":                   {"type": "enum",    "required_for": "S1,S2,S3,S4,S6", "values": ["kg", "l", "t", "drum", "bag", "pallet", "cylinder", "unit", "box", "set"]},
    "hs_code":               {"type": "string",  "required_for": "S1,S2,S3,S4,S6", "note": "6-10 digit; drives duty and restrictions"},
    "country_of_origin":     {"type": "iso3166", "required_for": "S1,S2,S3,S4,S6"},
    "shelf_life_months":     {"type": "number",  "required_for": "S1,S2,S6"},
    "certifications":        {"type": "string[]", "required_for": "conditional", "values": ["ISO 9001", "ISO 14001", "REACH registered", "Halal", "Kosher", "FDA", "GMP", "UL", "CE", "ATEX", "PED", "ASME-U"]},
    "documentation":         {"type": "enum[]",  "required_for": "S1,S2,S3,S4,S6", "values": ["SDS", "CoA", "TDS", "food-grade certificate", "allergen statement", "GMP dossier", "CE declaration", "test certificate 3.1", "calibration certificate"]},
    "regulatory_restrictions": {"type": "string[]", "required_for": "S12.4 and similar", "note": "Authorisation / restriction list references"},
    "licence_required":      {"type": "boolean", "required_for": "S30,S32"},
    "deviation_disclosure":  {"type": "string",  "required_for": "S6", "note": "Mandatory plain-language statement of what is off-spec"},
    "recycled_content_pct":  {"type": "decimal", "required_for": "S13.6,S68"},
    "atex_rating":           {"type": "string",  "required_for": "S37,S38,S49", "note": "e.g. Ex d IIB T4; mandatory for equipment in flammable atmospheres"},
    "micron_rating":         {"type": "number",  "required_for": "S47"},
    "protection_standard":   {"type": "string",  "required_for": "S46", "note": "e.g. EN 374, EN 166, NIOSH N95, EN ISO 20345"},

    # --- materials & polymers ---
    "material_grade":        {"type": "string",  "required_for": "S13,S14,S68", "note": "Producer grade code, e.g. HDPE 50018N"},
    "melt_flow_index":       {"type": "decimal", "required_for": "S13.1-S13.4,S13.6,S68", "note": "g/10min at standard condition"},
    "additive_package":      {"type": "string",  "required_for": "S13", "note": "e.g. antioxidant/UV package present"},
    "pot_life_minutes":      {"type": "number",  "required_for": "S13.4", "note": "Thermoset working time after mixing"},
    "particle_size_nm":      {"type": "number",  "required_for": "S21.3"},
    "viscosity_grade":       {"type": "string",  "required_for": "S27", "note": "ISO VG 32/46/68 or SAE grade"},
    "cure_time_minutes":     {"type": "number",  "required_for": "S28"},
    "activity_units":        {"type": "string",  "required_for": "S33", "note": "e.g. KNU/g for enzymes, wt% for metal loading"},

    # --- grade / licence gating ---
    "allergen_declaration":  {"type": "string[]", "required_for": "S26"},
    "grade_certificate":     {"type": "document", "required_for": "S26", "note": "Food/pharma/cosmetic grade certificate per batch"},
    "registration_number":   {"type": "string",  "required_for": "S30", "note": "National pesticide / fertiliser registration"},
    "cert_of_analysis_batch": {"type": "document", "required_for": "S31"},
    "gmp_documentation":     {"type": "document", "required_for": "S32"},
    "dmf_cep_reference":     {"type": "string",  "required_for": "S32", "note": "DMF / CEP / ASMF reference for APIs and excipients"},

    # --- equipment ---
    "capacity_or_rating":    {"type": "object",  "required_for": "S34-S44", "note": "{value, unit} e.g. {5000, L} or {75, kW}"},
    "material_of_construction": {"type": "string", "required_for": "S34-S52,S68", "note": "SS316L, GLA, PP, PTFE, EPDM ..."},
    "condition":             {"type": "enum",    "required_for": "S34-S44", "values": ["new", "refurbished", "used-inspected", "used-as-is", "rental"]},
    "lead_time_weeks":       {"type": "number",  "required_for": "S34-S44"},
    "power_supply":          {"type": "string",  "required_for": "S34-S44", "note": "e.g. 415V 3ph 50Hz"},
    "warranty_months":       {"type": "number",  "required_for": "S34-S44"},
    "installation_offered":  {"type": "boolean", "required_for": "S34-S44"},
    "wetted_materials":      {"type": "string[]", "required_for": "S37"},
    "calibration_certificate": {"type": "document", "required_for": "S38,S42"},
    "inspection_report":     {"type": "document", "required_for": "S44", "note": "Third-party condition report - mandatory for used equipment"},
    "year_of_manufacture":   {"type": "number",  "required_for": "S44"},

    # --- consumables & packaging ---
    "size_spec":             {"type": "string",  "required_for": "S45-S52", "note": "Dimension/size string, e.g. 200 L, 25 micron x 7 inch"},
    "pack_qty":              {"type": "object",  "required_for": "S45-S52", "note": "{qty, unit} per selling pack"},
    "un_rating_for_dg":      {"type": "string",  "required_for": "S45", "note": "UN packaging code e.g. 1H1/Y1.8/150; mandatory for DG fills"},
    "chemical_compatibility": {"type": "string", "required_for": "S48", "note": "Compatibility class / chart reference"},

    # --- services ---
    "scope_of_work":         {"type": "string",  "required_for": "S55-S61"},
    "sla_hours":             {"type": "number",  "required_for": "S55-S61"},
    "service_area":          {"type": "string[]", "required_for": "S55-S61", "note": "ISO 3166 codes covered"},
    "licences":              {"type": "string[]", "required_for": "S55-S61"},
    "dg_transport_licence":  {"type": "string",  "required_for": "S56"},
    "accreditation_scope":   {"type": "string",  "required_for": "S57", "note": "ISO/IEC 17025 scope reference"},
    "regulated_entity_partner": {"type": "string", "required_for": "S60", "note": "NBFC / bank / insurer partner name"},
    "waste_handling_licence": {"type": "string",  "required_for": "S61"},

    # --- secondary materials ---
    "shelf_life_remaining_pct": {"type": "decimal", "required_for": "S65,S66"},
    "deviation_disclosure":  {"type": "string",  "required_for": "S65,S66", "note": "Mandatory plain-language statement of what is off-spec"},
    "recovery_source":       {"type": "string",  "required_for": "S67", "note": "Origin stream + distillation report reference"},
    "contamination_profile": {"type": "string",  "required_for": "S68"},
}


# --------------------------------------------------------------------------- #
# Validation
# --------------------------------------------------------------------------- #
def validate(nodes: list[dict]) -> list[str]:
    errors: list[str] = []
    codes = [n["code"] for n in nodes]
    by_code = {n["code"]: n for n in nodes}

    # unique codes
    dupes = {c for c in codes if codes.count(c) > 1}
    for d in sorted(dupes):
        errors.append(f"duplicate code: {d}")

    # parents resolve; no self-parent; kinds are sane
    for n in nodes:
        p = n.get("parent")
        if n["kind"] == "pillar":
            if p is not None:
                errors.append(f"{n['code']}: pillar must have no parent")
        else:
            if p is None:
                errors.append(f"{n['code']}: non-pillar has no parent")
            elif p not in by_code:
                errors.append(f"{n['code']}: parent '{p}' does not exist")
            elif p == n["code"]:
                errors.append(f"{n['code']}: cannot be its own parent")
        if n["kind"] not in ("pillar", "segment", "subsegment"):
            errors.append(f"{n['code']}: unknown kind '{n['kind']}'")
        if n["kind"] == "subsegment" and p in by_code and by_code[p]["kind"] != "segment":
            errors.append(f"{n['code']}: subsegment parent '{p}' is not a segment")

    # no cycles
    def walk(code: str, seen: set[str]) -> bool:
        if code in seen:
            return True
        seen = seen | {code}
        p = by_code.get(code, {}).get("parent")
        return walk(p, seen) if p else False

    for n in nodes:
        if walk(n["code"], set()):
            errors.append(f"{n['code']}: cycle detected in ancestry")

    # taxonomy B refs valid
    for n in nodes:
        for app in n.get("apps", []):
            if app not in APPLICATIONS:
                errors.append(f"{n['code']}: unknown application code '{app}'")

    # every non-pillar must declare apps and attrs
    for n in nodes:
        if n["kind"] in ("segment", "subsegment"):
            if not n.get("apps"):
                errors.append(f"{n['code']}: missing applications")
            if not n.get("attrs"):
                errors.append(f"{n['code']}: missing mandatory attributes")

    # attribute keys must exist in the schema
    for n in nodes:
        for a in n.get("attrs", []):
            if a not in ATTRIBUTION_SCHEMA:
                errors.append(f"{n['code']}: attribute '{a}' not defined in ATTRIBUTION_SCHEMA")

    # pillar membership must resolve for every node
    for n in nodes:
        try:
            p = resolve_pillar(n["code"])
        except KeyError:
            errors.append(f"{n['code']}: cannot resolve pillar (broken parent chain)")
            continue
        if p not in TRANSACTION_MODEL_BY_PILLAR:
            errors.append(f"{n['code']}: pillar '{p}' has no transaction_model mapping")

    # equipment (S3 pillar) must never be tagged as a plain marketplace transaction
    for n in nodes:
        if resolve_pillar(n["code"]) == "S3" and n["code"] != "S3":
            if "certifications" not in n.get("attrs", []):
                errors.append(f"{n['code']}: equipment segment must require certifications")
            if "lead_time_weeks" not in n.get("attrs", []):
                errors.append(f"{n['code']}: equipment segment must require lead_time_weeks")

    return errors


def resolve_pillar(code: str) -> str:
    """Walk up the parent chain to the pillar code (S1..S6)."""
    by_code = {n["code"]: n for n in TREE}
    cur = by_code[code]
    while cur.get("parent"):
        cur = by_code[cur["parent"]]
    return cur["code"]


TRANSACTION_MODEL_BY_PILLAR = {
    "S1": "marketplace",       # chemicals: catalogued, priced, transacted online
    "S2": "marketplace",
    "S3": "brokerage_escrow",  # capex: RFQ -> quote -> escrow -> inspection -> milestone pay
    "S4": "marketplace",
    "S5": "managed_service",   # services: SOW, SLA, milestone delivery
    "S6": "marketplace",
}


def build() -> dict:
    nodes = []
    for n in TREE:
        node = {
            "code": n["code"],
            "name": n["name"],
            "kind": n["kind"],
            "parent": n.get("parent"),
            "applications": n.get("apps", []),
            "mandatory_attributes": n.get("attrs", []),
            "note": n.get("note", ""),
        }
        # derived flags
        code = n["code"]
        # grade_gated  = the end use legally requires a CERTIFIED grade
        #                (S26 food/feed/personal care, S32 pharma).
        # NOTE: S30 (agrochemicals) is deliberately NOT grade-gated -- pesticides
        # are technical-grade by nature, so a grade gate would make the whole
        # segment unsellable. S30 is protected by the licence gate instead.
        node["grade_gated"] = code in ("S26", "S32")
        node["licence_gated"] = code in ("S30", "S32", "S56", "S60", "S61")
        node["is_capex"] = resolve_pillar(code) == "S3"
        node["pillar"] = resolve_pillar(code)
        node["transaction_model"] = TRANSACTION_MODEL_BY_PILLAR[resolve_pillar(code)]
        nodes.append(node)
    return {
        "schema_version": "1.0.0",
        "generated_by": "sourcekettle/plan/taxonomy_builder.py",
        "taxonomies": {
            "A_category_tree": nodes,
            "B_application_tree": [
                {"code": c, "name": nm} for c, nm in sorted(APPLICATIONS.items())
            ],
            "C_attribute_schema": [
                {"key": k, **v} for k, v in ATTRIBUTION_SCHEMA.items()
            ],
        },
        "reference": {
            "storage_classes": [
                {"code": c, "name": nm, "rule": rule} for c, (nm, rule) in STORAGE_CLASSES.items()
            ],
            "ghs_pictograms": [
                {"code": c, "meaning": m} for c, m in GHS_PICTOGRAMS.items()
            ],
        },
    }


def flatten(nodes: list[dict]) -> list[dict]:
    by_code = {n["code"]: n for n in nodes}
    rows = []
    for n in nodes:
        # walk up to build a full path
        path, cur = [], n
        while cur:
            path.append(cur["name"])
            parent = cur.get("parent")
            cur = by_code.get(parent) if parent else None
        rows.append({
            "code": n["code"],
            "kind": n["kind"],
            "full_path": " > ".join(reversed(path)),
            "applications": ";".join(n["applications"]),
            "mandatory_attributes": ";".join(n["mandatory_attributes"]),
            "transaction_model": n["transaction_model"],
            "grade_gated": n["grade_gated"],
            "licence_gated": n["licence_gated"],
            "note": n["note"],
        })
    return rows


def main() -> int:
    errors = validate(TREE)
    if errors:
        print("TAXONOMY VALIDATION FAILED:")
        for e in errors:
            print(f"  - {e}")
        return 1

    doc = build()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    json_path = DATA_DIR / "taxonomy.json"
    json_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    csv_path = DATA_DIR / "taxonomy.csv"
    rows = flatten(doc["taxonomies"]["A_category_tree"])
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

    nodes = doc["taxonomies"]["A_category_tree"]
    print("TAXONOMY VALIDATION PASSED")
    print(f"  pillars      : {sum(1 for n in nodes if n['kind'] == 'pillar')}")
    print(f"  segments     : {sum(1 for n in nodes if n['kind'] == 'segment')}")
    print(f"  subsegments  : {sum(1 for n in nodes if n['kind'] == 'subsegment')}")
    print(f"  total nodes  : {len(nodes)}")
    print(f"  applications : {len(APPLICATIONS)}")
    print(f"  attributes   : {len(ATTRIBUTION_SCHEMA)}")
    print(f"  wrote {json_path.relative_to(HERE.parent.parent)}")
    print(f"  wrote {csv_path.relative_to(HERE.parent.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
