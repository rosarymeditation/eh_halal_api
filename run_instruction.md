# Run Instructions — EH Halal API

This document explains how to set up, run, and test this Node.js
backend from a clean clone.

## Prerequisites

- Node.js (LTS) — verify with:
  ```bash
  node --version
  npm --version
  ```
- A MongoDB instance
- Accounts/API keys for: Stripe, Twilio, SendGrid, AWS S3, Cloudinary,
  Mapbox

## 1. Clone and install dependencies

```bash
git clone <repo-url>
cd eh_halal_api
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in every value. See `README.md`'s Environment Variables section
for a category breakdown, and its Security Notes section for context
on credentials that were recently rotated.

Use a freshly rotated, unique value for `FOODENGO_SMTP_PASS` and
`CLOUDINARY_API_SECRET` — both were previously hardcoded and exposed,
and the SMTP password specifically was found reused across multiple
unrelated production systems.

## 3. Run the server

```bash
node index.js
```

## 4. Run the test suite

```bash
npx jest
```

Run a specific test file:
```bash
npx jest server/test/controllers/coupon.test.js
npx jest server/test/controllers/address.test.js
npx jest server/test/controllers/transaction.test.js
```

## 5. Run gitleaks (security scan)

```bash
gitleaks detect --source . --verbose
```

## Troubleshooting

- Server fails to start / MongoDB connection error — confirm
  `DATABASE_URL` is set correctly.
- `transaction.test.js` fails immediately with a Twilio/Stripe error —
  this happens because both clients are constructed at module load
  time and throw if their credentials aren't set. Ensure
  `jest.mock("twilio", ...)` and `jest.mock("stripe", ...)` are present
  at the top of the test file, or set dummy `TWILIOSID`/`TWILIOTOKEN`/
  `STRIPE` values in your test environment.
- Coupon redemption fails — confirmed fixed; see `README.md`'s
  Architecture Notes on the `redeem()` bug.
- Order confirmation page or last-order lookup crashes — confirmed
  fixed; see `README.md`'s notes on `userLastTotal()`.
- Cloudinary uploads fail after a credential rotation — this account
  is shared with `foodengo_server`; confirm both repos were updated
  with the new secret together.

## Project structure reference

See `README.md` for a full breakdown of the codebase's folder
structure, core features, architecture notes, and the security
remediation history for this repo.
