# Task: SEC13-041 — Cart Hoarding + Checkout Spam Controls

## Purpose

Protect cart/checkout availability and prevent resource exhaustion without altering order/payment semantics.

## Implementation Notes

- Add protective controls:
  - rate limit cart mutations
  - cap cart size/line count (explicit rejection)
  - throttle repeated checkout attempts
- Ensure:
  - rejection is explicit
  - no partial order creation occurs

## Acceptance Criteria

- Cart/checkout endpoints withstand abuse patterns.
- Order creation remains atomic and explicit.
