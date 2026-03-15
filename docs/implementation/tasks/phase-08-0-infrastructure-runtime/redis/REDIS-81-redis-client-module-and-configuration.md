# Task: REDIS-81 — Redis client module + configuration
Blueprint: TECH_STACK (Redis required), Domain B (Env config external to domain)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Create a single, well-scoped Redis client module with safe configuration and environment isolation.

## Implementation Location

* packages/infra/redis/src/redis.client.ts
* packages/infra/redis/src/redis.config.ts

## Implementation Notes

* Configuration is loaded at application startup.
* No domain package reads env vars.
* Support separate Redis URLs per environment.
* Set timeouts and retry policy explicitly.

## Acceptance Criteria

* Redis client can be injected into API and worker.
* Misconfiguration fails fast at startup.

## Dependencies

* RUNTIME-83 — Runtime config loader

## Estimated Effort

60–120 minutes
