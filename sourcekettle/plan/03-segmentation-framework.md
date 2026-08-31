# The SourceKettle Segmentation Framework

## 0. The one idea that makes this work

Most chemical catalogues are organised by **chemistry** (acids, solvents, salts). That is how a
chemist thinks and how almost no buyer shops. A procurement officer thinks:

> *"I need the stuff that keeps Line 2 running."*

So SourceKettle runs **two orthogonal taxonomies** on every product:

- **Taxonomy A — Category tree** (`CS-A`) — the shelf. Physical/functional family. Used for
  catalogue navigation, supplier onboarding, freight grouping.
- **Taxonomy B — Application / line tree** (`CS-B`) — the job. Which process the product serves.
  Used for buyer onboarding, recommendations, "complete your line" bundles.

Every SKU gets one primary A-node and one or more B-nodes, plus a set of **attributes** (hazard,
grade, packaging, form). That combination is what makes search, substitution and compliance
automation possible. See `data/taxonomy.json` for the machine-readable version.

---

# TAXONOMY A — The Category Tree (the shelf)

Six pillars. Codes are stable — never renumber, only append.

```
S1  RAW MATERIALS — BULK & COMMODITY
S2  RAW MATERIALS — SPECIALTY & FORMULATED
S3  MACHINES & PROCESS EQUIPMENT
S4  CONSUMABLES, MRO & PACKAGING
S5  SERVICES
S6  OVERSTOCK, OFF-SPEC & SECONDARY MATERIALS
```

---

## S1 — Raw materials: bulk & commodity chemicals

High volume, low margin, spec-interchangeable between suppliers. Sold by the tanker, ISO tank,
25 kg bag, or 1,000–1,250 kg IBC. **Procurement logic: landed cost + reliability + payment terms.**

### S10 Feedstocks & petrochemical base
Solvent naphtha, methanol, toluene, xylene, acetone, MEG/DEG, glycerine (crude & refined), phenol,
formalin, ethylene oxide/propylene oxide derivatives, fatty acids, fatty alcohols.
*Hazard: mostly DG Class 3 flammable liquids. Requires bonded warehousing.*

### S11 Acids, alkalis & inorganics
| Sub-segment | Representative SKUs |
|---|---|
| S11.1 Mineral acids | Hydrochloric (33%), sulphuric (98%), nitric (68%), phosphoric (85% tech/food) |
| S11.2 Alkalis | Caustic soda (flakes 98% / lye 47–50%), potash, soda ash light & dense |
| S11.3 Salts & inorganics | Sodium sulphate, bicarbonate, metabisulphite, hypochlorite (12.5%), alum, PAC, ferric chloride, lime, zinc oxide, titanium dioxide (rutile/anatase) |
| S11.4 Gases | Nitrogen, oxygen, argon, CO₂, hydrogen, LPG, acetylene, specialty gas mixes (cylinder, dewar, bulk) |

*Hazard: S11.1/S11.2 = Class 8 corrosive. Gases = Class 2. Segregated storage is mandatory — never
co-locate acids and hypochlorite.*

### S12 Solvents
- **S12.1 Hydrocarbon & aliphatic:** hexane, heptane, kerosene, white spirit, D40/D60/D80,
  isoparaffins
- **S12.2 Oxygenated:** methanol, ethanol (denatured/absolute/extra-neutral), IPA, butanol, ethyl
  acetate, butyl acetate, MIBK, MEK, acetone
- **S12.3 Glycol ethers & high-boilers:** 2-ethylhexanol, DPM, TPM, DOWANOL-class glycol ethers
- **S12.4 Halogenated:** methylene chloride, chloroform, trichloroethylene *(increasingly restricted —
  flag as controlled/restricted in the catalogue)*
- **S12.5 Green / bio-based solvents:** d-limonene, ethyl lactate, methyl soyate, glycerol formal,
  dibasic esters

*This is usually the single best entry category: high repeat purchase, clear specs, strong price
opacity, and a buyer who already knows exactly what they want.*

### S13 Polymers, resins & elastomers
- **S13.1 Commodity thermoplastics:** PE (HDPE/LDPE/LLDPE), PP homo & copolymer, PS, EPS, ABS, PET
- **S13.2 Engineering plastics:** PA6/PA66, PC, POM, PBT, PMMA, PPS, PEEK, PVDF, PTFE
- **S13.3 PVC & plasticisers:** suspension PVC, CPVC, DOP/DOTP/DINP/ATBC
- **S13.4 Thermosets:** epoxy resin + hardeners, UP resin, phenolic, PU systems (MDI/TDI/polyol)
- **S13.5 Elastomers & rubber:** natural rubber, SBR, NBR, EPDM, silicone gum, reclaimed rubber
- **S13.6 Recycled & bio-based:** rPET, rPP, regrind, PLA, PHA, bio-PE

