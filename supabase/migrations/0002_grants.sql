-- Los proyectos nuevos de Supabase no otorgan privilegios por defecto sobre las tablas de public.
-- RLS sigue decidiendo qué filas ve cada quien; esto solo habilita el acceso a nivel de tabla.
grant usage on schema public to authenticated, service_role;

grant all on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function fn_seller_actual(), fn_es_gestor(), fn_es_admin(), fn_dueno_actual(uuid), fn_reasignar_lead(uuid, uuid) to authenticated;
