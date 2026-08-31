# TaxSage Prototype — Administrator Guide

You control who can use this prototype through **generated access codes** — no admin login required.

## Opening the console

Start the server (`START-*` script or `node server.js`), open **http://localhost:4173**, and go to
**Access Control** in the sidebar (or `#/admin`, or the link on the access gate). The console opens
directly — there is **no passcode**; keep the URL private instead. Use the **App access mode**
toggle at the top:

- 🔓 **Open access** — the app loads for everyone immediately (no wall).
- 🔒 **Gate with codes** — visitors must enter a valid code. (Default for shipped builds.)

**"Open app"** (top-right) returns to the product.

## Generating customer codes

1. Enter a **customer/cohort label** (e.g. "Mrs. Bello — Bello Foods").
2. Pick the **grant**: `14-day trial`, `Premium · 1/3/12 months`.
3. Set **expiry** (7/30/90 days or never) and **activation limit** (1 / 3 / 10 / unlimited).
4. **Generate code** → copy the code or the **WhatsApp-ready share message** and send it.

Customers paste the code at the access gate; the grant applies immediately — no payment step.

## Monitoring & revocation

- The registry table shows status (live / exhausted / expired / revoked) and activation counts.
- **Revoke** any code at any time — it dies at the customer's next app launch.
- **Export codes (.json)** for your records.
- Dashboard cards: total issued · live · activations recorded.
- **"Open app as admin"** (top-right of the Admin page) lets you preview the product without
  creating a code for yourself.

## Distributing to customers

Two supported channels:

| Channel | Steps |
|---|---|
| **Zip handout** | Send `taxsage-prototype.zip` → customer unzips → runs `START-*` script → opens `localhost:4173` |
| **Hosted URL (recommended)** | Enable GitHub Pages (Settings → Pages → branch, folder `/docs`) or upload `dist/` to any static host → share the URL |

### Crucial: codes must travel with the build

Code registries are per-browser. After minting codes in this console:

1. Set your **gate mode** and mint codes.
2. Click **"Download provisioning bundle (access-codes.json)"**.
3. Save it as `public/access-codes.json` in the repo.
4. Rebuild & redeploy (`npm run deploy:test`, or re-zip via `npm run package:prototype`).

The bundle ships the registry **and the current gate mode** with the app, so customers' browsers
inherit both. Revocation/mode changes on hosted URLs: adjust here → re-download → redeploy.

This repo ships demo codes `TXS-DEMO-TR24` (trial) and `TXS-DEMO-PRE26` (annual Premium) in
`public/access-codes.json` so your first evaluator can get in immediately — replace them.

In both channels customers still need an access code from you.

## Important prototype notes

- Validation happens **on the customer's device** against the code registry shipped in that
  build/local copy. Revocations apply to devices that share your storage; for centrally-enforced
  revocation across hosted copies, point `checkCode()` at a small lookup API (see DESIGN.md §Access).
- The zip's `dist/` is a production build with relative paths — it runs from **any** subfolder
  or disk location.

## Troubleshooting

- **"vite not found"** when rebuilding: run `npm install` in the repo first.
- **Code rejected as unknown**: confirm the customer matches the registry copy you generated the
  code in (same build/host).
- **Blank page on file://**: serve over HTTP (the start scripts) — browsers block modules over `file://`.
