# Build Plan, Team & Budget

## Phase 0 — Concierge (Months 0–3): build the business before the software

**Do not write a line of product code in this phase.** The goal is to learn the true shape of an RFQ
and to acquire supply.

| Week | Action | Output |
|---|---|---|
| 1–2 | Pick one launch geography and one industry vertical (recommend: water treatment or detergent manufacturing) | A written ICP with 200 named target plants |
| 2–6 | 40 plant visits / calls. Ask for their last 12 months of chemical purchase invoices | A real spend dataset; the top 30 SKUs by frequency |
| 3–8 | Recruit 25 distributors/producers. Offer: free orders for 6 months, no listing fee | Signed supplier agreements + their price lists |
| 4–12 | **Manually source for 10 pilot plants** using WhatsApp + a spreadsheet + the taxonomy in `data/taxonomy.csv` | 10 paying pilots, real GMV, and the exact fields a quote actually needs |
| 6–12 | Engage a DG safety adviser and a regulatory consultant | A written compliance checklist for your jurisdiction |

**Phase 0 exit criteria (all must be true):**
- ≥10 plants buying through you repeatedly (at least 2 orders each)
- ≥$75k cumulative GMV placed
- The 30-SKU core catalogue documented with full compliance envelopes
- A named DG adviser and a named regulatory consultant engaged
- You can state, in one sentence, why pilots stayed

If you cannot hit these, **the problem is supply or trust, not software** — keep going on Phase 0
rather than starting to build.

## Phase 1 — MVP (Months 3–9)

**Scope. Only these things:**

1. Supplier onboarding + verification tiers (T1/T2/T3) with document upload
2. Product catalogue with the taxonomy, mandatory-attribute enforcement, and search
3. Compliance envelope: document vault with immutable revisions, UN-number validation,
   grade/licence/document gates, storage segregation warnings
4. RFQ + quote engine with decomposed landed cost
5. Order placement, multi-level approval, invoice generation, payment link
6. Buyer portal (order history, documents, compliance pack download)
7. Admin console (verification review, dispute handling, rule overrides with an audit reason)

**Explicitly out of scope for MVP:** mobile app, price index, equipment brokerage, trade finance,
ERP integration, ML recommendations, multi-currency, multi-language.

**Milestone schedule:**

| Month | Deliverable |
|---|---|
| 3–4 | Schema + migrations; taxonomy seeded from `taxonomy.json`; auth + tenancy; supplier onboarding |
| 5 | Catalogue CRUD with attribute validation; document vault; search v1 |
| 6 | Compliance rules engine + gates; RFQ/quote engine; **first live transaction through the platform** |
| 7 | Orders, approvals, invoicing, payments; buyer portal |
| 8 | Admin console; disputes; audit export; load test; penetration test |
| 9 | Onboard 30 suppliers and 60 buyers from the Phase-0 base. Turn on the take rate |

**MVP exit criteria:** 60 suppliers live, 250 registered buyers, $1.5M annualised GMV, take rate
billing in production, zero unblocked compliance violations in the audit log.

## Phase 2 — Depth (Months 9–18)

- Price index v1 (only for SKUs with ≥5 independent transactions/window; always publish *n*)
- Sample & qualification workflow — sample kits, spec comparison, trial-batch support. **This is the
  feature that unlocks switching and therefore price discovery**
- Logistics booking with DG carrier eligibility checks
- Supplier subscriptions (the first recurring revenue)
- Compliance SaaS tier sold to the EHS persona
- Jurisdiction rules engine + scheduled REACH/SVHC re-screen
- Consumables (S45–S52) catalogue depth — this is what lifts order frequency
- Overstock/off-spec (S6) supply-side wedge

**Exit criteria:** $12M GMV, ≥30% of buyers repurchasing within 90 days, first $10k MRR of SaaS.

## Phase 3 — Scale (Months 18–24)

- Equipment vertical (S3) with escrow + third-party inspection + milestone payments
- Managed-procurement retainers
- Trade finance via a licensed partner
- ERP punchout/PO integration (the retention moat)
- Second geography or second industry vertical
- DPP-ready data export

**Exit criteria:** $40M GMV, blended net revenue ≥6%, ≥3 customers on retainers, Series A ready.

---

## Team plan

| Phase | Hire | Why this order |
|---|---|---|
| 0 | Founder(s) only: 1 commercial, 1 technical | Sales learning cannot be delegated |
| 0→1 | **Chemist / quality lead** (1) | The single most important early hire. Someone who can read a CoA, challenge a supplier's spec, and smell a bad batch. Non-negotiable |
| 1 | Full-stack engineers (2) | Ship the MVP |
| 1 | Sourcing/field agents (2) | Supply acquisition is a feet-on-the-ground job |
| 1→2 | Fulfilment/customer ops (2) | Order exceptions are where marketplaces die |
| 2 | Compliance/regulatory specialist (1) | Takes the rules engine from your TODO list to maintained reality |
| 2 | Data engineer (1, part-time) | Price index + warehouse |
| 3 | Equipment category manager (1) | Different muscle: capex sales cycles, inspection networks |

**Do not hire** a head of marketing, a head of growth, or a head of anything before month 12.

## Budget (indicative, USD)

| Phase | Duration | Burn | Cumulative |
|---|---|---|---|
| 0 | 3 months | ~$12k/mo (founders + travel + legal + adviser) | $36k |
| 1 | 6 months | ~$21k/mo | $162k |
| 2 | 9 months | ~$42k/mo (bigger team, real logistics ops) | $540k |
| **Pre-seed raise needed** | | | **$500–750k** |
| 3 | 6+ months | ~$95k/mo | → **Seed $3–5M** |

Contingency: hold 20% back. Chemical logistics produces surprises — a rejected consignment, a
detained container, a failed CoA — and each one costs money and credibility.

## What to measure from day one

| Metric | Definition | Target at month 18 |
|---|---|---|
| **GMV** | Sum of order values placed | $12M annualised |
| **Net revenue** | Take rate + fees + SaaS − payment/refund costs | ≥5% of GMV |
| **Contribution per order** | Net revenue − direct fulfilment cost | ≥4% of GMV |
| **Repeat purchase rate** | Buyers with ≥2 orders in a rolling 90 days | ≥30% |
| **Orders per buyer / year** | The real health metric | ≥8 |
| **Fill rate** | RFQ lines matched with ≥3 qualified quotes | ≥70% |
| **Compliance exception rate** | Orders manually overridden / total | <0.5% |
| **Quote-to-order conversion** | Quotes accepted / quotes submitted | ≥25% |
| **Supplier 90-day active** | Suppliers with a fulfilled order in 90 days | ≥50% |
| **NPS by persona** | Split P1/P2/P3 — they judge you differently | ≥40 for P3 |

---

*Next: `05-gtm-strategy.md`.*
