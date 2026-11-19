-- Panel Conexión — esquema inicial
-- Correr completo en el SQL Editor de un proyecto de Supabase NUEVO y propio de Conexión.

create extension if not exists pgcrypto;

-- ───────────────────────── Enums ─────────────────────────
create type rol_equipo as enum ('admin', 'manager', 'vendedor');
create type tipo_vendedor as enum ('closer', 'setter');
create type etapa_lead as enum ('nuevo', 'contactado', 'agendado', 'en_proceso_de_pago', 'cliente', 'perdido', 'lead_falso');
create type estado_cita as enum ('agendada', 'reagendada', 'atendida', 'no_asistio', 'cancelada');
create type estado_venta as enum ('pagada', 'con_saldo');
create type estado_handoff as enum ('pendiente', 'procesado');
create type estado_ticket as enum ('abierto', 'en_progreso', 'cerrado');
create type prioridad_ticket as enum ('baja', 'media', 'alta');

-- ───────────────────────── Equipo ─────────────────────────
create table sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nombre text not null,
  email text not null unique,
  whatsapp text,
  rol rol_equipo not null default 'vendedor',
  tipo tipo_vendedor not null default 'closer',
  es_asignador boolean not null default false,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table horarios (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0 = domingo
  hora_inicio time not null,
  hora_fin time not null,
  check (hora_fin > hora_inicio)
);

-- ───────────────────────── Leads ─────────────────────────
create table leads (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  embudo text not null default 'general',
  utm_source text,
  utm_campaign text,
  etapa etapa_lead not null default 'nuevo',
  respuestas jsonb, -- respuestas del formulario de aplicación del embudo
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, embudo) -- un doble envío del mismo formulario no duplica el lead
);

create table lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  seller_id uuid not null references sellers(id) on delete cascade,
  assigned_by uuid references sellers(id),
  motivo text not null, -- 'auto:round_robin' | 'manual' | 'handoff_setter_closer'
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
-- Un solo dueño activo por lead, garantizado por la base de datos
create unique index lead_un_dueno_activo on lead_assignments (lead_id) where activo;

-- ───────────────────────── Citas ─────────────────────────
create table citas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  seller_id uuid not null references sellers(id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  estado estado_cita not null default 'agendada',
  notas text,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);
-- Un vendedor no puede tener dos citas activas que se crucen
create extension if not exists btree_gist;
alter table citas add constraint citas_sin_choque
  exclude using gist (seller_id with =, tstzrange(start_at, end_at) with &&)
  where (estado in ('agendada', 'reagendada'));

-- ───────────────────────── Ventas ─────────────────────────
create table ventas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  seller_id uuid not null references sellers(id),
  producto text not null,
  moneda text not null default 'USD',
  monto_total numeric(12,2) not null check (monto_total > 0),
  monto_abonado numeric(12,2) not null default 0 check (monto_abonado >= 0),
  estado estado_venta generated always as (case when monto_abonado >= monto_total then 'pagada'::estado_venta else 'con_saldo'::estado_venta end) stored,
  created_at timestamptz not null default now(),
  check (monto_abonado <= monto_total)
);

create table sale_handoffs (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null unique references ventas(id) on delete cascade,
  estado estado_handoff not null default 'pendiente',
  notas text,
  created_at timestamptz not null default now(),
  procesado_at timestamptz
);

-- ───────────────────────── Soporte ─────────────────────────
create table tickets (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  asunto text not null,
  descripcion text,
  estado estado_ticket not null default 'abierto',
  prioridad prioridad_ticket not null default 'media',
  asignado_a uuid references sellers(id),
  creado_por uuid references sellers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Helpers de permisos ─────────────────────────
create or replace function fn_seller_actual() returns sellers
language sql stable security definer set search_path = public as $$
  select * from sellers where user_id = auth.uid() and activo limit 1;
$$;

create or replace function fn_es_gestor() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select rol in ('admin', 'manager') or es_asignador from sellers where user_id = auth.uid() and activo), false);
$$;

create or replace function fn_es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select rol = 'admin' from sellers where user_id = auth.uid() and activo), false);
$$;

create or replace function fn_dueno_actual(p_lead uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select seller_id from lead_assignments where lead_id = p_lead and activo limit 1;
$$;

-- ───────────────────────── Asignación ─────────────────────────
-- Asignación automática round-robin: SOLO si el lead no tiene dueño.
-- Advisory lock por lead para que dos envíos simultáneos no creen dos dueños.
create or replace function fn_asignar_round_robin(p_lead uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_dueno uuid;
  v_elegido uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_lead::text));
  v_dueno := fn_dueno_actual(p_lead);
  if v_dueno is not null then
    return v_dueno; -- nunca se reasigna automático un lead que ya tiene dueño
  end if;

  select s.id into v_elegido
  from sellers s
  left join lateral (
    select max(la.created_at) as ultima from lead_assignments la where la.seller_id = s.id
  ) u on true
  where s.activo and s.rol = 'vendedor'
  order by u.ultima nulls first, s.created_at
  limit 1;

  if v_elegido is null then
    return null; -- no hay vendedores activos: el lead queda sin dueño y aparece en Resumen
  end if;

  insert into lead_assignments (lead_id, seller_id, motivo) values (p_lead, v_elegido, 'auto:round_robin');
  return v_elegido;
end;
$$;

