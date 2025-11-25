# Kinvest Web

Full-stack Next.js (pages router) app for running collective saving rotations with Clerk auth and a Node/Prisma API (default `http://localhost:4000`).

## What’s inside

- **Auth:** Clerk (`ClerkProvider` in `_app.js`, protected routes via `proxy.js` matcher). All upstream `/api/*` calls include a Clerk bearer token minted with the configured JWT template.
- **Features:** Dashboard with rotation snapshot, group/collective pages (invitations, cycles, contributions), wallet console (balances + transactions), notification inbox, invite detail pages.
- **API proxy:** Local routes under `pages/api` forward to the backend, adding the Clerk bearer token so you don’t fight CORS.

## Requirements

- Node 18+ and npm.
- Backend API running at `API_URL`/`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`) with the routes shown below.
- Clerk project + JWT template (set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_TEMPLATE`/`NEXT_PUBLIC_CLERK_JWT_TEMPLATE`).

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill Clerk keys and API URL(s)
npm run dev
# app at http://localhost:3000
```

> Note: Next 16 uses `proxy.js` (not `middleware.js`) for route protection. The existing matcher guards `/dashboard`, `/groups`, `/wallets`, `/activity`, `/settings`.

## Key pages

- `/dashboard` – rotation snapshot, collectives list, wallet ledger.
- `/groups` – manage/scan invitations, create collectives.
- `/groups/[groupId]` – collective summary, rotation timeline, payout history, record contributions.
- `/wallets` – list/create wallets, view transactions.
- `/invitations/[invitationId]` – accept/decline + history.

## Backend endpoints (expected)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/dashboard/overview` | GET | Profile, wallets, groups, ledger for the dashboard. |
| `/api/groups` | GET/POST | List or create collectives. |
| `/api/groups/:groupId` | GET | Group detail with members/cycles/insights. |
| `/api/groups/:groupId/members` | POST | Invite/activate member (owner/admin). |
| `/api/groups/:groupId/cycles` | POST | Create a cycle manually. |
| `/api/groups/:groupId/cycles/generate` | POST | Auto-generate rotation cycles. |
| `/api/groups/:groupId/contributions` | POST | Record a member contribution. |
| `/api/groups/:groupId/payouts` | POST | Log a payout. |
| `/api/wallets` | GET/POST | List or create wallets (per currency). |
| `/api/wallets/:walletId/transactions` | GET/POST | Read or create wallet transactions. |
| `/api/users/me` | GET/PUT | Read/update current profile. |

## Scripts

- `npm run dev` – start Next.js dev server.
- `npm run build` / `npm run start` – prod build and serve.
- `npm run lint` – Next.js lint.

## Contributing notes

- Tailwind 3.x tokens live in `tailwind.config.js`; shared component styles in `styles/globals.css`.
- React Query handles data fetching; API hooks live under `components/features/**/use*.js`.
- Keep proxy auth in place when adding new API calls so Clerk tokens reach the backend.