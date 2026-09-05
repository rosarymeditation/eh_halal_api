# EH Halal API

Node.js/Express backend for an online halal grocery/food-ordering
platform (Edinburgh Halal), with delivery-zone pricing, coupon
discounts, product variations, Stripe checkout, and SMS order alerts.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Architecture Notes](#architecture-notes)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js / Express |
| Database | MongoDB (Mongoose) |
| File Storage | AWS S3, Cloudinary |
| Payments | Stripe |
| SMS | Twilio |
| Email | SendGrid, Nodemailer (SMTP) |
| Geocoding | Mapbox |

## Project Structure

```
server/
├── controllers/
│   ├── user.js            # Auth, profile
│   ├── address.js          # Customer delivery addresses
│   ├── storeAddress.js       # Store's own location (geocoded)
│   ├── product.js             # Products, variations, search
│   ├── category.js             # Product categories
│   ├── cart.js                  # Shopping cart
│   ├── coupon.js                 # Discount codes
│   ├── transaction.js             # Order creation, payment, history
│   ├── favorite.js                 # Wishlist/favorites
│   ├── banner.js                    # Homepage banners
│   ├── city.js                       # Delivery city list
│   ├── status.js                      # Order status labels
│   ├── setting.js                      # Store-wide delivery settings
│   ├── weightType.js                    # Product weight/unit types
│   └── productReminder.js                # Back-in-stock reminders
├── models/
├── test/
│   └── controllers/
│       ├── coupon.test.js
│       ├── address.test.js
│       └── transaction.test.js
├── utility/
│   ├── global.js               # Shared helpers, uploads, getLatLong
│   ├── mail.js
│   └── constants.js
└── errors/
    └── statusCode.js
index.js
```

## Core Features

### Product Catalog
Categories with hardcoded quick-access IDs (seafood, condiments,
drinks, veg, grains, meat, cosmetics), product variations (different
weights/prices per product), search with pagination, popular/featured/
discounted product listings.

### Cart & Checkout
Cart management, coupon-based discounts (fixed or percentage),
delivery-zone pricing (local fee, next-day fee, free-delivery
threshold), Stripe Checkout session creation.

### Orders
Order creation with geocoded delivery address (via Mapbox), SendGrid
order-confirmation emails with itemized receipts, SMS alerts to store
staff via Twilio on every new order, order history and status
tracking, monthly sales aggregation for the admin dashboard.

### Loyalty & Reminders
Point-based reward system (1 point per £2 spent), product
back-in-stock email/SMS reminders for both registered and guest users.

## Getting Started

### Prerequisites
- Node.js (LTS)
- MongoDB instance
- Accounts for: Stripe, Twilio, SendGrid, AWS S3, Cloudinary, Mapbox

### Setup

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd eh_halal_api
   npm install
   ```

2. Configure environment variables
   ```bash
   cp .env.example .env
   ```
   See Environment Variables below.

3. Run the server
   ```bash
   node index.js
   ```

## Environment Variables

See `.env.example` for the full list, including:

| Category | Variables |
|---|---|
| Auth | `SECRET` |
| Email | `SENDGRID_API_KEY`, `FOODENGO_SMTP_PASS` |
| SMS | `TWILIOSID`, `TWILIOTOKEN` |
| Payments | `STRIPE` |
| Storage | `S3ACCESSKEY`/`S3SECRETKEY`, `CLOUDINARY_*` |
| Maps | `MAPBOX_ACCESS_TOKEN` |
| Database | `DATABASE_URL` |

⚠️ This account's Cloudinary credentials are shared with
`foodengo_server` — rotating the secret requires updating both repos
at the same time.

## Running Tests

```bash
npx jest
```

Run a specific suite:
```bash
npx jest server/test/controllers/coupon.test.js
npx jest server/test/controllers/address.test.js
npx jest server/test/controllers/transaction.test.js
```

### Current coverage
- **`coupon.js` — `redeem`**: regression coverage for a severe,
  confirmed-live bug (see Architecture Notes) where every successful
  coupon redemption returned an error; now verifies correct discount
  calculation for both Fixed and Percentage coupon types.
- **`address.js`**: `toggleDefault`'s unset-all-then-set-one logic, and
  `findDefaultAddress`'s fallback behavior when no address is flagged
  default.
- **`transaction.js` — `userLastTotal`**: regression coverage for a
  `ReferenceError` crash (see Architecture Notes), including the
  no-orders-yet edge case.

Note: `transaction.test.js` requires `jest.mock("twilio", ...)` and
`jest.mock("stripe", ...)` at the top of the file, since both clients
are constructed at module load time and will throw immediately if
`TWILIOSID`/`TWILIOTOKEN`/`STRIPE` aren't set in the test environment.

## Architecture Notes

- **`redeem()` coupon bug (fixed)**: both the Fixed and Percentage
  discount branches referenced `discountValue` in the response
  payload, but only `data.discountValue` existed in scope. This threw
  a `ReferenceError` on every successful redemption, silently reported
  as a generic server error — meaning valid, unexpired coupons always
  appeared to fail. Confirmed live via test before fixing.
- **`userLastTotal()` crash (fixed)**: referenced `item.status`, where
  `item` was never defined in this function's scope (it only exists as
  a loop variable in `userTotal`/`allTotal`). Replaced with
  `totalData.status`; added a null-check for users with no order
  history.
- **`roundUp()` (fixed)**: immediately overwrote its own `num`
  parameter with a hardcoded value, making it always return the same
  result regardless of input.
- **Duplicate `signUp` export (fixed)**: the auth controller
  previously exported two separate `signUp` functions in the same
  object — JavaScript silently lets the second win, so the first was
  dead code. Consolidated into one, removing a redundant DB re-fetch
  the surviving version had.
- **`forEach`/async pattern (fixed)**: order-creation functions
  (`create`, `createForMobileLatest`, `createForWeb`) used
  `productArray.forEach(async (item) => {...})`, which doesn't wait
  for the async callbacks — the HTTP response could return before all
  `Transaction` records finished saving. Replaced with `for...of`.
- **Duplicated `getLatLong()` (fixed)**: identical geocoding logic
  existed in both `storeAddress.js` and `transaction.js`, each with
  its own hardcoded Mapbox token. Consolidated into one shared helper
  in `utility/global.js`.

## Security Notes

Found and remediated during a security sweep, all requiring credential
rotation in addition to code/history fixes:

1. **Cloudinary API secret** hardcoded in `cloudinary.js` — same value
   already found exposed in `foodengo_server`, confirming reuse across
   repos.
2. **Mapbox access token** hardcoded in two files.
3. **SMTP password** hardcoded in `mail.js` — same password value
   (`2000years@BC`) already found and rotated in `afromigo_server`,
   confirming reuse across multiple, unrelated production systems.
   Given this pattern, treat any shared credential as compromised
   everywhere it's used, not just where it was first found.

## Troubleshooting

- **Coupon redemption always fails, even for valid codes** — confirmed
  fixed; see Architecture Notes.
- **`/transaction/last` (or equivalent) throws an error** — confirmed
  fixed; see Architecture Notes.
- **Transaction tests fail immediately on import** — add the
  `jest.mock("twilio", ...)`/`jest.mock("stripe", ...)` calls described
  in Running Tests above.
- **Image uploads fail after rotating Cloudinary credentials** —
  confirm `foodengo_server` was updated with the same new secret at
  the same time, since both repos share this account.

## License

This repository is proprietary and confidential, © Softnergy Limited.
All rights reserved. No part of this codebase may be copied,
distributed, or used without explicit permission from Softnergy Limited.

## Contact

Softnergy Limited
