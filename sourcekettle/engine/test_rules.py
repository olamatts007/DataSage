"""Tests for the SourceKettle compliance rules engine.

These are the behaviours that, if wrong, cost the company: a technical-grade
chemical reaching a food formulation, an undeclared dangerous-goods drop, an
acid shipped in the same vehicle as hypochlorite.

Run:
    python3 -m unittest discover -s sourcekettle/engine -p 'test_*.py' -v
"""

from __future__ import annotations

import unittest

from .models import Item, Order, Party, Shipment
from .rules import (
    GRADE_GATED,
    LICENCE_GATED,
    blocks_order,
    dg_gate,
    evaluate_order,
    grade_gate,
    licence_gate,
    pillar_of,
    secondary_material_gate,
    storage_segregation,
    un_number_format,
)


def _party(name: str, tier: str = "T3", **licences: bool) -> Party:
    return Party(org_id=name.lower(), name=name, verification_tier=tier, licences=licences)


class TestTaxonomyLoading(unittest.TestCase):
    """The gates must be driven by the generated taxonomy, not hard-coded."""

    def test_grade_gated_segments_match_the_plan(self):
        # S30 (agrochemicals) is deliberately excluded: pesticides are
        # technical-grade by nature, so a grade gate would make the segment
        # unsellable. S30 is protected by the licence gate instead.
        self.assertEqual(GRADE_GATED, frozenset({"S26", "S32"}))

    def test_agrochemicals_are_not_grade_gated(self):
        """Regression: a grade gate on S30 blocked every pesticide sale."""
        self.assertNotIn("S30", GRADE_GATED)
        item = Item("p1", "Glyphosate 41% SL", segment="S30", segment_pillar="S2", grade="technical")
        self.assertEqual(grade_gate(item).outcome, "pass")

    def test_agrochemicals_still_require_a_licence(self):
        """...but they must not become ungated as a result."""
        self.assertIn("S30", LICENCE_GATED)
        item = Item("p1", "Glyphosate 41% SL", segment="S30", segment_pillar="S2", grade="technical")
        self.assertEqual(licence_gate(item, _party("B"), _party("S")).outcome, "block")

    def test_licence_gated_segments_match_the_plan(self):
        self.assertEqual(LICENCE_GATED, frozenset({"S30", "S32", "S56", "S60", "S61"}))

    def test_pillar_resolution(self):
        self.assertEqual(pillar_of("S11.2"), "S1")   # alkali -> bulk chemicals
        self.assertEqual(pillar_of("S43"), "S3")     # line machinery -> equipment
        self.assertEqual(pillar_of("S67"), "S6")     # recovered solvent -> secondary
        self.assertEqual(pillar_of("S1"), "S1")      # a pillar resolves to itself


class TestGradeGate(unittest.TestCase):
    def test_technical_grade_into_food_segment_is_blocked(self):
        item = Item("p1", "Citric acid", segment="S26", segment_pillar="S2", grade="technical")
        f = grade_gate(item)
        self.assertEqual(f.outcome, "block")
        self.assertEqual(f.rule_code, "GRADE_GATE")
        self.assertEqual(f.detail["grade"], "technical")

    def test_food_grade_into_food_segment_passes(self):
        item = Item("p2", "Citric acid", segment="S26", segment_pillar="S2", grade="food")
        self.assertEqual(grade_gate(item).outcome, "pass")

    def test_technical_grade_into_normal_segment_passes(self):
        """Caustic soda for water treatment is a completely ordinary sale."""
        item = Item("p3", "Caustic soda flakes", segment="S23", segment_pillar="S2", grade="technical")
        self.assertEqual(grade_gate(item).outcome, "pass")

    def test_missing_grade_on_gated_segment_is_blocked(self):
        """An unknown grade must fail closed, not pass."""
        item = Item("p4", "API", segment="S32", segment_pillar="S2", grade=None)
        self.assertEqual(grade_gate(item).outcome, "block")


