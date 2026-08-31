"""Tests for the commercial and insight services.

Run:
    python3 -m unittest discover -s sourcekettle/app -t sourcekettle/app -p 'test_*.py' -v
"""

from __future__ import annotations

import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import commercial
import insights
from seed import BY_ID, PRODUCTS


class TestLandedCost(unittest.TestCase):
    def test_components_sum_to_total(self):
        """plan/07 invariant: landed cost is decomposed, never collapsed."""
        lc = commercial.landed_cost(1000, 129_000, "IN", 1000, has_dg=False, payment_days=30)
        self.assertEqual(sum(c["amount_kobo"] for c in lc["components"]), lc["total_kobo"])

    def test_landed_unit_is_total_over_quantity(self):
        lc = commercial.landed_cost(1000, 129_000, "IN", 1000, has_dg=False)
        self.assertEqual(lc["landed_unit_kobo"], round(lc["total_kobo"] / 1000))

    def test_landed_unit_exceeds_headline_unit(self):
        """The whole point: headline price is not the ranking key."""
        lc = commercial.landed_cost(1000, 129_000, "IN", 1000, has_dg=False)
        self.assertGreater(lc["landed_unit_kobo"], 129_000)

    def test_dg_surcharge_applies_to_freight(self):
        plain = commercial.landed_cost(1000, 100_000, "NG", 1000, has_dg=False)
        dg = commercial.landed_cost(1000, 100_000, "NG", 1000, has_dg=True, dg_lines=1)
        f_plain = next(c for c in plain["components"] if c["component"] == "freight")
        f_dg = next(c for c in dg["components"] if c["component"] == "freight")
        self.assertGreater(f_dg["amount_kobo"], f_plain["amount_kobo"])

    def test_longer_payment_terms_cost_more(self):
        d0 = commercial.landed_cost(1000, 100_000, "NG", 1000, has_dg=False, payment_days=0)
        d90 = commercial.landed_cost(1000, 100_000, "NG", 1000, has_dg=False, payment_days=90)
        self.assertLess(d0["total_kobo"], d90["total_kobo"])

    def test_domestic_is_cheaper_than_import(self):
        dom = commercial.landed_cost(1000, 100_000, "NG", 1000, has_dg=False)
        imp = commercial.landed_cost(1000, 100_000, "CN", 1000, has_dg=False)
        self.assertLess(dom["total_kobo"], imp["total_kobo"])

    def test_zero_quantity_rejected(self):
        with self.assertRaises(ValueError):
            commercial.landed_cost(0, 100_000, "NG", 0, has_dg=False)


class TestPriceIndex(unittest.TestCase):
    def _obs(self, n, related=0):
        out = [{"landed_unit_kobo": 100_000 + i * 100, "quantity": 100,
                "is_related_party": False} for i in range(n)]
        out += [{"landed_unit_kobo": 999_999, "quantity": 100, "is_related_party": True}
                for _ in range(related)]
        return out

    def test_refuses_to_publish_below_minimum(self):
        """plan/04 §5: never publish an index with fewer than 5 observations."""
        idx = commercial.price_index(self._obs(4))
        self.assertFalse(idx["published"])
        self.assertEqual(idx["n"], 4)

    def test_publishes_at_minimum(self):
        idx = commercial.price_index(self._obs(5))
        self.assertTrue(idx["published"])

    def test_always_publishes_n(self):
        """plan/04 §5: an index without n is marketing."""
        for n in (0, 3, 5, 30):
            self.assertIn("n", commercial.price_index(self._obs(n)))

    def test_excludes_related_party(self):
        idx = commercial.price_index(self._obs(10, related=3))
        self.assertEqual(idx["n"], 10)
        self.assertEqual(idx["excluded"], 3)

    def test_related_party_cannot_move_the_median(self):
        clean = commercial.price_index(self._obs(10))
        polluted = commercial.price_index(self._obs(10, related=5))
        self.assertEqual(clean["median_kobo"], polluted["median_kobo"])

    def test_methodology_is_versioned(self):
        self.assertIn("methodology_version", commercial.price_index(self._obs(10)))

    def test_confidence_scales_with_n(self):
        self.assertEqual(commercial.price_index(self._obs(6))["confidence"], "low")
        self.assertEqual(commercial.price_index(self._obs(12))["confidence"], "moderate")
        self.assertEqual(commercial.price_index(self._obs(25))["confidence"], "high")


class TestSavingsVsIndex(unittest.TestCase):
    def test_below_index(self):
        idx = commercial.price_index([{"landed_unit_kobo": 100_000, "quantity": 1,
                                       "is_related_party": False}] * 6)
        s = commercial.savings_vs_index(90_000, idx)
        self.assertEqual(s["verdict"], "below index")
        self.assertLess(s["delta_pct"], 0)

    def test_unavailable_when_index_unpublished(self):
        idx = commercial.price_index([])
        self.assertFalse(commercial.savings_vs_index(100_000, idx)["available"])


