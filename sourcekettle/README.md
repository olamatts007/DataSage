# SourceKettle — Business & Implementation Plan

Sourcing and procurement platform for industrial chemicals, line equipment and plant consumables.

**The thesis in one line:** organise supply around the *production line*, not around the molecule —
and make the compliance paperwork automatic, so a second source is actually safe to use.

---

## Read in this order

| # | Document | What it covers |
|---|---|---|
| 01 | [Executive summary & business case](plan/01-executive-summary.md) | The problem, the wedge, business model, 24-month shape, what kills the company |
| 02 | [Market & competition](plan/02-market-and-competition.md) | Bottom-up sizing model, competitive map, positioning statement, 5 buyer personas, launch-segment priority |
| 03 | **[Segmentation framework](plan/03-segmentation-framework.md)** | **The full segmentation — 6 pillars, 49 segments, 18 subsegments, plus the application tree and the attribute layer. Start here if you only read one.** |
| 04 | [Monetisation & unit economics](plan/04-monetisation.md) | 9 revenue lines, per-order economics, MVP cost structure, quoting mechanics, the price-index moat |
| 05 | [Go-to-market strategy](plan/05-gtm-strategy.md) | Beachhead selection, supply- and demand-side motions, retention levers, launch sequence |
| 06 | [Compliance & regulatory](plan/06-compliance-and-regulatory.md) | The compliance envelope, jurisdiction matrix, storage segregation rules, supplier verification tiers, transaction gates |
| 07 | [Technical implementation](plan/07-technical-implementation.md) | Stack, architecture, full SQL data model, API surface, compliance rules engine, search design, integrations |
| 08 | [Build plan & team](plan/08-build-plan-and-team.md) | Phase 0→3 with exit criteria, hire order, budget, the 10 metrics that matter |
| 09 | [Risks & differentiation](plan/09-risks-and-differentiation.md) | Risk register, honest assessment, what is and isn't a moat, kill criteria |
| 10 | [Naming shortlist](plan/10-naming-shortlist.md) | Domain availability screened via registry RDAP, plus one trademark conflict found and rejected |

## Data & code

| Path | What it is |
|---|---|
| **`app/`** | **Working reference application** — stdlib-only Python server + vanilla-JS single-page app |
| `app/substances.py` | 105 real industrial chemicals as a substance library — CAS, UN number, DG class, packing group, GHS, flash point, storage class, sellable grades |
| `app/catalog_gen.py` | Deterministic expander: substance × supplier × grade × pack → the catalogue's generated SKUs |
| `app/seed.py` | 1,031 SKUs (1,000 chemicals + 31 equipment/consumables) across 33 segments, 9 suppliers, 2 line templates, curated 33-entry DG reference |
| `app/commercial.py` | Landed-cost decomposition, price index, RFQ / sealed auction. 39 tests |
| `app/insights.py` | Substitution, supplier scorecards, replenishment, spend analytics, document vault |
| `app/history.py` | Seed transaction history, consumption profiles and document revisions |
| `app/server.py` | HTTP server + JSON API. Calls `engine.rules` directly — no reimplemented logic |
| `data/taxonomy.json` | Machine-readable segmentation — the category tree, application tree, attribute schema, storage classes and GHS pictograms. **Seed your database from this.** |
| `data/taxonomy.csv` | Flat version of the same tree, with full paths — for spreadsheets and supplier onboarding packs |
| `plan/taxonomy_builder.py` | Single source of truth that generates and **validates** both data files |
| `engine/` | Compliance rules engine, 32 unit tests |

### How the catalogue is built

The 1,000 chemical SKUs are **not** 1,000 hand-written rows. They are generated from
`substances.py` — a library of 105 real industrial chemicals, each carrying its CAS number,
UN number, DG class, packing group, GHS pictograms, flash point, storage class and the
grades it is actually sold in. `catalog_gen.py` expands each substance across the suppliers
that serve its segment, its sellable grades, and its pack sizes:

```
105 substances  ×  suppliers  ×  grades  ×  packs   →   962 generated SKUs
  + 38 hand-written anchors (referenced by id from tests and line templates)
  = 1,000 chemical SKUs   + 31 equipment / consumables  =  1,031 total
```

This mirrors how a real distributor's catalogue is structured — one substance, many
sellable SKUs — and it keeps the regulatory data coherent, because a substance's UN number,
DG class and storage class travel with it into every SKU instead of being re-typed per row.
Generation is deterministic (fixed seed), so a rebuild always yields the same catalogue.

Two invariants the generator must not break, both asserted at import time:
- every DG row's UN number exists in the curated `DG_REFERENCE` (33 distinct UN numbers
  in the catalogue, 33 entries in the reference);
- every row's segment resolves to a real taxonomy node and its supplier to a real supplier.

Prices, lead times and supplier names remain illustrative. UN numbers and DG classes are
real, but must be re-verified against the current IMDG/ADR editions before commercial use.

### Run the app

No install, no build step — standard library only:

```bash
python3 sourcekettle/app/server.py --port 8000
# then open http://localhost:8000
```

Regenerate the data files:

```bash
python3 sourcekettle/plan/taxonomy_builder.py
```

Run the engine tests:

```bash
python3 -m unittest discover -s sourcekettle/engine -p 'test_*.py' -v
```

### What the app demonstrates

