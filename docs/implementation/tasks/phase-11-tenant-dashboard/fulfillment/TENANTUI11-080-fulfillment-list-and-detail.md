# Task: TENANTUI11-080 — Fulfillment List + Detail

## Purpose

Expose fulfillment visibility for tenant operations and customer expectations management.

## Implementation Notes

- Add route module `/fulfillment` and `/fulfillment/:fulfillmentId` (or a combined pattern).
- Display:
  - fulfillment status
  - shipment/tracking info (tenant-visible)
  - exceptions/failures
- Actions (if supported):
  - record shipment
  - update tracking
  - mark delivered (if tenant is the actor)
- All actions must be auditable and suppressed in degraded mode.

## Acceptance Criteria

- Fulfillment surfaces render tenant-scoped.
- Mutations are explicit, auditable, and safe.
