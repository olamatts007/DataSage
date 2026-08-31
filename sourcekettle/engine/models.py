"""Value objects used by the SourceKettle rules engine.

These mirror the columns in `plan/07-technical-implementation.md` §3. They are
deliberately plain dataclasses: the point is that the *rules* are testable in
isolation, with no database and no framework.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

Outcome = Literal["pass", "warn", "block"]


@dataclass
class Party:
    """A buyer or supplier organisation."""

    org_id: str
    name: str
    verification_tier: Literal["T1", "T2", "T3"] = "T1"
    #: segment code -> True when a valid licence is on file
    licences: dict[str, bool] = field(default_factory=dict)

    def licence_ok(self, segment_code: str) -> bool:
        return bool(self.licences.get(segment_code, False))


@dataclass
class Item:
    """A line in a basket / order."""

    product_id: str
    name: str
    segment: str                 # e.g. "S11.2"
    segment_pillar: str          # e.g. "S1" - resolved from the taxonomy
    grade: str | None = None
    physical_form: str | None = None
    un_number: str | None = None
    dg_class: str = "non-DG"
    storage_class: str | None = None   # SC-1 .. SC-8
    deviation_disclosure: str | None = None
    quantity: float = 1.0
    uom: str = "kg"


@dataclass
class Shipment:
    """A physical drop. The DG gate attaches here, not to the order."""

    shipment_id: str
    is_dg: bool = False
    dg_declared: bool = False
    dg_decl_document_id: str | None = None
    un_numbers: list[str] = field(default_factory=list)
    carrier_dg_authorised: bool = False
    items: list[Item] = field(default_factory=list)


@dataclass
class Order:
    order_id: str
    buyer: Party
    supplier: Party
    items: list[Item]
    shipment: Shipment | None = None
