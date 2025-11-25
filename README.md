# Kinvest Web

Opinionated Next.js (pages router) starter with [Clerk](https://clerk.com) authentication pre-wired.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and add keys from the Clerk dashboard + API:

   ```bash
   cp .env.local.example .env.local
   ```

   Required keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_TEMPLATE` / `NEXT_PUBLIC_CLERK_JWT_TEMPLATE` – set if your API expects a custom Clerk JWT template.
   - `API_URL` – internal server-to-server base (default `http://localhost:4000`)
   - `NEXT_PUBLIC_API_URL` – client base (default `http://localhost:4000`)

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000.

## Auth flow

- `_app.js` wraps the app with `ClerkProvider`.
- `hooks/useSyncUserProfile` calls a local proxy (`/api/bootstrap/user`) which forwards to `/api/users/me` on your backend with the Clerk bearer token (minted with the configured JWT template), ensuring every newly signed-in user is mirrored in Postgres without CORS headaches.
- `pages/dashboard.js` fetches `/api/users/me`, `/api/users/me/metrics`, `/api/groups`, and `/api/wallets` on the server (using the Clerk session token) to hydrate the post-auth landing view.
- `middleware.js` protects `/dashboard` and other routes you add to `isProtectedRoute`.
- `pages/dashboard.js` uses `withServerSideAuth` to fetch the authed user on the server.

## API routes

All upstream `/api/*` requests now **must** include a valid Clerk bearer token header (`Authorization: Bearer <token>`). Mint this token with your configured JWT template via Clerk (see `CLERK_JWT_TEMPLATE` / `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`).

| Route | Method | Description |
| --- | --- | --- |
| `/health` | GET | Basic liveness probe. |
| `/api/users/me` | GET | Returns the signed-in user's profile, memberships, and latest ledger entries. |
| `/api/users/me` | PUT | Updates profile fields (`displayName`, `avatarUrl`, `locale`). |
| `/api/users/me/metrics` | GET | Aggregated contribution / payout stats. |
| `/api/groups` | GET/POST | List accessible groups or create a new group. |
| `/api/groups/:groupId` | GET | Detailed group view with members and recent cycles. |
| `/api/groups/:groupId/members` | POST | Invite/activate a member (owner/admin only). |
| `/api/groups/:groupId/cycles` | POST | Start a new saving cycle and seed participants. |
| `/api/groups/:groupId/contributions` | POST | Record a member contribution and optional ledger transaction. |
| `/api/groups/:groupId/payouts` | POST | Log a payout to a receiver wallet. |
| `/api/dashboard/overview` | GET | Snapshot of profile, wallet, group, and ledger data for the overview screen. |
| `/api/wallets` | GET/POST | List or create personal wallets (per currency). |
| `/api/wallets/:walletId/transactions` | GET/POST | Inspect or manually insert wallet transactions. |
| `/api/payments/intents` | GET/POST | CRUD for PaymentIntent records used for gateway reconciliation. |
| `/api/payments/intents/:intentId` | PATCH | Update intent status after provider callbacks. |

## Styling

- Tailwind CSS 3.x is configured via `tailwind.config.js` and `postcss.config.js`; `styles/globals.css` imports Tailwind layers and defines a few reusable component classes (`layout`, `card`, `cta`).
- Update `tailwind.config.js` to extend tokens (colors, fonts, etc.) and keep shared UI patterns inside `@layer components` blocks for easy reuse.

## Useful scripts

- `npm run dev` – start Next.js in development mode.
- `npm run build` – create a production build.
- `npm run start` – run the production server.
- `npm run lint` – lint with `next lint`.
# Kinvest-WEB
