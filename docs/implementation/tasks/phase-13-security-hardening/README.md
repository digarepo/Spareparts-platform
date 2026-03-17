# Phase 13 — Security & Trust Hardening

This phase operationalizes the security hardening and trust-boundary requirements from the architecture blueprints.

Primary blueprints:
- Domain AC — Security Hardening & Threat Boundaries
- Domain C/D/E/F — IAM boundaries (hardening + verification posture)
- Domain AE — secrets/ops posture aspects (implementation; deep ops isolation is Phase 15)

## Principles (authoritative)

- Hardening must **not** mutate domain semantics.
- All trust boundaries must be explicit and fail-closed.
- Protective controls (rate limiting, abuse prevention) constrain *frequency* not *meaning*.
- Detection signals must not become enforcement logic.

## MVP-complete (definition for this phase)

- External surfaces have baseline protective controls (rate limiting, abuse prevention) with explicit failure semantics.
- Auth/session/cookie posture is hardened with secure defaults.
- Cross-tenant leakage regression checks exist.
- Security posture is documented and reviewable.

## Task numbering convention

Files in this phase use IDs of the form `SEC13-###`.
