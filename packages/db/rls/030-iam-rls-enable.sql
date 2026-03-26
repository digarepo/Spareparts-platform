-- RLS-30: Enable RLS on IAM tables
-- Blueprint: Domain B (Data & Environment Enforcement)
-- Phase: 03 IAM

-- Enable Row Level Security on tenant-scoped IAM tables
-- These tables contain tenantId and must be protected for multi-tenant isolation

-- Account table - tenant-scoped accounts require tenantId
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

-- Session table - sessions are tenant-scoped when account is tenant-scoped
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- AccountRole join table - role assignments are tenant-scoped
ALTER TABLE "AccountRole" ENABLE ROW LEVEL SECURITY;

-- RolePermission table - permission grants are scope-bound
ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;

-- Note: Tables NOT requiring RLS (platform-scoped only):
-- - Identity: scope-agnostic, no tenant data
-- - PasswordCredential: identity-scoped only, no tenant data  
-- - Role: scope-bound but no tenantId (lookup table)
-- - Permission: scope-bound but no tenantId (lookup table)

-- Verification queries to confirm RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('Account', 'Session', 'AccountRole', 'RolePermission')
  AND schemaname = 'public'
ORDER BY tablename;
