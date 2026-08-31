# Monetisation, Unit Economics & Financial Model

## 1. Revenue lines, in the order you should turn them on

| # | Line | Rate | When to switch on | Notes |
|---|---|---|---|---|
| R1 | **Transaction take rate — chemicals & consumables** | 3–6% of GMV | MVP (month 6) | Start at the low end; raise once you add logistics and credit |
| R2 | **Equipment brokerage commission** | 5–10% of order value | Month 12 | Escrow + inspection justifies the higher rate |
| R3 | **Supplier subscription** (verified storefront, priority placement, RFQ alerts, analytics) | $50–500/mo tiered | Month 9 | The first predictable revenue; do not make it pay-to-list, only pay-to-be-prioritised |
| R4 | **Compliance SaaS** (document vault, SDS revision tracking, DG declaration generator, audit export) | $200–1,500/mo | Month 12 | Highest margin line. Sold to the EHS persona who is not the price-sensitive buyer |
| R5 | **Managed procurement / procurement-as-a-service** | $1,500–6,000/mo retainer + share of savings | Month 15 | For buyers with no procurement function. This is your "do it for me" tier |
| R6 | **Trade finance spread** | 1.5–3% per advance | Month 18 | Through a licensed NBFC/bank partner. Never on your own balance sheet |
| R7 | **Logistics margin** | 5–12% on freight | Month 12 | Buy DG trucking capacity in bulk, resell per drop |
| R8 | **Price index & market intelligence licensing** | $15k–60k/yr per subscriber | Month 20+ | The endgame. Your transaction data becomes the product |
| R9 | **Advertising / sponsored placement** | Variable | Month 24+ | Only once organic search volume justifies it. Risks trust — cap it |

**Blended net revenue target:** 5–6% of GMV by month 24. Below 4% you are a directory with extra
steps; above 8% you will get disintermediated.

## 2. Unit economics per order (build this spreadsheet first)

Worked example — a mid-size plant ordering **1,000 kg LABSA 90% + 2,000 kg SLES 70% + consumables**,
order value **$4,200**:

```
Gross order value (GMV)                              $4,200
Supplier cost @ blended take rate 4.5%               - $189   revenue to SourceKettle
  + Compliance pack (auto-generated, ~zero marginal)     $0
  + Logistics margin on $310 freight @ 8%             + $25
  + Payment fee / finance on 30-day terms @ 1.5%      + $63
                                                    -------
Revenue per order                                     $277   (6.6% of GMV)

Fulfilment cost
  Customer support touch (0.15 h @ $18)                -$3
  Document QC / compliance check (0.10 h @ $22)        -$2
  Payment processing (1.2%)                           -$50
  Logistics coordination (0.20 h @ $18)                -$4
  Returns / quality claims provision (0.6% GMV)       -$25
                                                    -------
Contribution per order                                $193   (4.6% of GMV)
```

**The three numbers that decide whether this works:**

1. **Orders per buyer per year.** Consumables (S45–S52) are what push this from 4 to 20+.
   A buyer ordering quarterly is unprofitable; one ordering fortnightly is a business.
2. **Contribution margin per order vs. cost to acquire.** If CAC is $600 and contribution is
   $193, you need ~3.1 orders to break even on acquisition — roughly one quarter. That is the
   number to defend in a pitch.
3. **Take rate erosion.** Every point you concede to win volume costs 22% of contribution in the
   model above. Never discount take rate; discount freight instead (it is a real cost you control).

## 3. Cost structure at MVP (months 6–12)

| Function | People | Monthly cost (indicative, USD) |
|---|---|---|
| Engineering | 2 full-stack + 1 part-time DevOps | 9,000 |
| Chemistry / quality | 1 (chemist who can read a CoA and challenge a supplier) | 2,500 |
| Sourcing / supply | 2 field agents | 4,000 |
| Customer / fulfilment | 2 | 2,500 |
| Founder(s) — sales | 1–2 | deferred / minimal |
| Infrastructure (cloud, search, telephony, docs storage) | — | 900 |
| Compliance & legal (SDS authoring partner, DG adviser, counsel) | — | 1,200 |
| Insurance (product liability, E&O, cyber) | — | 600 |
| **Total burn** | | **~20,700/mo → ~$250k/yr** |

At 4.6% contribution you need roughly **$5.4M GMV** to cover that burn. That is ~150 buyers at
$36k/yr each. Set this as your month-18 milestone, not a wish.

## 4. Pricing mechanics — how you actually quote

Chemical quoting is not "add to cart." Support three modes from day one:

1. **Catalogue price (fixed)** — only for consumables and small-pack items. This is your
   self-serve revenue and it must be genuinely instant.
2. **Contract price (negotiated)** — a buyer-specific price sheet with validity, volume tiers and
   index linkage (e.g. "caustic at published index −4%"). This is where 70% of real GMV sits.
3. **Spot / RFQ (auction)** — reverse auction with a closing time, minimum 3 qualified bidders,
   sealed bids, auto-ranked on **total landed cost**, not headline price.

> **Critical rule:** rank on landed cost, always. Headline price + freight + duty + payment-term
> cost + quality risk. A platform that ranks on headline price will train suppliers to quote low
> and win on freight, and your buyers will learn not to trust the ranking.

## 5. Index linkage — the moat, and how to build it honestly

Once you have ~50 transactions/month in a SKU, you can publish a **SourceKettle Price Index** for
that SKU: a rolling 30-day volume-weighted median landed price, with a confidence band and a
transaction-count disclosure.

Rules that keep it credible:
- Never publish an index with fewer than 5 independent transactions in the window.
- Publish the *n*, always. An index without n is marketing.
- Exclude related-party transactions and your own inventory movements.
- Freeze the methodology document and version it. Buyers will audit it.

This is what turns a marketplace into infrastructure — and it is the asset a strategic acquirer
(Univar, Brenntag, IMCD, a distributor consolidator, or an index publisher) will pay for.

## 6. What NOT to do

- **Do not hold inventory early.** You become a distributor with a tech budget and a working
  capital problem. Only stock what you have a signed offtake for.
- **Do not charge buyers.** In this market the supplier pays. Charging buyers kills the demand side
  of a two-sided marketplace before it starts.
- **Do not build the mobile app first.** Buyers quote from a desk. A responsive web app plus
  WhatsApp/email notifications covers 95% of usage. The mobile app matters for the *field agent*
  and the *store* persona, not the procurement officer.
- **Do not chase a wide catalogue.** 300 well-documented SKUs in 3 segments beat 30,000 scraped
  listings. Depth is the moat; breadth is a scraper's game you will lose to Alibaba.

---

*Next: `06-compliance-and-regulatory.md`.*
