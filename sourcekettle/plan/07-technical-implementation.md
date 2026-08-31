# Technical Implementation Blueprint

Build for a team of two engineers plus a founder who can write SQL. Boring technology, chosen
deliberately: this business fails on supply acquisition, not on architecture.

---

## 1. Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | Next.js (App Router) + TypeScript + Tailwind + shadcn/ui | SSR for SEO on catalogue pages — organic search on chemical names is a real acquisition channel |
| **Backend** | NestJS (Node/TS) **or** FastAPI (Python). Pick one and stay | Nest if your team is JS-native; FastAPI if you want the chemistry/data-science ecosystem (RDKit, pandas) in-process |
| **Primary DB** | PostgreSQL 16 | Relational integrity matters more than anything here. Money, orders, and compliance state must be transactional |
| **Search** | PostgreSQL full-text + `pg_trgm` at MVP → **Meilisearch or Typesense** at scale | Do not go to Elasticsearch before 100k SKUs |
| **Chemistry search** | RDKit + PostgreSQL `mol` type (optional, phase 2) | Substructure/similarity search. Only needed if you serve R&D buyers |
| **Files** | S3-compatible object storage, immutable bucket versioning, signed URLs | SDS/CoA documents are legal records |
| **Cache/queue** | Redis + BullMQ (or Celery) | Quote expiry, auction closing, document parsing, notification fan-out |
| **Auth** | Clerk / Auth0 / Keycloak | Do not build auth. Multi-tenant org model with roles is table stakes |
| **Payments** | Stripe (where available) + a local rails provider + bank transfer/PoB | Most GMV will be invoiced, not carded. Design for credit terms from day one |
| **Infra** | A single managed PaaS first (Render/Fly/Cloud Run) → managed Postgres → k8s only when forced | Ops time is founder time |
| **Observability** | Sentry + OpenTelemetry + Grafana Cloud free tier | You need order-funnel visibility, not vanity dashboards |
| **CI/CD** | GitHub Actions: lint → typecheck → test → migration dry-run → deploy | Migrations must be reversible and tested |

## 2. System architecture

```
                    ┌─────────────────────────────────────────┐
                    │              Next.js Web App            │
                    │  Buyer portal │ Supplier portal │ Admin │
                    └───────────────┬─────────────────────────┘
                                    │ REST/tRPC + SSE for live auctions
                    ┌───────────────▼─────────────────────────┐
                    │              API Gateway (Nest)         │
                    │  authn/z │ rate limit │ tenant scoping  │
                    └───┬───────┬───────┬───────┬──────┬──────┘
                        │       │       │       │      │
              ┌─────────▼──┐ ┌──▼────┐ ┌▼─────┐ ┌▼────┐ ┌▼──────────┐
              │ Catalogue  │ │ Quote │ │ Order│ │Compl│ │ Search    │
              │  Service   │ │& RFQ  │ │  &   │ │iance│ │ Indexer   │
              │            │ │Engine │ │ Pay  │ │Engine│ │           │
              └─────┬──────┘ └──┬────┘ └──┬───┘ └──┬──┘ └─────┬─────┘
                    │           │         │        │          │
              ┌─────▼───────────▼─────────▼────────▼──────────▼─────┐
              │                 PostgreSQL 16  +  Redis             │
              └──────────────────────┬──────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
 ┌──────▼──────┐            ┌────────▼────────┐         ┌─────────▼────────┐
 │ Integrations│            │  Worker fleet   │         │  Data platform   │
 │ Payments    │            │ Doc parsing/OCR │         │ Price index ETL  │
 │ Freight/DG  │            │ SDS extraction  │         │ Segment analytics│
 │ Tax/Customs │            │ Notification    │         │ Warehouse (phase2)│
 │ ERP (later) │            │ Auction settle  │         └──────────────────┘
 └─────────────┘            └─────────────────┘
```

**Design principles**

1. **Modular monolith.** The boxes above are *modules* in one deployable, with clean service
   boundaries — not microservices. Split only when a module has an independent scaling need.
2. **Every state transition is an event.** `order.placed`, `quote.expired`, `sds.revision.published`,
   `compliance.blocked`. Outbox table → Redis stream → consumers. This gives you the audit trail
   regulators and auditors will ask for, for free.
