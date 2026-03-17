-- RLS Context Foundations
-- This file defines the session context conventions used by RLS policies.

-- We treat missing context as invalid and rely on policies to fail closed.

-- Convention:
-- - app.tenant_id : ID of tenant context when executing under tenant scope
-- - app.actor_kind: one of: 'platform' | 'tenant' | 'customer' | 'anonymous'

-- Helpers (optional but useful for readable policies)

create schema if not exists app;

create or replace function app.current_tenant_id()
returns text
language sql
stable
as $$
    select nullif(current_setting('app.tenant_id', true), '');
$$;

create or replace function app.current_actor_kind()
returns text
language sql
stable
as $$
    select nullif(current_setting('app.actor_kind', true), '');
$$;