class TestLicenceGate(unittest.TestCase):
    def test_ungated_segment_needs_no_licence(self):
        item = Item("p1", "PAC", segment="S23", segment_pillar="S2")
        self.assertEqual(licence_gate(item, _party("Buyer"), _party("Sup")).outcome, "pass")

    def test_agrochemical_requires_licence_on_both_sides(self):
        item = Item("p2", "Glyphosate", segment="S30", segment_pillar="S2")
        f = licence_gate(item, _party("Buyer"), _party("Sup"))
        self.assertEqual(f.outcome, "block")
        self.assertEqual(sorted(f.detail["missing_licence_for"]), ["buyer", "supplier"])

    def test_agrochemical_with_one_sided_licence_still_blocked(self):
        item = Item("p3", "Glyphosate", segment="S30", segment_pillar="S2")
        buyer = _party("Buyer", **{"S30": True})
        f = licence_gate(item, buyer, _party("Sup"))
        self.assertEqual(f.outcome, "block")
        self.assertEqual(f.detail["missing_licence_for"], ["supplier"])

    def test_agrochemical_fully_licensed_passes(self):
        item = Item("p4", "Glyphosate", segment="S30", segment_pillar="S2")
        buyer = _party("Buyer", **{"S30": True})
        sup = _party("Sup", **{"S30": True})
        self.assertEqual(licence_gate(item, buyer, sup).outcome, "pass")


class TestSecondaryMaterialGate(unittest.TestCase):
    def test_non_secondary_is_untouched(self):
        item = Item("p1", "IPA", segment="S12.2", segment_pillar="S1")
        self.assertEqual(secondary_material_gate(item).outcome, "pass")

    def test_offspec_without_disclosure_is_blocked(self):
        item = Item("p2", "Off-spec TiO2", segment="S66", segment_pillar="S6",
                    deviation_disclosure=None)
        self.assertEqual(secondary_material_gate(item).outcome, "block")

    def test_offspec_with_disclosure_warns_but_does_not_block(self):
        item = Item("p3", "Off-spec TiO2", segment="S66", segment_pillar="S6",
                    deviation_disclosure="Brightness 94% vs 96% spec")
        self.assertEqual(secondary_material_gate(item).outcome, "warn")


class TestStorageSegregation(unittest.TestCase):
    def test_acid_with_hypochlorite_is_blocked(self):
        """SC-1 + SC-4 generates chlorine gas. This is the lethal case."""
        items = [
            Item("p1", "Hydrochloric acid", "S11.1", "S1", storage_class="SC-1"),
            Item("p2", "Sodium hypochlorite", "S11.3", "S1", storage_class="SC-4"),
        ]
        f = storage_segregation(items)
        self.assertEqual(f.outcome, "block")
        self.assertIn(["SC-1", "SC-4"], f.detail["conflicts"])

    def test_acid_with_alkali_is_blocked(self):
        items = [
            Item("p1", "Sulphuric acid", "S11.1", "S1", storage_class="SC-1"),
            Item("p2", "Caustic soda", "S11.2", "S1", storage_class="SC-2"),
        ]
        self.assertEqual(storage_segregation(items).outcome, "block")

    def test_flammable_with_oxidiser_is_blocked(self):
        items = [
            Item("p1", "Methanol", "S12.2", "S1", storage_class="SC-3"),
            Item("p2", "Peroxide", "S11.3", "S1", storage_class="SC-4"),
        ]
        self.assertEqual(storage_segregation(items).outcome, "block")

    def test_compatible_basket_passes(self):
        items = [
            Item("p1", "Caustic soda", "S11.2", "S1", storage_class="SC-2"),
            Item("p2", "Sodium sulphate", "S11.3", "S1", storage_class="SC-8"),
            Item("p3", "HDPE resin", "S13.1", "S1", storage_class="SC-8"),
        ]
        f = storage_segregation(items)
        self.assertEqual(f.outcome, "pass")
        self.assertEqual(f.detail["classes_present"], ["SC-2", "SC-8"])

    def test_multiple_conflicts_are_all_reported(self):
        """Never short-circuit: the EHS lead needs the whole picture."""
        items = [
            Item("p1", "HCl", "S11.1", "S1", storage_class="SC-1"),
            Item("p2", "Caustic", "S11.2", "S1", storage_class="SC-2"),
            Item("p3", "Hypochlorite", "S11.3", "S1", storage_class="SC-4"),
        ]
        f = storage_segregation(items)
        self.assertEqual(f.outcome, "block")
        self.assertEqual(len(f.detail["conflicts"]), 2)


