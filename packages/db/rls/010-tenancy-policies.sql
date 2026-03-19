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

--Catalog RLS policies
--Enable RLs on catalog tables
alter table "Product" enable row level security;
alter table "Product" force row level security;

alter table "Variant" enable row level security;
alter table "Variant" force row level security;

alter table "Price" enable row level security;
alter table "Price" force row level security;

alter table "Inventory" enable row level security;
alter table "Inventory" force row level security;

-- Product: tenant-scoped
drop policy if exists product_tenant_select on "Product";
create policy product_tenant_select
on "Product"
for select
using (
  app.current_actor_kind() = 'tenant'
  and "id" in (
    select "id" from "Product" where "tenantId" = app.current_tenant_id()
  )
);

--Variant: tenant-scoped via product
drop policy if exists variant_tenant_select on "Variant";
create policy variant_tenant_select
on "Variant"
for select
using (
  app.current_actor_kind() = 'tenant'
  and "productId" in (
    select "id" from "Product"
    where "tenantId" = app.current_tenant_id();
  )
);

-- Price: tenant-scoped via variant
drop policy if exists price_tenant_select on "Price";
create policy price_tenant_select
on "Price"
for select
using (
  app.current_actor_kind() = 'tenant'
  and "variantId" in (
    select "id" from "Variant"
    where "productId" in (
      select "id" from "Product"
      where "tenantId" = app.current_tenant_id()
    )
  )
);

-- Inventory tenant-scoped via Variant
drop policy if exists inventory_tenant_select on "Inventory";
create policy inventory_tenant_select
on "Inventory"
for select
using (
  app.current_actor_kind() = 'tenant'
  and "variantId" in (
    select "id" from "Variant"
    where "productId" in (
      select "id" from "Product"
      where "tenantId" = app.current_tenant_id()
    )
  )
);