| Screen | What it proves |
|---|---|
| **Catalogue** | 1,031 SKUs across 33 segments and 9 suppliers, faceted by pillar / application / grade / DG class / storage class and paged 48 at a time (`limit`/`offset` + `total`). Synonym search: `naoh` → caustic soda. Each card's **Compliance pack** opens the full envelope plus a decomposed landed-cost breakdown |
| **Line Builder** | The "sell the line" differentiator: pick *Liquid detergent line* and it returns all 12 roles — reactor, surfactants, alkali, pump, pH transmitter, filling station, drums, gloves, coveralls, filter bags — spanning three pillars. Add the whole line in one click |
| **Sourcing & Auction** | RFQ from cart or line template, sealed reverse auction, awarded **lot by lot** on total landed cost |
| **Market Index** | Rolling 30-day volume-weighted median per segment, with *n*, band and confidence |
| **Cart & Compliance** | Live evaluation by the real rules engine, plus a warehouse segregation plan |
| **Insights** | Substitution finder, supplier scorecards, replenishment, document vault alerts, spend analytics |
| **Orders** | Blocked baskets are rejected at the API with HTTP 422. Only fully-cleared orders persist |

### Commercial features (plan/04 made executable)

- **Landed cost decomposition** — goods, freight (with DG surcharge), duty by origin, insurance,
  handling, financing at 22% p.a. on the payment terms. Headline price is never the ranking key.
- **Sealed reverse auction, awarded per lot** — LABSA and the reactor are separate lots. Requires
  ≥3 qualified bids or it refuses to award, and reports exactly why.
- **Price index** — refuses to publish below 5 independent observations, always discloses *n*,
  excludes related-party rows, versions its methodology.
- **Substitution engine** — scores on CAS, segment, grade, form, storage, DG class and purity.
  Withholds anything below a score floor rather than guessing.
- **Supplier scorecards** — recomputed from order history: on-time, CoA conformance, dispute rate,
  document completeness. Never self-reported.
- **Replenishment** — usage rate against lead time and safety stock, rounded to MOQ.
- **Document vault** — superseded SDS revisions retained immutably; only the current revision
  alerts; expired documents block shipment.

### Compliance gates you can trigger in the UI

| Gate | How to trigger | Result |
|---|---|---|
| `STORAGE_SEGREGATION` | Add hydrochloric acid (SC-1) + sodium hypochlorite (SC-4) | **block** — chlorine gas |
| `GRADE_GATE` | Add *Citric Acid (TECHNICAL)* — it sits in S26 | **block** — grade-gated end use |
| `DG_GATE` | Add any DG item, leave the three shipment checkboxes unticked | **block** — lists exactly what is missing |
| `LICENCE_GATE` | Add Glyphosate 41% SL | **block** — names which side lacks the licence |
| `SECONDARY_MATERIAL_GATE` | Add the off-spec TiO₂ | **warn** — disclosure must be shown |
| `UN_NUMBER_NOT_IN_REFERENCE` | A DG product whose UN number is absent from the DG table | **block** — never free-typed |

### Test suites

```bash
python3 -m unittest discover -s sourcekettle/engine -t . -p 'test_*.py'          # 32 tests
python3 -m unittest discover -s sourcekettle/app -t sourcekettle/app -p 'test_*.py'  # 39 tests
```

## The segmentation at a glance

```
S1  RAW MATERIALS — BULK & COMMODITY          S10 Feedstocks   S11 Acids/Alkalis/Inorganics
                                              S12 Solvents     S13 Polymers & Resins
                                              S14 Fillers & Pigments
S2  RAW MATERIALS — SPECIALTY & FORMULATED    S20 Surfactants  S21 Specialty Additives
                                              S22 Coatings     S23 Water Treatment
                                              S24 I&I Cleaning S25 Textile/Paper
                                              S26 Food/Feed/PC S27 Lubricants
                                              S28 Adhesives    S29 Construction
                                              S30 Agro         S31 Lab & Reagent
                                              S32 Pharma       S33 Catalysts & Enzymes
S3  MACHINES & PROCESS EQUIPMENT              S34 Reaction     S35 Separation
                                              S36 Heat Transfer S37 Fluid Handling
                                              S38 Instrumentation S39 Filling & Packaging
                                              S40 Material Handling S41 Utilities & ETP
                                              S42 Lab Equipment S43 Line-Specific Machinery
                                              S44 Used & Rental
S4  CONSUMABLES, MRO & PACKAGING              S45 Packaging    S46 PPE & Safety
                                              S47 Filtration   S48 Gaskets & Seals
                                              S49 Electrical   S50 Maintenance
                                              S51 Lab Consumables S52 Packing & Despatch
S5  SERVICES                                  S55 Sourcing     S56 Logistics & DG
                                              S57 Testing      S58 Regulatory
                                              S59 Engineering  S60 Trade Finance
                                              S61 Waste & Circularity
S6  OVERSTOCK, OFF-SPEC & SECONDARY           S65 Surplus      S66 Off-Spec
                                              S67 Recovered Solvents S68 Recycled Resins
```

Cross-cutting: **18 application codes (B01–B18)** describe which production line a product serves,
and **67 attributes** drive search, substitution and compliance automation.

## Where to start on Monday

1. Read `plan/03-segmentation-framework.md` and mark up the segments you will *not* launch with.
2. Run the taxonomy builder and open `data/taxonomy.csv` — this is your supplier onboarding sheet.
3. Do the Phase-0 work in `plan/08-build-plan-and-team.md`: pick one geography, one vertical, and
   book 40 plant visits. **Do not write product code yet.**
4. Engage a DG safety adviser and a regulatory consultant (`plan/06-compliance-and-regulatory.md`).
5. Run the naming and trademark checks in `plan/10-naming-shortlist.md` — domain availability has
   already been screened; trademark clearance has not.
