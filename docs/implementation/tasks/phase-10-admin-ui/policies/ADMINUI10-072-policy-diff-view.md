# Task: ADMINUI10-072 — Policy Diff View

## Purpose

Allow admins to understand what changed between policy versions.

## Implementation Notes

- Provide a diff UI for policy changes:
  - select two versions (or current vs previous)
  - render a structured diff for JSON-like policies
- Ensure sensitive fields are redacted if necessary.

## Acceptance Criteria

- Diff view renders deterministically.
- Diff view is permission-gated.
