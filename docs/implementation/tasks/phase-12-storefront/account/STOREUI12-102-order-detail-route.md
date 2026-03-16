# Task: STOREUI12-102 — Order Detail Route (Account)

## Purpose

Provide customers order detail visibility including payment outcomes and fulfillment tracking.

## Implementation Notes

- Add route module `/account/orders/:orderId`.
- Display:
  - items grouped by tenant
  - order status
  - payment outcomes timeline
  - fulfillment/tracking
- Must not expose other customers' data.

## Acceptance Criteria

- Order detail renders for authorized customer only.
- Payment outcomes are explicit without implying order truth from attempts.
