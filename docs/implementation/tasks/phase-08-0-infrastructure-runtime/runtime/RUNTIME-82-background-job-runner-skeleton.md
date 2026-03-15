# Task: RUNTIME-82 — Background job runner skeleton (explicit boundaries)
Blueprint: Domain B (background job boundary), Domain AD (explicit transitions)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

apps/worker

## Purpose

Introduce a minimal background job execution shell that:
- validates context
- runs with explicit scope
- uses request-scoped DB transactions

## Implementation Location

* apps/worker/src/main.ts
* apps/worker/src/jobs/job-registry.ts

## Implementation Notes

* Avoid implicit retries that may create duplicates.
* Retry policy must be explicit per job.

## Acceptance Criteria

* Worker can execute jobs with tenant context.
* Job execution produces auditable logs.

## Dependencies

* RUNTIME-80

## Estimated Effort

120–240 minutes
