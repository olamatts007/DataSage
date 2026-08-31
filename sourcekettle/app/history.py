"""Seed transaction history, consumption profiles and document records.

Realistic illustrative data so the price index, replenishment and scorecard
features have something to compute over. Deterministic, so results are stable
between runs.

In production these tables are populated by real fulfilled orders -- that is
the whole point of plan/04 §5: the transaction data IS the product.
"""

from __future__ import annotations

import random
from datetime import date, timedelta

TODAY = date(2026, 8, 31)

_rng = random.Random(20260831)


def _observations(product_id: str, taxonomy: str, base_unit_kobo: int,
                  n: int, drift: float = 0.0) -> list[dict]:
    """Synthesise n independent landed-price observations over 30 days."""
    out = []
    for i in range(n):
        d = TODAY - timedelta(days=_rng.randint(0, 29))
        # +/- 9% noise around a drifting base price
        px = int(base_unit_kobo * (1 + drift * (29 - (TODAY - d).days) / 29)
                 * _rng.uniform(0.91, 1.09))
        out.append({
            "product_id": product_id,
            "taxonomy_code": taxonomy,
            "region": "NG-Lagos",
            "landed_unit_kobo": px,
            "quantity": _rng.choice([250, 500, 1000, 1000, 1250, 2000]),
            "is_related_party": False,
            "observed_at": d.isoformat(),
        })
    return out


# Two deliberately related-party rows, to prove the index excludes them.
_RELATED = [
    {"product_id": "p-2001", "taxonomy_code": "S20", "region": "NG-Lagos",
     "landed_unit_kobo": 40_000, "quantity": 5000, "is_related_party": True,
     "observed_at": (TODAY - timedelta(days=3)).isoformat()},
]

OBSERVATIONS: dict[str, list[dict]] = {
    "S20": _observations("p-2001", "S20", 1_48_000, 24) + _RELATED,
    "S11.2": _observations("p-1001", "S11.2", 61_000, 18),
    "S12.2": _observations("p-1011", "S12.2", 1_02_000, 12),
    "S23": _observations("p-2004", "S23", 1_84_000, 7),
    "S14": _observations("p-1008", "S14", 2_68_000, 15),
    "S47": _observations("p-4005", "S47", 1_300, 21),
    "S45": _observations("p-4001", "S45", 6_900, 4),     # below threshold on purpose
}

# --------------------------------------------------------------------------- #
# Fulfilled order history -- drives supplier scorecards
# --------------------------------------------------------------------------- #
def _mk(supplier_id: str, product_id: str, segment: str, qty: float, price: float,
        on_time=True, coa=True, disputed=False, docs=True):
    return {"supplier_id": supplier_id, "product_id": product_id, "segment": segment,
            "items": [{"product_id": product_id, "segment": segment, "quantity": qty,
                       "price_kobo": int(price * 100)}],
            "delivered_on_time": on_time, "coa_conformant": coa,
            "disputed": disputed, "documents_complete": docs}


ORDER_HISTORY = [
    # s1 Coastal Chem Distributors -- strong performer
    *[_mk("s1", "p-2001", "S20", 1000, 1_29_000) for _ in range(14)],
    *[_mk("s1", "p-1001", "S11.2", 1000, 48_500) for _ in range(9)],
    _mk("s1", "p-2002", "S20", 1000, 1_08_500, on_time=False),
    _mk("s1", "p-1008", "S14", 1000, 2_45_000, coa=False, docs=False),

    # s2 Lagos Industrial Supply -- good but slipping on documents
    *[_mk("s2", "p-1002", "S11.2", 1250, 34_000) for _ in range(11)],
    *[_mk("s2", "p-1005", "S11.3", 1250, 8_800) for _ in range(6)],
    _mk("s2", "p-4001", "S45", 50, 6_200, docs=False),
    _mk("s2", "p-4002", "S45", 10, 31_000, docs=False),
    _mk("s2", "p-1003", "S11.1", 1250, 16_500, on_time=False, disputed=True),

    # s3 Meridian Chemical Traders -- T2, higher dispute rate
    *[_mk("s3", "p-1012", "S12.2", 200, 1_12_000) for _ in range(5)],
    _mk("s3", "p-2009", "S26", 500, 1_18_000, coa=False, disputed=True),
    _mk("s3", "p-6002", "S66", 1000, 1_78_000, disputed=True),
    _mk("s3", "p-1008", "S14", 1000, 2_45_000, on_time=False),

    # s4 Harmattan Lab & MRO -- best performer
    *[_mk("s4", "p-4005", "S47", 50, 1_100) for _ in range(18)],
    *[_mk("s4", "p-4003", "S46", 100, 1_400) for _ in range(12)],
    _mk("s4", "p-2005", "S23", 25, 78_000),

    # s5 Niger Process Equipment -- capex, few large orders
    _mk("s5", "p-3001", "S34", 1, 4_850_000),
    _mk("s5", "p-3002", "S37", 2, 1_85_000, on_time=False),
]

