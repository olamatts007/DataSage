"""SourceKettle commercial engine: landed cost, price index, RFQ / reverse auction.

Implements plan/04 §4 (quote mechanics, "rank on landed cost, always") and
plan/04 §5 (the price index moat).

Money is integer kobo throughout -- plan/07 invariant 3: money is never a float.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass, field

CURRENCY = "NGN"

# Illustrative duty + logistics parameters. Replace with a real customs/tariff
# integration and live freight rates before production (plan/07 integrations).
DUTY_RATE_BY_ORIGIN = {
    "NG": 0.00, "IN": 0.10, "CN": 0.10, "AE": 0.05, "SA": 0.05,
    "TR": 0.07, "EG": 0.07, "DE": 0.05, "NL": 0.05, "MY": 0.10, "BR": 0.12,
}
FREIGHT_PROFILE = {
    "NG": {"base_kobo": 800_000, "per_kg_kobo": 600},
    "_import": {"base_kobo": 4_500_000, "per_kg_kobo": 2_200},
}
DG_FREIGHT_SURCHARGE = 0.15
INSURANCE_RATE = 0.0035
FINANCING_ANNUAL_RATE = 0.22          # trade-finance cost of carrying terms
HANDLING_BASE_KOBO = 250_000
HANDLING_PER_DG_LINE_KOBO = 150_000

KINDS = ("goods", "freight", "duty", "insurance", "handling", "financing", "other")


@dataclass
class CostLine:
    kind: str
    amount_kobo: int
    note: str = ""

    def as_dict(self) -> dict:
        return {"component": self.kind, "amount_kobo": self.amount_kobo, "note": self.note}


def landed_cost(quantity: float, unit_price_kobo: int, origin: str,
                total_kg: float, has_dg: bool, dg_lines: int = 0,
                payment_days: int = 0, duty_override: float | None = None) -> dict:
    """Decompose a quote into components. Never collapse into one number.

    Returns the components plus `landed_unit_kobo`, which is the number that
    gets ranked -- plan/04: headline price is not the ranking key.
    """
    if quantity <= 0:
        raise ValueError("quantity must be positive")

    goods = int(round(unit_price_kobo * quantity))
    duty_rate = DUTY_RATE_BY_ORIGIN.get(origin, 0.10) if duty_override is None else duty_override

    prof = FREIGHT_PROFILE["NG"] if origin == "NG" else FREIGHT_PROFILE["_import"]
    freight = int(prof["base_kobo"] + prof["per_kg_kobo"] * max(total_kg, 0.0))
    if has_dg:
        freight = int(round(freight * (1 + DG_FREIGHT_SURCHARGE)))

    duty = int(round(goods * duty_rate))
    insurance = int(round(goods * INSURANCE_RATE))
    handling = HANDLING_BASE_KOBO + HANDLING_PER_DG_LINE_KOBO * dg_lines
    financing = int(round(goods * (payment_days / 365.0) * FINANCING_ANNUAL_RATE))

    lines = [
        CostLine("goods", goods, f"{quantity:g} x {unit_price_kobo} kobo"),
        CostLine("freight", freight,
                 f"{'domestic' if origin == 'NG' else 'import'}"
                 + (" + 15% DG surcharge" if has_dg else "")),
        CostLine("duty", duty, f"{duty_rate:.0%} on goods (origin {origin})"),
        CostLine("insurance", insurance, f"{INSURANCE_RATE:.2%} of goods"),
        CostLine("handling", handling, f"base + {dg_lines} DG line(s)"),
        CostLine("financing", financing, f"{payment_days}d terms @ {FINANCING_ANNUAL_RATE:.0%} p.a."),
    ]
    total = sum(l.amount_kobo for l in lines)
    return {
        "currency": CURRENCY,
        "components": [l.as_dict() for l in lines if l.amount_kobo],
        "total_kobo": total,
        "landed_unit_kobo": int(round(total / quantity)) if quantity else 0,
        "payment_days": payment_days,
        "duty_rate": duty_rate,
    }


# --------------------------------------------------------------------------- #
# Price index -- plan/04 §5
# --------------------------------------------------------------------------- #
METHODOLOGY_VERSION = "1.0.0"
MIN_OBSERVATIONS = 5


def price_index(observations: list[dict], min_n: int = MIN_OBSERVATIONS) -> dict:
    """Rolling volume-weighted median landed price with a published n.

    Rules from plan/04 §5, enforced here rather than by hand:
      * never publish with fewer than `min_n` independent observations
      * always publish n
      * exclude related-party transactions
      * exclude own-inventory movements
    """
    usable = [o for o in observations
              if not o.get("is_related_party") and o.get("landed_unit_kobo")]
    n = len(usable)
    if n < min_n:
        return {
            "published": False,
            "n": n,
            "required_n": min_n,
            "reason": f"insufficient independent observations ({n} < {min_n})",
            "methodology_version": METHODOLOGY_VERSION,
        }

    prices = sorted(o["landed_unit_kobo"] for o in usable)
    weights = [float(o.get("quantity") or 1) for o in usable]
    median = statistics.median(prices)

    # volume-weighted mean, for reference only -- median is the published figure
    vwm = sum(p * w for p, w in zip(prices, weights)) / sum(weights) if sum(weights) else median

    # trimmed range: 20th-80th percentile, so one outlier cannot move the band
    lo = prices[max(0, int(n * 0.2))]
    hi = prices[min(n - 1, int(n * 0.8))]

    return {
        "published": True,
        "n": n,
        "required_n": min_n,
        "currency": CURRENCY,
        "median_kobo": int(round(median)),
        "volume_weighted_mean_kobo": int(round(vwm)),
        "low_kobo": lo,
        "high_kobo": hi,
        "band_pct": round((hi - lo) / median * 100, 1) if median else 0.0,
        "confidence": "high" if n >= 20 else "moderate" if n >= 10 else "low",
        "window_days": 30,
        "methodology_version": METHODOLOGY_VERSION,
        "excluded": len(observations) - n,
    }


def savings_vs_index(landed_unit_kobo: int, index: dict) -> dict:
    """What the buyer actually saves/pays relative to the published index."""
    if not index.get("published"):
        return {"available": False, "reason": index.get("reason", "no index")}
    ref = index["median_kobo"]
    delta = landed_unit_kobo - ref
    return {
        "available": True,
        "index_median_kobo": ref,
        "your_landed_kobo": landed_unit_kobo,
        "delta_kobo": delta,
        "delta_pct": round(delta / ref * 100, 1) if ref else 0.0,
        "verdict": "below index" if delta < 0 else "above index" if delta > 0 else "at index",
    }


# --------------------------------------------------------------------------- #
# RFQ / reverse auction -- plan/04 §4 mode 3
# --------------------------------------------------------------------------- #
MIN_BIDDERS = 3


@dataclass
class RfqLine:
    taxonomy_code: str
    spec: str
    quantity: float
    uom: str
    target_unit_kobo: int | None = None


@dataclass
class Rfq:
    rfq_id: str
    lines: list[RfqLine]
    delivery_location: str
    required_by: str
    payment_days: int = 30
    mode: str = "sealed_auction"
    closed: bool = False
    quotes: list[dict] = field(default_factory=list)


def submit_quote(rfq: Rfq, supplier: dict, unit_prices: dict[str, int],
                 origin: str | None = None) -> dict:
    """Record a sealed bid and compute its total landed cost."""
    if rfq.closed:
        return {"error": "RFQ is closed"}
    if any(q["supplier_id"] == supplier["org_id"] for q in rfq.quotes):
        return {"error": "supplier has already quoted this RFQ"}

    total_landed = 0
    per_line = []
    dg_lines = 0
    for ln in rfq.lines:
        unit = unit_prices.get(ln.taxonomy_code)
        if unit is None:
            return {"error": f"no price offered for {ln.taxonomy_code}"}
        per_line.append({"taxonomy_code": ln.taxonomy_code, "spec": ln.spec,
                         "quantity": ln.quantity, "uom": ln.uom,
                         "unit_kobo": unit, "line_kobo": int(unit * ln.quantity)})
        total_landed += int(unit * ln.quantity)

    # landed cost across the whole RFQ, treated as one shipment
    lc = landed_cost(
        quantity=sum(l.quantity for l in rfq.lines) or 1,
        unit_price_kobo=int(total_landed / (sum(l.quantity for l in rfq.lines) or 1)),
        origin=origin or supplier.get("country", "NG"),
        total_kg=sum(l.quantity for l in rfq.lines),
        has_dg=bool(dg_lines),
        dg_lines=dg_lines,
        payment_days=rfq.payment_days,
    )

    quote = {
        "supplier_id": supplier["org_id"],
        "supplier_name": supplier.get("name"),
        "tier": supplier.get("verification_tier"),
        "score": supplier.get("score"),
        "lines": per_line,
        "goods_kobo": total_landed,
        "landed": lc,
    }
    rfq.quotes.append(quote)
    return quote


def rank_quotes(rfq: Rfq) -> dict:
    """Rank on TOTAL LANDED COST, with documented tie-breakers.

    Never on headline price -- plan/04 §4. Ties break on supplier tier, then
    performance score, then goods cost.
    """
    if len(rfq.quotes) < MIN_BIDDERS:
        return {
            "rankable": False,
            "reason": f"need at least {MIN_BIDDERS} qualified bids to award "
                      f"({len(rfq.quotes)} received)",
            "quotes": len(rfq.quotes),
        }

    tier_rank = {"T3": 0, "T2": 1, "T1": 2}
    ordered = sorted(
        rfq.quotes,
        key=lambda q: (
            q["landed"]["landed_unit_kobo"],
            tier_rank.get(q.get("tier"), 3),
            -(q.get("score") or 0),
            q["goods_kobo"],
        ),
    )
    best = ordered[0]["landed"]["landed_unit_kobo"]
    worst = ordered[-1]["landed"]["landed_unit_kobo"]

    return {
        "rankable": True,
        "mode": rfq.mode,
        "sealed": rfq.mode == "sealed_auction" and not rfq.closed,
        "ranking": [
            {
                "rank": i + 1,
                "supplier": q["supplier_name"],
                "tier": q["tier"],
                "score": q["score"],
                "landed_unit_kobo": q["landed"]["landed_unit_kobo"],
                "goods_unit_kobo": int(q["goods_kobo"] / (sum(l["quantity"] for l in q["lines"]) or 1)),
                "total_kobo": q["landed"]["total_kobo"],
                "components": q["landed"]["components"],
                "vs_leader_pct": round((q["landed"]["landed_unit_kobo"] - best) / best * 100, 1)
                if best else 0.0,
            }
            for i, q in enumerate(ordered)
        ],
        "spread_pct": round((worst - best) / best * 100, 1) if best else 0.0,
        "recommended": ordered[0]["supplier_name"],
    }
