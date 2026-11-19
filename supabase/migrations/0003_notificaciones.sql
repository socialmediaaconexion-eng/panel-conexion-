-- Link fijo de videollamada de cada closer (Google Meet / Zoom), va en confirmaciones e invitaciones.
alter table sellers add column if not exists link_reunion text;

-- Registro de cada aviso enviado. La clave única hace que el cron sea idempotente:
-- un recordatorio nunca sale dos veces aunque el cron corra varias veces.
create table notificaciones (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references citas(id) on delete cascade,
  evento text not null,        -- confirmacion | recordatorio_24h | recordatorio_1h | reagendada:<inicio> | cancelada
  canal text not null,         -- whatsapp | email
  destinatario text not null,  -- lead | closer
  estado text not null,        -- enviado | omitido | error
  detalle text,
  created_at timestamptz not null default now(),
  unique (cita_id, evento, canal, destinatario)
);

alter table notificaciones enable row level security;
create policy notificaciones_select on notificaciones for select to authenticated
  using (fn_es_gestor() or exists (select 1 from citas c where c.id = cita_id and c.seller_id = (fn_seller_actual()).id));

grant all on notificaciones to service_role;
grant select on notificaciones to authenticated;
