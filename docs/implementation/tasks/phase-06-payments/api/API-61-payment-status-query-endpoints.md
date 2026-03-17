# Task: API-61 — Payment status query endpoints (customer + tenant views)
Blueprint: Domain Q (Payment Core Model & Meaning)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose read-only endpoints for payment status and history:
- customers can read their own payments
- tenants can read payments tied to their tenant obligations
- platform finance can observe for audit

## Implementation Location

* apps/api/src/modules/payments/payments.controller.ts
* apps/api/src/modules/payments/payments.query.ts

## Implementation Notes

* Customer view must not expose provider inbox/raw payloads.
* Tenant view must not leak cross-tenant information.
* Prefer explicit DTO shaping even if DB includes more fields.

## Acceptance Criteria

* GET payment by id
* GET payments by order id
* Responses conform to contracts and are scope-safe

## Dependencies

* CONTRACTS-61 — Money primitives
* RLS-61/RLS-62/RLS-63 policies

## Estimated Effort

60–120 minutes
