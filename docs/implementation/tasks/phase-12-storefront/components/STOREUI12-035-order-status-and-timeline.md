# Task: STOREUI12-035 — Order Status + Timeline

## Purpose

Provide reusable order status UI for confirmation and account order detail.

## Implementation Notes

Implement components:
- `OrderStatusPill`
- `OrderTimeline`
- `PaymentOutcomeTimeline`

Rules (Domain S):
- do not infer order truth from payment attempts
- show intent vs outcome where applicable

## Acceptance Criteria

- Order detail pages show clear status and history.
- Payment outcomes are displayed without implying order cancellation.