3. **Money is never a float.** `BIGINT` minor units or `NUMERIC(18,4)`. Currency on every amount.
   Landed-cost components stored separately, never collapsed into one number.
4. **Documents are immutable.** Append-only, content-addressed (SHA-256), with a mutable pointer
   for "current revision."

## 3. Core data model

```sql
-- ---------- IDENTITY & TENANCY ----------
CREATE TABLE organisations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name      text        NOT NULL,
  trading_name    text,
  org_type        text        NOT NULL CHECK (org_type IN
                    ('buyer','supplier','both','logistics','lab','service_provider')),
  country         char(2)     NOT NULL,
  tax_id          text,
  verification_tier text      NOT NULL DEFAULT 'T1'
                    CHECK (verification_tier IN ('T1','T2','T3')),
  performance_score numeric(5,2),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES organisations(id),
  email           citext UNIQUE NOT NULL,
  role            text NOT NULL CHECK (role IN
                    ('owner','buyer','approver','store','ehs','quality','admin','finance')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Buyer's declared production lines. This is what powers "sell me the line".
CREATE TABLE production_lines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES organisations(id),
  name            text NOT NULL,                 -- "Line 2 - liquid detergent"
  application_codes text[] NOT NULL,             -- ['B02']
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------- CATALOGUE ----------
-- Seeded from sourcekettle/data/taxonomy.json
CREATE TABLE taxonomy_nodes (
  code            text PRIMARY KEY,              -- 'S11.2'
  name            text NOT NULL,
  kind            text NOT NULL CHECK (kind IN ('pillar','segment','subsegment')),
  parent_code     text REFERENCES taxonomy_nodes(code),
  pillar          text NOT NULL,                 -- resolved: 'S1'..'S6'
  applications    text[] NOT NULL DEFAULT '{}',
  mandatory_attrs text[] NOT NULL DEFAULT '{}',
  grade_gated     boolean NOT NULL DEFAULT false,
  licence_gated   boolean NOT NULL DEFAULT false,
  transaction_model text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true
);
CREATE INDEX ON taxonomy_nodes (parent_code);
CREATE INDEX ON taxonomy_nodes USING gin (applications);

CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_org_id uuid NOT NULL REFERENCES organisations(id),
  taxonomy_code   text NOT NULL REFERENCES taxonomy_nodes(code),
  sku             text NOT NULL,
  trade_name      text NOT NULL,
  cas_number      text,
  grade           text,
  physical_form   text,
  un_number       text,                          -- validated against dg_reference
  dg_class        text,
  packing_group   text,
  ghs_pictograms  text[],
  h_statements    text[],
  p_statements    text[],
  flash_point_c   numeric(6,2),
  storage_class   text,                          -- SC-1 .. SC-8
  purity_min_pct  numeric(6,3),
  shelf_life_months int,
  hs_code         text,
  country_of_origin char(2),
  certifications  text[] DEFAULT '{}',
  attrs           jsonb NOT NULL DEFAULT '{}',   -- segment-specific mandatory attrs
  attrs_complete  boolean NOT NULL DEFAULT false,-- computed: all mandatory_attrs present
  lifecycle       text NOT NULL DEFAULT 'draft'
                    CHECK (lifecycle IN ('draft','pending_review','live','suspended','archived')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_org_id, sku)
);
CREATE INDEX ON products (taxonomy_code);
CREATE INDEX ON products USING gin (attrs);
CREATE INDEX ON products USING gin (to_tsvector('english', trade_name));

-- A product can serve several applications; primary one lives on taxonomy_code.
CREATE TABLE product_applications (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  application_code text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (product_id, application_code)
);

CREATE TABLE offers (                            -- price + availability, the mutable part
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  currency        char(3) NOT NULL,
  unit_price_minor bigint NOT NULL,              -- integer minor units. Never a float.
  uom             text NOT NULL,
  moq             numeric(14,3) NOT NULL,
  lead_time_days  int NOT NULL,
  incoterm        text NOT NULL DEFAULT 'EXW',
  origin_location text,
  valid_from      date NOT NULL,
  valid_to        date NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON offers (product_id, valid_to);

CREATE TABLE packaging_options (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit         text NOT NULL,                    -- '200L HDPE drum'
  net_weight_kg numeric(10,3),
  tare_kg      numeric(10,3),
  un_rated     text,                             -- '1H1/Y1.8/150'
  units_per_pallet int
);

-- ---------- COMPLIANCE ----------
CREATE TABLE documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid REFERENCES products(id),
  order_item_id uuid,                           -- set when captured for a specific shipment
  doc_type     text NOT NULL CHECK (doc_type IN
                 ('SDS','CoA','TDS','GRADE_CERT','ALLERGEN','GMP','CE_DECL',
                  'TEST_CERT_3_1','CALIBRATION','INSPECTION','DG_DECL','LICENCE')),
  storage_key  text NOT NULL,
  sha256       text NOT NULL,
  revision     text,
  issue_date   date,
  language     char(2) DEFAULT 'en',
  is_current   boolean NOT NULL DEFAULT true,
  expires_at   date,
  uploaded_by  uuid REFERENCES users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sha256)
);
CREATE INDEX ON documents (product_id, doc_type, is_current);

CREATE TABLE compliance_checks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL,                    -- 'product' | 'order' | 'shipment'
  subject_id  uuid NOT NULL,
  rule_code   text NOT NULL,                     -- 'GRADE_GATE','STORAGE_SEGREGATION',...
  outcome     text NOT NULL CHECK (outcome IN ('pass','warn','block')),
  detail      jsonb NOT NULL DEFAULT '{}',
  evaluated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON compliance_checks (subject_type, subject_id);

CREATE TABLE dg_reference (                      -- UN Dangerous Goods list. Curated, versioned.
  un_number      char(4) PRIMARY KEY,
  proper_shipping_name text NOT NULL,
  dg_class       text NOT NULL,
  packing_groups text[],
  source_version text NOT NULL,                  -- e.g. 'IMDG 42-24'
  valid_from     date NOT NULL
);

CREATE TABLE jurisdiction_rules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country char(2),
  dest_country  char(2),
  hs_code_prefix text,
  un_number     char(4),
  required_docs text[] NOT NULL,
  licence_gate  boolean NOT NULL DEFAULT false,
  notes         text,
  UNIQUE (origin_country, dest_country, hs_code_prefix, un_number)
);

-- ---------- COMMERCIAL ----------
CREATE TABLE rfqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_org_id  uuid NOT NULL REFERENCES organisations(id),
  title         text NOT NULL,
  mode          text NOT NULL CHECK (mode IN ('open_rfq','sealed_auction','contract_renewal')),
  closes_at     timestamptz NOT NULL,
  delivery_location text NOT NULL,
  required_by   date NOT NULL,
  payment_terms text,
  status        text NOT NULL DEFAULT 'draft',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rfq_lines (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id        uuid NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  taxonomy_code text NOT NULL REFERENCES taxonomy_nodes(code),
  spec_text     text NOT NULL,
  quantity      numeric(14,3) NOT NULL,
  uom           text NOT NULL,
  target_price_minor bigint,
  currency      char(3)
);

CREATE TABLE quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id        uuid REFERENCES rfqs(id),
  supplier_org_id uuid NOT NULL REFERENCES organisations(id),
  status        text NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','withdrawn','shortlisted','awarded','rejected','expired')),
  valid_until   date NOT NULL,
  total_landed_minor bigint,                     -- the ranked number
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Landed cost is decomposed, never collapsed. Ranking uses the sum.
CREATE TABLE quote_cost_components (
  quote_id     uuid REFERENCES quotes(id) ON DELETE CASCADE,
  component    text NOT NULL CHECK (component IN
                 ('goods','freight','duty','insurance','handling','financing','other')),
  amount_minor bigint NOT NULL,
  currency     char(3) NOT NULL,
  note         text,
  PRIMARY KEY (quote_id, component)
);

CREATE TABLE orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_org_id  uuid NOT NULL REFERENCES organisations(id),
  supplier_org_id uuid NOT NULL REFERENCES organisations(id),
  quote_id      uuid REFERENCES quotes(id),
  status        text NOT NULL DEFAULT 'pending_approval',
  currency      char(3) NOT NULL,
  total_minor   bigint NOT NULL,
  incoterm      text NOT NULL,
  payment_terms text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id),
  taxonomy_code text NOT NULL,
  quantity      numeric(14,3) NOT NULL,
  uom           text NOT NULL,
  unit_price_minor bigint NOT NULL,
  line_total_minor bigint NOT NULL,
  status        text NOT NULL DEFAULT 'pending',
  batch_number  text,                            -- filled at despatch; powers traceability
  expiry_date   date
);

CREATE TABLE shipments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id),
  carrier_org_id uuid REFERENCES organisations(id),
  is_dg         boolean NOT NULL DEFAULT false,
  dg_declared   boolean NOT NULL DEFAULT false,  -- gate: must be true when is_dg
  un_numbers    char(4)[],
  tracking_ref  text,
  shipped_at    timestamptz,
  delivered_at  timestamptz,
  status        text NOT NULL DEFAULT 'planned'
);

-- ---------- PRICE INDEX (the moat) ----------
CREATE TABLE price_observations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_code text NOT NULL,
  cas_number    text,
  grade         text,
  region        text NOT NULL,
  landed_unit_price_minor bigint NOT NULL,
  uom           text NOT NULL,
  quantity      numeric(14,3),
  is_related_party boolean NOT NULL DEFAULT false,
  order_item_id uuid,
  observed_at   date NOT NULL
);
CREATE INDEX ON price_observations (taxonomy_code, region, observed_at);
```

