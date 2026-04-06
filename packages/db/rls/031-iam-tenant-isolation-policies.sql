-- RLS-31: IAM tenant isolation policies
-- Blueprints: Domain B (Data & Environment Enforcement), Domain C (Identity & Scope)
-- Phase: 03 IAM

-- Strict tenant isolation for IAM tenant-scoped data
-- Deny-by-default: if context is missing or mismatched, no rows are visible

-- SECURITY DEFINER functions to avoid recursive RLS performance issues
-- These functions bypass RLS for cross-table validation while maintaining security

CREATE OR REPLACE FUNCTION app.can_access_account(account_id_param TEXT, scope_code_param TEXT, tenant_id_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    account_exists BOOLEAN;
BEGIN
    -- Direct query without RLS to check account access rights
    SELECT EXISTS(
        SELECT 1 FROM "Account"
        WHERE id = account_id_param
        AND roleCode = scope_code_param
        AND (tenant_id_param IS NULL OR "tenantId" = tenant_id_param)
    ) INTO account_exists;

    RETURN account_exists;
END;
$$;

CREATE OR REPLACE FUNCTION app.get_account_tenant_context(account_id_param TEXT)
RETURNS TABLE(scope_code TEXT, tenant_id TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT roleCode, "tenantId"
    FROM "Account"
    WHERE id = account_id_param;
END;
$$;

-- Account table policies - tenant-scoped accounts require tenantId
DROP POLICY IF EXISTS account_select ON "Account";
CREATE POLICY account_select ON "Account"
FOR SELECT
USING (
  -- Platform actors can see all accounts (supervisory access)
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  -- Tenant actors can only see accounts in their tenant context
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  -- Customer actors can only see customer accounts
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
);

DROP POLICY IF EXISTS account_insert ON "Account";
CREATE POLICY account_insert ON "Account"
FOR INSERT
WITH CHECK (
  -- Platform actors can insert platform-scoped accounts only
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform' AND "tenantId" IS NULL)
  OR
  -- Tenant actors can only insert tenant-scoped accounts for their tenant
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  -- Customer actors can only insert customer accounts for their tenant
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
);

DROP POLICY IF EXISTS account_update ON "Account";
CREATE POLICY account_update ON "Account"
FOR UPDATE
USING (
  -- Platform actors can update platform accounts only
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  -- Tenant actors can only update tenant accounts in their context
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  -- Customer actors can only update customer accounts in their context
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
)
WITH CHECK (
  -- CRITICAL: Prevent scope or tenant changes that would violate isolation
  -- This ensures accounts cannot be "stolen" by moving them to another tenant
  "roleCode" = (SELECT "roleCode" FROM "Account" WHERE id = "id")
  AND "tenantId" = (SELECT "tenantId" FROM "Account" WHERE id = "id")
  AND (
    -- Platform actors can only update platform accounts
    (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform' AND "tenantId" IS NULL)
    OR
    -- Tenant actors can only update tenant accounts in their tenant
    (app.current_actor_kind() = 'tenant'
     AND "roleCode" = 'tenant'
     AND "tenantId" = app.current_tenant_id())
    OR
    -- Customer actors can only update customer accounts in their tenant
    (app.current_actor_kind() = 'customer'
     AND "roleCode" = 'customer'
     AND "tenantId" = app.current_tenant_id())
  )
);

-- Session table policies - sessions inherit account's tenant scope
-- Add session type validation to prevent cross-type session access

DROP POLICY IF EXISTS session_select ON "Session";
CREATE POLICY session_select ON "Session"
FOR SELECT
USING (
  -- Platform actors can see platform account sessions
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  -- Tenant actors can only see sessions for accounts in their tenant
  -- AND matching session type to prevent cross-type access
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id()
   AND (current_setting('app.session_type', true) IS NULL
        OR current_setting('app.session_type', true) = 'tenant'))
  OR
  -- Customer actors can only see customer sessions in their tenant
  -- AND matching session type to prevent cross-type access
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id()
   AND (current_setting('app.session_type', true) IS NULL
        OR current_setting('app.session_type', true) = 'customer'))
);

DROP POLICY IF EXISTS session_insert ON "Session";
CREATE POLICY session_insert ON "Session"
FOR INSERT
WITH CHECK (
  -- Use SECURITY DEFINER function to avoid recursive RLS performance issue
  app.can_access_account(
    "accountId",
    (SELECT scope_code FROM app.get_account_tenant_context("accountId")),
    (SELECT tenant_id FROM app.get_account_tenant_context("accountId"))
  )
  AND (
    -- Session type must match actor type or be null for backward compatibility
    current_setting('app.session_type', true) IS NULL
    OR (app.current_actor_kind() = 'tenant' AND current_setting('app.session_type', true) = 'tenant')
    OR (app.current_actor_kind() = 'customer' AND current_setting('app.session_type', true) = 'customer')
    OR (app.current_actor_kind() = 'platform' AND current_setting('app.session_type', true) = 'platform')
  )
);

-- AccountRole table policies - role assignments are tenant-scoped
DROP POLICY IF EXISTS account_role_select ON "AccountRole";
CREATE POLICY account_role_select ON "AccountRole"
FOR SELECT
USING (
  -- Platform actors can see platform role assignments
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  -- Tenant actors can only see role assignments for accounts in their tenant
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  -- Customer actors can only see customer role assignments in their tenant
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
);

DROP POLICY IF EXISTS account_role_insert ON "AccountRole";
CREATE POLICY account_role_insert ON "AccountRole"
FOR INSERT
WITH CHECK (
  -- Use SECURITY DEFINER function to avoid recursive RLS performance issue
  app.can_access_account(
    "accountId",
    (SELECT scope_code FROM app.get_account_tenant_context("accountId")),
    (SELECT tenant_id FROM app.get_account_tenant_context("accountId"))
  )
  AND (
    -- Role assignments must match the actor's scope and tenant context
    (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
    OR
    (app.current_actor_kind() = 'tenant'
     AND "roleCode" = 'tenant'
     AND "tenantId" = app.current_tenant_id())
    OR
    (app.current_actor_kind() = 'customer'
     AND "roleCode" = 'customer'
     AND "tenantId" = app.current_tenant_id())
  )
);

-- RolePermission table policies - permission grants are scope-bound
DROP POLICY IF EXISTS role_permission_select ON "RolePermission";
CREATE POLICY role_permission_select ON "RolePermission"
FOR SELECT
USING (
  -- Platform actors can see platform role permissions
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  -- Tenant actors can only see tenant role permissions
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  -- Customer actors can only see customer role permissions
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
);

DROP POLICY IF EXISTS role_permission_insert ON "RolePermission";
CREATE POLICY role_permission_insert ON "RolePermission"
FOR INSERT
WITH CHECK (
  -- Permission grants must match the actor's scope and tenant context
  (app.current_actor_kind() = 'platform' AND "roleCode" = 'platform')
  OR
  (app.current_actor_kind() = 'tenant'
   AND "roleCode" = 'tenant'
   AND "tenantId" = app.current_tenant_id())
  OR
  (app.current_actor_kind() = 'customer'
   AND "roleCode" = 'customer'
   AND "tenantId" = app.current_tenant_id())
);

-- Force RLS on all IAM tables to prevent bypass
ALTER TABLE "Account" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AccountRole" FORCE ROW LEVEL SECURITY;
ALTER TABLE "RolePermission" FORCE ROW LEVEL SECURITY;
