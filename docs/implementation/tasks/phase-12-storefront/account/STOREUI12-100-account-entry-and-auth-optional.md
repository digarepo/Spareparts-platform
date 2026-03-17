# Task: STOREUI12-100 — Account Entry (Optional Auth)

## Purpose

Provide optional customer account entry without blocking guest browsing/checkout.

## Implementation Notes

- Add route module `/account`.
- Show:
  - sign-in/register entry points
  - benefits summary
- For unauthenticated users visiting protected account routes:
  - show sign-in prompt

## Acceptance Criteria

- Guests can ignore account entirely.
- Account routes handle unauthenticated state gracefully.
