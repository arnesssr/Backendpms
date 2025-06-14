-- State change tracking trigger
CREATE OR REPLACE FUNCTION track_state_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        event_type,
        details,
        severity,
        metadata
    ) VALUES (
        TG_TABLE_NAME || '.' || TG_OP,
        'State change in ' || TG_TABLE_NAME,
        'info',
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'old_state', row_to_json(OLD),
            'new_state', row_to_json(NEW),
            'timestamp', now()
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER track_product_changes
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION track_state_changes();

CREATE TRIGGER track_inventory_changes
    AFTER INSERT OR UPDATE OR DELETE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION track_state_changes();
