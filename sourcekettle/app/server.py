#!/usr/bin/env python3
"""SourceKettle application server.

Standard library only -- no pip install, no build step. Run:

    python3 sourcekettle/app/server.py [--port 8000]

Then open http://localhost:8000

The compliance decisions in this app are made by `engine.rules` -- the same
module covered by the 30-test suite in `engine/test_rules.py`. This file does
not reimplement any rule; it constructs the value objects and hands them over.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent
REPO_ROOT = PROJECT_DIR.parent
STATIC_DIR = APP_DIR / "static"

# Make `engine` importable -- this is the real, tested rules engine.
sys.path.insert(0, str(PROJECT_DIR))

from engine.models import Item, Order, Party, Shipment          # noqa: E402
from engine.rules import evaluate_order, pillar_of               # noqa: E402

import commercial                                                 # noqa: E402
import history                                                    # noqa: E402
import insights                                                   # noqa: E402
from seed import (                                               # noqa: E402
    BY_ID, DG_REFERENCE, LINE_TEMPLATES, PRODUCTS, SUPPLIERS, un_number_known,
)

TAXONOMY = json.loads((PROJECT_DIR / "data" / "taxonomy.json").read_text(encoding="utf-8"))
NODES = {n["code"]: n for n in TAXONOMY["taxonomies"]["A_category_tree"]}
APPLICATIONS = {a["code"]: a["name"] for a in TAXONOMY["taxonomies"]["B_application_tree"]}
STORAGE = {s["code"]: s for s in TAXONOMY["reference"]["storage_classes"]}

# Buyer persona for the demo session (plan/02 defines P1-P5).
BUYER = Party("b1", "BrightWash Industries", "T3", licences={})
# Same buyer but holding a pesticide licence, for exercising the licence gate.
BUYER_LICENSED = Party("b1", "BrightWash Industries", "T3", licences={"S30": True})

ORDERS: dict[str, dict] = {}
RFQS: dict[str, commercial.Rfq] = {}
AUCTIONS: dict[str, dict] = {}


def _rfq_view(r: commercial.Rfq) -> dict:
    return {
        "rfq_id": r.rfq_id,
        "mode": r.mode,
        "closed": r.closed,
        "delivery_location": r.delivery_location,
        "required_by": r.required_by,
        "payment_days": r.payment_days,
        "lines": [{"taxonomy_code": l.taxonomy_code,
                   "segment_name": NODES.get(l.taxonomy_code, {}).get("name", l.taxonomy_code),
                   "spec": l.spec, "quantity": l.quantity, "uom": l.uom,
                   "target_unit_kobo": l.target_unit_kobo} for l in r.lines],
        "quotes": len(r.quotes),
        "bidders": [q["supplier_name"] for q in r.quotes],
    }


def create_rfq(lines: list[dict], delivery: str, required_by: str,
               payment_days: int = 30, mode: str = "sealed_auction") -> commercial.Rfq:
    """Build an RFQ from cart lines or a line template.

    Lines may carry either a resolved `segment` or just a `product_id`; the
    segment is resolved from the catalogue when absent, because an RFQ is
    specified against a segment, not against one supplier's SKU.
    """
    rid = "RFQ-" + uuid.uuid4().hex[:6].upper()
    resolved = []
    for ln in lines:
        p = BY_ID.get(ln.get("product_id"), {})
        segment = ln.get("segment") or p.get("segment")
        if not segment:
            raise ValueError(f"cannot resolve a segment for line {ln}")
        resolved.append(commercial.RfqLine(
            taxonomy_code=segment,
            spec=ln.get("spec") or p.get("name", segment),
            quantity=float(ln.get("quantity") or p.get("moq") or 1),
            uom=ln.get("uom") or p.get("uom", "kg"),
            target_unit_kobo=ln.get("target_unit_kobo"),
        ))

    # One lot per requested SPEC, not per segment. LABSA, SLES and CAPB are all
    # S20 but they are bought separately -- merging them would make the
    # per-unit landed-price comparison across bidders meaningless, because each
    # bidder would be pricing a different product.
    r = commercial.Rfq(
        rfq_id=rid,
        lines=resolved,
        delivery_location=delivery,
        required_by=required_by,
        payment_days=payment_days,
        mode=mode,
    )
    RFQS[rid] = r
    return r


# Deterministic per-supplier bid behaviour, so an auction is reproducible.
# Unknown suppliers fall back to neutral rather than raising -- a new supplier
# onboarded mid-flight must still be able to bid.
_BID_FACTOR = {"s1": 1.000, "s2": 0.965, "s3": 1.042, "s4": 1.018, "s5": 1.075,
               "s6": 0.990, "s7": 1.055, "s8": 0.978, "s9": 1.030}
_BID_SEED = {"s1": 0.00, "s2": -0.02, "s3": 0.03, "s4": 0.01, "s5": 0.05,
             "s6": -0.01, "s7": 0.04, "s8": -0.015, "s9": 0.02}
_DEFAULT_FACTOR, _DEFAULT_SEED = 1.0, 0.0


def run_auction(rfq_id: str) -> dict:
    """Collect sealed bids and award LOT BY LOT.

    A multi-segment RFQ is not won by one supplier -- you award the caustic to
    one distributor and the reactor to a fabricator. So each requested segment
    is its own lot, bidders are the suppliers who can serve that segment, and
    each lot is ranked independently on total landed cost.
    """
    r = RFQS.get(rfq_id)
    if not r:
        return {"error": "unknown RFQ"}
    if r.quotes:
        return {"error": "bids already collected"}

    lots = []
    for ln in r.lines:
        eligible = []
        for s in SUPPLIERS.values():
            cands = [p for p in PRODUCTS
                     if p["supplier"] == s["org_id"] and p["segment"] == ln.taxonomy_code]
            if not cands:
                continue
            base = min(int(p["price"] * 100) for p in cands)
            factor = _BID_FACTOR.get(s["org_id"], _DEFAULT_FACTOR) * \
                (1 + _BID_SEED.get(s["org_id"], _DEFAULT_SEED))
            eligible.append((s, int(round(base * factor)), cands[0]))

        lot_rfq = commercial.Rfq(
            rfq_id=f"{r.rfq_id}-{ln.taxonomy_code}",
            lines=[ln],
            delivery_location=r.delivery_location,
            required_by=r.required_by,
            payment_days=r.payment_days,
            mode=r.mode,
        )
        for s, unit, _ in eligible:
            commercial.submit_quote(lot_rfq, s, {ln.taxonomy_code: unit}, origin=s["country"])

        ranking = commercial.rank_quotes(lot_rfq)
        lots.append({
            "lot": ln.taxonomy_code,
            "segment_name": NODES.get(ln.taxonomy_code, {}).get("name", ln.taxonomy_code),
            "spec": ln.spec,
            "quantity": ln.quantity,
            "uom": ln.uom,
            "bidders": len(eligible),
            "ranking": ranking,
        })

        # record the winner on the parent RFQ so the UI can show an award summary
        if ranking.get("rankable"):
            winner = next(q for q in r_quotes(lot_rfq) if q["supplier_name"] == ranking["recommended"])
            r.quotes.append(winner | {"lot": ln.taxonomy_code})

    awarded = sum(1 for l in lots if l["ranking"].get("rankable"))
    result = {
        "rfq_id": rfq_id,
        "lots": len(lots),
        "awarded": awarded,
        "unawardable": [l["lot"] for l in lots if not l["ranking"].get("rankable")],
        "results": lots,
        "note": "each lot is ranked independently on total landed cost",
    }
    AUCTIONS[rfq_id] = result
    return result


def r_quotes(rfq) -> list[dict]:
    return rfq.quotes


CARRIER_DG_OK = True  # toggled from the UI to demonstrate the DG gate


# --------------------------------------------------------------------------- #
# Catalogue helpers
# --------------------------------------------------------------------------- #
def _pack_weight(p: dict) -> float:
    """Kg per unit of the selling UoM, for freight calculation."""
    if p.get("uom") in ("kg",):
        return 1.0
    if p.get("uom") == "l":
        return 0.95
    if p.get("uom") == "t":
        return 1000.0
    packs = p.get("packs") or []
    if packs:
        return float(packs[0].get("net_weight_kg") or packs[0].get("net_weight_kg") or 1)
    return 1.0


def pillar_for(code: str) -> str:
    node = NODES.get(code)
    if not node:
        return ""
    return node.get("pillar") or pillar_of(code)


def path_for(code: str) -> str:
    parts, cur = [], NODES.get(code)
    while cur:
        parts.append(cur["name"])
        cur = NODES.get(cur.get("parent")) if cur.get("parent") else None
    return " > ".join(reversed(parts))


def applications_for(code: str) -> list[str]:
    node = NODES.get(code, {})
    return node.get("applications", [])


def enrich(p: dict) -> dict:
    """Add taxonomy-derived context so the UI never has to join client-side."""
    seg = p["segment"]
    out = dict(p)
    out["pillar"] = pillar_for(seg)
    out["segment_name"] = NODES.get(seg, {}).get("name", seg)
    out["segment_path"] = path_for(seg)
    out["applications"] = applications_for(seg)
    out["application_names"] = [APPLICATIONS.get(a, a) for a in applications_for(seg)]
    node = NODES.get(seg, {})
    out["grade_gated"] = node.get("grade_gated", False)
    out["licence_gated"] = node.get("licence_gated", False)
    out["transaction_model"] = node.get("transaction_model", "marketplace")
    out["storage_rule"] = STORAGE.get(p.get("storage") or "", {}).get("rule")
    out["dg_psn"] = DG_REFERENCE.get(p.get("un") or "", {}).get("psn")
    out["un_verified"] = un_number_known(p.get("un"))
    supplier = SUPPLIERS.get(p["supplier"], {})
    out["supplier_name"] = supplier.get("name")
    out["supplier_tier"] = supplier.get("verification_tier")
    out["supplier_score"] = supplier.get("score")
    return out


PAGE_SIZE = 48


def _matches(p: dict, q: str, pillar: str, app: str, grade: str,
             dg: str, storage: str) -> bool:
    if pillar and not pillar_for(p["segment"]).startswith(pillar):
        return False
    if app and app not in applications_for(p["segment"]):
        return False
    if grade and p.get("grade") != grade:
        return False
    if dg and p.get("dg") != dg:
        return False
    if storage and p.get("storage") != storage:
        return False
    if not q:
        return True
    hay = " ".join(filter(None, [
        p["name"], p["sku"], p.get("cas") or "", p["segment"],
        NODES.get(p["segment"], {}).get("name", ""), p.get("note", ""),
    ])).lower()
    if q in hay:
        return True
    # Synonym expansion -- plan/07 calls this the highest-ROI search feature.
    return any(q in alts and canon in hay for canon, alts in SYNONYMS.items())


def search(q: str = "", pillar: str = "", app: str = "", grade: str = "",
           dg: str = "", storage: str = "", limit: int = 0, offset: int = 0,
           enrich_all: bool = False) -> dict:
    """Filter the catalogue and return one page of it.

    The catalogue is ~1000 SKUs, so the full result set is never serialised in
    one response: `limit`/`offset` page it and `total` lets the client render a
    pager. Rows are filtered and sorted as raw dicts and only the returned page
    is enriched -- enriching all 1000 on every keystroke was the slow path.
    """
    q = (q or "").strip().lower()
    hits = [p for p in PRODUCTS if _matches(p, q, pillar, app, grade, dg, storage)]
    hits.sort(key=lambda x: (pillar_for(x["segment"]), x["segment"], x["name"]))
    total = len(hits)
    if enrich_all or not limit:
        page = [enrich(x) for x in hits]
        return {"results": page, "total": total, "limit": total, "offset": 0}
    start = max(0, offset)
    page = [enrich(x) for x in hits[start:start + limit]]
    return {"results": page, "total": total, "limit": limit, "offset": start}


SYNONYMS = {
    "caustic soda": {"naoh", "caustic", "sodium hydroxide", "1310-73-2"},
    "hydrochloric acid": {"hcl", "muriatic", "7647-01-0"},
    "sodium hypochlorite": {"bleach", "hypochlorite", "naocl"},
    "titanium dioxide": {"tio2", "13463-67-7"},
    "isopropanol": {"ipa", "isopropyl alcohol", "67-63-0"},
}


# --------------------------------------------------------------------------- #
# The compliance engine bridge
# --------------------------------------------------------------------------- #
def build_items(lines: list[dict]) -> list[Item]:
    items = []
    for ln in lines:
        p = BY_ID.get(ln.get("product_id"))
        if not p:
            continue
        items.append(Item(
            product_id=p["id"],
            name=p["name"],
            segment=p["segment"],
            segment_pillar=pillar_for(p["segment"]),
            grade=p.get("grade"),
            physical_form=p.get("form"),
            un_number=p.get("un"),
            dg_class=p.get("dg") or "non-DG",
            storage_class=p.get("storage"),
            deviation_disclosure=p.get("disclosure"),
            quantity=float(ln.get("quantity") or 1),
            uom=p.get("uom", "kg"),
        ))
    return items


def un_number_findings(items: list[Item]) -> list[dict]:
    """App-level check required by plan/06: UN numbers must exist in the curated
    DG reference. The engine validates *format*; this validates *membership*."""
    out = []
    for it in items:
        if it.dg_class in (None, "non-DG"):
            continue
        if not it.un_number:
            out.append({"rule_code": "UN_NUMBER_MISSING", "outcome": "block",
                        "detail": {"product_id": it.product_id,
                                   "reason": "DG item has no UN number"}})
        elif not un_number_known(it.un_number):
            out.append({"rule_code": "UN_NUMBER_NOT_IN_REFERENCE", "outcome": "block",
                        "detail": {"product_id": it.product_id, "un_number": it.un_number,
                                   "reason": "not in the curated DG reference table"}})
    return out


def evaluate_payload(payload: dict) -> dict:
    lines = payload.get("items", [])
    ship_cfg = payload.get("shipment", {})
    items = build_items(lines)

    un_numbers = sorted({i.un_number for i in items if i.un_number})
    is_dg = any((i.dg_class or "non-DG") != "non-DG" for i in items)

    supplier_id = ship_cfg.get("supplier_id") or (
        BY_ID[lines[0]["product_id"]]["supplier"] if lines else "s1")
    supplier_cfg = SUPPLIERS.get(supplier_id, {})
    supplier = Party(supplier_cfg.get("org_id", supplier_id),
                     supplier_cfg.get("name", supplier_id),
                     supplier_cfg.get("verification_tier", "T1"),
                     licences=supplier_cfg.get("licences", {}))
    buyer = BUYER_LICENSED if payload.get("buyer_has_licence") else BUYER

    shipment = Shipment(
        shipment_id=ship_cfg.get("shipment_id", "SHP-DRAFT"),
        is_dg=bool(ship_cfg.get("is_dg", is_dg)),
        dg_declared=bool(ship_cfg.get("dg_declared", False)),
        dg_decl_document_id=ship_cfg.get("dg_decl_document_id"),
        un_numbers=un_numbers,
        carrier_dg_authorised=bool(ship_cfg.get("carrier_dg_authorised", False)),
        items=items,
    )
    order = Order(payload.get("order_id", "ORD-DRAFT"), buyer, supplier, items, shipment)

    findings = evaluate_order(order)          # <- the real, tested engine
    as_dicts = [{"rule_code": f.rule_code, "outcome": f.outcome, "detail": f.detail}
                for f in findings]
    as_dicts += un_number_findings(items)     # app-level DG reference membership

    blocked = any(f["outcome"] == "block" for f in as_dicts)
    return {
        "order_id": order.order_id,
        "blocked": blocked,
        "counts": {
            "total": len(as_dicts),
            "pass": sum(1 for f in as_dicts if f["outcome"] == "pass"),
            "warn": sum(1 for f in as_dicts if f["outcome"] == "warn"),
            "block": sum(1 for f in as_dicts if f["outcome"] == "block"),
        },
        "findings": as_dicts,
        "shipment": {"is_dg": shipment.is_dg, "un_numbers": un_numbers},
        "items": [enrich(BY_ID[i.product_id]) | {"quantity": i.quantity} for i in items],
    }


def warehouse_plan(items: list[Item]) -> dict:
    """plan/06 §3 -- derive the buyer's segregation plan from the basket."""
    groups: dict[str, list[str]] = {}
    for i in items:
        if i.storage_class:
            groups.setdefault(i.storage_class, []).append(i.name)
    plan = []
    for code in sorted(groups):
        meta = STORAGE.get(code, {})
        plan.append({"storage_class": code, "name": meta.get("name", code),
                     "rule": meta.get("rule", ""), "items": groups[code]})
    return {"zones": plan,
            "separate_drops_required": len([z for z in plan
                                            if z["storage_class"] in ("SC-1", "SC-3", "SC-4")]) > 1}


