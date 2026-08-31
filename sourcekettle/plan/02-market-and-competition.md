# Market, Competition & Positioning

## 1. Sizing the opportunity (top-down, then bottom-up)

**Top-down.** The global chemical industry is a multi-trillion-dollar market; the commonly cited
figure in the Knowde business breakdown is ~$5 trillion, with no player holding more than ~2% share
in the marketplace layer. The specialty chemicals segment alone is forecast to add roughly
**USD 382 billion between 2025 and 2030 at a ~6.3% CAGR**. Digital sourcing platforms are a
fraction of a percent of that flow — which is exactly why the opportunity exists.

**The relevant slice for SourceKettle is not "all chemicals."** It is:

> *Discretionary industrial chemical, equipment and consumable spend by small-to-mid manufacturers
> that is currently placed through un-digitised regional distributors.*

**Bottom-up model (build this yourself with local numbers — the structure is what matters):**

```
Addressable plants in launch region              N = 12,000
  × plants with a line-relevant chemical spend      60%   = 7,200
  × realistic 5-year penetration                    4%    =   288 active buyers
  × average annual spend per active buyer      $90,000    = $25.9M annual GMV
  × blended net take rate                             5.5% = $1.42M net revenue
```

Run that arithmetic for three candidate launch geographies and pick the one with the best
`(density of plants) × (distributor fragmentation) × (payment discipline)`. Density matters more
than total market size: logistics cost per drop is your margin.

**Serviceable obtainable market is the honest number to raise on.** A $26M GMV business at 5.5% is a
real, fundable, profitable company. Claiming a $5T TAM in a pitch deck signals you haven't thought.

## 2. Competitive map

### Direct: digital chemical marketplaces

| Player | Base | Focus | Funding signal | Where they are weak for you |
|---|---|---|---|---|
| **Knowde** | San Jose, US | Ingredient/polymer marketplace + MDM/AI data | ~$146M raised; $60M in Aug 2024 | Reoriented toward data/master-data SaaS; strong in personal-care/ingredient brands, thin on shop-floor MRO and equipment |
| **BluePallet** | Austin, US | Chemical commerce + logistics + finance | ~$17M | US-centric, bulk/drum logistics focus, no equipment vertical |
| **Molbase** | Shanghai, CN | B2B chemicals e-commerce | Public; ~$10M+ raised | China/APAC concentration (~68% of volume), fine chemicals & reagents, structural search — not a line-supply play |
| **CheMondis** | Cologne, DE | European B2B chemicals marketplace | Bootstrapped, ~52 staff | Europe-only, spot chemicals, no equipment or MRO |
| **ChemDirect** | US | ML-driven pricing/inventory | ~$6.9M | Pricing intelligence angle; narrow catalogue |
| **PINPOOLS / BuyersGuideChem / JOQORA** | DE | Chemical sourcing, tender mgmt, listings | Bootstrapped | Directory/tender tools, weak transaction layer |
| **Elchemy, ChemicalBook, LookChem, ECHEMI, ChemCloud, Kemiex, Kemgo** | IN/CN/CH/EU | Listings, reagents, life-science raw materials, e-auctions | Mostly small or unfunded | Category or geography niches; none bundle machines + consumables |

**Read on this table:** the market has been attempted many times and no one has won it outright.
That is a *good* sign (demand is real, buyers will transact online) and a *warning* (the pure
"marketplace for chemicals" thesis alone has not produced an obvious winner). Every company that
survived added something beyond the listing: logistics (BluePallet), data/MDM (Knowde), finance
(Molbase), tender workflow (PINPOOLS).

### Indirect: the real competition

1. **The incumbent distributor with a WhatsApp group.** Fast, trusted, extends credit, will
   price-match. Your enemy is their relationship, not their technology.
2. **Alibaba / IndiaMART / Made-in-China.** Infinite supply, zero qualification, zero compliance
   hand-holding, and a buyer who must personally carry the import/DG risk.
3. **The OEM direct.** For machines, buyers still go to the manufacturer's local rep.
4. **Doing nothing.** The most common competitor. A plant that has run the same line for 15 years
   with the same three suppliers needs a *trigger* to change.

### Adjacent models worth stealing from

- **Xometry / Fictiv** — instant-quote UX for a fragmented supply base. Copy their quote engine.
- **Grainger / RS Components** — consumables catalogue depth, availability-led merchandising,
  next-day promise. Copy their category structure and their "substitute product" logic.
- **Flexport** — document-centric freight visibility. Copy their shipment timeline UI.

## 3. Positioning statement

> **For** plant managers, procurement officers and EHS leads at small and mid-size process
> manufacturers **who** have to keep a production line running without a procurement department,
> **SourceKettle is** the sourcing platform for industrial chemicals, line equipment and plant
> consumables **that** delivers verified supply with the compliance documentation already attached —
> **unlike** regional distributors and general B2B listing sites, **SourceKettle** prices across a
> qualified supplier network and owns the paperwork, the logistics and the credit, so a second
> source is actually safe to use.

## 4. Buyer personas (write these on the wall)

| Persona | Title | What they optimise for | Trigger to buy | What they fear |
|---|---|---|---|---|
| **P1 — The Plant Manager** | Plant/Production Head | Line uptime, yield | Line stopped or about to be | Batch failure, audit finding |
| **P2 — The Procurement Officer** | Purchase Manager | Landed cost, payment terms | Annual contract renewal, budget cut | Price variance, supplier default |
| **P3 — The EHS / Quality Lead** | EHS or QA Head | Compliance, traceability | Audit, incident, new regulation | Undocumented shipment, wrong SDS revision |
| **P4 — The Owner-Operator** | MD / Founder (SME) | Cash flow, simplicity | Competitor undercut them | Being cheated on price or quality |
| **P5 — The Formulator / R&D** | Technical Manager | Spec match, sample availability | New product, cost-down reformulation | Raw material variation between lots |

Design rule: **P1 and P3 are the people who can block a deal. P2 and P4 are the people who sign it.**
Your product needs a "compliance pack" view for P3 and a "total landed cost" view for P2, or the
deal stalls no matter how good the price is.

## 5. Segment-by-segment go-to-market priority

Not all categories are equally attractive to launch in. Score each on four axes:

| Axis | Question |
|---|---|
| **Frequency** | Is it bought weekly (consumables) or every 3 years (a reactor)? |
| **Standardisation** | Is it a commodity with a spec sheet, or a bespoke fabrication? |
| **Hazard class** | Non-DG is trivially easy; DG Class 8 needs a partner; Class 3 needs insurance. |
| **Price opacity** | High opacity = high value of your index = high willingness to pay. |

**Recommended launch order:**

1. **Water treatment & utility chemicals** (S34) — high frequency, high standardisation, recurring
   contracts, and buyers are measurable-results-oriented. Easy to prove value.
2. **Industrial & institutional cleaning** (S35) — same buyer, same trucks, adjacent SKUs.
3. **Process chemicals for one vertical** (e.g. detergent: S31+S37+S12+S13) — deeper, higher value.
4. **Consumables & MRO** (S40–S48) — attach to the above; this is where you win order *frequency*.
5. **Bulk commodities** (S11–S14) — only once you have truck/rail logistics partnerships.
6. **Machines & equipment** (S20–S29) — last, because sales cycles are long and the brokerage
   capability is a different muscle.

---

*Next: `03-segmentation-framework.md` — the actual segmentation, in full.*
