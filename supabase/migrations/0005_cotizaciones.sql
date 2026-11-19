-- Cotizaciones que piden desde conexionteam.app/cotizar. n8n recibe cada una y envía los correos.

create table if not exists cotizaciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  email text not null,
  telefono text,
  empresa text,
  pais text,
  piezas text[] not null default '{}',
  presupuesto text,
  plazo text,
  mensaje text,
  estado text not null default 'nueva' check (estado in ('nueva', 'en_preparacion', 'enviada', 'aceptada', 'descartada')),
  n8n_estado text,                 -- enviado | omitido | error:<detalle>
  notas text,
  utm_source text, utm_campaign text, sesion text
);

create index if not exists cotizaciones_fecha on cotizaciones (created_at desc);

alter table cotizaciones enable row level security;
create policy cotizaciones_select on cotizaciones for select to authenticated using (fn_es_gestor());
create policy cotizaciones_update on cotizaciones for update to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

grant all on cotizaciones to service_role;
grant select, update on cotizaciones to authenticated;