-- Reasignación manual: exige admin/manager o permiso es_asignador.
create or replace function fn_reasignar_lead(p_lead uuid, p_seller uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_actor sellers;
begin
  if not fn_es_gestor() then
    raise exception 'No tienes permiso para reasignar leads. Pídeselo a un administrador.';
  end if;
  if not exists (select 1 from sellers where id = p_seller and activo) then
    raise exception 'El vendedor elegido no existe o está inactivo.';
  end if;
  v_actor := fn_seller_actual();
  perform pg_advisory_xact_lock(hashtext(p_lead::text));
  update lead_assignments set activo = false where lead_id = p_lead and activo;
  insert into lead_assignments (lead_id, seller_id, assigned_by, motivo) values (p_lead, p_seller, v_actor.id, 'manual');
  -- Las citas futuras activas pasan al nuevo dueño para que panel y agenda no se desincronicen
  update citas set seller_id = p_seller
   where lead_id = p_lead and estado in ('agendada', 'reagendada') and start_at > now();
end;
$$;

-- Leads que tuvieron 2+ vendedores distintos el mismo día (alerta del Resumen)
create or replace view v_leads_multiples_duenos_hoy with (security_invoker = true) as
select la.lead_id, l.nombre, l.email, count(distinct la.seller_id) as vendedores
from lead_assignments la
join leads l on l.id = la.lead_id
where la.created_at >= date_trunc('day', now())
group by la.lead_id, l.nombre, l.email
having count(distinct la.seller_id) > 1;

-- Leads sin dueño activo
create or replace view v_leads_huerfanos with (security_invoker = true) as
select l.* from leads l
where not exists (select 1 from lead_assignments la where la.lead_id = l.id and la.activo)
  and l.etapa not in ('perdido', 'lead_falso', 'cliente');

-- Al registrar una venta: el lead pasa a cliente/en pago y se crea el handoff a finanzas
create or replace function fn_tras_venta() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update leads set etapa = case when new.monto_abonado >= new.monto_total then 'cliente'::etapa_lead else 'en_proceso_de_pago'::etapa_lead end,
                   updated_at = now()
   where id = new.lead_id;
  insert into sale_handoffs (venta_id) values (new.id) on conflict (venta_id) do nothing;
  return new;
end;
$$;
create trigger trg_tras_venta after insert or update of monto_abonado on ventas for each row execute function fn_tras_venta();

create or replace function fn_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
create trigger trg_leads_touch before update on leads for each row execute function fn_touch_updated_at();
create trigger trg_tickets_touch before update on tickets for each row execute function fn_touch_updated_at();

-- ───────────────────────── RLS ─────────────────────────
alter table sellers enable row level security;
alter table horarios enable row level security;
alter table leads enable row level security;
alter table lead_assignments enable row level security;
alter table citas enable row level security;
alter table ventas enable row level security;
alter table sale_handoffs enable row level security;
alter table tickets enable row level security;

-- Equipo: todos los miembros activos se ven entre sí; solo admin edita
create policy sellers_select on sellers for select to authenticated using ((fn_seller_actual()).id is not null);
create policy sellers_admin_write on sellers for all to authenticated using (fn_es_admin()) with check (fn_es_admin());

-- Horarios: cada quien edita el suyo; gestores ven y editan todos
create policy horarios_select on horarios for select to authenticated using ((fn_seller_actual()).id is not null);
create policy horarios_write on horarios for all to authenticated
  using (fn_es_gestor() or seller_id = (fn_seller_actual()).id)
  with check (fn_es_gestor() or seller_id = (fn_seller_actual()).id);

-- Leads: el vendedor ve los suyos; gestores ven todos
create policy leads_select on leads for select to authenticated
  using (fn_es_gestor() or fn_dueno_actual(id) = (fn_seller_actual()).id);
create policy leads_insert on leads for insert to authenticated with check ((fn_seller_actual()).id is not null);
create policy leads_update on leads for update to authenticated
  using (fn_es_gestor() or fn_dueno_actual(id) = (fn_seller_actual()).id);

-- Asignaciones: solo lectura directa (los cambios pasan por las funciones)
create policy assignments_select on lead_assignments for select to authenticated
  using (fn_es_gestor() or seller_id = (fn_seller_actual()).id);

-- Citas
create policy citas_select on citas for select to authenticated
  using (fn_es_gestor() or seller_id = (fn_seller_actual()).id);
create policy citas_write on citas for all to authenticated
  using (fn_es_gestor() or seller_id = (fn_seller_actual()).id)
  with check (fn_es_gestor() or seller_id = (fn_seller_actual()).id);

-- Ventas
create policy ventas_select on ventas for select to authenticated
  using (fn_es_gestor() or seller_id = (fn_seller_actual()).id);
create policy ventas_insert on ventas for insert to authenticated
  with check (fn_es_gestor() or seller_id = (fn_seller_actual()).id);
create policy ventas_update on ventas for update to authenticated using (fn_es_gestor());

-- Handoffs: gestores
create policy handoffs_all on sale_handoffs for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

-- Tickets: todo el equipo
create policy tickets_all on tickets for all to authenticated
  using ((fn_seller_actual()).id is not null) with check ((fn_seller_actual()).id is not null);

grant execute on function fn_reasignar_lead(uuid, uuid) to authenticated;
grant select on v_leads_multiples_duenos_hoy, v_leads_huerfanos to authenticated;
revoke execute on function fn_asignar_round_robin(uuid) from public, anon, authenticated;
