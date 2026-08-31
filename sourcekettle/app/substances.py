"""Substance library for the generated catalogue.

Each row is a real industrial chemical with its identity, hazard profile and
typical commercial attributes. The generator in `catalog_gen.py` expands each
substance across suppliers, grades and pack sizes to reach the target SKU count
-- which is exactly how a real distributor's catalogue is structured: one
substance, many sellable SKUs.

!! CAS numbers below are given for the substances I can state confidently.
Prices, purities and lead times are illustrative. Before production every row
must be replaced with a verified supplier record, and UN numbers re-validated
against the current IMDG/ADR dangerous-goods list.

Row format:
  (code, name, segment, cas, form, purity, un, dg, pg, ghs, flash_c, storage,
   price_base_kobo_per_unit, uom, grades)
"""

from __future__ import annotations

S = lambda *a: a  # readability

# ghs codes are GHS01..GHS09 as defined in the taxonomy reference table
SUBSTANCES: list[tuple] = [
    # ========================= S11 ACIDS / ALKALIS / INORGANICS ==================
    S("NAOH",  "Sodium Hydroxide", "S11.2", "1310-73-2", "flake",  99.0, "1823", "8", "II",  ["GHS05", "GHS07"], None, "SC-2", 48_500, "kg", ["industrial", "technical", "AR"]),
    S("NAOHL", "Sodium Hydroxide Solution 50%", "S11.2", "1310-73-2", "liquid", 50.0, "1824", "8", "II", ["GHS05"], None, "SC-2", 36_000, "kg", ["industrial", "technical"]),
    S("KOH",   "Potassium Hydroxide", "S11.2", "1310-58-3", "flake", 90.0, "1813", "8", "II", ["GHS05", "GHS07"], None, "SC-2", 132_000, "kg", ["industrial", "technical"]),
    S("NA2CO3","Sodium Carbonate (Soda Ash)", "S11.2", "497-19-8", "powder", 99.2, None, "non-DG", None, ["GHS07"], None, "SC-8", 24_500, "kg", ["industrial", "technical"]),
    S("NAHCO3","Sodium Bicarbonate", "S11.2", "144-55-8", "powder", 99.5, None, "non-DG", None, [], None, "SC-8", 19_800, "kg", ["industrial", "food", "technical"]),
    S("HCL",   "Hydrochloric Acid 33%", "S11.1", "7647-01-0", "liquid", 33.0, "1789", "8", "II", ["GHS05", "GHS07"], None, "SC-1", 16_500, "kg", ["technical", "industrial"]),
    S("H2SO4", "Sulphuric Acid 98%", "S11.1", "7664-93-9", "liquid", 98.0, "1830", "8", "II", ["GHS05"], None, "SC-1", 19_800, "kg", ["technical", "industrial"]),
    S("HNO3",  "Nitric Acid 68%", "S11.1", "7697-37-2", "liquid", 68.0, "2031", "8", "II", ["GHS03", "GHS05"], None, "SC-1", 42_000, "kg", ["technical", "AR"]),
    S("H3PO4", "Phosphoric Acid 85%", "S11.1", "7664-38-2", "liquid", 85.0, "1805", "8", "III", ["GHS05"], None, "SC-1", 52_000, "kg", ["technical", "food", "industrial"]),
    S("CH3COOH","Acetic Acid Glacial", "S11.1", "64-19-7", "liquid", 99.8, "2789", "8", "II", ["GHS02", "GHS05"], 39.0, "SC-1", 78_000, "kg", ["technical", "food", "AR"]),
    S("HCOOH", "Formic Acid 85%", "S11.1", "64-18-6", "liquid", 85.0, "1779", "8", "II", ["GHS02", "GHS05", "GHS06"], 50.0, "SC-1", 88_000, "kg", ["technical", "industrial"]),
    S("NAOCL", "Sodium Hypochlorite 12.5%", "S11.3", "7681-52-9", "liquid", 12.5, "1791", "8", "III", ["GHS05", "GHS09"], None, "SC-4", 8_800, "kg", ["industrial", "technical"]),
    S("H2O2",  "Hydrogen Peroxide 50%", "S11.3", "7722-84-1", "liquid", 50.0, "2014", "5.1", "II", ["GHS03", "GHS05", "GHS07"], None, "SC-4", 55_000, "kg", ["technical", "industrial"]),
    S("NACL",  "Sodium Chloride (industrial salt)", "S11.3", "7647-14-5", "powder", 99.5, None, "non-DG", None, [], None, "SC-8", 9_500, "kg", ["industrial", "food"]),
    S("NA2SO4","Sodium Sulphate Anhydrous", "S11.3", "7757-82-6", "powder", 99.0, None, "non-DG", None, [], None, "SC-8", 15_500, "kg", ["industrial", "technical"]),
    S("SMBS",  "Sodium Metabisulphite", "S11.3", "7681-57-4", "powder", 97.0, "2695", "8", "III", ["GHS05", "GHS07"], None, "SC-1", 43_000, "kg", ["industrial", "food", "technical"]),
    S("NH3SOL","Ammonia Solution 25%", "S11.3", "1336-21-6", "liquid", 25.0, "2672", "8", "III", ["GHS05", "GHS07", "GHS09"], None, "SC-2", 38_000, "kg", ["industrial", "technical"]),
    S("CACL2", "Calcium Chloride", "S11.3", "10043-52-4", "granule", 94.0, None, "non-DG", None, ["GHS07"], None, "SC-8", 28_000, "kg", ["industrial", "technical"]),
    S("MGSO4", "Magnesium Sulphate", "S11.3", "7487-88-9", "granule", 99.5, None, "non-DG", None, [], None, "SC-8", 21_000, "kg", ["industrial", "food"]),
    S("AL2SO4","Aluminium Sulphate", "S11.3", "10043-01-3", "powder", 17.0, None, "non-DG", None, ["GHS05"], None, "SC-8", 23_500, "kg", ["industrial", "technical"]),
    S("FECL3", "Ferric Chloride Solution", "S11.3", "7705-07-9", "liquid", 40.0, "2582", "8", "III", ["GHS05"], None, "SC-1", 26_000, "kg", ["industrial", "technical"]),
    S("PAC",   "Poly Aluminium Chloride 30%", "S11.3", "1327-41-9", "liquid", 30.0, None, "non-DG", None, ["GHS05"], None, "SC-8", 13_200, "kg", ["industrial", "technical"]),
    S("NA2SIO3","Sodium Silicate Solution", "S11.3", "1344-09-8", "liquid", 38.0, None, "non-DG", None, ["GHS05"], None, "SC-2", 17_500, "kg", ["industrial", "technical"]),
    S("STPP",  "Sodium Tripolyphosphate", "S11.3", "7758-29-4", "powder", 94.0, None, "non-DG", None, [], None, "SC-8", 62_000, "kg", ["industrial", "food"]),
    S("ZNSO4", "Zinc Sulphate Monohydrate", "S11.3", "7446-20-0", "powder", 98.0, None, "non-DG", None, ["GHS07", "GHS09"], None, "SC-8", 74_000, "kg", ["industrial", "technical"]),
    S("FESO4", "Ferrous Sulphate", "S11.3", "7720-78-1", "granule", 98.0, None, "non-DG", None, ["GHS07"], None, "SC-8", 22_000, "kg", ["industrial", "technical"]),
    S("CAO",   "Quicklime (Calcium Oxide)", "S11.2", "1305-78-8", "powder", 92.0, None, "non-DG", None, ["GHS05", "GHS07"], None, "SC-2", 12_500, "kg", ["industrial", "technical"]),
    S("ZNCL2", "Zinc Chloride Solution", "S11.3", "7646-85-7", "liquid", 50.0, "2331", "8", "III", ["GHS05", "GHS09"], None, "SC-1", 48_000, "kg", ["industrial", "technical"]),

    # ============================== S12 SOLVENTS =================================
    S("MEOH",  "Methanol", "S12.2", "67-56-1", "liquid", 99.8, "1230", "3", "II", ["GHS02", "GHS06"], 11.0, "SC-3", 41_000, "kg", ["technical", "AR", "HPLC"]),
    S("IPA",   "Isopropanol", "S12.2", "67-63-0", "liquid", 99.8, "1219", "3", "II", ["GHS02", "GHS07"], 12.0, "SC-3", 88_000, "kg", ["technical", "AR", "HPLC"]),
    S("ETOH",  "Ethanol (denatured)", "S12.2", "64-17-5", "liquid", 96.0, "1170", "3", "II", ["GHS02"], 13.0, "SC-3", 125_000, "l", ["technical", "food", "AR"]),
    S("ETAC",  "Ethyl Acetate", "S12.2", "141-78-6", "liquid", 99.0, "1173", "3", "II", ["GHS02", "GHS07"], -4.0, "SC-3", 112_000, "kg", ["technical", "AR"]),
    S("ACET",  "Acetone", "S12.2", "67-64-1", "liquid", 99.5, "1090", "3", "II", ["GHS02", "GHS07"], -20.0, "SC-3", 96_000, "kg", ["technical", "AR", "HPLC"]),
    S("TOLU",  "Toluene", "S12.1", "108-88-3", "liquid", 99.5, "1294", "3", "II", ["GHS02", "GHS07", "GHS08"], 4.0, "SC-3", 78_000, "kg", ["technical", "AR"]),
    S("XYLE",  "Xylene (mixed isomers)", "S12.1", "1330-20-7", "liquid", 99.0, "1307", "3", "III", ["GHS02", "GHS07", "GHS08", "GHS09"], 25.0, "SC-3", 82_000, "kg", ["technical", "AR"]),
    S("NAPHTH","Solvent Naphtha (heavy)", "S12.1", "64742-95-6", "liquid", None, "1330", "3", "III", ["GHS02", "GHS07"], 32.0, "SC-3", 68_000, "kg", ["technical", "industrial"]),
    S("MEK",   "Methyl Ethyl Ketone", "S12.2", "78-93-3", "liquid", 99.5, "1193", "3", "II", ["GHS02", "GHS07"], -9.0, "SC-3", 138_000, "kg", ["technical", "AR"]),
    S("MIBK",  "Methyl Isobutyl Ketone", "S12.2", "108-10-1", "liquid", 99.5, "1245", "3", "II", ["GHS02", "GHS07"], 14.0, "SC-3", 152_000, "kg", ["technical", "AR"]),
    S("BUTAC", "Butyl Acetate (n-)", "S12.2", "123-86-4", "liquid", 99.0, "1123", "3", "II", ["GHS02", "GHS07"], 22.0, "SC-3", 128_000, "kg", ["technical", "AR"]),
    S("BUTAN","n-Butanol", "S12.2", "71-36-3", "liquid", 99.5, "1120", "3", "III", ["GHS02", "GHS05", "GHS07"], 29.0, "SC-3", 118_000, "kg", ["technical", "AR"]),
    S("D40",   "Dearomatised Hydrocarbon D40", "S12.1", "64742-47-8", "liquid", None, "1993", "3", "III", ["GHS02"], 41.0, "SC-3", 92_000, "kg", ["technical", "industrial"]),
    S("D80",   "Dearomatised Hydrocarbon D80", "S12.1", "64742-48-9", "liquid", None, "1993", "3", "III", ["GHS02"], 68.0, "SC-3", 98_000, "kg", ["technical", "industrial"]),
    S("WS",    "White Spirit (mineral)", "S12.1", "8052-41-3", "liquid", None, "1993", "3", "III", ["GHS02", "GHS07"], 38.0, "SC-3", 74_000, "kg", ["technical", "industrial"]),
    S("LIMO",  "d-Limonene (bio-based)", "S12.5", "5989-27-5", "liquid", 95.0, "3082", "9", "III", ["GHS07", "GHS09"], 48.0, "SC-8", 265_000, "kg", ["technical", "cosmetic"]),
    S("ELACT", "Ethyl Lactate (bio-based)", "S12.5", "97-64-3", "liquid", 99.0, "1993", "3", "III", ["GHS02"], 46.0, "SC-3", 320_000, "kg", ["technical", "food"]),
    S("DPM",   "Dipropylene Glycol Methyl Ether", "S12.3", "34590-94-8", "liquid", 99.0, None, "non-DG", None, ["GHS07"], 75.0, "SC-8", 245_000, "kg", ["technical", "industrial"]),
    S("EG",    "Ethylene Glycol", "S12.3", "107-21-1", "liquid", 99.5, None, "non-DG", None, ["GHS07"], 111.0, "SC-8", 88_000, "kg", ["industrial", "technical"]),
    S("GLYC",  "Glycerine 99.5%", "S12.3", "56-81-5", "liquid", 99.5, None, "non-DG", None, [], 160.0, "SC-8", 96_000, "kg", ["food", "pharma", "cosmetic", "technical"]),

    # ====================== S13 POLYMERS / S14 FILLERS ==========================
    S("HDPE",  "HDPE Blow Moulding Grade", "S13.1", "9002-88-4", "granule", None, None, "non-DG", None, [], None, "SC-8", 118_000, "kg", ["industrial"]),
    S("LDPE",  "LDPE Film Grade", "S13.1", "9002-88-4", "granule", None, None, "non-DG", None, [], None, "SC-8", 124_000, "kg", ["industrial"]),
    S("PPH",   "PP Homopolymer Raffia Grade", "S13.1", "9003-07-0", "granule", None, None, "non-DG", None, [], None, "SC-8", 112_000, "kg", ["industrial"]),
    S("PPC",   "PP Copolymer Injection Grade", "S13.1", "9003-07-0", "granule", None, None, "non-DG", None, [], None, "SC-8", 128_000, "kg", ["industrial"]),
    S("PET",   "PET Bottle Grade", "S13.1", "25038-59-9", "granule", None, None, "non-DG", None, [], None, "SC-8", 108_000, "kg", ["industrial"]),
    S("PS",    "Polystyrene General Purpose", "S13.1", "9003-53-6", "granule", None, None, "non-DG", None, [], None, "SC-8", 132_000, "kg", ["industrial"]),
    S("ABS",   "ABS Natural Grade", "S13.1", "9003-56-9", "granule", None, None, "non-DG", None, [], None, "SC-8", 186_000, "kg", ["industrial"]),
    S("PA6",   "Polyamide 6 Natural", "S13.2", "25038-54-4", "granule", None, None, "non-DG", None, [], None, "SC-8", 268_000, "kg", ["industrial"]),
    S("PC",    "Polycarbonate Clear Grade", "S13.2", "25037-45-0", "granule", None, None, "non-DG", None, [], None, "SC-8", 312_000, "kg", ["industrial"]),
    S("PVC",   "PVC Suspension Resin K67", "S13.3", "9002-86-2", "powder", None, None, "non-DG", None, [], None, "SC-8", 98_000, "kg", ["industrial"]),
    S("DOP",   "Dioctyl Phthalate (DOP)", "S13.3", "117-81-7", "liquid", 99.5, None, "non-DG", None, ["GHS08"], 206.0, "SC-8", 168_000, "kg", ["industrial", "technical"]),
    S("EPX",   "Epoxy Resin E-128 (liquid)", "S13.4", "25068-38-6", "liquid", None, None, "non-DG", None, ["GHS07", "GHS09"], 200.0, "SC-8", 218_000, "kg", ["industrial", "technical"]),
    S("UPR",   "Unsaturated Polyester Resin (orthophthalic)", "S13.4", "26098-37-3", "liquid", None, "1993", "3", "III", ["GHS02", "GHS07"], 33.0, "SC-3", 182_000, "kg", ["industrial"]),
    S("MDI",   "Polymeric MDI", "S13.4", "9016-87-9", "liquid", None, "2489", "6.1", "II", ["GHS06", "GHS07", "GHS08"], 212.0, "SC-6", 385_000, "kg", ["industrial"]),
    S("TIO2",  "Titanium Dioxide Rutile", "S14", "13463-67-7", "powder", 93.0, None, "non-DG", None, [], None, "SC-8", 245_000, "kg", ["industrial", "technical"]),
    S("TIO2A", "Titanium Dioxide Anatase", "S14", "13463-67-7", "powder", 98.0, None, "non-DG", None, [], None, "SC-8", 228_000, "kg", ["industrial"]),
    S("CACO3", "Calcium Carbonate (GCC)", "S14", "471-34-1", "powder", 98.5, None, "non-DG", None, [], None, "SC-8", 7_800, "kg", ["industrial", "technical"]),
    S("KAOLIN","Kaolin (calcined)", "S14", "1332-58-7", "powder", 98.0, None, "non-DG", None, [], None, "SC-8", 9_200, "kg", ["industrial"]),
    S("TALC",  "Talc (micronised)", "S14", "14807-96-6", "powder", 97.0, None, "non-DG", None, [], None, "SC-8", 11_500, "kg", ["industrial", "cosmetic"]),
    S("SILFUM","Fumed Silica", "S14", "7631-86-9", "powder", 99.8, None, "non-DG", None, [], None, "SC-8", 385_000, "kg", ["industrial", "technical"]),
    S("BARIUM","Barium Sulphate (precipitated)", "S14", "7727-43-7", "powder", 98.5, None, "non-DG", None, [], None, "SC-8", 42_000, "kg", ["industrial"]),
    S("CBLK",  "Carbon Black N330", "S14", "1333-86-4", "powder", 99.0, None, "non-DG", None, [], None, "SC-8", 96_000, "kg", ["industrial"]),
    S("FE2O3", "Iron Oxide Red", "S14", "1309-37-1", "powder", 95.0, None, "non-DG", None, [], None, "SC-8", 68_000, "kg", ["industrial"]),
    S("ZNO",   "Zinc Oxide (indirect process)", "S14", "1314-13-2", "powder", 99.5, None, "non-DG", None, [], None, "SC-8", 185_000, "kg", ["industrial", "cosmetic"]),

    # ==================== S20 SURFACTANTS / S21-S24 SPECIALTY ===================
    S("LABSA", "Linear Alkyl Benzene Sulphonic Acid 90%", "S20", "25155-30-0", "liquid", 90.0, "2584", "8", "III", ["GHS05"], None, "SC-1", 129_000, "kg", ["technical", "industrial"]),
    S("SLES",  "Sodium Laureth Sulphate 70%", "S20", "68891-38-3", "paste", 70.0, None, "non-DG", None, ["GHS07"], None, "SC-8", 108_500, "kg", ["technical", "industrial"]),
    S("SLS",   "Sodium Lauryl Sulphate (powder)", "S20", "151-21-3", "powder", 95.0, None, "non-DG", None, ["GHS05", "GHS07"], None, "SC-8", 142_000, "kg", ["technical", "cosmetic"]),
    S("CAPB",  "Cocamidopropyl Betaine 30%", "S20", "61789-40-0", "liquid", 30.0, None, "non-DG", None, [], None, "SC-8", 134_000, "kg", ["technical", "cosmetic"]),
    S("APG",   "Alkyl Polyglucoside", "S20", "68515-73-1", "liquid", 60.0, None, "non-DG", None, [], None, "SC-8", 215_000, "kg", ["technical", "cosmetic"]),
    S("AEO",   "Alcohol Ethoxylate (C12-14, 7EO)", "S20", "68439-50-9", "liquid", None, None, "non-DG", None, [], None, "SC-8", 158_000, "kg", ["technical", "industrial"]),
    S("BTMAC", "Benzalkonium Chloride 50%", "S20", "68424-85-1", "liquid", 50.0, None, "non-DG", None, ["GHS05", "GHS06", "GHS09"], None, "SC-8", 198_000, "kg", ["technical", "industrial"]),
    S("PAMAN", "Anionic Polyacrylamide Flocculant", "S23", "9003-05-8", "granule", None, None, "non-DG", None, [], None, "SC-8", 165_000, "kg", ["industrial", "technical"]),
    S("PAMCAT","Cationic Polyacrylamide Flocculant", "S23", "9003-05-8", "granule", None, None, "non-DG", None, [], None, "SC-8", 188_000, "kg", ["industrial"]),
    S("ANTISC","RO Antiscalant (phosphonate based)", "S23", None, "liquid", None, None, "non-DG", None, ["GHS07"], None, "SC-8", 78_000, "kg", ["industrial"]),
    S("OSCAV", "Oxygen Scavenger (sulphite based)", "S23", None, "liquid", None, None, "non-DG", None, ["GHS07"], None, "SC-8", 69_000, "kg", ["industrial"]),
    S("BIOCIDE","Isothiazolinone Biocide (MIT/CMIT)", "S23", "26172-55-4", "liquid", 14.0, "3082", "9", "III", ["GHS05", "GHS06", "GHS07", "GHS08", "GHS09"], None, "SC-6", 245_000, "kg", ["industrial"]),
    S("EDTA4NA","Tetrasodium EDTA 40%", "S23", "60-00-4", "liquid", 40.0, None, "non-DG", None, ["GHS07"], None, "SC-8", 168_000, "kg", ["industrial", "cosmetic"]),
    S("GLUCON","Sodium Gluconate", "S23", "527-07-1", "powder", 98.0, None, "non-DG", None, [], None, "SC-8", 182_000, "kg", ["industrial", "food"]),
    S("CIPALK","CIP Alkaline Detergent", "S24", None, "liquid", 30.0, "1719", "8", "III", ["GHS05"], None, "SC-2", 39_500, "kg", ["industrial"]),
    S("CIPACID","CIP Acid Detergent (nitric/phosphoric)", "S24", None, "liquid", 25.0, "2031", "8", "II", ["GHS03", "GHS05"], None, "SC-1", 45_500, "kg", ["industrial"]),
    S("DEGREASE","Alkaline Degreaser Concentrate", "S24", None, "liquid", None, "1719", "8", "III", ["GHS05"], None, "SC-2", 52_000, "kg", ["industrial"]),
    S("SANITISER","Quaternary Sanitiser Concentrate", "S24", None, "liquid", None, "3082", "9", "III", ["GHS05", "GHS07", "GHS09"], None, "SC-8", 88_000, "kg", ["industrial"]),
    S("DEFOAM","Silicone Antifoam Emulsion", "S21.2", "63148-62-9", "emulsion", None, None, "non-DG", None, [], None, "SC-8", 268_000, "kg", ["industrial", "technical"]),
    S("DISPER","Polymeric Dispersant", "S21.2", None, "liquid", None, None, "non-DG", None, ["GHS07"], None, "SC-8", 245_000, "kg", ["industrial"]),
    S("HEC",   "Hydroxyethyl Cellulose (thickener)", "S21.2", "9004-62-0", "powder", None, None, "non-DG", None, [], None, "SC-8", 385_000, "kg", ["industrial", "cosmetic"]),
    S("IRGANOX","Hindered Phenolic Antioxidant", "S21.1", "6683-19-8", "powder", None, None, "non-DG", None, [], None, "SC-8", 890_000, "kg", ["industrial"]),
    S("ATH",   "Aluminium Trihydrate (flame retardant)", "S21.1", "21645-51-2", "powder", 99.5, None, "non-DG", None, [], None, "SC-8", 78_000, "kg", ["industrial"]),
    S("CAUSTFOOD","Citric Acid Monohydrate", "S26", "77-92-9", "granule", 99.5, None, "non-DG", None, [], None, "SC-8", 145_000, "kg", ["food", "pharma", "technical"]),
    S("SORBATE","Potassium Sorbate", "S26", "24634-61-5", "granule", 99.0, None, "non-DG", None, ["GHS07"], None, "SC-8", 485_000, "kg", ["food", "pharma"]),
    S("XANTHAN","Xanthan Gum", "S26", "11138-66-2", "powder", None, None, "non-DG", None, [], None, "SC-8", 685_000, "kg", ["food", "cosmetic"]),
    S("ASCORB","Ascorbic Acid (Vitamin C)", "S26", "50-81-7", "powder", 99.0, None, "non-DG", None, [], None, "SC-8", 780_000, "kg", ["food", "pharma"]),
    S("HYDOIL","Hydraulic Oil ISO VG 46", "S27", None, "liquid", None, None, "non-DG", None, [], 210.0, "SC-8", 98_000, "l", ["industrial"]),
    S("GEAROIL","Gear Oil ISO VG 220", "S27", None, "liquid", None, None, "non-DG", None, [], 220.0, "SC-8", 112_000, "l", ["industrial"]),
    S("CUTFLUID","Soluble Cutting Fluid Concentrate", "S27", None, "emulsion", None, None, "non-DG", None, ["GHS07"], None, "SC-8", 185_000, "l", ["industrial"]),
    S("UREA",  "Urea (granular, fertiliser grade)", "S30", "57-13-6", "granule", 46.0, None, "non-DG", None, [], None, "SC-8", 42_000, "kg", ["technical", "industrial"]),
    S("NPK",   "NPK 15-15-15 Compound Fertiliser", "S30", None, "granule", None, None, "non-DG", None, [], None, "SC-8", 48_000, "kg", ["technical"]),
    S("GLYPH", "Glyphosate 41% SL", "S30", "1071-83-6", "liquid", 41.0, "3016", "6.1", "III", ["GHS07", "GHS09"], None, "SC-6", 235_000, "l", ["technical"]),
]

# Substances without a CAS in the library (formulations / blends). The engine
# treats a missing CAS as legitimate for formulated products.
def cas_or_none(c):
    return c
