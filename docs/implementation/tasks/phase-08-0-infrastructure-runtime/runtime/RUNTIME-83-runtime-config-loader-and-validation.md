# Task: RUNTIME-83 — Runtime config loader + validation (startup fail-fast)
Blueprint: Domain B (config external to domain), Domain AE (ops independence)
Phase: 08 Infrastructure & Runtime

## Layer

runtime

## Package / Area

packages/runtime

## Purpose

Implement a single runtime configuration loader that validates all required environment configuration at startup and exposes immutable config to application shells.

## Implementation Location

* packages/runtime/src/config/runtime-config.ts
* apps/api/src/bootstrap/config.ts
* apps/worker/src/bootstrap/config.ts

## Implementation Notes

* Domain packages must not read env vars.
* Validation must:
  * verify presence
  * verify formats
  * ensure environment isolation (no shared secrets)
* Fail fast at startup rather than failing mid-request.

## Acceptance Criteria

* API and worker boot with validated config.
* Misconfiguration prevents startup.

## Dependencies

* Domain B

## Estimated Effort

60–120 minutes
