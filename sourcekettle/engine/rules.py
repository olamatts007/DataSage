"""SourceKettle compliance rules engine (reference implementation).

Design rules:
  * Pure functions. No I/O, no database, no framework. Every rule is testable.
  * Every rule returns a Finding, and every Finding is persisted by the caller
    into `compliance_checks`. That table is the audit defence.
  * A "block" outcome has NO override. If the business genuinely needs an
    escape hatch, it must be a *new rule with its own code and its own audit
    reason* -- never a bypass flag on an existing gate.

The gated segment sets below are loaded from the generated taxonomy rather than
hard-coded, so the rules cannot drift from the catalogue definition.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from .models import Item, Order, Outcome, Party, Shipment

__all__ = [
    "Finding",
    "INCOMPATIBLE_STORAGE_PAIRS",
    "QUALIFYING_GRADES",
    "GRADE_GATED",
    "LICENCE_GATED",
    "blocks_order",
    "dg_gate",
    "evaluate_order",
    "gated_segments",
    "grade_gate",
    "licence_gate",
    "pillar_of",
    "secondary_material_gate",
    "storage_segregation",
    "un_number_format",
]

TAXONOMY_PATH = Path(__file__).resolve().parent.parent / "data" / "taxonomy.json"

# Storage-class pairs that must never share a single drop.
# Derived from plan/06-compliance-and-regulatory.md §3.
INCOMPATIBLE_STORAGE_PAIRS: set[frozenset[str]] = {
    frozenset({"SC-1", "SC-2"}),  # acid + alkali -> violent neutralisation
    frozenset({"SC-1", "SC-4"}),  # acid + oxidiser (hypochlorite) -> chlorine gas, lethal
    frozenset({"SC-3", "SC-4"}),  # flammable + oxidiser -> fire intensification
    frozenset({"SC-5", "SC-3"}),  # compressed gas + flammable liquid store
}

# Grades that satisfy a grade-gated end use. Everything else is industrial/technical.
QUALIFYING_GRADES = {
    "USP", "BP", "EP", "food", "pharma", "cosmetic",
}


@dataclass(frozen=True)
class Finding:
    """One rule outcome. Persist every one of these."""

    rule_code: str
    outcome: Outcome
    detail: dict[str, Any]

    @property
    def blocks(self) -> bool:
        return self.outcome == "block"


# --------------------------------------------------------------------------- #
# Taxonomy-driven configuration
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def _taxonomy() -> dict[str, Any]:
    with TAXONOMY_PATH.open(encoding="utf-8") as fh:
        return json.load(fh)


@lru_cache(maxsize=1)
def gated_segments(flag: str) -> frozenset[str]:
    """Segment codes carrying a given gate, read straight from the taxonomy."""
    nodes = _taxonomy()["taxonomies"]["A_category_tree"]
    return frozenset(n["code"] for n in nodes if n.get(flag))


def pillar_of(code: str) -> str:
    nodes = {n["code"]: n for n in _taxonomy()["taxonomies"]["A_category_tree"]}
    cur = nodes[code]
    while cur.get("parent"):
        cur = nodes[cur["parent"]]
    return cur["code"]


GRADE_GATED = gated_segments("grade_gated")            # -> {'S26','S30','S32'}
LICENCE_GATED = gated_segments("licence_gated")        # -> {'S30','S32','S56','S60','S61'}
SECONDARY_PILLAR = "S6"


# --------------------------------------------------------------------------- #
# Rules
# --------------------------------------------------------------------------- #
def grade_gate(item: Item) -> Finding:
    """A non-certified grade must never flow into a grade-gated end use.

    Example: technical-grade caustic must not be sold into an S26 (food/PC)
    formulation. Blocking, no override.
    """
    if item.segment in GRADE_GATED and item.grade not in QUALIFYING_GRADES:
        return Finding(
            "GRADE_GATE",
            "block",
            {
                "product_id": item.product_id,
                "segment": item.segment,
                "grade": item.grade,
                "requires_grade_in": sorted(QUALIFYING_GRADES),
                "reason": "grade-gated end use requires a certified grade",
            },
        )
    return Finding("GRADE_GATE", "pass", {"product_id": item.product_id})


def licence_gate(item: Item, buyer: Party, supplier: Party) -> Finding:
    """Licence-gated segments require a valid licence on BOTH sides."""
    if item.segment not in LICENCE_GATED:
        return Finding("LICENCE_GATE", "pass", {"product_id": item.product_id})

    missing = [
        role
        for role, party in (("buyer", buyer), ("supplier", supplier))
        if not party.licence_ok(item.segment)
    ]
    if missing:
        return Finding(
            "LICENCE_GATE",
            "block",
            {
                "product_id": item.product_id,
                "segment": item.segment,
                "missing_licence_for": missing,
            },
        )
    return Finding("LICENCE_GATE", "pass", {"product_id": item.product_id})


def secondary_material_gate(item: Item) -> Finding:
    """S6 items must disclose their deviation and stay out of gated end uses."""
    if pillar_of(item.segment) != SECONDARY_PILLAR:
        return Finding("SECONDARY_MATERIAL_GATE", "pass", {"product_id": item.product_id})

    if not item.deviation_disclosure:
        return Finding(
            "SECONDARY_MATERIAL_GATE",
            "block",
            {
                "product_id": item.product_id,
                "segment": item.segment,
                "reason": "secondary material requires a deviation_disclosure",
            },
        )
    return Finding(
        "SECONDARY_MATERIAL_GATE",
        "warn",
        {
            "product_id": item.segment and item.product_id,
            "segment": item.segment,
            "disclosure": item.deviation_disclosure,
            "note": "disclosure must be shown to the buyer before confirmation",
        },
    )


def storage_segregation(items: list[Item]) -> Finding:
    """Block a single drop that mixes incompatible storage classes."""
    classes = {i.storage_class for i in items if i.storage_class}
    conflicts = sorted(
        tuple(sorted(pair))
        for pair in INCOMPATIBLE_STORAGE_PAIRS
        if pair <= classes
    )
    if conflicts:
        return Finding(
            "STORAGE_SEGREGATION",
            "block",
            {
                "conflicts": [list(c) for c in conflicts],
                "classes_present": sorted(classes),
                "action": "split across vehicles, or obtain a written EHS approval as a new rule",
            },
        )
    return Finding(
        "STORAGE_SEGREGATION",
        "pass",
        {"classes_present": sorted(classes)},
    )


def dg_gate(shipment: Shipment) -> Finding:
    """No dangerous-goods shipment leaves undeclared or on an unauthorised carrier.

    This is the rule whose failure is a criminal liability, so it checks three
    things independently and reports exactly which are missing.
    """
    if not shipment.is_dg:
        return Finding("DG_GATE", "pass", {"shipment_id": shipment.shipment_id, "is_dg": False})

    missing = [
        name
        for name, ok in (
            ("dg_declaration", shipment.dg_declared),
            ("dg_declaration_document", bool(shipment.dg_decl_document_id)),
            ("dg_authorised_carrier", shipment.carrier_dg_authorised),
            ("un_numbers", bool(shipment.un_numbers)),
        )
        if not ok
    ]
    if missing:
        return Finding(
            "DG_GATE",
            "block",
            {
                "shipment_id": shipment.shipment_id,
                "missing": missing,
                "un_numbers": shipment.un_numbers,
            },
        )
    return Finding("DG_GATE", "pass", {"shipment_id": shipment.shipment_id,
                                       "un_numbers": shipment.un_numbers})


def un_number_format(item: Item) -> Finding:
    """UN numbers are 4 digits, never free-typed prose. A cheap structural guard."""
    if not item.un_number:
        return Finding("UN_NUMBER_FORMAT", "pass", {"product_id": item.product_id})
    ok = len(item.un_number) == 4 and item.un_number.isdigit()
    return Finding(
        "UN_NUMBER_FORMAT",
        "pass" if ok else "block",
        {"product_id": item.product_id, "un_number": item.un_number,
         "reason": None if ok else "UN number must be exactly 4 digits"},
    )


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #
def evaluate_order(order: Order) -> list[Finding]:
    """Run every applicable rule across an order. Returns all findings.

    Note this evaluates *everything* rather than short-circuiting: the buyer and
    the auditor both need the full picture, not just the first failure.
    """
    findings: list[Finding] = []

    for item in order.items:
        findings.append(grade_gate(item))
        findings.append(licence_gate(item, order.buyer, order.supplier))
        findings.append(secondary_material_gate(item))
        findings.append(un_number_format(item))

    findings.append(storage_segregation(order.items))

    if order.shipment is not None:
        findings.append(dg_gate(order.shipment))

    return findings


def blocks_order(findings: list[Finding]) -> bool:
    return any(f.blocks for f in findings)
