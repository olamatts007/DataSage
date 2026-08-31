# Risks, Failure Modes & Differentiation

## 1. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Early warning signal |
|---|---|---|---|---|---|
| R1 | **Cold start — no live supply** | High | Fatal | Concierge phase; arrive with POs; anchor suppliers with 12-month free listing; you do their data entry | <3 qualified quotes per RFQ line |
| R2 | **Hazmat incident from a bad declaration** | Medium | Fatal (criminal + fatal) | Rules engine with a hard `dg_gate` that has no override; UN numbers validated against a curated DG reference table, never free-typed; DG-authorised carriers only; incident playbook written pre-launch | Any manual override in `compliance_checks` |
| R3 | **Disintermediation** — buyer and supplier go direct | High | Severe | Own documents, credit, logistics; multi-year SDS history in your vault; ERP punchout; make the platform cheaper than the alternative, not just convenient | Repeat rate falling while GMV per buyer stays flat |
| R4 | **Working capital trap** — you start holding stock | Medium | Severe | Stay inventory-light; stock only against signed offtake; watch inventory turns weekly | Days-of-inventory > 20 |
| R5 | **Credit default** — you extended terms and weren't paid | High | Severe | Never extend credit on your own balance sheet early; use a licensed partner; cap exposure per buyer; require escrow for new accounts | DSO trending past agreed terms |
| R6 | **Quality claim** — a batch fails and the buyer blames the material | High | Severe | Third-party lab analysis on disputes; retain samples; CoA conformance checks; documented chain of custody; product liability insurance | Dispute rate >2% |
| R7 | **Regulatory change** — a substance you sell heavily gets restricted | Medium | Moderate | Scheduled re-screen against REACH/SVHC and restriction lists; `regulatory_restrictions` attribute on affected segments; diversify across segments | Candidate-list update touching >5% of GMV |
| R8 | **A funded competitor enters your geography** | Medium | Moderate | Depth beats breadth — 300 documented SKUs and a real relationship with 150 plants is hard to buy quickly. Own compliance and the price index | Competitor signing your anchor suppliers |
| R9 | **Key-person dependency** on one chemist/sourcing agent | High | Moderate | Document everything in the runbook; the taxonomy and rules engine are the institutional memory, not the person | Any process that only one person can run |
| R10 | **Fraudulent supplier** — fake CoA, relabelled drums | Medium | Severe | T3 site verification for high-value transactions; batch-level traceability; spot third-party inspection; delist on first proven offence | A supplier whose CoAs are suspiciously identical across batches |

## 2. The honest assessment of "will this work?"

**In favour:**
- The underlying spend is enormous, recurring and mandatory — plants cannot stop buying chemicals.
- Incumbents are digitally weak and structurally unable to serve small buyers profitably.
- Compliance is becoming software, and software accrues to whoever holds the transaction.
- Multiple funded players have validated that buyers will transact chemicals online.

**Against:**
- Many capable teams have tried this and none has produced a dominant winner. That is evidence
  about the difficulty, not just about the opportunity.
- The winner in each geography so far is the one with **operational** depth — trucks, warehouses,
  credit — not the one with the best search bar. Budget for operations.
- Margins are thin and buyers are price-led. Your differentiation must be things they cannot
  easily price: reliability, documentation, qualification support, credit.
- The equipment vertical (S3) is a genuinely different business with capex sales cycles. Treat it
  as a second company you start later, not as a tab in the same app.

**The realistic best case** is a strong regional business — dominant in one geography and one or two
verticals, $50–150M GMV, profitable — which is a genuinely good outcome and a plausible acquisition
target for a distributor consolidator. The global-platform outcome is possible but requires
operational capital at a scale that only comes from a proven regional model.

## 3. What actually differentiates SourceKettle

Ranked by how hard each is to copy:

1. **The line model.** Organising supply around a production line (Taxonomy B) rather than around
   the molecule. Requires the equipment and consumable verticals to exist, which is expensive.
2. **The qualification workflow.** Making a second source safe to try. Requires lab partnerships,
   technical staff and a documented methodology. Competitors selling only molecules have no
   incentive to build this because it threatens their own suppliers.
3. **The compliance engine + document history.** Years of versioned SDS/CoA/DG records per buyer,
   with audit export. Cheap to build, miserable to migrate away from.
4. **The price index with published *n*.** Trust is slow to build and cannot be bought. Whoever
   publishes a credible index first becomes the reference.
5. **Warehouse segregation planning.** Small feature, disproportionate EHS goodwill, and it makes
   your buyer's safety officer your internal champion.
6. **Secondary-material channel (S6).** A supply source competitors ignore, and a real service to
   distributors with dead stock.

**Not differentiators** (do not spend money here): UI polish, AI chatbots, a blockchain component,
a mobile app in year one, a broader catalogue than Alibaba.

## 4. Naming, brand & domain notes

- **"SourceKettle" is descriptive and memorable** — good for B2B SEO and for explaining what you do
  in one word. Its weakness is exactly that: it reads as a commodity directory, and there are many
  similarly-named chemical-trading entities worldwide.
- **Before you commit, do these checks** (I have not done them for you — they need live registry
  access):
  1. Trademark search in your launch jurisdiction **and** in Nice Class 35 (marketplace/advertising),
     Class 1 (chemicals), and Class 42 (software). A descriptive name is harder to register
     protectively — expect to rely on a logo/wordmark.
  2. Domain and handle availability across `.com` and your country TLD.
  3. Company-name availability in your incorporation registry.
  4. A search-engine sweep for existing "SourceKettle" chemical traders in your target markets —
     several similarly named businesses exist internationally, and B2B buyers will find them.
- If a conflict surfaces, keep the concept and adjust the mark (e.g. a coined variant) rather than
  rebuilding the brand later.

## 5. Legal entity structure (directional, confirm with counsel)

- **Two entities is often worth it:** a marketplace/technology company (asset-light, holds the IP
  and the platform) and, if you later hold inventory or arrange transport, a separate trading/logistics
  entity. This isolates hazardous-goods and inventory liability from the platform IP.
- Required licences to check in your jurisdiction: trade/merchant licence, GST/tax registration,
  dangerous-goods storage and transport authorisations, any chemical-specific dealer licence,
  and (for S30/S32) pesticide and drug licences.
- Terms of service must state clearly who the seller of record is, who warrants quality, and what
  the dispute path is. Ambiguity here resolves against you in court.

## 6. Kill criteria — decide these now, while you are optimistic

Write them down and hold yourself to them:

- **Month 6:** fewer than 10 repeat-buying plants → the demand thesis is wrong for this beachhead.
  Change beachhead, not strategy.
- **Month 12:** RFQ fill rate persistently below 40% → the supply thesis is wrong. Consider becoming
  a procurement-services business instead of a marketplace.
- **Month 18:** contribution margin per order below 2% after logistics → the unit economics do not
  work at this order size. Move upmarket to larger buyers or exit the bulk segments.
- **Any time:** a compliance incident caused by a platform defect → freeze transactions in the
  affected segment, publish what happened, fix the rule, re-verify. Never quietly patch it.

---

*Index: `README.md`.*
