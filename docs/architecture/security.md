# Security Model

Authentication and authorization are explicit and contract-driven.

Identity, role membership, and tenant scope are always resolved explicitly and
never inferred implicitly.

JWT-based authentication is used for API access. Secrets are provided via
environment variables and are never committed to source control.
