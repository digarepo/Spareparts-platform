# Task: ES-90 — Elasticsearch client module + configuration
Blueprint: TECH_STACK (Elasticsearch mandatory), Domain B (config external to domain)
Phase: 09 Search

## Layer

infrastructure

## Package / Area

packages/infra/search

## Purpose

Implement a single Elasticsearch client module with validated runtime configuration.

## Implementation Location

* packages/infra/search/src/es.client.ts
* packages/infra/search/src/es.config.ts

## Implementation Notes

* Configuration is loaded at startup (API + worker).
* Set timeouts and retry policy explicitly.
* Do not let ES availability affect core platform operations.

## Acceptance Criteria

* ES client is injectable and testable.
* Startup fails fast on invalid configuration.

## Dependencies

* Phase 08 runtime config loader (RUNTIME-83)

## Estimated Effort

60–120 minutes
