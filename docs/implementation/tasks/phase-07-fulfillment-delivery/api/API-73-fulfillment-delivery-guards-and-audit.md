# Task: API-73 — Fulfillment/delivery guards + audit logging
Blueprint: Domain C (Identity, Scope, Authorization), Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model), Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

api

## Package / Area

apps/api/src/http

## Purpose

Enforce scope-first authorization and auditability for operational logistics actions.

## Implementation Location

* apps/api/src/http/guards/fulfillment.guard.ts
* apps/api/src/http/guards/shipment.guard.ts
* apps/api/src/http/guards/tracking.guard.ts
* apps/api/src/observability/audit/logistics.audit.ts

## Implementation Notes

* Deny-by-default.
* Tenants can operate their own fulfillment/shipment records.
* Customers are read-only for tracking visibility.
* Audit logs should capture:
  * actor
  * scope
  * action
  * target id
  * outcome

## Acceptance Criteria

* Guards exist and are applied to endpoints.
* Operational actions are auditable.

## Dependencies

* API-70..72

## Estimated Effort

60–120 minutes
