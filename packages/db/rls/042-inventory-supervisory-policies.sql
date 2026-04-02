-- Materialized view for inventory summaries (performance optimization)
CREATE MATERIALIZED VIEW inventory_summary_mv AS
SELECT
    ii.tenant_id,
    COUNT(*) as total_variants,
    SUM(ii.on_hand_quantity) as total_on_hand,
    SUM(ii.on_hand_quantity - ii.reserved_quantity - ii.allocated_quantity) as total_available,
    COUNT(CASE WHEN (ii.on_hand_quantity - ii.reserved_quantity - ii.allocated_quantity) <= 5 THEN 1 END) as low_stock_count,
    COUNT(CASE WHEN (ii.on_hand_quantity - ii.reserved_quantity - ii.allocated_quantity) = 0 THEN 1 END) as out_of_stock_count,
    MAX(ii.updated_at) as last_updated,
    now() as refresh_timestamp
FROM inventory_items ii
GROUP BY ii.tenant_id;

-- Index for materialized view performance
CREATE UNIQUE INDEX idx_inventory_summary_tenant ON inventory_summary_mv (tenant_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_inventory_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY inventory_summary_mv;
END;
$$ LANGUAGE plpgsql;

-- Supervisor view functions
CREATE OR REPLACE FUNCTION get_all_inventory_summary()
RETURNS TABLE (
    tenant_id TEXT,
    total_variants BIGINT,
    total_on_hand BIGINT,
    total_available BIGINT,
    low_stock_count BIGINT,
    out_of_stock_count BIGINT,
    last_updated TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tenant_id,
        total_variants,
        total_on_hand,
        total_available,
        low_stock_count,
        out_of_stock_count,
        last_updated
    FROM inventory_summary_mv
    ORDER BY tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_tenant_inventory_details(p_tenant_id TEXT)
RETURNS TABLE (
    catalog_variant_id TEXT,
    on_hand_quantity BIGINT,
    reserved_quantity BIGINT,
    allocated_quantity BIGINT,
    available_quantity BIGINT,
    is_active BOOLEAN,
    is_sellable BOOLEAN,
    low_stock_threshold BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    -- Verify supervisor role
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'platform_supervisor'
        AND pg_has_role(session_user, 'platform_supervisor', 'MEMBER')
    ) THEN
        RAISE EXCEPTION 'Access denied: Platform supervisor role required';
    END IF;

    RETURN QUERY
    SELECT
        ii.catalog_variant_id,
        ii.on_hand_quantity,
        ii.reserved_quantity,
        ii.allocated_quantity,
        ii.on_hand_quantity - ii.reserved_quantity - ii.allocated_quantity as available_quantity,
        ii.is_active,
        ii.is_sellable,
        ii.low_stock_threshold,
        ii.created_at,
        ii.updated_at
    FROM inventory_items ii
    WHERE ii.tenant_id = p_tenant_id
    ORDER BY ii.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit functions for supervisors (with fixed joins)
CREATE OR REPLACE FUNCTION get_inventory_audit_events(
    p_tenant_id TEXT DEFAULT NULL,
    p_catalog_variant_id TEXT DEFAULT NULL,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL,
    p_limit BIGINT DEFAULT 100
)
RETURNS TABLE (
    id TEXT,
    tenant_id TEXT,
    inventory_id TEXT,
    catalog_variant_id TEXT,
    event_type TEXT,
    reason TEXT,
    initiated_by TEXT,
    created_at TIMESTAMP,
    metadata JSONB
) AS $$
BEGIN
    -- Verify supervisor role
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'platform_supervisor'
        AND pg_has_role(session_user, 'platform_supervisor', 'MEMBER')
    ) THEN
        RAISE EXCEPTION 'Access denied: Platform supervisor role required';
    END IF;

    RETURN QUERY
    SELECT
        iae.id,
        iae.tenant_id,
        iae.inventory_id,
        ii.catalog_variant_id,
        iae.event_type,
        iae.reason,
        iae.initiated_by,
        iae.created_at,
        iae.metadata
    FROM inventory_audit_events iae
    LEFT JOIN inventory_items ii ON iae.inventory_id = ii.id
    WHERE
        (p_tenant_id IS NULL OR iae.tenant_id = p_tenant_id)
        AND (p_catalog_variant_id IS NULL OR ii.catalog_variant_id = p_catalog_variant_id)
        AND (p_start_date IS NULL OR iae.created_at >= p_start_date)
        AND (p_end_date IS NULL OR iae.created_at <= p_end_date)
    ORDER BY iae.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supervisor access with audit trail
CREATE OR REPLACE FUNCTION supervisor_view_inventory(p_tenant_id TEXT, p_catalog_variant_id TEXT)
RETURNS TABLE (
    id TEXT,
    tenant_id TEXT,
    catalog_variant_id TEXT,
    on_hand_quantity BIGINT,
    reserved_quantity BIGINT,
    allocated_quantity BIGINT,
    available_quantity BIGINT,
    is_active BOOLEAN,
    is_sellable BOOLEAN,
    low_stock_threshold BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
DECLARE
    supervisor_id TEXT;
BEGIN
    -- Verify supervisor role
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'platform_supervisor'
        AND pg_has_role(session_user, 'platform_supervisor', 'MEMBER')
    ) THEN
        RAISE EXCEPTION 'Access denied: Platform supervisor role required';
    END IF;

    -- Get supervisor identity
    supervisor_id := current_setting('app.current_identity_id', true);

    -- Log supervisor access
    INSERT INTO inventory_audit_events (
        tenant_id,
        inventory_id,
        event_type,
        reason,
        initiated_by,
        metadata
    ) VALUES (
        p_tenant_id,
        (SELECT id FROM inventory_items WHERE tenant_id = p_tenant_id AND catalog_variant_id = p_catalog_variant_id LIMIT 1),
        'supervisor_access',
        'Platform supervisor viewing inventory data',
        supervisor_id,
        json_build_object(
            'operation', 'view',
            'catalog_variant_id', p_catalog_variant_id,
            'timestamp', now(),
            'system', 'supervisory_access'
        )
    );

    RETURN QUERY
    SELECT
        ii.id,
        ii.tenant_id,
        ii.catalog_variant_id,
        ii.on_hand_quantity,
        ii.reserved_quantity,
        ii.allocated_quantity,
        ii.on_hand_quantity - ii.reserved_quantity - ii.allocated_quantity as available_quantity,
        ii.is_active,
        ii.is_sellable,
        ii.low_stock_threshold,
        ii.created_at,
        ii.updated_at
    FROM inventory_items ii
    WHERE ii.tenant_id = p_tenant_id
    AND ii.catalog_variant_id = p_catalog_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supervisor access logging table
CREATE TABLE IF NOT EXISTS supervisor_access_log (
    id TEXT PRIMARY KEY DEFAULT generate_ulid(),
    supervisor_id TEXT NOT NULL,
    tenant_id TEXT,
    operation_type TEXT NOT NULL,
    operation_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS for supervisor access log
ALTER TABLE supervisor_access_log ENABLE ROW LEVEL SECURITY;

-- Policy for supervisor access log
CREATE POLICY supervisor_access_log_policy ON supervisor_access_log
FOR ALL TO platform_supervisor
USING (supervisor_id = current_setting('app.current_identity_id', true));

-- Supervisor access logging trigger
CREATE OR REPLACE FUNCTION log_supervisor_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO supervisor_access_log (
        supervisor_id,
        tenant_id,
        operation_type,
        operation_details,
        ip_address,
        user_agent
    ) VALUES (
        current_setting('app.current_identity_id', true),
        COALESCE(current_setting('app.target_tenant_id', true), current_setting('app.current_tenant_id', true)),
        TG_TABLE_NAME,
        json_build_object(
            'operation', TG_OP,
            'function', TG_NAME,
            'timestamp', now()
        ),
        current_setting('app.ip_address', true),
        current_setting('app.user_agent', true)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
