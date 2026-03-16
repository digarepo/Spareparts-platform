# Task: RUNTIME-85 — Feature gates (availability only, no semantic drift)
Blueprint: Domain B (feature gating rule), Domain AC (no alternate execution paths)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

packages/runtime

## Purpose

Implement a feature gating mechanism that controls availability only and cannot alter business semantics.

## Implementation Location

* packages/runtime/src/feature-gates/feature-gates.ts

## Implementation Notes

* Gates must:
  * be explicit
  * be observable
  * never fork domain meaning
* Prefer compile-time or startup-configured gates for MVP.

## Acceptance Criteria

* Feature gates exist and are used only to enable/disable fully designed capabilities.

## Dependencies

* RUNTIME-83

## Estimated Effort

60–120 minutes
