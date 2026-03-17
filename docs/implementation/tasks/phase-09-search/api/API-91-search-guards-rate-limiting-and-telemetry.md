# Task: API-91 — Search guards, rate limiting, and telemetry (non-semantic)
Blueprint: Domain AC (rate limiting non-semantic), Domain AE (observability non-interference), Domain U (no unsafe results)
Phase: 09 Search

## Layer

api

## Package / Area

apps/api/src/http

## Purpose

Apply protective controls to search endpoints:
- authorization guards
- rate limiting
- observability hooks

Without changing search meaning or violating tenant isolation.

## Implementation Location

* apps/api/src/http/guards/search.guard.ts
* apps/api/src/http/middleware/rate-limit.middleware.ts
* packages/observability/*

## Implementation Notes

* Rate limiting must not be bypassable.
* Telemetry must not influence eligibility/ranking.

## Acceptance Criteria

* Guards applied to all search routes.
* Rate limiting configured by surface type.

## Dependencies

* Phase 08 SEC-80, SEC-82
* Phase 08 OBS-80..82

## Estimated Effort

60–120 minutes
