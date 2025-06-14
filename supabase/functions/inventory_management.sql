-- Update inventory quantity with validation
create or replace function update_inventory_quantity(
  p_product_id uuid,
  p_quantity_change integer
) returns void as $$
begin
  -- Lock the inventory record
  perform lock_inventory(p_product_id);
  
  update inventory
  set 
    quantity = quantity + p_quantity_change,
    status = case 
      when quantity + p_quantity_change > 0 then 'in_stock'
      else 'out_of_stock'
    end,
    updated_at = now()
  where product_id = p_product_id;
end;
$$ language plpgsql;

-- Handle stock movement with location support
create or replace function handle_stock_movement(
  p_product_id uuid,
  p_location_id uuid,
  p_quantity integer,
  p_reference text default null
) returns void as $$
begin
  -- Lock both product and location
  perform lock_inventory(p_product_id);
  
  -- Update location inventory
  update location_inventory
  set quantity = quantity + p_quantity
  where product_id = p_product_id and location_id = p_location_id;
  
  -- Update main inventory
  perform update_inventory_quantity(p_product_id, p_quantity);
  
  -- Record movement
  insert into stock_movements (
    product_id,
    location_id,
    quantity,
    reference,
    created_at
  ) values (
    p_product_id,
    p_location_id,
    p_quantity,
    p_reference,
    now()
  );
end;
$$ language plpgsql;
