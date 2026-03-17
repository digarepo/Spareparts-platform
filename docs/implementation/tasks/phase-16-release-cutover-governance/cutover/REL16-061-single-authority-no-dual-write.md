# Task: REL16-061 — Single Authority Rule (No Dual-write)

## Purpose

Enforce the single-authority rule during cutover (Domain AG).

## Implementation Notes

- Ensure exactly one system is authoritative at any time.
- Explicitly forbid:
  - dual-write
  - shadow authority
  - parallel authoritative systems

## Acceptance Criteria

- Cutover plan asserts single-authority.
- No dual-write mechanisms exist.
