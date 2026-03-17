# Task: STOREUI12-005 — Optional Auth + Customer Context

## Purpose

Support optional customer accounts while preserving full guest capability.

## Implementation Notes

- Implement `apps/storefront/app/lib/auth/*`:
  - whoami / current user resolution
  - authenticated vs guest states
- Ensure guest checkout path is always available.
- Account pages must redirect or show a sign-in prompt when unauthenticated.

## Acceptance Criteria

- Guest users can browse, cart, and checkout.
- Authenticated users get account benefits (order history, saved info) without blocking guests.
