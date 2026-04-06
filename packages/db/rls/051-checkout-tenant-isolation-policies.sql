-- =============================================================================
-- CHECKOUT TENANT ISOLATION POLICIES (Performance Optimized)
-- =============================================================================
-- Customer-owned carts, tenant-responsible orders with fail-closed security
-- Optimized for high-volume environments with denormalized customerId

-- =============================================================================
-- CART RLS POLICIES (Customer-scoped access with performance optimization)
-- =============================================================================

-- Enable RLS on cart tables
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts FORCE ROW LEVEL SECURITY;

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items FORCE ROW LEVEL SECURITY;

ALTER TABLE cart_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_status_history FORCE ROW LEVEL SECURITY;

-- Cart SELECT policy: Optimized with direct customerId comparison
DROP POLICY IF EXISTS cart_select ON carts;
CREATE POLICY cart_select ON carts
FOR SELECT
USING (
    -- Customer scope: only own carts (direct comparison for performance)
    (app.current_actor_kind() = 'customer' AND customer_id = current_setting('app.current_customer_id', true))
    OR
    -- Tenant scope: all carts in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Cart INSERT policy: Customers can only create carts for themselves
DROP POLICY IF EXISTS cart_insert ON carts;
CREATE POLICY cart_insert ON carts
FOR INSERT
WITH CHECK (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
    AND tenant_id = app.current_tenant_id()
);

-- Cart UPDATE policy: Customers can only update their own carts
DROP POLICY IF EXISTS cart_update ON carts;
CREATE POLICY cart_update ON carts
FOR UPDATE
USING (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
)
WITH CHECK (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
);

-- Cart DELETE policy: Use soft-delete instead of physical deletion
-- Customers don't delete carts, they change status to 'deleted'
DROP POLICY IF EXISTS cart_delete ON carts;
CREATE POLICY cart_delete ON carts
FOR DELETE
USING (false); -- Physical deletion disabled, use soft-delete

-- =============================================================================
-- CART ITEMS RLS POLICIES (Optimized with denormalized customerId)
-- =============================================================================

-- Cart Items SELECT policy: Optimized with direct customerId comparison
DROP POLICY IF EXISTS cart_item_select ON cart_items;
CREATE POLICY cart_item_select ON cart_items
FOR SELECT
USING (
    -- Customer scope: direct customerId comparison (no subquery)
    (app.current_actor_kind() = 'customer' AND customer_id = current_setting('app.current_customer_id', true))
    OR
    -- Tenant scope: all items in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Cart Items INSERT policy: Only for own carts
DROP POLICY IF EXISTS cart_item_insert ON cart_items;
CREATE POLICY cart_item_insert ON cart_items
FOR INSERT
WITH CHECK (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
    AND tenant_id = app.current_tenant_id()
    AND cart_id IN (
        SELECT id FROM carts WHERE customer_id = current_setting('app.current_customer_id', true)
    )
);

-- Cart Items UPDATE/DELETE policies: Via cart ownership
DROP POLICY IF EXISTS cart_item_update ON cart_items;
CREATE POLICY cart_item_update ON cart_items
FOR UPDATE
USING (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
)
WITH CHECK (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
);

DROP POLICY IF EXISTS cart_item_delete ON cart_items;
CREATE POLICY cart_item_delete ON cart_items
FOR DELETE
USING (
    app.current_actor_kind() = 'customer'
    AND customer_id = current_setting('app.current_customer_id', true)
);

-- =============================================================================
-- CART STATUS HISTORY RLS POLICIES (Optimized)
-- =============================================================================

-- Cart Status History SELECT policy: Optimized with direct join
DROP POLICY IF EXISTS cart_status_history_select ON cart_status_history;
CREATE POLICY cart_status_history_select ON cart_status_history
FOR SELECT
USING (
    -- Customer scope: history of own carts (direct comparison)
    (app.current_actor_kind() = 'customer' AND cart_id IN (
        SELECT id FROM carts WHERE customer_id = current_setting('app.current_customer_id', true)
    ))
    OR
    -- Tenant scope: all history in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Cart Status History INSERT policy: Automatic via triggers
DROP POLICY IF EXISTS cart_status_history_insert ON cart_status_history;
CREATE POLICY cart_status_history_insert ON cart_status_history
FOR INSERT
WITH CHECK (true); -- Inserted by trigger, not by users

-- =============================================================================
-- ORDER RLS POLICIES (Customer-owned, Tenant-responsible with granular controls)
-- =============================================================================

-- Enable RLS on order tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history FORCE ROW LEVEL SECURITY;

-- Order SELECT policy: Customers see own orders, tenants see all in their scope
DROP POLICY IF EXISTS order_select ON orders;
CREATE POLICY order_select ON orders
FOR SELECT
USING (
    -- Customer scope: only own orders
    (app.current_actor_kind() = 'customer' AND customer_id = current_setting('app.current_customer_id', true))
    OR
    -- Tenant scope: all orders in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Order INSERT policy: System and tenant operations only
DROP POLICY IF EXISTS order_insert ON orders;
CREATE POLICY order_insert ON orders
FOR INSERT
WITH CHECK (
    -- System operations (checkout process)
    (app.current_actor_kind() = 'system')
    OR
    -- Tenant operations (manual order creation)
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
);

-- Order UPDATE policy: Enhanced with status-based controls
DROP POLICY IF EXISTS order_update ON orders;
CREATE POLICY order_update ON orders
FOR UPDATE
USING (
    -- Customer scope: limited updates based on order status
    (app.current_actor_kind() = 'customer'
     AND customer_id = current_setting('app.current_customer_id', true)
     AND status IN (SELECT code FROM order_status WHERE allows_address_updates = true))
    OR
    -- Tenant scope: status updates and tenant operations
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- System scope: automated processing
    (app.current_actor_kind() = 'system')
)
WITH CHECK (
    -- Customer scope: same restrictions as USING
    (app.current_actor_kind() = 'customer'
     AND customer_id = current_setting('app.current_customer_id', true)
     AND status IN (SELECT code FROM order_status WHERE allows_address_updates = true))
    OR
    -- Tenant scope: tenant operations
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- System scope: automated processing
    (app.current_actor_kind() = 'system')
);

-- Order DELETE policy: System only (for data retention policies)
DROP POLICY IF EXISTS order_delete ON orders;
CREATE POLICY order_delete ON orders
FOR DELETE
USING (app.current_actor_kind() = 'system');

-- =============================================================================
-- ORDER ITEMS RLS POLICIES (Optimized with denormalized customerId)
-- =============================================================================

-- Order Items SELECT policy: Optimized with direct customerId comparison
DROP POLICY IF EXISTS order_item_select ON order_items;
CREATE POLICY order_item_select ON order_items
FOR SELECT
USING (
    -- Customer scope: direct customerId comparison (no subquery)
    (app.current_actor_kind() = 'customer' AND customer_id = current_setting('app.current_customer_id', true))
    OR
    -- Tenant scope: all items in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Order Items INSERT policy: System and tenant only
DROP POLICY IF EXISTS order_item_insert ON order_items;
CREATE POLICY order_item_insert ON order_items
FOR INSERT
WITH CHECK (
    (app.current_actor_kind() = 'system')
    OR
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
);

-- Order Items UPDATE/DELETE policies: System only
DROP POLICY IF EXISTS order_item_update ON order_items;
CREATE POLICY order_item_update ON order_items
FOR UPDATE
USING (app.current_actor_kind() = 'system');

DROP POLICY IF EXISTS order_item_delete ON order_items;
CREATE POLICY order_item_delete ON order_items
FOR DELETE
USING (app.current_actor_kind() = 'system');

-- =============================================================================
-- ORDER STATUS HISTORY RLS POLICIES (Optimized)
-- =============================================================================

-- Order Status History SELECT policy: Via order ownership
DROP POLICY IF EXISTS order_status_history_select ON order_status_history;
CREATE POLICY order_status_history_select ON order_status_history
FOR SELECT
USING (
    -- Customer scope: history of own orders
    (app.current_actor_kind() = 'customer' AND order_id IN (
        SELECT id FROM orders WHERE customer_id = current_setting('app.current_customer_id', true)
    ))
    OR
    -- Tenant scope: all history in tenant
    (app.current_actor_kind() = 'tenant' AND tenant_id = app.current_tenant_id())
    OR
    -- Platform scope: read-only access
    (app.current_actor_kind() = 'platform')
);

-- Order Status History INSERT policy: Automatic via triggers
DROP POLICY IF EXISTS order_status_history_insert ON order_status_history;
CREATE POLICY order_status_history_insert ON order_status_history
FOR INSERT
WITH CHECK (true); -- Inserted by trigger, not by users

-- =============================================================================
-- STATUS LOOKUP TABLES (Platform-owned, tenant-used)
-- =============================================================================

-- Enable RLS on status tables (read-only for tenants)
ALTER TABLE cart_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_status FORCE ROW LEVEL SECURITY;

ALTER TABLE order_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status FORCE ROW LEVEL SECURITY;

-- Status lookup policies: Read-only for all authenticated users
DROP POLICY IF EXISTS cart_status_select ON cart_status;
CREATE POLICY cart_status_select ON cart_status
FOR SELECT
USING (
    app.current_actor_kind() IN ('customer', 'tenant', 'platform')
);

DROP POLICY IF EXISTS order_status_select ON order_status;
CREATE POLICY order_status_select ON order_status
FOR SELECT
USING (
    app.current_actor_kind() IN ('customer', 'tenant', 'platform')
);

-- No insert/update/delete policies on lookup tables (platform-managed)