**Two invariants worth enforcing with triggers:**
1. `products.attrs_complete = true` ⟹ every key in `taxonomy_nodes.mandatory_attrs` is present and
   non-null in `attrs` (plus the base columns). Enforce it, don't trust the UI.
2. A `shipments` row with `is_dg = true` cannot be set to `shipped` unless `dg_declared = true` and
   a `DG_DECL` document exists. This is the trigger that prevents the incident that ends the company.

## 4. Key APIs

```
POST   /v1/products                       create (supplier) — validates mandatory attrs
GET    /v1/catalogue/search?q=&taxonomy=&app=&grade=&dg_class=&region=&in_stock=
GET    /v1/products/{id}                  product + current offer + compliance envelope
POST   /v1/rfqs                           create RFQ with lines
POST   /v1/rfqs/{id}/quotes               supplier submits quote w/ cost components
POST   /v1/rfqs/{id}/award                buyer awards — recomputes landed cost ranking
POST   /v1/orders                         create order (enforces grade/licence/document gates)
POST   /v1/orders/{id}/approve            multi-level approval workflow
POST   /v1/shipments                      create — runs DG + segregation checks
GET    /v1/orders/{id}/compliance-pack    returns the versioned document bundle (PDF/ZIP)
GET    /v1/index/{taxonomy_code}          price index w/ n, band, methodology version
POST   /v1/documents                      upload; SHA-256 dedupe; immutable
GET    /v1/me/warehouse-plan              segregation plan derived from open orders
```

