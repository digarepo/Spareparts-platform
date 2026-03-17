# Task: API-70 — Fulfillment endpoints (tenant-owned operations)
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose tenant-authenticated endpoints to create and manage fulfillment records.

Fulfillment is tenant-controlled. Platform is supervisor-only.

## Implementation Location

* apps/api/src/modules/fulfillment/fulfillment.controller.ts
* apps/api/src/modules/fulfillment/fulfillment.service.ts

## Implementation Notes

* Endpoints:
  * POST /fulfillments (create)
  * GET /fulfillments/:id (tenant view)
  * PATCH /fulfillments/:id/status (explicit transition)
* Validate requests/responses via contracts.
* Enforce tenant scope.

## Acceptance Criteria

* Endpoints exist and are tenant-scoped.
* State transitions are validated (no implicit changes).

## Dependencies

* CONTRACTS-72 — Fulfillment contracts
* RLS-71 — Tenant operational access policies
* DOMAIN-70/71

## Estimated Effort

60–120 minutes
