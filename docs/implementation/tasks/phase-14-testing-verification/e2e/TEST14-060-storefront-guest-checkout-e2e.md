# Task: TEST14-060 — Storefront Guest Checkout E2E

## Purpose

Validate Storefront customer-critical path end-to-end.

## Implementation Notes

- E2E scenarios:
  - browse → PDP → add to cart → checkout as guest
  - payment failure → failure route → safe recovery action
  - search degraded → category browse still works

## Acceptance Criteria

- Guest checkout is always available.
- Failure recovery is explicit and safe.
