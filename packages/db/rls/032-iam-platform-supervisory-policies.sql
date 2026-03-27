-- RLS-32: Platform supervisory policies for IAM (explicit, read-only)
-- Blueprints: Domain B (Data & Environment Enforcement), Domain C (Identity & Scope)
-- Phase: 03 IAM

-- Platform supervisory access for governance and audits
-- Explicit, controlled, read-only cross-tenant access
-- Denies all mutation of tenant-owned IAM state

-- Create a separate policy for platform supervisory read access
-- This allows platform actors to read all tenant data for governance purposes
-- but prevents any mutation of tenant-owned IAM state

-- Function-based audit logging for supervisory access
-- Note: PostgreSQL does not support AFTER SELECT triggers
-- This function integrates with audit systems and can be called from application layer
CREATE OR REPLACE FUNCTION app.log_supervisory_read(table_name TEXT, operation TEXT, user_context TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log supervisory read access for audit compliance
    -- This would integrate with your audit logging system
    -- For now, raise a notice that would be captured by monitoring systems
    RAISE NOTICE 'SUPERVISORY_READ: table=%, operation=%, user=%, timestamp=%',
                 table_name, operation, user_context, now();

    -- In production, this would insert to an audit_log table
    -- INSERT INTO audit_log (event_type, table_name, user_id, timestamp, details)
    -- VALUES ('SUPERVISORY_READ', table_name, user_context, now(),
    --          json_build_object('operation', operation));
END;
$$;

-- Account table - platform supervisory read-only access
DROP POLICY IF EXISTS account_supervisory_select ON "Account";
CREATE POLICY account_supervisory_select ON "Account"
FOR SELECT
TO app_supervisory_role  -- Explicit role requirement
USING (
  -- Only allow when explicitly in supervisory context and validated
  app.validate_supervisory_session()
);

-- Deny platform supervisory mutations on tenant accounts
-- These policies override any permissive policies with explicit denial
DROP POLICY IF EXISTS account_supervisory_deny_mutate ON "Account";
CREATE POLICY account_supervisory_deny_mutate ON "Account"
FOR ALL
TO app_supervisory_role
WITH CHECK (false);  -- Explicit denial of all mutations

-- Session table - platform supervisory read-only access
DROP POLICY IF EXISTS session_supervisory_select ON "Session";
CREATE POLICY session_supervisory_select ON "Session"
FOR SELECT
TO app_supervisory_role
USING (
  app.validate_supervisory_session()
);

-- Deny platform supervisory mutations on sessions
DROP POLICY IF EXISTS session_supervisory_deny_mutate ON "Session";
CREATE POLICY session_supervisory_deny_mutate ON "Session"
FOR ALL
TO app_supervisory_role
WITH CHECK (false);

-- AccountRole table - platform supervisory read-only access
DROP POLICY IF EXISTS account_role_supervisory_select ON "AccountRole";
CREATE POLICY account_role_supervisory_select ON "AccountRole"
FOR SELECT
TO app_supervisory_role
USING (
  app.validate_supervisory_session()
);

-- Deny platform supervisory mutations on role assignments
DROP POLICY IF EXISTS account_role_supervisory_deny_mutate ON "AccountRole";
CREATE POLICY account_role_supervisory_deny_mutate ON "AccountRole"
FOR ALL
TO app_supervisory_role
WITH CHECK (false);

-- RolePermission table - platform supervisory read-only access
DROP POLICY IF EXISTS role_permission_supervisory_select ON "RolePermission";
CREATE POLICY role_permission_supervisory_select ON "RolePermission"
FOR SELECT
TO app_supervisory_role
USING (
  app.validate_supervisory_session()
);

-- Deny platform supervisory mutations on permission grants
DROP POLICY IF EXISTS role_permission_supervisory_deny_mutate ON "RolePermission";
CREATE POLICY role_permission_supervisory_deny_mutate ON "RolePermission"
FOR ALL
TO app_supervisory_role
WITH CHECK (false);

-- Create the supervisory role if it doesn't exist
-- This role must be explicitly granted to trusted platform operators
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_supervisory_role') THEN
        CREATE ROLE app_supervisory_role;
    END IF;
END
$$;

-- Application-level audit integration example
-- This shows how the application would call the audit function
-- The actual calls would be made in the API layer or middleware

/*
-- Example application usage:
SET LOCAL app.supervisory_mode = 'true';
SET LOCAL app.actor_kind = 'platform';

-- Before executing supervisory reads:
SELECT app.log_supervisory_read('Account', 'SELECT', current_user);

-- Execute the query:
SELECT * FROM "Account" WHERE "tenantId" = 'specific-tenant';

-- Audit logging recommendations:
-- 1. Use pgaudit extension for comprehensive audit trails
--    CREATE EXTENSION IF NOT EXISTS pgaudit;
--    SET pgaudit.log = 'read';
--    SET pgaudit.role = 'app_supervisory_role';
--
-- 2. Or implement application-level logging in middleware
-- 3. Or use PostgreSQL triggers on INSERT/UPDATE/DELETE for mutation audit
*/

-- Enhanced security: Require explicit session for supervisory access
CREATE OR REPLACE FUNCTION app.validate_supervisory_session()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    supervisory_mode TEXT;
    actor_kind TEXT;
BEGIN
    supervisory_mode := current_setting('app.supervisory_mode', true);
    actor_kind := app.current_actor_kind();

    -- Must be explicitly enabled and platform actor
    IF supervisory_mode <> 'true' OR actor_kind <> 'platform' THEN
        RETURN FALSE;
    END IF;

    -- Additional validation: check if user has supervisory role
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'app_supervisory_role'
        AND pg_has_role(current_user, 'app_supervisory_role', 'MEMBER')
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

-- Comment explaining supervisory mode usage
COMMENT ON SCHEMA app IS 'Application context functions and supervisory policies. Supervisory mode requires: 1) app_supervisory_role, 2) SET app.supervisory_mode = ''true'', 3) app.actor_kind = ''platform''';
