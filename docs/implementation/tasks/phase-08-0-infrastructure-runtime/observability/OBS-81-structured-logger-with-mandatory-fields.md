# Task: OBS-81 — Structured logger with mandatory fields
Blueprint: TECH_STACK (logging fields), Domain AE (non-interference)
Phase: 08 Infrastructure & Runtime

## Layer

observability

## Package / Area

packages/observability

## Purpose

Implement a structured logger wrapper that guarantees required fields are present and prevents tenant leakage.

## Implementation Location

* packages/observability/src/logger.ts

## Implementation Notes

* Mandatory fields:
  * request_id
  * tenant_id
  * scope
  * actor_id
* Logger must not throw in request paths.

## Acceptance Criteria

* Logger wrapper exists and is used by API and worker.
* Logs are safe under missing optional context.

## Dependencies

* RUNTIME-81

## Estimated Effort

60–120 minutes