### S14 Bulk additives, fillers & pigments
Calcium carbonate (GCC/PCC), talc, kaolin, silica (fumed/precipitated), barium sulphate, mica,
wollastonite, carbon black, titanium dioxide, iron oxides, organic & inorganic pigment ranges,
masterbatches (colour, white, black, additive).

---

## S2 — Raw materials: specialty & formulated

Lower volume, higher margin, **function-driven and harder to substitute** — the buyer needs a
technical datasheet and often a sample before committing. **Procurement logic: qualification, not
just price.**

### S20 Surfactants & detergent bases
LABSA 90%, SLES 70% (2EO/3EO), SLS, AES, CAPB, AEO, APG, alcohol ethoxylates, sulfosuccinates,
amine oxides, quaternary ammonium compounds (BTC, DDAC), gemini & silicone surfactants.

### S21 Specialty additives & performance chemicals
- **S21.1 Polymer additives:** antioxidants (Irganox-class), UV stabilisers, HALS, heat stabilisers,
  flame retardants (APP, ATH, brominated, phosphorus), nucleating agents, slip & antiblock
- **S21.2 Processing aids:** compatibilisers, coupling agents, defoamers, dispersants, rheology
  modifiers, biocides, preservatives (MIT/CMIT, phenoxyethanol), antistats
- **S21.3 Functional fillers & nanomaterials:** nanosilica, nanoclay, carbon nanotubes, graphene
  *(low volume, high value, sample-heavy)*

### S22 Coatings, inks & adhesive raw materials
Alkyds, acrylics, PU dispersions, nitrocellulose, rosin & derivatives, titanium dioxide, extenders,
coalescents, thickeners (HEC/ASE/HEUR), pigments & dyes, solvents, photoinitiators, monomers &
oligomers for UV systems.

### S23 Water treatment & process chemicals
Coagulants (alum, PAC, ferric), flocculants (anionic/cationic/nonionic polyacrylamide), antiscalants,
corrosion inhibitors, oxygen scavengers, biocides (oxidising & non-oxidising), pH adjusters, ion
exchange resins, activated carbon, membrane antiscalants & cleaners, chelants (EDTA, DTPA,
gluconates), boiler chemicals, cooling tower treatment.

### S24 Industrial & institutional cleaning
Alkaline cleaners, acid descalers, solvent degreasers, CIP detergents & sanitisers, foam control,
laundry chemicals, handwash & sanitisers, floor care, enzymatic cleaners.

### S25 Textile, leather, paper & pulp chemicals
Sizing agents, wet-strength resins, retention aids, optical brighteners, dye-fixing agents, tanning
agents (chrome-free), fatliquors, defoamers, bleaching stabilisers, anti-crease & softener bases.

### S26 Food, feed & personal-care ingredients *(grade-gated segment)*
Acidulants, preservatives, sweeteners, thickeners & hydrocolloids, emulsifiers, vitamins, amino
acids, flavours, colours, cosmetic-grade actives, emollients, waxes, silicones.
**Rule: this segment requires food/pharma/cosmetic grade certification, allergen declarations and
batch-level traceability. Do not open it until your document vault can enforce that.**

### S27 Oils, lubricants & metalworking fluids
Base oils (Group I–III, PAO, esters), greases, hydraulic & gear oils, compressor & transformer oils,
metalworking fluids (soluble, semi-synthetic, neat), quenching oils, rust preventives, heat transfer
fluids.

### S28 Adhesives & sealants *(finished)*
Epoxies, PU, silicones, cyanoacrylates, hot-melts & EVA, PVAc, MS polymers, anaerobics, tapes.

### S29 Construction & infrastructure chemicals
Concrete admixtures (PCE, lignosulphonate, naphthalene), waterproofing, grouts, repair mortars,
tile adhesives, curing compounds, protective coatings, geochemicals.

### S30 Agrochemicals & plant nutrition
NPK & water-soluble fertilisers, micronutrients, pesticides (insecticide/fungicide/herbicide),
plant growth regulators, biostimulants, soil conditioners.
**Rule: heavily licence-gated. Verify seller and buyer licences before enabling transactions.**

