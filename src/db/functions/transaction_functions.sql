-- Event sourcing functions
CREATE OR REPLACE FUNCTION record_event(
    p_event_type TEXT,
    p_aggregate_type TEXT,
    p_aggregate_id UUID,
    p_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO event_store (
        event_type,
        aggregate_type,
        aggregate_id,
        event_data,
        sequence_number
    ) VALUES (
        p_event_type,
        p_aggregate_type,
        p_aggregate_id,
        p_data,
        (SELECT COALESCE(MAX(sequence_number), 0) + 1
         FROM event_store
         WHERE aggregate_id = p_aggregate_id)
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Transaction boundary functions
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void AS $$
BEGIN
    EXECUTE 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
    COMMIT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
    ROLLBACK;
END;
$$ LANGUAGE plpgsql;
