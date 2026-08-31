# Compliance, Regulatory & Safety Architecture

This is the section that most first-time founders skip and the one that most often ends the company.
A mis-declared dangerous-goods shipment is not a customer-service incident — it is a criminal
liability and, at worst, a fatality. **Compliance is an MVP feature, not a phase-3 module.**

> ⚠️ **This document is an engineering and product checklist, not legal advice.** Engage a
> regulatory consultant and a DG safety adviser in your launch jurisdiction before your first
> transaction. Verify every requirement against current primary sources.

---

## 1. The compliance envelope

Every product in SourceKettle carries a **compliance envelope** — a versioned bundle that travels with
the order. If any required member is missing, the item cannot be quoted. This is enforced in code,
not by a human checking a box.

```
compliance_envelope
├── identity        CAS, EINECS/EC, INCI (if cosmetic), trade name, synonyms, HS code
├── hazard          UN number, DG class, packing group, GHS pictograms, H/P statements,
│                   flash point, exposure limits (OEL/TLV), CMR status
├── documentation   SDS (versioned, dated, language-correct), CoA (per batch), TDS,
│                   grade certificate, allergen statement (S26), GMP dossier (S32)
├── transport       proper shipping name, label set, packaging UN rating, segregation rules,
│                   tunnel code / transport category, emergency instructions
├── regulatory      REACH registration no. & tonnage band, SVHC status, TSCA inventory status,
│                   authorisation/restriction references, national registration (S30)
└── provenance      manufacturer, country of origin, batch/lot, manufacture & expiry date,
                    chain-of-custody for S6 secondary materials
```

**Versioning rule:** the SDS is the single most-versioned document in this business. Store every
revision immutably with its issue date. A shipment must reference the SDS revision that was current
**on the ship date**, not the latest one. Auditors ask exactly this question.

## 2. Jurisdiction matrix

| Regime | Where | What it demands of the platform |
|---|---|---|
| **UN GHS** | Global | 16-section SDS format, standardised pictograms (GHS01–GHS09), H/P statements. Build the pictogram and statement sets as controlled vocabularies — see `reference.ghs_pictograms` in `data/taxonomy.json` |
| **REACH / CLP** | EU (+ UK REACH) | Registration numbers, tonnage bands, SVHC candidate-list screening (updated ~twice yearly — you need a scheduled re-screen of the whole catalogue), authorisation & restriction lists, EU-language SDS |
| **TSCA** | USA | Inventory status; **positive or negative certification must be filed with customs by the importer of record**. The platform can generate it but the buyer signs it |
| **ADR / IMDG / IATA-DGR** | Road / sea / air | Transport documents: UN number, proper shipping name, class, packing group, tunnel restriction code, consignor/consignee, quantity. Container packing certificate for sea DG |
| **EU Digital Product Passport** | EU, phasing in from 2027 | Machine-readable product data including identity, safety & sustainability data, batch traceability, compliance status, disposal instructions, and carbon footprint for certain categories. **Design your data model for this now** — retrofitting a DPP onto a free-text catalogue is a rewrite |
| **OSHA HazCom** | USA | Workplace labelling and SDS availability |
| **National pesticide / fertiliser / drug licences** | Per country | S30 and S32 transactions must be licence-gated in the app, on both sides |
| **Local DG transport rules** | Per country | Carrier must hold DG transport authority; driver training certificates must be current |

**Practical consequence:** you need a `jurisdiction_rules` table keyed by
`(origin_country, destination_country, hs_code, un_number)` that returns the required document set
and any licence gate. This is one of the highest-value pieces of IP you will build.

## 3. Storage segregation as a product feature

The platform computes the buyer's **warehouse segregation plan** from the basket, using the
`storage_class` attribute (SC-1 … SC-8) defined in `data/taxonomy.json`.

Non-negotiable rules the engine must enforce:

