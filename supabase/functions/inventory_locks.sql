-- Lock inventory function
create or replace function lock_inventory(p_product_id uuid)
returns void as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_product_id::text));
end;
$$ language plpgsql;

-- Unlock inventory function
create or replace function unlock_inventory(p_product_id uuid)
returns void as $$
begin
  perform pg_advisory_xact_unlock(hashtext(p_product_id::text));
end;
$$ language plpgsql;