## 5. The compliance rules engine

Keep it dead simple and auditable — a table of pure functions, not a DSL.

```python
# compliance/rules.py  (illustrative)
from dataclasses import dataclass
from typing import Literal

Outcome = Literal["pass", "warn", "block"]

@dataclass(frozen=True)
class Finding:
    rule_code: str
    outcome: Outcome
    detail: dict

INCOMPATIBLE_STORAGE = {
    # acids must never share a drop with alkalis or hypochlorite
    ("SC-1", "SC-2"), ("SC-1", "SC-4"),
    ("SC-2", "SC-1"), ("SC-4", "SC-1"), ("SC-4", "SC-3"), ("SC-3", "SC-4"),
}

GRADE_GATED_SEGMENTS = {"S26", "S30", "S32"}          # from taxonomy_builder.py
LICENCE_GATED_SEGMENTS = {"S30", "S32", "S56", "S60", "S61"}
NON_INDUSTRIAL_GRADES = {"USP", "BP", "EP", "food", "pharma", "cosmetic"}

def grade_gate(item) -> Finding:
    """A technical-grade material must not flow into a grade-gated end use."""
    if item.segment_pillar in GRADE_GATED_SEGMENTS and item.grade not in NON_INDUSTRIAL_GRADES:
        return Finding("GRADE_GATE", "block",
                       {"segment": item.segment, "grade": item.grade,
                        "reason": "grade-gated end use requires certified grade"})
    return Finding("GRADE_GATE", "pass", {})

def storage_segregation(items) -> Finding:
    """Block a single drop that mixes incompatible storage classes."""
    classes = {i.storage_class for i in items if i.storage_class}
    conflicts = sorted({tuple(sorted(p)) for p in INCOMPATIBLE_STORAGE if set(p) <= classes})
    if conflicts:
        return Finding("STORAGE_SEGREGATION", "block",
                       {"conflicts": conflicts,
                        "action": "split across vehicles or obtain written EHS approval"})
    return Finding("STORAGE_SEGREGATION", "pass", {"classes": sorted(classes)})

def dg_gate(shipment) -> Finding:
    """No DG shipment leaves undeclared. No override exists."""
    if shipment.is_dg and not (shipment.dg_declared and shipment.dg_decl_document_id):
        return Finding("DG_GATE", "block",
                       {"un_numbers": shipment.un_numbers,
                        "missing": [f for f, ok in
                                    (("declaration", shipment.dg_declared),
                                     ("document", bool(shipment.dg_decl_document_id))) if not ok]})
    return Finding("DG_GATE", "pass", {})

def licence_gate(item, buyer, supplier) -> Finding:
    if item.segment in LICENCE_GATED_SEGMENTS:
        missing = [p for p, ok in (("buyer", buyer.licence_ok(item.segment)),
                                   ("supplier", supplier.licence_ok(item.segment))) if not ok]
        if missing:
            return Finding("LICENCE_GATE", "block", {"missing_licence_for": missing})
    return Finding("LICENCE_GATE", "pass", {})
```