| Rule | Why |
|---|---|
| Acids (SC-1) never with alkalis (SC-2) | Violent neutralisation, heat, splashing |
| Hypochlorite and oxidisers (SC-4) never with acids | **Generates chlorine gas. Lethal.** |
| Oxidisers (SC-4) segregated from flammables (SC-3) | Fire intensification |
| Water-reactive (SC-7) — no water-based suppression | Reaction with extinguishing medium |
| Gases (SC-5) upright, restrained, ventilated, segregated by gas type | Cylinder rupture, asphyxiation |
| Toxics/CMR (SC-6) in locked, access-logged store | Exposure control, theft |

When a basket contains an incompatible pair, the platform must **block the single-drop shipment**
and either split it across vehicles or warn explicitly. This is a genuine differentiator: your
buyer's EHS lead becomes your internal champion because you caught something their distributor
never would.

## 4. Supplier onboarding & verification (the trust layer)

Tiered, and the tier must be visible on every listing.

| Tier | Requirements | What the buyer sees |
|---|---|---|
| **T3 — Verified** | Legal entity check, GST/tax ID, physical site verification (photo + geo), bank account verification, ISO 9001 if held, valid SDS on file, DG transport capability confirmed | Green badge, full catalogue, escrow enabled |
| **T2 — Reviewed** | Legal entity + tax ID + bank verified, documents on file but no site visit | Amber badge, escrow mandatory |
| **T1 — Listed** | Basic KYC only | Grey badge, **cannot transact** — enquiry only |

Plus a **performance score** recalculated monthly from: on-time delivery %, CoA conformance %,
dispute rate, document completeness, response time. Surface it publicly. This is what makes a
marketplace self-policing instead of a race to the bottom.

**Re-verification cadence:** annually, plus event-driven (ownership change, licence expiry, any
quality incident).

## 5. Transaction controls (encode these, do not rely on people)

1. **Grade gate.** An item with `grade = technical` cannot be recommended into an S26 / S30 / S32
   end use. Hard block in the cart.
2. **Licence gate.** S30 and S32 require a valid licence number on both buyer and seller records
   before the order can be confirmed.
3. **Secondary-material gate.** Every S6 item must carry `deviation_disclosure`, and cannot be
   recommended into grade-gated end uses.
4. **DG declaration gate.** If `dg_class != non-DG`, the shipment requires a generated declaration,
   UN-rated packaging (`un_rating_for_dg` on S45 items), and a DG-authorised carrier. No exceptions,
   no override flag.
5. **Document gate.** Order cannot move to `READY_TO_SHIP` while any member of the compliance
   envelope is missing or expired.
6. **Restricted-substance acknowledgement.** For S12.4 halogenated solvents and any
   `regulatory_restrictions` entry, require a logged, named, timestamped buyer acknowledgement.

## 6. Liability posture

- **SourceKettle is a platform, not the seller of record**, for marketplace transactions — but that
  distinction only holds if you do not control pricing, do not take title, and do not warrant
  quality. The moment you hold inventory or guarantee specs, you are a distributor and you carry
  distributor liability. Choose deliberately and document it.
- Carry **product liability**, **professional indemnity / E&O**, and **cyber** cover from day one.
- Terms must include: buyer's responsibility for correct end-use and grade selection; supplier
  warranty of conformity to the published spec and CoA; a documented dispute and escalation path;
  and indemnities that are realistic (a small supplier cannot indemnify a catastrophe — which is
  exactly why your insurance matters).
- **Incident playbook, written before launch:** who is called, in what order, within how many
  minutes, for (a) a spill in transit, (b) a wrong-hazard delivery, (c) a quality failure that
  ruined a batch, (d) a suspected counterfeit/relabelled product.

## 7. The compliance roadmap by phase

| Phase | Must have | Nice to have |
|---|---|---|
| **MVP** | Compliance envelope schema; SDS vault with immutable revisions; UN number validation against the DG list; storage-class segregation warnings; supplier tiering; grade gate; DG carrier check | Automated SDS parsing |
| **Depth** | Jurisdiction rules engine; SDS revision auto-tracking + supplier chase; DG declaration generator; audit export pack; batch traceability | REACH/SVHC auto re-screen |
| **Scale** | DPP-ready data export; carbon data capture; licence registry integration; API for buyer ERP compliance sync | Country-specific SDS auto-translation |

---

*Next: `07-technical-implementation.md`.*
