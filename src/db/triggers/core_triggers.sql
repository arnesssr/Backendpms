-- Data Integrity Triggers
CREATE OR REPLACE FUNCTION enforce_inventory_constraints()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure stock is never negative
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'Stock cannot be negative';
    END IF;
    
    -- Update status based on stock level
    NEW.status := CASE
        WHEN NEW.stock <= 0 THEN 'out_of_stock'
        WHEN NEW.stock <= NEW.minimum_stock THEN 'low_stock'
        ELSE 'in_stock'
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_inventory_constraints
    BEFORE INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION enforce_inventory_constraints();

-- Audit Logging Trigger
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        event_type,
        table_name,
        record_id,
        old_data,
        new_data,
        user_id,
        ip_address
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        current_setting('app.current_user_id', true),
        current_setting('app.client_ip', true)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