### S31 Laboratory & reagent chemicals
AR/LR grades, analytical standards, reference materials, indicator dyes, buffer salts,
chromatography media, solvents (HPLC/GC grade), titration reagents.

### S32 Pharma & fine chemicals *(gate carefully)*
APIs, pharmaceutical intermediates, excipients (MCC, lactose, starch, magnesium stearate),
bio-buffers. **Highest compliance burden of any segment — GMP documentation, CEP/DMF, country
licences. Enter only with a regulatory partner.**

### S33 Catalysts, enzymes & biotech inputs
Precious-metal & base-metal catalysts, zeolites, supported catalysts, industrial enzymes
(amylase, protease, lipase, cellulase), fermentation media & nutrients, starter cultures.

---

## S3 — Machines & process equipment

Capex. Long cycle, high value, needs installation and after-sales. **Sell as brokerage + escrow +
inspection, not as marketplace inventory.**

### S34 Reaction & mixing
Reactors (SS316, GLA/glass-lined, jacketed), agitated vessels, high-shear mixers, planetary mixers,
homogenisers, ribbon & conical blenders, dissolvers, milling & grinding (bead, ball, hammer),
crystallisers, evaporators, spray dryers.

### S35 Separation & purification
Distillation columns & trays/packing, wiped-film evaporators, filtration (filter press, Nutsche,
candle), centrifuges (decanter, basket, disc stack), hydrocyclones, extraction units, dryers
(tray, FBD, vacuum, flash), membrane systems (UF/NF/RO), dust collectors.

### S36 Heat transfer & thermal
Shell & tube / plate heat exchangers, cooling towers, chillers, thermic fluid heaters, industrial
ovens & furnaces, steam boilers, heat recovery, jacketed piping, tracing.

### S37 Fluid handling, transfer & storage
Centrifugal, gear, diaphragm (AODD), lobe, peristaltic, screw, magnetic-drive and **magnetically
coupled sealless** pumps *(the correct answer for corrosive/flammable duty)*; valves (ball, gate,
butterfly, diaphragm, pinch, safety-relief); hose & coupling; IBCs, drums, silos, agitators, level &
containment systems.

### S38 Instrumentation, control & automation
Flow (magnetic, coriolis, ultrasonic), level (radar, ultrasonic, float), pressure & temperature
transmitters, analytical instruments (pH, ORP, conductivity, turbidity, dissolved O₂), control
valves & actuators, PLC & DCS, HMI/SCADA, variable-frequency drives, weighing & load cells,
**gas detection and safety interlock systems**.

### S39 Filling, packaging & labelling lines
Drum & IBC filling stations, bottling & capping, sachet/form-fill-seal, carton sealers,
shrink-wrap, palletisers, labellers, metal detectors, checkweighers, coders & printers.

### S40 Material handling
Forklifts (electric/diesel), stackers, pallet trucks, conveyors, hoists & EOT cranes, industrial
vacuum systems, AGVs.

### S41 Utilities, energy & effluent
Air compressors, air dryers, nitrogen/oxygen generators, RO & demineralisation plants, ETP/STP
equipment (clarifiers, DAF units, MBBR/MBBR media), sludge dewatering, incinerators, solar thermal,
UPS & generators.

### S42 Lab & QC equipment
Fume hoods, hotplates & stirrers, ovens & muffs, viscometers, spectrophotometers, HPLC/GC,
titrators, particle size analysers, moisture analysers, balances, colour measurement.

### S43 Line-specific process machinery
*(the vertical bundles — this is where the "we sell the line" promise becomes literal)*
Detergent & liquid-washing lines, paint & coatings dispersion lines, food processing lines,
cosmetic/cream & lotion lines, plastic compounding & extrusion, water bottling, blending &
packaging skids.

### S44 Used, refurbished & rental equipment
Second-hand reactors and centrifuges, refurbished instruments, rental dosing skids and temporary
utilities. **High-margin, underserved, and a natural fit for an escrow + inspection service.**

---

## S4 — Consumables, MRO & packaging

Low unit value, **highest order frequency**, and the category that creates daily engagement.
Grainger-style availability beats price here.

