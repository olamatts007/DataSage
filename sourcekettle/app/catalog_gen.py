"""Deterministic catalogue generator.

Expands the substance library across suppliers, grades and pack sizes to reach
a target SKU count -- mirroring how a real distributor's catalogue is built:
one substance, many sellable SKUs.

Deterministic by construction (no RNG without a fixed seed) so a rebuild always
produces the same catalogue and the tests stay stable.
"""

from __future__ import annotations

import random
from typing import Callable

from substances import SUBSTANCES

# Suppliers that carry chemicals (S1/S2/S6). Equipment (s5-s7) is excluded --
# this generator makes chemicals, not machinery.
CHEM_SUPPLIERS = [
    ("s1", "Coastal Chem Distributors", "T3", "NG", 4.7, 1.000),
    ("s2", "Lagos Industrial Supply", "T3", "NG", 4.5, 0.965),
    ("s3", "Meridian Chemical Traders", "T2", "AE", 4.1, 1.042),
    ("s4", "Harmattan Lab & MRO", "T3", "NG", 4.8, 1.018),
    ("s8", "Sahel Safety & Packaging", "T3", "NG", 4.6, 0.978),
    ("s9", "Guinea Gulf MRO", "T2", "NG", 3.9, 1.030),
]

# Origin pool per supplier, so duty and freight vary realistically
ORIGIN_POOL = {
    "s1": ["NG", "IN", "EG"], "s2": ["NG", "AE"], "s3": ["AE", "CN", "TR"],
    "s4": ["NG", "DE", "AE"], "s8": ["NG", "CN"], "s9": ["NG", "IN"],
}

GRADE_MULTIPLIER = {
    "technical": 1.00, "industrial": 1.02, "AR": 1.85, "HPLC": 2.40,
    "LR": 1.70, "food": 1.18, "pharma": 1.65, "cosmetic": 1.22,
}

PACK_TEMPLATES = {
    "kg":  [("25 kg bag", 25, None, 40), ("1000 kg jumbo", 1000, None, None)],
    "l":   [("200 L drum", 168, "1H1/Y1.8/150", None), ("1000 L IBC", 1000, "31HA1/Y/100", None)],
    "unit": [("1 unit", 1, None, None)],
}
# DG-classed liquids/solids need UN-rated packaging; non-DG does not
PACK_TEMPLATES_NONDG = {
    "kg":  [("25 kg bag", 25, None, 40), ("1000 kg jumbo", 1000, None, None)],
    "l":   [("200 L drum", 168, None, None), ("1000 L IBC", 1000, None, None)],
    "unit": [("1 unit", 1, None, None)],
}


def _packs(uom: str, is_dg: bool) -> list[dict]:
    src = PACK_TEMPLATES if is_dg else PACK_TEMPLATES_NONDG
    out = []
    for unit, net, un_rated, per_pallet in src.get(uom, src["kg"]):
        p = {"unit": unit, "net_weight_kg": net}
        if un_rated:
            p["un_rated"] = un_rated
        if per_pallet:
            p["units_per_pallet"] = per_pallet
        out.append(p)
    return out


def generate(target: int,
             exclude_ids: set[str] | None = None,
             used_skus: set[str] | None = None,
             start_index: int = 1) -> list[dict]:
    """Produce up to `target` generated chemical SKUs.

    Distribution is round-robin over substances so the catalogue stays balanced
    across segments rather than front-loading the first few.
    """
    exclude_ids = exclude_ids or set()
    used_skus = set(used_skus or set())
    rng = random.Random(20260831)

    # Pre-expand every substance into candidate SKUs
    candidates: list[dict] = []
    for (code, name, segment, cas, form, purity, un, dg, pg, ghs,
         flash, storage, price_base, uom, grades) in SUBSTANCES:

        is_dg = dg not in (None, "non-DG")
        lead_base = 18 if is_dg else 12

        for s_i, (sid, sname, stier, scountry, sscore, sfactor) in enumerate(CHEM_SUPPLIERS):
            origin = ORIGIN_POOL[sid][s_i % len(ORIGIN_POOL[sid])]
            for g_i, grade in enumerate(grades):
                gmult = GRADE_MULTIPLIER.get(grade, 1.0)
                jitter = rng.uniform(0.94, 1.08)
                price = int(round(price_base * sfactor * gmult * jitter / 100) * 100)

                sku = f"{code}-{grade[:2].upper()}-{sid.upper()}{g_i}"
                if sku in used_skus:
                    continue
                used_skus.add(sku)

                pack = _packs(uom, is_dg)[g_i % 2]
                moq = pack["net_weight_kg"] if pack["net_weight_kg"] >= 25 else 25

                candidates.append({
                    "id": None,                     # assigned after sorting
                    "sku": sku,
                    "name": f"{name} — {grade} grade",
                    "segment": segment,
                    "cas": cas,
                    "grade": grade,
                    "form": form,
                    "purity": purity,
                    "un": un,
                    "dg": dg,
                    "pg": pg,
                    "ghs": list(ghs),
                    "flash": flash,
                    "storage": storage,
                    "price": price / 100,           # stored as currency units
                    "uom": uom,
                    "moq": moq,
                    "lead": lead_base + (s_i + g_i) % 9,
                    "origin": origin,
                    "packs": [pack],
                    "supplier": sid,
                    "docs": (["SDS", "CoA", "TDS"] if is_dg else ["SDS", "CoA"])
                            + (["GRADE_CERT"] if grade in ("food", "pharma", "cosmetic") else []),
                    "generated": True,
                })

    # Interleave by substance code so segment coverage is even, not clustered
    by_code: dict[str, list[dict]] = {}
    for c in candidates:
        by_code.setdefault(c["sku"].split("-")[0], []).append(c)

    ordered: list[dict] = []
    buckets = list(by_code.values())
    while any(buckets):
        for b in buckets:
            if b:
                ordered.append(b.pop(0))
        buckets = [b for b in buckets if b]

    taken = [c for c in ordered if c["id"] not in exclude_ids][:target]
    for i, c in enumerate(taken):
        c["id"] = f"p-G{start_index + i:04d}"
    return taken


def segment_counts(products: list[dict]) -> dict[str, int]:
    out: dict[str, int] = {}
    for p in products:
        out[p["segment"]] = out.get(p["segment"], 0) + 1
    return dict(sorted(out.items()))
