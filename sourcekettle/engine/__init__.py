"""SourceKettle reference implementation.

The modules here are a working reference for the rules described in
`plan/06-compliance-and-regulatory.md` and `plan/07-technical-implementation.md`.
They are pure Python with no external dependencies so they can run anywhere,
including directly against the generated taxonomy in `data/taxonomy.json`.
"""

from .models import Item, Order, Party, Shipment
from .rules import (
    Finding,
    dg_gate,
    evaluate_order,
    grade_gate,
    licence_gate,
    secondary_material_gate,
    storage_segregation,
)

__all__ = [
    "Item",
    "Order",
    "Party",
    "Shipment",
    "Finding",
    "dg_gate",
    "evaluate_order",
    "grade_gate",
    "licence_gate",
    "secondary_material_gate",
    "storage_segregation",
]
