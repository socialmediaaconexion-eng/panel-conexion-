-- Cobros con links de pago de Bold, creados desde el panel y enviados al cliente.

create table if not exists cobros (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  creado_por uuid references sellers(id) on delete set null,
  cliente_nombre text not null,
  cliente_email text,
  cliente_telefono text,
  concepto text not null,
  moneda text not null default 'USD' check (moneda in ('USD', 'COP')),
  monto numeric(14,2) not null check (monto > 0),
  estado text not null default 'pendiente' check (estado in ('borrador', 'pendiente', 'procesando', 'pagado', 'rechazado', 'cancelado', 'expirado')),
  bold_link text unique,           -- LNK_...
  url text,
  error text,
  pagado_at timestamptz,
  actualizado_at timestamptz not null default now()
);

create index if not exists cobros_fecha on cobros (created_at desc);

alter table cobros enable row level security;
create policy cobros_select on cobros for select to authenticated using (fn_es_gestor());

grant all on cobros to service_role;
grant select on cobros to authenticated;
