# SourceKettle — Executive Summary & Business Case

**One-liner:** SourceKettle is the procurement operating system for a factory floor — one place to buy
the chemicals that go *into* the process, the machines that run it, and the consumables that keep it
running, with the compliance paperwork attached automatically.

---

## 1. The problem, stated precisely

A mid-sized manufacturing plant (paint, detergent, food processing, plastics, textile, water
treatment) spends across three disjoint budgets and three disjoint supplier universes:

| Spend category | Typical share of plant OPEX | Who they buy from today | How they buy |
|---|---|---|---|
| **Process chemicals & raw materials** | 40–65% | 3–8 distributors + direct mill deals | WhatsApp + PDF quote + phone |
| **Capital equipment / line upgrades** | 10–25% (lumpy) | OEM reps, trade shows, brokers | RFQ emails, 8–16 week cycles |
| **Consumables & MRO** (PPE, packaging, filtration, spares) | 15–30% | 10–40 small vendors | Petty cash, invoices, no visibility |

The pain is not "I cannot find a chemical." Distributors already exist. The pain is:

1. **No price transparency.** The same solvent can be quoted at ₹95/L and ₹180/L to two plants
   40 km apart, and neither buyer knows it.
2. **Compliance is manual and scary.** SDS, MSDS, COA, DG declaration, UN number, TSCA/REACH
   statement, GST/HS classification — assembled per shipment by a human, often wrong, always late.
3. **Qualification risk.** Switching a raw material supplier risks a failed batch. So buyers never
   switch, and prices never get tested. This single fact is why the market stays inefficient.
4. **Three separate workflows.** Nobody sells you caustic soda, the dosing pump that feeds it, and
   the gloves your operator wears in one transaction. Yet that is what "running the line" means.
5. **No credit, no consolidation.** 30 invoices a month, 12 payment terms, zero negotiating power
   for the small buyer.

## 2. The wedge (why this is different from what exists)

The chemical marketplace space is already crowded — see `02-market-and-competition.md`. Knowde,
BluePallet, CheMondis, Molbase, ChemDirect, Elchemy, PINPOOLS all sell **molecules**.

**None of them sell the line.** SourceKettle's structural differentiation:

> **We organise supply around the production line, not around the molecule.**

Concretely, that means:

- A buyer signs up as *"I run a 5,000 L liquid detergent line."* SourceKettle knows that line needs
  LABSA, SLES, caustic, salt, preservative, fragrance, colour — **and** the dosing pumps, IBCs,
  nitrile gloves, drum liners, pH probes and filter bags that surround them.
- Every product page carries its **compliance envelope** by default (SDS + UN number + GHS +
  storage class + packaging options + HS code), not as an afterthought.
- **Qualification assistance is a product.** We make the second source safe to try: sample kits,
  spec-matching, CoA comparison, trial-batch support. This unlocks the price discovery that
  competitors cannot, because they don't own the machine + consumable context.

## 3. Business model in one paragraph

SourceKettle starts as an **inventory-light curated marketplace** (take-rate 3–6% on chemicals, 5–10%
on equipment brokerage), layered with **recurring revenue**: a SaaS tier for compliance document
management, a subscription for contract pricing, trade finance spread, and managed-procurement
("procurement-as-a-service") retainers. The marketplace generates the data; the data generates the
price index; the price index is the moat and becomes a licensable product (see `04-monetisation.md`).

## 4. Why now

- **Chemical prices are volatile and buyers have been burned.** After the 2021–2023 freight/energy
  shock, plant managers actively want a second source and want price signals. Sourcing resilience
  is now a board-level topic.
- **Compliance load is rising, not falling.** EU Digital Product Passport requirements phase in from
  2027, REACH SVHC candidate lists keep growing, and dangerous-goods documentation is being
  digitised at ports. Compliance is becoming *software*, and software favours a platform that
  already holds the transaction.
- **Distributors are digitally weak.** Most regional distributors run on Tally/Excel/WhatsApp. They
  will onboard to a channel that brings them orders rather than compete with it.
- **B2B buying behaviour already changed.** Procurement staff under 40 expect Amazon-like search,
  self-serve pricing, and online documentation.

## 5. The 24-month shape

| Phase | Months | What exists | Success measure |
|---|---|---|---|
| **0. Concierge** | 0–3 | No platform. A human sources for 10 pilot plants over WhatsApp + a spreadsheet. | 10 paying pilots, ₹/GMV of ~$50k–150k, learn the real RFQ shape |
| **1. MVP** | 3–9 | Catalogue + search + RFQ + supplier portal + document vault | 60 suppliers, 250 buyers, $1.5M annualised GMV, 4% take rate live |
| **2. Depth** | 9–18 | Compliance engine, price index, sample workflow, logistics booking | $12M GMV, 30% repeat-in-90-days, first SaaS revenue |
| **3. Scale** | 18–24 | Equipment vertical, trade finance, second geography or second industry line | $40M GMV, blended 6% net revenue, Series A story proven |

## 6. What kills this company

Ranked honestly (full analysis in `09-risks-and-differentiation.md`):

1. **Cold start on supply.** A marketplace with no live inventory is a directory, and directories die.
   → Mitigated by the concierge phase: sell first, build the catalogue from real demand.
2. **One bad hazmat shipment.** A mis-declared DG shipment is a criminal liability, not a bug.
   → Compliance rules engine is MVP, not phase 3. Never let a human free-type a UN number.
3. **Disintermediation.** Buyer and supplier trade direct after the first match.
   → Own the documents, the credit, and the logistics. Those are the reasons to stay.
4. **Working-capital trap.** If you hold inventory before you have demand, you become a distributor
   with a tech budget. → Stay inventory-light until a segment proves it needs buffer stock.

## 7. The ask (if raising)

- **Pre-seed:** $400k–750k for 18 months — 2 engineers, 1 chemist/quality lead, 2 sourcing agents,
  1 founder doing sales. Buys you to $5M annualised GMV and a defensible price dataset.
- **Seed:** $3M–5M at 18 months, once blended take rate ≥5% and repeat purchase rate ≥30%.

---

*Next: `02-market-and-competition.md` for market sizing and the competitive map.*
