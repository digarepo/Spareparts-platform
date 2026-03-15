# Task: OBS15-002 — Structured Logging + Redaction

## Purpose

Implement structured logs with strict redaction so telemetry never becomes a leakage channel.

## Implementation Notes

- Adopt a consistent structured log schema:
  - timestamp
  - severity
  - request/correlation id
  - actor category (customer/tenant staff/platform staff) (no secrets)
  - active scope
  - tenant id when in tenant scope
  - event name
  - outcome
- Redact:
  - credentials
  - payment instrument data
  - sensitive PII fields as required

## Acceptance Criteria

- Logs are structured and queryable.
- Sensitive data is not logged.
