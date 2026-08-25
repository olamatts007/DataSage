# TaxSage 🇳🇬

**MSME tax collation, processing and reporting under Nigeria's gazetted 2025 Tax Reform Acts.**

TaxSage helps Nigerian micro, small and medium enterprises comply with the four Acts signed in
June 2025 and effective **1 January 2026**: the Nigeria Tax Act (NTA), Nigeria Tax Administration
Act (NTAA), Nigeria Revenue Service Act, and Joint Revenue Board Act.

![stack](https://img.shields.io/badge/stack-React%2018%20%2B%20TypeScript%20%2B%20Vite-0b3d2b)

## The workflow: Collate → Process → Report

| Stage | Screen | What it does |
|---|---|---|
| **Comply** | Business Profile | 3-step wizard → NTA 2025 classification (small vs standard) + generated obligations |
| | Overview | Compliance health score, tax position cards, threshold radar, next deadlines |
| **Collate** | Records Ledger | Income/expense capture with VAT treatment & WHT tagging, CSV import/export — your legal books of account |
| | Payroll | Employee register → monthly PAYE under the new bands, employer filing tracker |
| **Process** | Tax Engine | Transparent computations with workings: CIT + 4% Development Levy *or* PIT bands + rent relief, VAT netting, WHT register — plus an **old-law toggle** that prices your saving from the reform |
| **Report** | Returns & Reports | Return-ready schedules: CIT/PIT self-assessment, monthly VAT return, WHT schedule, PAYE annual return — CSV export + print/PDF |
| | Filing Calendar | Deadlines generated from your year-end (PAYE 10th · VAT/WHT 21st · CIT FYE+6m · PIT 31 Mar) with NTAA penalty exposure |
| **Reference** | The New Law | Plain-English digest of all four Acts, keyed to app features |

## Rules implemented (as gazetted)

- **Small company** (≤ ₦100m turnover **and** ≤ ₦250m fixed assets, professional services
  excluded): **0% CIT**, CGT-exempt, Development-Levy-exempt, WHT-relieved both ways, VAT relief
  (opt-in allowed). The 20% medium band was abolished in the final Act.
- **Standard companies**: 30% CIT + **4% Development Levy** (consolidates TET/NASENI/PTF/IT levies).
- **PIT bands**: 0% to ₦800,000 · 15% to ₦3m · 18% to ₦12m · 21% to ₦25m · 23% to ₦50m · 25% above.
  CRA abolished → **rent relief** = lower of 20% of annual rent or ₦500,000.
- **VAT** 7.5%; zero-rated staples (food, health, education, power); monthly return by the 21st.
- **WHT (2024 Regulations)**: 10% dividends/interest/rent · 10%/5% royalties · 5% professional fees ·
  2% supplies/construction/other services · 15% directors' fees · **rate doubles without a Tax ID**.
- **NTAA administration**: mandatory Tax ID; ₦100k + ₦50k/month late-filing fines; ₦5m for contracts
  with unregistered vendors.

Two rule sets (`NTA2025` and the repealed `FA2021`) live in `src/lib/rules.ts` — the engine switches
between them to prove the reform's impact on identical records. See **[docs/DESIGN.md](docs/DESIGN.md)**
for the full architecture and compliance mapping.

## Monetization — Premium paywall

Freemium, sandbox-implemented (simulated payments; swap the `subscribe` store action for live
Paystack/Flutterwave webhooks to accept real money):

| Plan | Price | Effective |
|---|---|---|
| SME Starter | free | classification · 50 records · 3 employees · dashboard · calendar · guide |
| Premium monthly | ₦7,500 | everything unlocked |
| Premium quarterly | ₦20,000 | ₦6,667/mo — save 11% |
| Premium annual | ₦66,000 | ₦5,500/mo — save 27% |

14-day trial (no card), Nigerian checkout mock (card with Luhn check · bank transfer · USSD),
receipts ledger, auto-renew management, JSON backup/restore, and graceful expiry — records are never
deleted. Premium unlocks return schedules, print/PDF & CSV exports, unlimited records/employees,
the old-vs-new reform comparison, compliance scoring and threshold alerts.

## Distributable prototype (customer test runs)

The repo ships an **admin-controlled access layer** for handing the app to test customers:

- Customers land on an **access gate** — a generated code in the format `TXS-XXXX-XXXX` is
  required to open the app; each code carries a **plan grant** (14-day trial or Premium period),
  an **expiry** and an **activation cap**; codes can be **revoked** at any time.
- **Admin console** at `#/admin` — create a device passcode once, then generate/label/export/
  revoke codes and watch activations. "Open app as admin" previews the product without a code.
- `npm run build` produces a fully **relative-pathed `dist/`**; `prototype-assets/` adds a
  zero-dependency `server.js`, `START-WINDOWS.bat` / `START-MAC-LINUX.sh`, and customer & admin
  guides. Zip them together → **`taxsage-prototype.zip` (~120 KB)** — ready to hand out or host
  on any static site. See `prototype-assets/ADMIN-GUIDE.md`.

```bash
# repackage after any change
npm run build && zip -r taxsage-prototype.zip \
  --filesync prototype-assets dist  # or use /tmp staging as in git history
```

## Performance

Route-level code splitting (initial JS ~66 KB gzip; each screen ~2–5 KB), memoized tax/entitlement
engine, per-route error boundaries, skeleton loaders, PWA manifest, print-optimized reports, and
schema migrations that never break an existing workspace. 54 engine/billing assertions pass.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle
```

First run loads a demo small company (₦42m packaged-foods Ltd at 0% CIT) on the free plan — click
**★ Try Premium** on the Overview to experience the paywall. Use **Scenarios** in the top bar to
switch businesses. All data persists in `localStorage`.

## Disclaimer

TaxSage generates **preparation schedules**, not filed returns. Filings happen on the NRS and State
IRS e-portals. Always confirm positions with a licensed tax practitioner.
