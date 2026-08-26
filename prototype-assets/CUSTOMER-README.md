# TaxSage — Customer Test-Run Prototype

Welcome to your guided test run of **TaxSage**, the MSME tax-compliance workspace for the
gazetted **Nigeria Tax Act 2025** (effective 1 January 2026).

---

## 1 · Start the app (2 minutes)

You received `taxsage-prototype.zip`. Unzip it, then pick **one**:

| Platform | Action |
|---|---|
| **Windows** | Double-click `START-WINDOWS.bat` |
| **macOS / Linux** | Run `chmod +x START-MAC-LINUX.sh && ./START-MAC-LINUX.sh` in a terminal |
| **Any (manual)** | `node server.js` (needs Node.js) — or serve the `dist/` folder with any static server |

Then open **http://localhost:4173** in your browser. (Prefer online? The `dist/` folder also works
drag-and-drop on Netlify, Vercel, GitHub Pages, or any static host.)

## 2 · Unlock with your access code

The app opens on an **access gate**. Enter the code your administrator gave you
(format `TXS-XXXX-XXXX`). Codes are single- or limited-use, may expire, and automatically grant
your test plan (trial or Premium). No payment is involved in this test run.

## 3 · What to evaluate

1. **Business Profile** — set your structure, turnover and fixed assets; watch your **NTA 2025
   small-company classification** resolve live (0% CIT ↔ 30% + 4% Development Levy).
2. **Records Ledger** — add/import sales & expenses (this *is* your legal book of account).
3. **Payroll** — add employees; PAYE computes on the new bands (first ₦800k at 0%).
4. **Tax Engine** — full transparent workings; toggle **Old law** to see your reform saving.
5. **Returns & Reports** — generate CIT/PIT, monthly VAT, WHT schedule & PAYE returns; print/PDF.
6. **Filing Calendar** — NTAA 2025 deadlines (PAYE 10th · VAT/WHT 21st · CIT FYE+6m · PIT 31 Mar)
   with penalty exposure.

**Scenarios** (top-right) load realistic demo datasets instantly:
₦42m small foods company (0% CIT) · ₦160m trading company (30% + levy) · freelance sole proprietor.

## 4 · Notes

- Everything runs **on your device** — records stay in this browser's local storage. Export a JSON
  backup anytime from **Subscription → Workspace backup**.
- Sandbox subscriptions accept the test card `4242 4242 4242 4242` (any expiry/CVV).
- Feedback channel: reply to your administrator with the screen name + what you expected.

*TaxSage prepares schedules for filing on the NRS/State IRS portals — it does not file on your behalf.*
