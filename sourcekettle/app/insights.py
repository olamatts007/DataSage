"""SourceKettle insight services.

Substitution, supplier scorecards, replenishment, spend analytics and the
document vault. These are the retention features in plan/05 §5 -- the things
that make migrating away from the platform a genuine loss.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta

# --------------------------------------------------------------------------- #
# Substitution -- plan/07: the attribute layer is what makes substitution work
# --------------------------------------------------------------------------- #
def substitutes(target: dict, catalogue: list[dict]) -> list[dict]:
    """Find products that can stand in for `target`, with a match score and reason.

    Scored so that an exact CAS match on the same grade outranks a merely
    same-segment match. Anything below `min_score` is not offered, because a
    bad substitution suggestion costs more than no suggestion.
    """
    out = []
    for c in catalogue:
        if c["id"] == target["id"]:
            continue
        score, reasons = 0, []

        if target.get("cas") and c.get("cas") == target["cas"]:
            score += 45
            reasons.append("identical CAS")
        if c["segment"] == target["segment"]:
            score += 25
            reasons.append(f"same segment {target['segment']}")
        if c.get("form") == target.get("form"):
            score += 10
            reasons.append("same physical form")
        if c.get("storage") == target.get("storage"):
            score += 8
            reasons.append("same storage class")
        if c.get("dg") == target.get("dg"):
            score += 7
            reasons.append("same DG class")

        # purity must not regress
        tp, cp = target.get("purity"), c.get("purity")
        if tp and cp:
            if cp >= tp:
                score += 5
                reasons.append(f"purity {cp}% >= {tp}%")
            else:
                score -= 25
                reasons.append(f"purity {cp}% BELOW required {tp}%")
        elif tp and not cp:
            score -= 15
            reasons.append("purity not stated")

        # grade must be at least as high for gated end uses
        if target.get("grade") and c.get("grade"):
            if c["grade"] == target["grade"]:
                score += 10
                reasons.append(f"same grade ({c['grade']})")
            elif _grade_rank(c["grade"]) < _grade_rank(target["grade"]):
                score -= 40
                reasons.append(f"grade {c['grade']} is LOWER than {target['grade']}")
            else:
                score += 3
                reasons.append(f"higher grade ({c['grade']})")

        if score < 40:
            continue
        out.append({"product": c, "score": score, "reasons": reasons})

    out.sort(key=lambda x: (-x["score"], x["product"]["price"]))
    return out


_GRADES = ["technical", "industrial", "AR", "LR", "HPLC", "cosmetic", "food", "BP", "EP", "USP", "pharma"]


def _grade_rank(g: str) -> int:
    return _GRADES.index(g) if g in _GRADES else -1


# --------------------------------------------------------------------------- #
# Supplier scorecard -- plan/06 §4
# --------------------------------------------------------------------------- #
def scorecard(supplier: dict, orders: list[dict]) -> dict:
    """Recomputed from transaction history, not self-reported."""
    mine = [o for o in orders if o.get("supplier_id") == supplier["org_id"]]
    if not mine:
        return {"supplier": supplier["name"], "orders": 0, "score": supplier.get("score"),
                "note": "no fulfilled orders yet -- score is the onboarding assessment"}

    on_time = sum(1 for o in mine if o.get("delivered_on_time")) / len(mine)
    coa_ok = sum(1 for o in mine if o.get("coa_conformant")) / len(mine)
    disputes = sum(1 for o in mine if o.get("disputed")) / len(mine)
    doc_complete = sum(1 for o in mine if o.get("documents_complete")) / len(mine)

    # weighted: quality and compliance dominate price-driven metrics
    composite = round(
        (on_time * 0.25 + coa_ok * 0.30 + doc_complete * 0.20
         + (1 - disputes) * 0.25) * 5, 2)

    return {
        "supplier": supplier["name"],
        "tier": supplier.get("verification_tier"),
        "orders": len(mine),
        "on_time_pct": round(on_time * 100, 1),
        "coa_conformance_pct": round(coa_ok * 100, 1),
        "dispute_rate_pct": round(disputes * 100, 1),
        "document_completeness_pct": round(doc_complete * 100, 1),
        "score": composite,
        "flags": [
            f for f, bad in (
                ("on-time delivery below 90%", on_time < 0.90),
                ("CoA conformance below 98%", coa_ok < 0.98),
                ("dispute rate above 2%", disputes > 0.02),
                ("document completeness below 100%", doc_complete < 1.0),
            ) if bad
        ],
    }


# --------------------------------------------------------------------------- #
# Replenishment -- plan/05 §5
# --------------------------------------------------------------------------- #
def reorder_suggestions(consumption: dict[str, dict], catalogue_by_id: dict[str, dict],
                        today: date | None = None) -> list[dict]:
    """Suggest reorders from usage rate, lead time and safety stock.

    `consumption` maps product_id -> {daily_qty, on_hand, safety_days}.
    """
    today = today or date.today()
    out = []
    for pid, c in consumption.items():
        p = catalogue_by_id.get(pid)
        if not p:
            continue
        daily = float(c.get("daily_qty") or 0)
        if daily <= 0:
            continue
        on_hand = float(c.get("on_hand") or 0)
        safety_days = int(c.get("safety_days", 14))
        lead = int(p.get("lead", 7))

        days_of_cover = on_hand / daily
        reorder_at = daily * (lead + safety_days)
        need = on_hand <= reorder_at
        # order up to lead time + safety + one review cycle, rounded to MOQ
        want = daily * (lead + safety_days + 14)
        moq = float(p.get("moq") or 1)
        qty = max(moq, -(-want // moq) * moq) if need else 0.0

        out.append({
            "product_id": pid,
            "name": p["name"],
            "sku": p["sku"],
            "segment": p["segment"],
            "on_hand": on_hand,
            "daily_qty": daily,
            "days_of_cover": round(days_of_cover, 1),
            "lead_time_days": lead,
            "safety_days": safety_days,
            "reorder_point": round(reorder_at, 1),
            "action": "REORDER NOW" if need else "ok",
            "suggested_qty": qty,
            "suggested_value": int(qty * p.get("price", 0) * 100),  # kobo
            "stockout_in_days": round(max(days_of_cover - lead, 0), 1) if need else None,
        })
    out.sort(key=lambda x: (x["action"] != "REORDER NOW", x["days_of_cover"]))
    return out


# --------------------------------------------------------------------------- #
# Spend analytics
# --------------------------------------------------------------------------- #
def spend_summary(orders: list[dict], catalogue_by_id: dict[str, dict]) -> dict:
    by_segment: dict[str, int] = defaultdict(int)
    by_supplier: dict[str, int] = defaultdict(int)
    by_pillar: dict[str, int] = defaultdict(int)
    total = 0

    for o in orders:
        for it in o.get("items", []):
            value = int(float(it.get("quantity") or 0) * float(it.get("price_kobo") or 0))
            total += value
            seg = it.get("segment", "?")
            by_segment[seg] += value
            by_supplier[it.get("supplier_id") or "?"] += value
            p = catalogue_by_id.get(it.get("product_id"), {})
            by_pillar[p.get("pillar", "?")] += value

    def top(d, n=8):
        return [{"key": k, "value_kobo": v,
                 "share_pct": round(v / total * 100, 1) if total else 0}
                for k, v in sorted(d.items(), key=lambda kv: -kv[1])[:n]]

    return {
        "total_kobo": total,
        "orders": len(orders),
        "by_segment": top(by_segment),
        "by_supplier": top(by_supplier),
        "by_pillar": top(by_pillar),
    }


# --------------------------------------------------------------------------- #
# Document vault -- plan/06 §1
# --------------------------------------------------------------------------- #
def document_alerts(documents: list[dict], today: date | None = None,
                    warn_days: int = 45) -> dict:
    """SDS revisions are the most-versioned documents in this business.

    A shipment must reference the revision current ON THE SHIP DATE, so we keep
    every revision and only flag the *current* one.
    """
    today = today or date.today()
    expired, expiring, superseded = [], [], []

    for d in documents:
        if not d.get("is_current", True):
            superseded.append(d)
            continue
        exp = d.get("expires_at")
        if not exp:
            continue
        exp_date = date.fromisoformat(exp) if isinstance(exp, str) else exp
        days = (exp_date - today).days
        rec = {"product_id": d.get("product_id"), "doc_type": d.get("doc_type"),
               "revision": d.get("revision"), "expires_at": exp, "days_left": days}
        if days < 0:
            expired.append(rec)
        elif days <= warn_days:
            expiring.append(rec)

    return {
        "expired": sorted(expired, key=lambda r: r["days_left"]),
        "expiring_soon": sorted(expiring, key=lambda r: r["days_left"]),
        "superseded_revisions": len(superseded),
        "warn_window_days": warn_days,
        "blocking": len(expired),
        "note": "expired documents block an order from moving to READY_TO_SHIP",
    }