Every `Finding` is persisted to `compliance_checks` with a timestamp. That table *is* your audit
defence.

## 6. Search design

- **Tokens that matter:** trade name, CAS number, synonym, INCI, grade, UN number, HS code, and
  the common misspelling. Chemical buyers search `naoh`, `caustic flakes`, `1310-73-2` and expect
  the same result.
- Build a **synonym table** (`naoh → sodium hydroxide → caustic soda → 1310-73-2`) and expand at
  query time. This single table will do more for your conversion rate than any ML ranking model.
- Rank by: exact CAS match → exact trade-name match → taxonomy match → supplier tier →
  performance score → availability → landed cost.
- Facets: taxonomy path, application, grade, DG class, storage class, packaging, region, lead time,
  certification, in-stock.

## 7. Integrations

| Integration | Purpose | Phase |
|---|---|---|
| Freight / DG carriers (API or curated partner list) | Live rates, booking, tracking, DG capability check | 2 |
| Customs / HS classification reference | Duty estimate in landed cost | 2 |
| Tax engine (Avalara/local) | Correct GST/VAT on invoices | 1 |
| Payment rails + invoice financing partner | Terms, escrow, milestone release | 2–3 |
| Third-party lab network (SGS/Intertek/BV class) | Book analysis against a sample, pull results into the CoA record | 2 |
| Buyer ERP (Tally, SAP B1, Odoo) | Punchout / PO sync. **This is what makes you sticky** | 3 |
| REACH/SVHC candidate list feed | Scheduled re-screen of the catalogue | 2 |

## 8. Non-functional requirements

- **Availability:** 99.5% is fine at MVP. The catalogue can be read-only during deploys; order
  placement cannot silently fail.
- **Audit:** every mutation on orders, quotes, compliance and documents writes an immutable event.
  Retain ≥7 years (statutory record retention in most jurisdictions — confirm locally).
- **Access control:** role-scoped. `ehs` and `quality` roles get read access to every document for
  their org and **cannot** approve price. `finance` approves, cannot edit specs.
- **Data residency & PII:** personal data is limited (contacts). Chemical data is not personal —
  but supplier pricing is commercially sensitive and must be tenant-isolated. Test isolation
  explicitly in CI.
- **Backup/DR:** point-in-time recovery on Postgres, cross-region object replication for documents.
  Run one restore drill per quarter and write it down.

---

*Next: `08-build-plan-and-team.md`.*
