# Task: STOREUI12-090 — Checkout Route (Guest-first)

## Purpose

Implement checkout with guest as the default path while allowing optional sign-in.

## Implementation Notes

- Add route module `/checkout`.
- Steps:
  - contact (guest email)
  - shipping address
  - review (per-tenant breakdown)
  - payment attempt initiation
- Must validate cart snapshots before creating the order.

## Acceptance Criteria

- Guest checkout completes without requiring account.
- Review step shows per-tenant breakdown.
