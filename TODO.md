# Kinvest Web – Finish Line TODO

## API proxy + data plumbing
- Keep new endpoints going through `fetchFromApi` (Clerk tokens) and update normalize helpers when backend payloads change.

## Core flows to finish
- Dashboard (`pages/dashboard.js`): refine empty/error states and show entry currency when it differs from preferred currency.
- Groups (`pages/groups.js`, `pages/groups/[groupId].js`): add payout logging UI wired to `/api/groups/:groupId/payouts`; verify insights (current/next cycle, payoutsByMonth/history) render as returned by backend.
- Invitations (`pages/invitations/[invitationId].js`): show clear errors for expired/missing invites and confirm accept/decline refetch feedback in the UI.
- Wallets (`pages/wallets.js`): add load-failed/empty states and backend error surfacing for the transaction feed.
- Activity/Settings: replace placeholder copy with functional pages once backend endpoints exist (activity stream, notification prefs, locale/currency, API tokens).

## Validation, UX, and resilience
- Contributions: add wallet-currency check (require a wallet in the group currency, disable if missing) and keep backend errors visible.
- Payouts: include error handling and success feedback when logging payouts; keep auto-payout badge in payout card.
- Guard date/currency formatting against invalid values; centralize helpers where practical.
- Handle 401/403 gracefully in UI for protected routes.

## QA and readiness
- Add integration tests or happy-path API tests for proxy/flows; run `npm run lint` and fix warnings.
- Verify `.env.local` (Clerk keys, `API_URL`/`NEXT_PUBLIC_API_URL`, JWT template) and keep README updated.
- Strip dev-only console logs before release.

## Documentation & consistency
- Add a short architecture map (README updated with structure; keep it current as features move).
- Prefer shared helpers (`utils/formatters`) for dates/currency/enums; avoid redefining per page.
- Add `components/common/` barrel for shared UI primitives as they are extracted (buttons/modals/inputs).
