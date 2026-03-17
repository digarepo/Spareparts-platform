-- Tenancy RLS Policies
-- Deny-by-default posture: if context is missing or mismatched, no rows are visible.

-- TenantMembership is tenant-scoped and MUST be filtered by app.tenant_id when in tenant scope.
alter table "TenantMembership" enable row level security;

-- Explicitly force RLS (prevent bypass by table owner in some contexts)
alter table "TenantMembership" force row level security;

-- Read policy: tenant actor can only see memberships for their tenant context.
drop policy if exists tenant_membership_select on "TenantMembership";
create policy tenant_membership_select
on "TenantMembership"
for select
using (
  app.current_actor_kind() = 'tenant'
  and "tenantId" = app.current_tenant_id()
);

 -- Insert policy: tenant actor can only insert rows for their tenant context.
drop policy if exists tenant_membership_insert on "TenantMembership";
create policy tenant_membership_insert
on "TenantMembership"
for insert
with check (
  app.current_actor_kind() = 'tenant'
  and "tenantId" = app.current_tenant_id()
);

 -- Update policy: tenant actor can only update rows for their tenant context.
drop policy if exists tenant_membership_update on "TenantMembership";
create policy tenant_membership_update
on "TenantMembership"
for update
using (
  app.current_actor_kind() = 'tenant'
  and "tenantId" = app.current_tenant_id()
)
with check (
  app.current_actor_kind() = 'tenant'
  and "tenantId" = app.current_tenant_id()
);

-- Delete policy: tenant actor can only delete rows for their tenant context.
drop policy if exists tenant_membership_delete on "TenantMembership";
create policy tenant_membership_delete
on "TenantMembership"
for delete
using (
  app.current_actor_kind() = 'tenant'
  and "tenantId" = app.current_tenant_id()
);