# --------------------------------------------------------------------------- #
# HTTP layer
# --------------------------------------------------------------------------- #
class Handler(BaseHTTPRequestHandler):
    server_version = "SourceKettle/1.0"

    def log_message(self, fmt, *args):  # quieter logs
        sys.stderr.write("  %s %s\n" % (self.command, self.path.split("?")[0]))

    # -- helpers ---------------------------------------------------------- #
    def _send(self, code: int, body: bytes, ctype: str):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, obj, code: int = 200):
        self._send(code, json.dumps(obj, default=str).encode(), "application/json")

    def _static(self, rel: str):
        target = (STATIC_DIR / rel).resolve()
        if not str(target).startswith(str(STATIC_DIR.resolve())):
            return self._json({"error": "forbidden"}, 403)
        if not target.is_file():
            return self._json({"error": "not found", "path": rel}, 404)
        ctype = {".html": "text/html; charset=utf-8",
                 ".js": "text/javascript; charset=utf-8",
                 ".css": "text/css; charset=utf-8",
                 ".svg": "image/svg+xml"}.get(target.suffix, "application/octet-stream")
        self._send(200, target.read_bytes(), ctype)

    # -- routes ----------------------------------------------------------- #
    def do_GET(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        path = u.path

        if path in ("/", "/index.html"):
            return self._static("index.html")
        if path.startswith("/static/"):
            return self._static(path[len("/static/"):])

        if path == "/api/bootstrap":
            return self._json({
                "taxonomy": TAXONOMY["taxonomies"]["A_category_tree"],
                "applications": TAXONOMY["taxonomies"]["B_application_tree"],
                "storage_classes": TAXONOMY["reference"]["storage_classes"],
                "ghs": TAXONOMY["reference"]["ghs_pictograms"],
                "suppliers": list(SUPPLIERS.values()),
                "line_templates": LINE_TEMPLATES,
                "dg_reference": DG_REFERENCE,
                "buyer": {"name": BUYER.name, "tier": BUYER.verification_tier},
                "counts": {
                    "pillars": sum(1 for n in TAXONOMY["taxonomies"]["A_category_tree"]
                                   if n["kind"] == "pillar"),
                    "segments": sum(1 for n in TAXONOMY["taxonomies"]["A_category_tree"]
                                    if n["kind"] == "segment"),
                    "subsegments": sum(1 for n in TAXONOMY["taxonomies"]["A_category_tree"]
                                       if n["kind"] == "subsegment"),
                    "products": len(PRODUCTS),
                    "applications": len(APPLICATIONS),
                    "attributes": len(TAXONOMY["taxonomies"]["C_attribute_schema"]),
                },
            })

        if path == "/api/catalogue":
            args = {k: q.get(k, "") for k in
                    ("q", "pillar", "app", "grade", "dg", "storage")}
            try:
                args["limit"] = int(q.get("limit") or PAGE_SIZE)
                args["offset"] = int(q.get("offset") or 0)
            except ValueError:
                return self._json({"error": "limit/offset must be integers"}, 400)
            return self._json(search(**args))

        m = re.match(r"^/api/products/([\w-]+)$", path)
        if m:
            p = BY_ID.get(m.group(1))
            if not p:
                return self._json({"error": "unknown product"}, 404)
            node = NODES.get(p["segment"], {})
            return self._json({
                "product": enrich(p),
                "mandatory_attributes": node.get("mandatory_attributes", []),
                "segment_note": node.get("note", ""),
            })

        m = re.match(r"^/api/lines/([A-Z]\d+)$", path)
        if m:
            tpl = LINE_TEMPLATES.get(m.group(1))
            if not tpl:
                return self._json({"error": "unknown line template"}, 404)
            return self._json({
                "application": m.group(1),
                "application_name": APPLICATIONS.get(m.group(1), ""),
                "name": tpl["name"], "typical": tpl["typical"],
                "roles": [{"role": r, "product": enrich(BY_ID[pid])}
                          for r, pid in tpl["roles"] if pid in BY_ID],
            })

        if path == "/api/orders":
            return self._json({"orders": list(ORDERS.values())})

        # ---------------- commercial / insight services ---------------- #
        if path == "/api/index-segments":
            segs = [{"code": c,
                     "name": NODES.get(c, {}).get("name", c),
                     "observations": len(v),
                     "publishable": len([o for o in v if not o.get("is_related_party")])
                                    >= commercial.MIN_OBSERVATIONS}
                    for c, v in sorted(history.OBSERVATIONS.items())]
            segs.sort(key=lambda s: (not s["publishable"], s["code"]))
            return self._json({"segments": segs,
                               "min_observations": commercial.MIN_OBSERVATIONS})

        m = re.match(r"^/api/index/([\w.]+)$", path)
        if m:
            code = m.group(1)
            obs = history.OBSERVATIONS.get(code, [])
            idx = commercial.price_index(obs)
            return self._json({"taxonomy_code": code,
                               "segment_name": NODES.get(code, {}).get("name", code),
                               "index": idx,
                               "recent": sorted(obs, key=lambda o: o["observed_at"],
                                                reverse=True)[:8]})

        m = re.match(r"^/api/substitutes/([\w-]+)$", path)
        if m:
            p = BY_ID.get(m.group(1))
            if not p:
                return self._json({"error": "unknown product"}, 404)
            found = insights.substitutes(p, PRODUCTS)
            return self._json({"target": enrich(p),
                               "count": len(found),
                               "substitutes": [{"score": f["score"], "reasons": f["reasons"],
                                                "product": enrich(f["product"])} for f in found]})

        if path == "/api/scorecards":
            return self._json({"scorecards": [insights.scorecard(s, history.ORDER_HISTORY)
                                              for s in SUPPLIERS.values()]})

        if path == "/api/replenishment":
            return self._json({
                "suggestions": insights.reorder_suggestions(history.CONSUMPTION, BY_ID,
                                                            today=history.TODAY),
                "as_of": history.TODAY.isoformat(),
            })

        if path == "/api/analytics":
            spend = insights.spend_summary(history.ORDER_HISTORY,
                                           {p["id"]: enrich(p) for p in PRODUCTS})
            return self._json({
                "spend": spend,
                "currency": commercial.CURRENCY,
                "suppliers": {s["org_id"]: s["name"] for s in SUPPLIERS.values()},
                "segments": {c: NODES[c]["name"] for c, _ in
                             ((x["key"], None) for x in spend["by_segment"])},
            })

        if path == "/api/documents/alerts":
            return self._json(insights.document_alerts(history.DOCUMENTS, today=history.TODAY))

        if path == "/api/rfqs":
            return self._json({"rfqs": [_rfq_view(r) for r in RFQS.values()]})

        m = re.match(r"^/api/rfqs/([\w.-]+)/ranking$", path)
        if m:
            raw = m.group(1)
            # A lot id looks like "RFQ-XXXXXX-S20"; the parent RFQ is "RFQ-XXXXXX".
            # Resolve the parent explicitly rather than with a greedy regex.
            rid = raw if raw in RFQS else raw.rsplit("-", 1)[0]
            r = RFQS.get(rid)
            if not r:
                return self._json({"error": "unknown RFQ", "tried": [raw, rid]}, 404)
            auction = AUCTIONS.get(rid)
            if auction is None:
                return self._json({"rfq": _rfq_view(r), "auction": None,
                                   "status": "no bids collected yet"})
            # attach a reference price index to each awarded lot
            for lot in auction["results"]:
                lot["reference_index"] = commercial.price_index(
                    history.OBSERVATIONS.get(lot["lot"], []))
            return self._json({"rfq": _rfq_view(r), "auction": auction})

        return self._json({"error": "not found", "path": path}, 404)

    def do_POST(self):
        u = urlparse(self.path)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            payload = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self._json({"error": "invalid JSON body"}, 400)

        if u.path == "/api/evaluate":
            return self._json(evaluate_payload(payload))

        if u.path == "/api/warehouse-plan":
            items = build_items(payload.get("items", []))
            return self._json(warehouse_plan(items))

        if u.path == "/api/landed-cost":
            p = BY_ID.get(payload.get("product_id"))
            if not p:
                return self._json({"error": "unknown product"}, 404)
            qty = float(payload.get("quantity") or p["moq"] or 1)
            lc = commercial.landed_cost(
                quantity=qty,
                unit_price_kobo=int(p["price"] * 100),
                origin=p["origin"],
                total_kg=qty * _pack_weight(p),
                has_dg=(p.get("dg") or "non-DG") != "non-DG",
                dg_lines=1 if (p.get("dg") or "non-DG") != "non-DG" else 0,
                payment_days=int(payload.get("payment_days", 30)),
            )
            idx = commercial.price_index(history.OBSERVATIONS.get(p["segment"], []))
            return self._json({
                "product": enrich(p),
                "quantity": qty,
                "landed": lc,
                "vs_index": commercial.savings_vs_index(lc["landed_unit_kobo"], idx),
                "index": idx,
            })

        if u.path == "/api/rfqs":
            lines = payload.get("items") or []
            if not lines:
                tpl = LINE_TEMPLATES.get(payload.get("line_template"))
                if tpl:
                    lines = [{"product_id": pid, "quantity": BY_ID[pid]["moq"]}
                             for _, pid in tpl["roles"] if pid in BY_ID]
            if not lines:
                return self._json({"error": "no items and no line_template given"}, 400)
            try:
                r = create_rfq(lines,
                               payload.get("delivery_location", "Lagos, NG"),
                               payload.get("required_by", "2026-09-30"),
                               int(payload.get("payment_days", 30)),
                               payload.get("mode", "sealed_auction"))
            except ValueError as e:
                return self._json({"error": str(e)}, 400)
            return self._json({"rfq": _rfq_view(r)}, 201)

        m = re.match(r"^/api/rfqs/([\w-]+)/auction$", u.path)
        if m:
            return self._json(run_auction(m.group(1)))

        if u.path == "/api/orders":
            result = evaluate_payload(payload)
            if result["blocked"]:
                # Hard gate. plan/06: a blocked order cannot be placed. No override.
                return self._json({"error": "order blocked by compliance rules",
                                   "blocked": True, "result": result}, 422)
            oid = "ORD-" + uuid.uuid4().hex[:6].upper()
            ORDERS[oid] = result | {"order_id": oid, "status": "confirmed"}
            return self._json({"order_id": oid, "status": "confirmed", "result": result}, 201)

        return self._json({"error": "not found", "path": u.path}, 404)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--host", default="0.0.0.0")
    args = ap.parse_args()

    srv = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"SourceKettle  |  http://{args.host}:{args.port}")
    print(f"  taxonomy : {len(NODES)} nodes, {len(APPLICATIONS)} applications")
    print(f"  catalogue: {len(PRODUCTS)} products across "
          f"{len({p['segment'] for p in PRODUCTS})} segments")
    print(f"  engine   : {__import__('engine.rules', fromlist=['rules']).__file__}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
