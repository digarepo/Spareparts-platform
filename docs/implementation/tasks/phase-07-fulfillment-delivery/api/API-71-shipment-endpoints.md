# Task: API-71 — Shipment endpoints (transport execution)
Blueprint: Domain AJ (Shipment Logistics Model)
Phase: 07 Fulfillment & Delivery

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose tenant-authenticated endpoints to create shipments from fulfillments and perform explicit shipment status transitions.

## Implementation Location

* apps/api/src/modules/logistics/shipments.controller.ts
* apps/api/src/modules/logistics/shipments.service.ts

## Implementation Notes

* Endpoints:
  * POST /shipments (create from fulfillment)
  * GET /shipments/:id
  * PATCH /shipments/:id/status
* Validate inputs/outputs via contracts.
* Enforce tenant scoping.

## Acceptance Criteria

* Shipment endpoints exist.
* Cross-tenant access is denied.

## Dependencies

* CONTRACTS-73 — Shipment contracts
* RLS-71
* DOMAIN-72/73

## Estimated Effort

60–120 minutes
