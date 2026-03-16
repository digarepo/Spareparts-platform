# Task: SEC13-003 — Session/Cookie + CSRF Posture

## Purpose

Harden session handling and cookie defaults consistent with Domains C/E/F.

## Implementation Notes

- Define cookie policy:
  - `Secure`, `HttpOnly`, `SameSite` values per app
- Define CSRF strategy for state-changing endpoints:
  - token-based or double-submit cookie
  - ensure SSR + API calls remain compatible
- Verify logout/session revocation semantics.

## Acceptance Criteria

- State-changing endpoints are CSRF-protected.
- Cookie settings are consistent and documented.
