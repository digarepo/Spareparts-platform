# Task: API-64 — Payments guards, idempotency enforcement, and audit logging
Blueprint: Domain C (Identity, Scope, Authorization), Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src/http

## Purpose

Add API-layer protections for payments:
- enforce scope and explicit authority for every payment action
- enforce idempotency behavior consistently
- emit audit logs for all attempts (success/failure)

## Implementation Location

* apps/api/src/http/guards/payment.guard.ts
* apps/api/src/http/interceptors/idempotency.interceptor.ts
* apps/api/src/observability/audit/payments.audit.ts

## Implementation Notes

* Deny-by-default.
* Idempotency should be:
  * consistent for payment-intent creation
  * explicit errors when key reuse conflicts with payload
* Audit logs must include:
  * actor attribution
  * scope
  * intent
  * outcome

## Acceptance Criteria

* Payment guard(s) exist and are used by endpoints.
* Idempotency middleware/interceptor is in place.
* Audit logs are emitted for all payment actions.

## Dependencies

* API-60..63

## Estimated Effort

60–120 minutes