# --------------------------------------------------------------------------- #
# Consumption profiles -- drives replenishment
# --------------------------------------------------------------------------- #
CONSUMPTION = {
    "p-4005": {"daily_qty": 6,   "on_hand": 38,    "safety_days": 14},   # filter bags -- will trigger
    "p-4003": {"daily_qty": 12,  "on_hand": 640,   "safety_days": 14},   # gloves -- ok
    "p-2001": {"daily_qty": 180, "on_hand": 2_400, "safety_days": 10},   # LABSA -- will trigger
    "p-2002": {"daily_qty": 150, "on_hand": 4_100, "safety_days": 10},   # SLES -- ok
    "p-1002": {"daily_qty": 90,  "on_hand": 700,   "safety_days": 10},   # caustic lye -- will trigger
    "p-4001": {"daily_qty": 3,   "on_hand": 95,    "safety_days": 14},   # drums -- ok
    "p-1005": {"daily_qty": 70,  "on_hand": 520,   "safety_days": 7},    # hypochlorite -- ok
    "p-2010": {"daily_qty": 4,   "on_hand": 22,    "safety_days": 14},   # hydraulic oil -- will trigger
}

# --------------------------------------------------------------------------- #
# Document vault -- drives expiry alerts
# --------------------------------------------------------------------------- #
DOCUMENTS = [
    # current, healthy
    {"product_id": "p-2001", "doc_type": "SDS", "revision": "4.1", "is_current": True,
     "expires_at": (TODAY + timedelta(days=410)).isoformat()},
    {"product_id": "p-2002", "doc_type": "SDS", "revision": "3.0", "is_current": True,
     "expires_at": (TODAY + timedelta(days=280)).isoformat()},
    # expiring inside the 45-day window
    {"product_id": "p-1001", "doc_type": "SDS", "revision": "2.2", "is_current": True,
     "expires_at": (TODAY + timedelta(days=18)).isoformat()},
    {"product_id": "p-1011", "doc_type": "SDS", "revision": "1.9", "is_current": True,
     "expires_at": (TODAY + timedelta(days=39)).isoformat()},
    # already expired -- must block shipment
    {"product_id": "p-1003", "doc_type": "SDS", "revision": "2.0", "is_current": True,
     "expires_at": (TODAY - timedelta(days=22)).isoformat()},
    {"product_id": "p-3001", "doc_type": "CE_DECL", "revision": "1.0", "is_current": True,
     "expires_at": (TODAY - timedelta(days=5)).isoformat()},
    # superseded revisions retained immutably -- plan/06 §1
    {"product_id": "p-2001", "doc_type": "SDS", "revision": "3.0", "is_current": False,
     "expires_at": (TODAY - timedelta(days=200)).isoformat()},
    {"product_id": "p-2001", "doc_type": "SDS", "revision": "2.1", "is_current": False,
     "expires_at": (TODAY - timedelta(days=600)).isoformat()},
    {"product_id": "p-1001", "doc_type": "SDS", "revision": "1.4", "is_current": False,
     "expires_at": (TODAY - timedelta(days=500)).isoformat()},
    # no expiry (CoAs are per-batch, not dated documents in this model)
    {"product_id": "p-4005", "doc_type": "TDS", "revision": "1.0", "is_current": True,
     "expires_at": None},
]
