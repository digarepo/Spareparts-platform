# Task: OBS-82 — Metrics hooks (baseline) without authority coupling
Blueprint: TECH_STACK (metrics hooks), Domain AE (observability cannot influence behavior)
Phase: 08 Infrastructure & Runtime

## Layer

observability

## Package / Area

packages/observability

## Purpose

Provide baseline metrics hooks (latency, error rate, dependency health) with strict non-interference.

## Implementation Location

* packages/observability/src/metrics.ts

## Implementation Notes

* Metrics must not affect request outcomes.
* Tenant-scoped metrics must prevent reverse inference.

## Acceptance Criteria

* Hooks exist and can be no-op in dev.
* Metrics failures do not alter HTTP responses.

## Dependencies

* OBS-80

## Estimated Effort

60–120 minutes
