#!/usr/bin/env python3
"""SourceKettle compliance engine - worked demo.

Shows the rules engine judging three realistic orders:
  1. a clean detergent-plant order          -> passes
  2. a mixed acid + hypochlorite drop       -> blocked (chlorine gas risk)
  3. technical-grade material into a food use -> blocked (grade gate)

Run:
    python3 sourcekettle/engine/demo.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from engine.models import Item, Order, Party, Shipment          # noqa: E402
from engine.rules import blocks_order, evaluate_order           # noqa: E402

SYMBOL = {"pass": "  ok  ", "warn": " WARN ", "block": "BLOCK "}


def report(order: Order, note: str) -> bool:
    print("=" * 78)
    print(f"ORDER {order.order_id} — {note}")
    print(f"  buyer={order.buyer.name} ({order.buyer.verification_tier})  "
          f"supplier={order.supplier.name} ({order.supplier.verification_tier})")
    for i in order.items:
        print(f"    - {i.name:<32} seg={i.segment:<6} grade={i.grade or '-':<10} "
              f"storage={i.storage_class or '-':<5} un={i.un_number or '-'}")
    print("-" * 78)
    findings = evaluate_order(order)
    for f in findings:
        if f.outcome != "pass" or f.rule_code in ("STORAGE_SEGREGATION", "DG_GATE"):
            extra = ""
            if f.rule_code == "STORAGE_SEGREGATION" and f.detail.get("conflicts"):
                extra = f"  conflicts={f.detail['conflicts']}"
            if f.rule_code == "DG_GATE" and f.detail.get("missing"):
                extra = f"  missing={f.detail['missing']}"
            if f.rule_code == "GRADE_GATE" and f.outcome == "block":
                extra = f"  grade={f.detail['grade']} needs one of {f.detail['requires_grade_in'][:3]}..."
            print(f"  [{SYMBOL[f.outcome]}] {f.rule_code}{extra}")
    blocked = blocks_order(findings)
    print(f"  => {'BLOCKED — cannot be placed' if blocked else 'CLEARED — may proceed'}"
          f"  ({len(findings)} checks run, {sum(1 for f in findings if f.blocks)} blocking)")
    print()
    return blocked


def main() -> int:
    buyer = Party("b1", "BrightWash Industries", "T3")
    supplier = Party("s1", "Coastal Chem Distributors", "T3")

    # --- 1. A clean, ordinary order. Should pass. --------------------------
    clean = Order(
        "ORD-1001", buyer, supplier,
        items=[
            Item("p1", "LABSA 90%", "S20", "S2", grade="technical", storage_class="SC-8"),
            Item("p2", "SLES 70%", "S20", "S2", grade="technical", storage_class="SC-8"),
            Item("p3", "Caustic soda lye 47%", "S11.2", "S1", grade="technical",
                 storage_class="SC-2", un_number="1824"),
            Item("p4", "Nitrile gloves (box/100)", "S46", "S4", storage_class="SC-8"),
            Item("p5", "Filter bag 25 micron", "S47", "S4", storage_class="SC-8"),
        ],
        shipment=Shipment("SHP-1001", is_dg=True, dg_declared=True,
                          dg_decl_document_id="DOC-9f21", un_numbers=["1824"],
                          carrier_dg_authorised=True),
    )

    # --- 2. Acid + hypochlorite on one truck. Must block. ------------------
    mixed = Order(
        "ORD-1002", buyer, supplier,
        items=[
            Item("p6", "Hydrochloric acid 33%", "S11.1", "S1", grade="technical",
                 storage_class="SC-1", un_number="1789"),
            Item("p7", "Sodium hypochlorite 12.5%", "S11.3", "S1", grade="technical",
                 storage_class="SC-4", un_number="1791"),
        ],
        shipment=Shipment("SHP-1002", is_dg=True, dg_declared=True,
                          dg_decl_document_id="DOC-7ab3", un_numbers=["1789", "1791"],
                          carrier_dg_authorised=True),
    )

    # --- 3. Technical grade into a food-grade end use. Must block. --------
    food = Order(
        "ORD-1003", buyer, supplier,
        items=[
            Item("p8", "Citric acid (technical)", "S26", "S2", grade="technical"),
        ],
        shipment=Shipment("SHP-1003", is_dg=False),
    )

    r1 = report(clean, "detergent line: chemicals + PPE + filtration, compliant DG drop")
    r2 = report(mixed, "acid and hypochlorite on the same vehicle")
    r3 = report(food, "technical-grade material offered into a food-grade segment")

    print("=" * 78)
    expected = (False, True, True)
    actual = (r1, r2, r3)
    if actual == expected:
        print("DEMO OK — order 1 cleared, orders 2 and 3 blocked as designed.")
        return 0
    print(f"DEMO MISMATCH — expected blocked={expected}, got {actual}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