class TestRfqAuction(unittest.TestCase):
    def _rfq(self):
        return commercial.Rfq(
            rfq_id="RFQ-TEST",
            lines=[commercial.RfqLine("S20", "LABSA 90%", 1000, "kg")],
            delivery_location="Lagos", required_by="2026-09-30")

    def _sup(self, i, tier="T3", score=4.5):
        return {"org_id": f"s{i}", "name": f"Supplier {i}",
                "verification_tier": tier, "score": score, "country": "NG"}

    def test_needs_three_bidders_to_award(self):
        r = self._rfq()
        commercial.submit_quote(r, self._sup(1), {"S20": 129_000})
        commercial.submit_quote(r, self._sup(2), {"S20": 120_000})
        res = commercial.rank_quotes(r)
        self.assertFalse(res["rankable"])
        self.assertIn("at least 3", res["reason"])

    def test_ranks_on_landed_cost_not_headline(self):
        """A cheaper headline price with worse terms can still lose."""
        r = self._rfq()
        commercial.submit_quote(r, self._sup(1), {"S20": 129_000})
        commercial.submit_quote(r, self._sup(2), {"S20": 125_000})
        commercial.submit_quote(r, self._sup(3), {"S20": 127_000})
        res = commercial.rank_quotes(r)
        self.assertTrue(res["rankable"])
        landed = [q["landed_unit_kobo"] for q in res["ranking"]]
        self.assertEqual(landed, sorted(landed), "ranking must be ascending on landed cost")

    def test_closed_rfq_rejects_bids(self):
        r = self._rfq()
        r.closed = True
        self.assertIn("error", commercial.submit_quote(r, self._sup(1), {"S20": 100}))

    def test_duplicate_supplier_rejected(self):
        r = self._rfq()
        commercial.submit_quote(r, self._sup(1), {"S20": 100})
        self.assertIn("error", commercial.submit_quote(r, self._sup(1), {"S20": 90}))

    def test_missing_line_price_rejected(self):
        r = self._rfq()
        self.assertIn("error", commercial.submit_quote(r, self._sup(1), {"S99": 100}))


class TestSubstitution(unittest.TestCase):
    def test_identical_cas_same_grade_is_offered(self):
        """Caustic flakes -> other caustic sources: same CAS, segment and grade."""
        target = BY_ID["p-1001"]
        found = insights.substitutes(target, PRODUCTS)
        lye = next(f for f in found if f["product"]["id"] == "p-1002")
        self.assertIn("identical CAS", lye["reasons"])
        self.assertIn("same grade (industrial)", lye["reasons"])

    def test_best_substitute_matches_chemistry_form_and_purity(self):
        """The top match must be same CAS, same physical form, no purity loss."""
        target = BY_ID["p-1001"]                      # caustic flakes 98%
        found = insights.substitutes(target, PRODUCTS)
        best = found[0]
        self.assertEqual(best["product"]["cas"], target["cas"])
        self.assertEqual(best["product"]["form"], target["form"])
        self.assertGreaterEqual(best["product"]["purity"], target["purity"])
        self.assertEqual(best["product"]["grade"], target["grade"])
        self.assertIn("identical CAS", best["reasons"])

    def test_substitutes_are_sorted_by_score(self):
        found = insights.substitutes(BY_ID["p-1001"], PRODUCTS)
        scores = [f["score"] for f in found]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_technical_grade_is_not_offered_for_a_food_grade_target(self):
        """The engine must not suggest something the grade gate would block."""
        target = BY_ID["p-2008"]                      # citric acid, FOOD grade
        ids = {f["product"]["id"] for f in insights.substitutes(target, PRODUCTS)}
        self.assertNotIn("p-2009", ids,
                         "technical-grade citric must never be offered for a food-grade need")

    def test_purity_regression_is_flagged(self):
        target = BY_ID["p-1008"]                      # TiO2 93%
        found = insights.substitutes(target, PRODUCTS)
        offspec = next((f for f in found if f["product"]["id"] == "p-6002"), None)
        if offspec:
            self.assertTrue(any("BELOW" in r for r in offspec["reasons"]))

    def test_unrelated_product_is_not_offered(self):
        target = BY_ID["p-3001"]                      # a 5,000 L reactor
        ids = {f["product"]["id"] for f in insights.substitutes(target, PRODUCTS)}
        self.assertNotIn("p-4005", ids)               # filter bags are not a reactor substitute

    def test_nothing_is_offered_below_the_score_floor(self):
        for f in insights.substitutes(BY_ID["p-2001"], PRODUCTS):
            self.assertGreaterEqual(f["score"], 40)


