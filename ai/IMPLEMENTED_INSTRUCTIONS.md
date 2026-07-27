# Implemented Instructions

This file records what is currently implemented and should be treated as the authoritative behavior until changed.

## Authentication Mode

- Backend/API auth is disabled for now.
- Login uses built-in demo accounts only.
- Sign up is intentionally disabled.

### Active Demo Accounts

- `temp` / `temp`
- `ada@example.com` / `Password1`
- `grace@example.com` / `Password2`
- `margaret@example.com` / `Password3`

## Session & Storage

- Active session key: `balancedTeamGenerator.activeUser` in browser localStorage.
- Player data persistence key pattern: `balancedTeamGenerator.players:<userId>` in localStorage.
- Temp user defaults to mock player list if no saved local data exists.

## UX / Routing

- Login required to access dashboard/team builder/about routes.
- Sidebar shown only for authenticated users.
- Dashboard is the primary roster management page.
- Team Builder supports:
  - Use saved roster players
  - One-time external import flow

## Build / Test Status

- Current code compiles with `npm run build`.
- Tests pass with `npm test -- --watchAll=false`.

## Out of Scope (Deferred)

- External database integration.
- API-based profile/user storage.
- Multi-device real-time sync.
