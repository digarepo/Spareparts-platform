# Task: ADMINUI10-009 — Permission-aware Client Logging

## Purpose

Add minimal client logging that supports debugging without leaking sensitive content.

## Implementation Notes

- Log only:
  - route
  - status codes
  - correlation ids
  - feature identifiers
- Never log raw payloads that may contain sensitive information.

## Acceptance Criteria

- Logs contain actionable references for support without exposing sensitive data.