class TestScorecard(unittest.TestCase):
    def test_best_performer_beats_worst(self):
        cards = {c["supplier"]: c for c in
                 (insights.scorecard({"org_id": s, "name": s, "verification_tier": "T3"},
                                     __import__("history").ORDER_HISTORY)
                  for s in ("s4", "s3"))}
        self.assertGreater(cards["s4"]["score"], cards["s3"]["score"])

    def test_flags_raised_for_poor_history(self):
        c = insights.scorecard({"org_id": "s3", "name": "s3", "verification_tier": "T2"},
                               __import__("history").ORDER_HISTORY)
        self.assertTrue(c["flags"], "a supplier with disputes and late deliveries must be flagged")

    def test_no_history_returns_onboarding_score(self):
        c = insights.scorecard({"org_id": "zz", "name": "new", "verification_tier": "T1",
                                "score": 3.0}, [])
        self.assertEqual(c["orders"], 0)
        self.assertEqual(c["score"], 3.0)


class TestReplenishment(unittest.TestCase):
    def test_low_stock_triggers_reorder(self):
        sugg = insights.reorder_suggestions(
            {"x": {"daily_qty": 10, "on_hand": 20, "safety_days": 14}},
            {"x": {"id": "x", "name": "Widget", "sku": "W1", "segment": "S47",
                   "lead": 7, "moq": 50, "price": 100}},
            today=date(2026, 8, 31))
        self.assertEqual(sugg[0]["action"], "REORDER NOW")
        self.assertGreaterEqual(sugg[0]["suggested_qty"], 50)

    def test_healthy_stock_does_not_trigger(self):
        sugg = insights.reorder_suggestions(
            {"x": {"daily_qty": 10, "on_hand": 5000, "safety_days": 14}},
            {"x": {"id": "x", "name": "Widget", "sku": "W1", "segment": "S47",
                   "lead": 7, "moq": 50, "price": 100}},
            today=date(2026, 8, 31))
        self.assertEqual(sugg[0]["action"], "ok")

    def test_suggestion_respects_moq(self):
        sugg = insights.reorder_suggestions(
            {"x": {"daily_qty": 1, "on_hand": 1, "safety_days": 14}},
            {"x": {"id": "x", "name": "W", "sku": "W", "segment": "S47",
                   "lead": 7, "moq": 50, "price": 100}},
            today=date(2026, 8, 31))
        self.assertEqual(sugg[0]["suggested_qty"] % 50, 0)


class TestDocumentAlerts(unittest.TestCase):
    def _docs(self):
        t = date(2026, 8, 31)
        return [
            {"product_id": "a", "doc_type": "SDS", "revision": "1", "is_current": True,
             "expires_at": (t - timedelta(days=5)).isoformat()},
            {"product_id": "b", "doc_type": "SDS", "revision": "1", "is_current": True,
             "expires_at": (t + timedelta(days=10)).isoformat()},
            {"product_id": "c", "doc_type": "SDS", "revision": "1", "is_current": True,
             "expires_at": (t + timedelta(days=300)).isoformat()},
            {"product_id": "a", "doc_type": "SDS", "revision": "0", "is_current": False,
             "expires_at": (t - timedelta(days=400)).isoformat()},
        ]

    def test_expired_is_blocking(self):
        a = insights.document_alerts(self._docs(), today=date(2026, 8, 31))
        self.assertEqual(a["blocking"], 1)
        self.assertEqual(a["expired"][0]["product_id"], "a")

    def test_expiring_inside_window_flagged(self):
        a = insights.document_alerts(self._docs(), today=date(2026, 8, 31))
        self.assertEqual([e["product_id"] for e in a["expiring_soon"]], ["b"])

    def test_superseded_revisions_are_retained_not_alerted(self):
        """plan/06 §1: keep every revision, only flag the current one."""
        a = insights.document_alerts(self._docs(), today=date(2026, 8, 31))
        self.assertEqual(a["superseded_revisions"], 1)
        self.assertNotIn("a", [e["product_id"] for e in a["expiring_soon"]])

    def test_healthy_document_not_flagged(self):
        a = insights.document_alerts(self._docs(), today=date(2026, 8, 31))
        self.assertNotIn("c", [e["product_id"] for e in a["expiring_soon"]]
                         + [e["product_id"] for e in a["expired"]])


class TestSpendSummary(unittest.TestCase):
    def test_shares_sum_to_100(self):
        import history
        s = insights.spend_summary(history.ORDER_HISTORY,
                                   {p["id"]: {"pillar": p["segment"][0]} for p in PRODUCTS})
        self.assertGreater(s["total_kobo"], 0)
        self.assertAlmostEqual(sum(x["share_pct"] for x in s["by_pillar"]), 100.0, delta=0.6)


if __name__ == "__main__":
    unittest.main(verbosity=2)
