-- Audit logging function
create or replace function log_inventory_change()
returns trigger as $$
begin
  insert into audit_logs (
    event_type,
    table_name,
    record_id,
    old_data,
    new_data,
    user_id,
    created_at
  ) values (
    TG_OP,
    TG_TABLE_NAME,
    coalesce(NEW.product_id, OLD.product_id),
    case when TG_OP != 'INSERT' then row_to_json(OLD) else null end,
    case when TG_OP != 'DELETE' then row_to_json(NEW) else null end,
    current_setting('app.current_user_id', true),
    now()
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Apply audit trigger to inventory
create trigger inventory_audit_trigger
  after insert or update or delete on inventory
  for each row execute function log_inventory_change();