| Code | Segment | Representative items |
|---|---|---|
| **S45** | Packaging | HDPE & steel drums (200/210/220 L), IBCs, jerry cans (5–30 L), PP/PE bags & FIBCs, liners, drum accessories (bungs, caps, rings, seals), pails & tubs, bottles, closures, sachet film, shrink & stretch film, carton & corrugated, wooden/plastic pallets, strapping & tapes |
| **S46** | PPE & safety | Nitrile/latex/neoprene/butyl & chemical gauntlets, coveralls (Type 3/4/5/6), respirators (half/full mask, PAPR, cartridges), safety shoes & boots, face shields, goggles, chemical aprons, spill kits, eyewash & safety showers, first-aid, lockout-tagout, gas detectors |
| **S47** | Filtration & separation consumables | Filter bags (PP/PE/PTFE, 1–800 µm), cartridge filters, filter cloths & plates, membranes & spares, activated carbon, filter aid (diatomite, perlite), sieve & screen meshes |
| **S48** | Gaskets, seals & hose | Spiral-wound & ring-joint gaskets, EPDM/NBR/Viton/PTFE seals, O-ring kits, hose assemblies, quick couplings |
| **S49** | Electrical & instrumentation consumables | Contactors, relays, MCB/MCCB, cables & glands, cable trays, sensors & transmitters, calibrators, indicator lamps |
| **S50** | Maintenance & workshop | Industrial adhesives, threadlockers, lubricants & greases, aerosols, cutting & grinding discs, drill bits & taps, abrasives, welding electrodes & wire, paints, cleaners & degreasers, janitorial |
| **S51** | QC & lab consumables | Glassware, volumetric flasks & pipettes, filters & membranes, reagents, standards, sample containers, gloves, lab wipes, chromatography consumables |
| **S52** | Packing & despatch consumables | Labels & thermal ribbons, ink & coders, void fill, bubble wrap, edge protectors, desiccants, VCI anti-corrosion packaging |

---

## S5 — Services

The services layer is what stops disintermediation. These are high-margin and they bind the
transaction to the platform.

| Code | Service |
|---|---|
| **S55** | Sourcing & brokerage — RFQ management, supplier qualification, factory audits, cost benchmarking |
| **S56** | Logistics & dangerous-goods transport — DG-certified trucking, tank cleaning, hazmat warehousing, ISO tank leasing, freight forwarding, customs brokerage, cargo insurance |
| **S57** | Testing, inspection & QC — third-party lab analysis (SGS/Intertek/Bureau Veritas class), pre-shipment inspection, batch retention sampling, CoA verification |
| **S58** | Regulatory & compliance — SDS authoring & translation, REACH only-representative, TSCA statements, product registration, labelling & GHS classification, HS classification |
| **S59** | Engineering, installation & after-sales — commissioning, AMC/CMC contracts, spares management, operator training, equipment validation |
| **S60** | Trade finance & insurance — supplier credit, invoice discounting, escrow & milestone payment, LC management, product liability cover |
| **S61** | Waste, recovery & circularity — spent-solvent recovery, effluent treatment services, packaging take-back, chemical destruction/disposal |

---

## S6 — Overstock, off-spec & secondary materials

Frequently ignored, genuinely profitable, and an excellent supply-side wedge: distributors and
plants sit on drums of near-expiry or off-spec material they want to move.

| Code | Segment |
|---|---|
| **S65** | Surplus & slow-moving stock (original packaging, documented) |
| **S66** | Off-spec & downgraded material (sold with full CoA deviation disclosure) |
| **S67** | Recovered & reclaimed solvents, re-refined oils |
| **S68** | Recycled resins, regrind, reclaimed rubber |

**Hard rule:** every S6 item must carry its deviation disclosure and cannot be recommended for
grade-gated end uses (S26, S32).

> **Correction found while building the app:** S30 was originally listed as grade-gated alongside
> S26 and S32. That is wrong — pesticides are technical-grade by nature, so a grade gate made the
> entire agrochemical segment unsellable (every product failed with `grade=technical`). S30 is now
> **licence-gated only**. The distinction matters: a *grade* gate protects an end use that legally
> requires certified purity (food, pharma); a *licence* gate protects a transaction that requires
> legal authority. Do not conflate them. Regression tests cover both directions.

---

# TAXONOMY B — The Application / Line Tree (the job)

This is the axis buyers actually navigate by. Codes are `B##`.

```
B01  Water treatment & municipal         B10  Food & beverage processing
B02  Detergent, soap & home care         B11  Personal care & cosmetics
B03  Paints, coatings & inks             B12  Pharmaceutical & nutraceutical
B04  Plastics, compounding & masterbatch B13  Electronics & semiconductors
B05  Textile, leather & apparel          B14  Automotive & metal finishing
B06  Paper, pulp & packaging             B15  Construction & infrastructure
B07  Oil, gas & petrochemical            B16  Power generation & utilities
B08  Mining & mineral processing         B17  Agriculture & agri-inputs
B09  Chemical processing & fine chem     B18  General manufacturing / MRO
```

