# Task: ADMINUI10-001 — Configure Platform Admin as SPA

## Purpose

Ensure `apps/platform-admin` runs as an SPA (no SSR), consistent with platform-admin being a pure API consumer.

## Implementation Notes

- Set React Router config to SPA mode (disable SSR).
- Verify dev and build scripts still function.
- Ensure direct navigation to deep routes works (proper client-side routing behavior).

## Acceptance Criteria

- App runs in dev as SPA.
- Refreshing a deep link route does not crash and loads the SPA.
- No server-render-only assumptions are present in route modules.
