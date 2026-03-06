# Data Architecture and Authority

PostgreSQL is the single authoritative data store for the platform.

All tenant isolation is enforced at the database level using Row-Level Security
(RLS). Application-level authorization is considered defense in depth and must
never be relied upon as the primary enforcement mechanism.

Derived data systems (such as search indexes) are non-authoritative and must
never be treated as a source of truth.
