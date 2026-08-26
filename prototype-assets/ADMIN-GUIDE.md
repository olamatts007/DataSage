# TaxSage Prototype — Administrator Guide

You control who can use this prototype through **generated access codes**.

## First sign-in (one-time, per device)

1. Start the server (`START-*` script or `node server.js`) and open **http://localhost:4173**.
2. Click **"Administrator sign-in →"**. Since no passcode exists yet, you'll **create one**
   (min 8 characters, stored SHA-256-hashed on this device).
3. You're now in **Admin — Test-Run Access Control**.

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
| **Online hosting** | Upload `dist/` to any static host (Netlify/Vercel/GitHub Pages/S3) → share the URL |

In both cases customers still need an access code from you.

## Important prototype notes

- Validation happens **on the customer's device** against the code registry shipped in that
  build/local copy. Revocations apply to devices that share your storage; for centrally-enforced
  revocation across hosted copies, point `checkCode()` at a small lookup API (see DESIGN.md §Access).
- Reset admin passcode: browser dev-tools → clear this site's Local Storage.
- The zip's `dist/` is a production build with relative paths — it runs from **any** subfolder
  or disk location.

## Troubleshooting

- **"vite not found"** when rebuilding: run `npm install` in the repo first.
- **Code rejected as unknown**: confirm the customer matches the registry copy you generated the
  code in (same build/host).
- **Blank page on file://**: serve over HTTP (the start scripts) — browsers block modules over `file://`.
