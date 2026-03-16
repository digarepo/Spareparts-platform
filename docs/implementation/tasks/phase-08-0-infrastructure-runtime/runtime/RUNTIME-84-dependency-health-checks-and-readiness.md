# Task: RUNTIME-84 — Dependency health checks + readiness gating
Blueprint: Domain AD (failure handling), Domain AC (fail closed under uncertainty)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

apps/api/src

## Purpose

Expose health/readiness endpoints and ensure the app can fail closed when critical dependencies (DB, Redis) are unavailable.

## Implementation Location

* apps/api/src/modules/health/health.controller.ts
* apps/api/src/modules/health/health.service.ts

## Implementation Notes

* Health endpoint (liveness): process is up.
* Readiness endpoint: critical deps reachable.
* Must not leak tenant data.

## Acceptance Criteria

* Health endpoints exist.
* Readiness correctly reflects DB/Redis connectivity.

## Dependencies

* REDIS-81

## Estimated Effort

60–120 minutes