class TestDgGate(unittest.TestCase):
    def test_non_dg_shipment_passes(self):
        s = Shipment("s1", is_dg=False)
        self.assertEqual(dg_gate(s).outcome, "pass")

    def test_dg_without_anything_is_blocked_and_lists_every_gap(self):
        s = Shipment("s2", is_dg=True)
        f = dg_gate(s)
        self.assertEqual(f.outcome, "block")
        self.assertEqual(
            sorted(f.detail["missing"]),
            ["dg_authorised_carrier", "dg_declaration", "dg_declaration_document", "un_numbers"],
        )

    def test_declared_dg_on_unauthorised_carrier_is_blocked(self):
        s = Shipment("s3", is_dg=True, dg_declared=True, dg_decl_document_id="doc-1",
                     un_numbers=["1789"], carrier_dg_authorised=False)
        f = dg_gate(s)
        self.assertEqual(f.outcome, "block")
        self.assertEqual(f.detail["missing"], ["dg_authorised_carrier"])

    def test_fully_compliant_dg_shipment_passes(self):
        s = Shipment("s4", is_dg=True, dg_declared=True, dg_decl_document_id="doc-1",
                     un_numbers=["1789"], carrier_dg_authorised=True)
        self.assertEqual(dg_gate(s).outcome, "pass")


class TestUnNumberFormat(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(un_number_format(Item("p", "x", "S11.1", "S1", un_number="1789")).outcome, "pass")

    def test_prose_is_rejected(self):
        f = un_number_format(Item("p", "x", "S11.1", "S1", un_number="UN 1789 corrosive"))
        self.assertEqual(f.outcome, "block")

    def test_short_number_is_rejected(self):
        self.assertEqual(un_number_format(Item("p", "x", "S11.1", "S1", un_number="178")).outcome, "block")

    def test_absent_is_allowed_for_non_dg(self):
        self.assertEqual(un_number_format(Item("p", "x", "S13.1", "S1", un_number=None)).outcome, "pass")


class TestEvaluateOrder(unittest.TestCase):
    """End-to-end: a realistic basket must be evaluated as a whole."""

    def test_a_clean_detergent_order_passes_entirely(self):
        buyer = _party("BrightWash")
        supplier = _party("ChemDist")
        order = Order(
            "o1", buyer, supplier,
            items=[
                Item("p1", "LABSA 90%", "S20", "S2", grade="technical", storage_class="SC-8"),
                Item("p2", "SLES 70%", "S20", "S2", grade="technical", storage_class="SC-8"),
                Item("p3", "Caustic soda lye", "S11.2", "S1", grade="technical",
                     storage_class="SC-2", un_number="1824"),
                Item("p4", "Nitrile gloves", "S46", "S4", storage_class="SC-8"),
            ],
            shipment=Shipment("s1", is_dg=True, dg_declared=True, dg_decl_document_id="d1",
                              un_numbers=["1824"], carrier_dg_authorised=True),
        )
        findings = evaluate_order(order)
        self.assertFalse(blocks_order(findings), [f for f in findings if f.blocks])
        self.assertEqual(len(findings), 4 * 4 + 1 + 1)  # 4 rules/line + segregation + DG

    def test_a_hazardous_order_is_blocked_on_every_independent_ground(self):
        """Undeclared DG *and* an incompatible load *and* a grade violation."""
        order = Order(
            "o2", _party("Buyer"), _party("Sup"),
            items=[
                Item("p1", "Hydrochloric acid 33%", "S11.1", "S1", grade="technical",
                     storage_class="SC-1", un_number="1789"),
                Item("p2", "Sodium hypochlorite", "S11.3", "S1", grade="technical",
                     storage_class="SC-4", un_number="1791"),
                Item("p3", "Technical citric acid", "S26", "S2", grade="technical"),
            ],
            shipment=Shipment("s1", is_dg=True),  # nothing in place
        )
        findings = evaluate_order(order)
        blocked = {f.rule_code for f in findings if f.blocks}
        self.assertTrue(blocks_order(findings))
        self.assertIn("STORAGE_SEGREGATION", blocked)
        self.assertIn("DG_GATE", blocked)
        self.assertIn("GRADE_GATE", blocked)

    def test_order_without_shipment_still_evaluates_item_rules(self):
        order = Order("o3", _party("B"), _party("S"),
                      items=[Item("p1", "IPA", "S12.2", "S1", grade="technical",
                                  storage_class="SC-3")])
        findings = evaluate_order(order)
        self.assertNotIn("DG_GATE", {f.rule_code for f in findings})
        self.assertFalse(blocks_order(findings))


if __name__ == "__main__":
    unittest.main(verbosity=2)
