# Task: RUNTIME-81 — Request context + correlation IDs (request_id propagation)
Blueprint: TECH_STACK (logging mandatory fields), Domain AE (observability non-interference)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

apps/api/src/http

## Purpose

Standardize request context propagation (request_id, tenant_id, scope, actor_id) for logs/metrics/traces without influencing behavior.

## Implementation Location

* apps/api/src/http/middleware/request-context.middleware.ts
* packages/runtime/src/request-context.ts

## Implementation Notes

* Generate request_id if missing.
* Propagate via AsyncLocalStorage (or explicit passing) but must not alter outcomes.

## Acceptance Criteria

* All logs emitted include the mandatory fields.
* Absence of observability components must not change behavior.

## Dependencies

* Domain AE

## Estimated Effort

60–120 minutes
