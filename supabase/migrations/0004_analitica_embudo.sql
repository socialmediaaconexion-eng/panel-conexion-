-- Analítica del embudo: cada paso que da un visitante (vista, video, clic, formulario).
-- Se escribe solo desde el servidor (/api/eventos con la clave de servicio); lo leen gestores en el panel.

create table if not exists embudo_eventos (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  sesion text not null,                 -- id anónimo por pestaña (sessionStorage)
  evento text not null check (evento in (
    'vsl_vista', 'video_play', 'video_25', 'video_50', 'video_75', 'video_100',
    'cta_aplicar', 'aplicar_vista', 'agenda_vista', 'gracias_vista'
  )),
  embudo text not null default 'vsl-conexion',
  utm_source text, utm_medium text, utm_campaign text, utm_content text,
  referrer text,
  dispositivo text                      -- movil | escritorio
);

create index if not exists embudo_eventos_fecha on embudo_eventos (created_at desc);
create index if not exists embudo_eventos_evento on embudo_eventos (evento, created_at desc);

alter table embudo_eventos enable row level security;
create policy embudo_eventos_select on embudo_eventos for select to authenticated using (fn_es_gestor());

grant all on embudo_eventos to service_role;
grant usage, select on sequence embudo_eventos_id_seq to service_role;
grant select on embudo_eventos to authenticated;

-- La sesión del navegador viaja con la aplicación para unir visita → lead.
alter table leads add column if not exists sesion text;
alter table leads add column if not exists utm_medium text;
alter table leads add column if not exists utm_content text;
