# Task: DEPLOY-80 — Add Redis to local development via Docker Compose
Blueprint: TECH_STACK (Docker compose dev, Redis required)
Phase: 08 Infrastructure & Runtime

## Layer

deployment

## Package / Area

infrastructure/docker

## Purpose

Provide a consistent local Redis dependency for development and testing.

## Implementation Location

* docker-compose.yml (or infrastructure/compose/docker-compose.yml)

## Implementation Notes

* Configure:
  * redis service
  * volumes optional
  * port mapping for local dev
* Ensure environment variables are documented.

## Acceptance Criteria

* Developers can start Redis locally with the standard compose workflow.

## Dependencies

* REDIS-81

## Estimated Effort

30–60 minutes
