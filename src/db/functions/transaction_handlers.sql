-- Atomic inventory update
CREATE OR REPLACE FUNCTION update_inventory_atomically(
    p_product_id UUID,
    p_quantity INTEGER,
    p_operation VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Lock the inventory record
    SELECT stock INTO v_current_stock
    FROM inventory
    WHERE product_id = p_product_id
    FOR UPDATE;

    -- Calculate new stock
    v_new_stock := CASE p_operation
        WHEN 'add' THEN v_current_stock + p_quantity
        WHEN 'subtract' THEN v_current_stock - p_quantity
        ELSE v_current_stock
    END;

    -- Validate stock level
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock';
    END IF;

    -- Update inventory
    UPDATE inventory
    SET 
        stock = v_new_stock,
        status = CASE
            WHEN v_new_stock > 0 THEN 'in_stock'
            ELSE 'out_of_stock'
        END,
        updated_at = NOW()
    WHERE product_id = p_product_id;

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
