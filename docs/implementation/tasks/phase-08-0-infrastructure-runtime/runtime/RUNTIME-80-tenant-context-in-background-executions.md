# Task: RUNTIME-80 — Tenant context introduction + validation for background executions
Blueprint: Domain B (Tenant context boundaries), Domain AD (Validation Before Mutation)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

apps/worker (or packages/runtime/jobs)

## Purpose

Ensure background jobs introduce, validate, and carry tenant context explicitly—matching the same invariants as HTTP requests.

## Implementation Location

* apps/worker/src/runtime/job-context.ts
* packages/runtime/src/tenant-context.ts

## Implementation Notes

* Tenant context must be introduced at job entry.
* Tenant context must be validated before any domain/data access.
* Tenant context is immutable for the lifetime of execution.

## Acceptance Criteria

* Job handler signature requires explicit `TenantContext`.
* Missing/invalid context fails closed before any mutation.

## Dependencies

* Domain B tenant context model

## Estimated Effort

60–120 minutes
