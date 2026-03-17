# Task: REDIS-86 — Tenant isolation rules for shared cache/coordination
Blueprint: Domain B (tenant isolation), Domain AC (zero implicit trust)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Prevent Redis from becoming a cross-tenant leakage channel by enforcing key scoping and safe aggregation rules.

## Implementation Location

* packages/infra/redis/src/keys/redis-keys.ts
* packages/infra/redis/src/tenancy/redis-tenancy.guard.ts

## Implementation Notes

* Tenant-scoped keys must always include tenant_id.
* Aggregated/global keys must be platform-governed and must not allow reverse inference.
* Never store PII in Redis.

## Acceptance Criteria

* Lintable guard/helper exists to build only tenant-scoped keys.
* Cross-tenant key construction is prevented in shared helpers.

## Dependencies

* REDIS-85

## Estimated Effort

45–90 minutes
