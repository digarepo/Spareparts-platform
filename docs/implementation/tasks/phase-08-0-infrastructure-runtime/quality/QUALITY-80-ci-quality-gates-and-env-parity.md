# Task: QUALITY-80 — CI quality gates + environment parity checks
Blueprint: TECH_STACK (CI required checks), Domain B (no semantic drift across env)
Phase: 08 Infrastructure & Runtime

## Layer

quality

## Package / Area

.github/workflows

## Purpose

Ensure CI enforces lint/typecheck/build and prevents environment-specific logic drift.

## Implementation Location

* .github/workflows/ci.yml

## Implementation Notes

* Required checks:
  * lint
  * typecheck
  * build
* Add a rule to block merging if env-specific branching is introduced for semantics-critical code.

## Acceptance Criteria

* CI pipeline exists and is required for protected branches.

## Dependencies

* TECH_STACK

## Estimated Effort

60–120 minutes
