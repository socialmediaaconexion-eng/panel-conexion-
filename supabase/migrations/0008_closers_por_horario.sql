-- 20-nov-2026: el reparto automático y la agenda toman a cualquier closer activo (admin incluido)
-- que tenga horarios cargados. Antes solo rol = 'vendedor', lo que dejaba fuera a Alex (admin + closer).
create or replace function fn_asignar_round_robin(p_lead uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_dueno uuid;
  v_elegido uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_lead::text));
  v_dueno := fn_dueno_actual(p_lead);
  if v_dueno is not null then
    return v_dueno;
  end if;
  select s.id into v_elegido
  from sellers s
  left join lateral (select max(la.created_at) as ultima from lead_assignments la where la.seller_id = s.id) u on true
  where s.activo and s.tipo = 'closer' and exists (select 1 from horarios h where h.seller_id = s.id)
  order by u.ultima nulls first, s.created_at
  limit 1;
  if v_elegido is null then
    return null;
  end if;
  insert into lead_assignments (lead_id, seller_id, motivo) values (p_lead, v_elegido, 'auto:round_robin');
  return v_elegido;
end;
$$;