**How the two axes combine (worked example):**

> *Product:* Caustic soda flakes 98%
> **Taxonomy A:** `S11.2 Alkalis` · **Taxonomy B:** `B01, B02, B06, B09, B14`
> **Attributes:** grade = industrial · form = solid flake · DG class = 8 · UN = 1823 ·
> packaging = [25 kg bag, 50 kg bag, 1,000 kg jumbo] · storage class = corrosive-dry
>
> *Product:* 5,000 L SS316 jacketed reactor with high-shear mixer
> **Taxonomy A:** `S34 Reaction & mixing` · **Taxonomy B:** `B02, B11, B03`
> **Attributes:** material = SS316L · capacity = 5000 L · pressure = jacketed 3 bar ·
> certification = [PED, ASME-U] · condition = new · lead time = 10–14 weeks

Because the same node carries `B02`, the platform can answer *"show me everything I need to run a
detergent line"* — which no chemistry-first catalogue can.

---

# TAXONOMY C — The Attribute Layer (the filters)

Attributes are what make search, substitution and compliance automation possible. Every product
must resolve all **mandatory** attributes for its segment before it can go live.

| Attribute | Type | Mandatory? | Why it matters |
|---|---|---|---|
| `cas_number` | string | Chems only | The single source of truth for identity |
| `eci_ne_number` | string | EU trade | REACH identity |
| `grade` | enum: technical / industrial / USP / BP / EP / food / pharma / cosmetic / AR / LR / HPLC / electronic | **Yes** | Determines which end uses are legal |
| `purity_min_pct` | decimal | Yes | Spec matching |
| `physical_form` | enum: solid / liquid / gas / powder / granule / flake / paste / emulsion | **Yes** | Handling + freight |
| `un_number` | string (4 digit) | **Yes** | DG declaration; must be validated against the UN list, never free-typed |
| `dg_class` | enum 1–9 or "non-DG" | **Yes** | Segregation, carrier eligibility |
| `packing_group` | I / II / III | If DG | Packaging standard |
| `ghs_pictograms` | enum array GHS01–GHS09 | **Yes** | Labelling |
| `h_statements` / `p_statements` | code arrays | Yes | SDS-derived |
| `flash_point_c` | decimal | Yes | Flammability, warehouse class |
| `storage_class` | enum | **Yes** | Warehouse segregation rules |
| `packaging_options` | array with unit + weight | **Yes** | Quote & freight calculation |
| `moq` + `uom` | number | **Yes** | Quote validity |
| `shelf_life_months` | number | Yes | FIFO, expiry alerts |
| `hs_code` | string (6–10) | Yes for import | Customs + duty |
| `country_of_origin` | ISO 3166 | Yes | Duty, restrictions |
| `shelf_life_remaining_pct` | number | For S6 items | Secondary-material disclosure |
| `certifications` | array (ISO 9001, REACH-registered, Halal, Kosher, FDA, GMP, UL, CE, ATEX, PED) | Conditional | Buyer gate |
| `documentation` | array (SDS, CoA, TDS, food-grade cert, allergen statement) | **Yes** | Compliance pack |

### Hazard-based view (the EHS persona's lens — P3)

Chemicals also live in a **storage-segregation view** derived from the attributes above:

| Storage class | Contents | Rule |
|---|---|---|
| **SC-1** Corrosive acids | HCl, H₂SO₄, HNO₃ | Separate bunded area; never with alkalis or hypochlorite |
| **SC-2** Corrosive alkalis | Caustic soda, potash | Bunded, dry, away from acids & metals |
| **SC-3** Flammable liquids | Solvents Class 3 | Fire-rated store, ATEX electricals, bonding/earthing |
| **SC-4** Oxidisers | Hypochlorite, peroxides, nitrates | Away from flammables & organics |
| **SC-5** Compressed gases | Class 2 cylinders | Upright, chained, ventilated, segregated by gas type |
| **SC-6** Toxic & CMR | Restricted substances | Locked store, access log |
| **SC-7** Water-reactive | Certain metals, hydrides | Dry store, no sprinklers |
| **SC-8** General non-DG | Most salts, polymers, fillers | Standard racking |

The platform should compute a buyer's **warehouse segregation plan** from their basket. That is a
feature no distributor offers, and it makes EHS your internal champion.

---

*Next: `04-monetisation.md`. The machine-readable taxonomy lives at `sourcekettle/data/taxonomy.json`.*
