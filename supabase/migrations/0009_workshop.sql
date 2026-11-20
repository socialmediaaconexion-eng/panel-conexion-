-- Workshop low cost: cursos, módulos, lecciones, alumnos, inscripciones y progreso.
-- Los alumnos son usuarios de Supabase Auth SEPARADOS del equipo: nunca van en `sellers`.
-- Lo escribe el servidor con la clave de servicio (compra, activación, panel); el alumno lee lo suyo con RLS.

-- ───────────────────────── Cursos y contenido ─────────────────────────
create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  titulo text not null,
  descripcion text,
  precio_usd numeric(12,2) check (precio_usd is null or precio_usd > 0),
  precio_cop numeric(14,0) check (precio_cop is null or precio_cop > 0),
  meses_acceso integer check (meses_acceso is null or meses_acceso > 0), -- null = sin vencimiento
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists modulos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos(id) on delete cascade,
  orden integer not null default 1,
  titulo text not null,
  descripcion text,
  letra text,                                   -- letra de A·L·M·A que muestra el área del alumno (opcional)
  entregable text,                              -- lo que el alumno termina construido en el módulo
  numerado boolean not null default true,       -- false para Bienvenida y Cierre (no cuentan como módulo)
  created_at timestamptz not null default now()
);
create index if not exists modulos_curso on modulos (curso_id, orden);

create table if not exists lecciones (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references modulos(id) on delete cascade,
  orden integer not null default 1,
  titulo text not null,
  descripcion text,
  video_url text,                               -- YouTube no listado, Vimeo o mp4 directo
  prompt text,                                  -- prompt o plantilla para copiar con un botón
  duracion_min integer check (duracion_min is null or duracion_min >= 0),
  recursos jsonb not null default '[]'::jsonb,  -- [{ "nombre": "Plantilla", "url": "https://..." }]
  vista_previa boolean not null default false,  -- se puede ver sin comprar
  created_at timestamptz not null default now(),
  check (jsonb_typeof(recursos) = 'array')
);
create index if not exists lecciones_modulo on lecciones (modulo_id, orden);

-- ───────────────────────── Alumnos ─────────────────────────
create table if not exists alumnos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null, -- se llena al activar el acceso
  nombre text not null,
  email text not null unique check (email = lower(email)),
  whatsapp text,
  created_at timestamptz not null default now()
);

create table if not exists inscripciones (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references alumnos(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  estado text not null default 'pendiente_pago' check (estado in ('pendiente_pago', 'activa', 'revocada', 'reembolsada')),
  origen text not null default 'pago_bold' check (origen in ('pago_bold', 'manual')),
  cobro_id uuid references cobros(id) on delete set null,
  moneda text check (moneda in ('USD', 'COP')),
  monto numeric(14,2),
  pais text,                    -- país que eligió al comprar: Colombia paga en COP con IVA incluido; el resto en USD sin IVA
  -- Rastreo: la sesión del navegador une la inscripción con los eventos del embudo.
  sesion text, utm_source text, utm_medium text, utm_campaign text, utm_content text,
  activada_at timestamptz,
  vence_at timestamptz,         -- fin del acceso (activada_at + cursos.meses_acceso); null = sin vencimiento
  reembolsada_at timestamptz,   -- garantía: devolución procesada a mano en Bold
  primer_acceso_at timestamptz,
  acceso_enviado_at timestamptz,
  acceso_detalle text,          -- resultado del último envío del correo de acceso (enviado / falta RESEND_API_KEY / error)
  creado_por uuid references sellers(id) on delete set null, -- quién dio el acceso manual
  created_at timestamptz not null default now(),
  unique (alumno_id, curso_id)
);
create index if not exists inscripciones_estado on inscripciones (estado, created_at desc);

create table if not exists progreso_lecciones (
  alumno_id uuid not null references alumnos(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  completada_at timestamptz not null default now(),
  primary key (alumno_id, leccion_id)
);

-- ───────────────────────── Helpers de permisos ─────────────────────────
create or replace function fn_alumno_actual() returns uuid
language sql stable security definer set search_path = public as $$
  select id from alumnos where user_id = auth.uid() limit 1;
$$;

create or replace function fn_tiene_curso(p_curso uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from inscripciones i
    where i.curso_id = p_curso and i.estado = 'activa' and i.alumno_id = fn_alumno_actual()
      and (i.vence_at is null or i.vence_at > now())
  );
$$;

create or replace function fn_curso_de_modulo(p_modulo uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select curso_id from modulos where id = p_modulo;
$$;

-- Busca un usuario de Auth por correo (para enlazar alumnos que ya tienen cuenta). Solo el servidor.
create or replace function fn_usuario_por_email(p_email text) returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;
revoke execute on function fn_usuario_por_email(text) from public, anon, authenticated;
grant execute on function fn_usuario_por_email(text) to service_role;

-- ───────────────────────── RLS ─────────────────────────
alter table cursos enable row level security;
alter table modulos enable row level security;
alter table lecciones enable row level security;
alter table alumnos enable row level security;
alter table inscripciones enable row level security;
alter table progreso_lecciones enable row level security;

-- Cursos y módulos: los activos los ve cualquier usuario con sesión; el equipo gestor los edita.
create policy cursos_select on cursos for select to authenticated using (activo or fn_es_gestor());
create policy cursos_gestor on cursos for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

create policy modulos_select on modulos for select to authenticated
  using (fn_es_gestor() or exists (select 1 from cursos c where c.id = curso_id and c.activo));
create policy modulos_gestor on modulos for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

-- Lecciones: el video solo lo ve quien tiene el curso activo, o cualquiera si es vista previa.
create policy lecciones_select on lecciones for select to authenticated
  using (fn_es_gestor() or vista_previa or fn_tiene_curso(fn_curso_de_modulo(modulo_id)));
create policy lecciones_gestor on lecciones for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

-- Alumnos e inscripciones: cada alumno ve lo suyo; los gestores ven todo. Las escrituras van por el servidor.
create policy alumnos_select on alumnos for select to authenticated using (user_id = auth.uid() or fn_es_gestor());
create policy alumnos_gestor on alumnos for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

create policy inscripciones_select on inscripciones for select to authenticated
  using (alumno_id = fn_alumno_actual() or fn_es_gestor());
create policy inscripciones_gestor on inscripciones for all to authenticated using (fn_es_gestor()) with check (fn_es_gestor());

-- Progreso: el alumno marca y desmarca sus lecciones de cursos que tiene activos.
create policy progreso_select on progreso_lecciones for select to authenticated
  using (alumno_id = fn_alumno_actual() or fn_es_gestor());
create policy progreso_insert on progreso_lecciones for insert to authenticated
  with check (alumno_id = fn_alumno_actual() and exists (
    select 1 from lecciones l where l.id = leccion_id and (l.vista_previa or fn_tiene_curso(fn_curso_de_modulo(l.modulo_id)))
  ));
create policy progreso_delete on progreso_lecciones for delete to authenticated using (alumno_id = fn_alumno_actual());

grant all on cursos, modulos, lecciones, alumnos, inscripciones, progreso_lecciones to service_role;
grant select, insert, update, delete on cursos, modulos, lecciones, alumnos, inscripciones to authenticated;
grant select, insert, delete on progreso_lecciones to authenticated;
grant execute on function fn_alumno_actual(), fn_tiene_curso(uuid), fn_curso_de_modulo(uuid) to authenticated;

-- ───────────────────────── Eventos del embudo del workshop ─────────────────────────
alter table embudo_eventos drop constraint if exists embudo_eventos_evento_check;
alter table embudo_eventos add constraint embudo_eventos_evento_check check (evento in (
  'vsl_vista', 'video_play', 'video_25', 'video_50', 'video_75', 'video_100',
  'cta_aplicar', 'aplicar_vista', 'agenda_vista', 'gracias_vista',
  'workshop_vista', 'workshop_video_play', 'workshop_cta', 'workshop_checkout', 'workshop_pago', 'workshop_acceso'
));
create index if not exists embudo_eventos_embudo on embudo_eventos (embudo, created_at desc);

-- ───────────────────────── Curso ALMA (siembra) ─────────────────────────
-- Fuente: "1 - Producto del workshop.md" (20-nov-2026). USD 45 / COP 179.000 (IVA incluido, por confirmar con
-- el contador), pago único, 12 meses de acceso. Todo se edita en Panel → Workshop → Contenido.
-- El slug es el que usa la landing (src/lib/workshop.ts → WORKSHOP.slug).
-- Las lecciones quedan sin video; la de bienvenida es vista previa gratuita para poder probar.
with c as (
  insert into cursos (slug, titulo, descripcion, precio_usd, precio_cop, meses_acceso, activo)
  values ('alma', 'ALMA',
          'Dale ALMA a tu negocio con IA. Crea con Claude tu arquetipo, tus agentes, tu primera landing y un panel para ver tus números desde el celular.',
          45, 179000, 12, true)
  on conflict (slug) do nothing
  returning id
), mods(orden, letra, numerado, titulo, descripcion, entregable) as (
  values
    (0, null, false, 'Bienvenida', 'Qué vas a construir y cómo usar ALMA desde el celular.', null),
    (1, 'A', true, 'A de Arquetipo: marca personal exprés', 'Qué es un arquetipo, cuál es el tuyo y qué contenido hacer.', 'Ficha ALMA de marca: arquetipo, voz, 3 pilares y frase.'),
    (2, null, true, 'Tu Claude listo: instalación y conceptos básicos', 'Instalación y lo básico para pedirle bien.', 'Proyecto «Mi negocio» creado y con contexto.'),
    (3, 'A', true, 'A de Agentes', 'Tus asistentes de Claude con tu voz y sin olor a IA.', '3 agentes funcionando y 1 guion de presentación de 60 segundos.'),
    (4, 'L', true, 'L de Landing', 'Tu página creada con Claude y publicada.', 'Landing publicada con link propio y un botón de contacto.'),
    (5, 'M', true, 'M de Marca: marca y creativos para tu landing', 'Identidad, foto, video y creativos para tu landing.', 'Mini manual de marca, video de 60 segundos en la landing y 3 creativos.'),
    (6, null, true, 'Tu panel en el celular: todo conectado', 'Todo conectado y a la vista en tu celular.', 'Panel personal en el celular.'),
    (7, null, false, 'Cierre', 'Lo que construiste y lo que sigue.', null)
), lecs(modulo, orden, titulo, descripcion, duracion) as (
  values
    (0, 1, 'Qué vas a construir y cómo usar ALMA desde el celular', 'Ver el sistema completo terminado y saber cómo marcar avances.', 5),
    (1, 1, 'Qué es un arquetipo y por qué tu marca necesita uno', 'Entender los 12 arquetipos con ejemplos latinos reales.', 6),
    (1, 2, 'Encuentra el tuyo', 'Hacer el test y quedarte con un arquetipo principal y uno de apoyo.', 8),
    (1, 3, 'Qué contenido hacer según tu arquetipo', 'Definir 3 pilares de contenido y 10 ideas.', 8),
    (1, 4, 'Tu frase de marca', 'Escribir en una línea a quién ayudas y cómo.', 3),
    (2, 1, 'Instala Claude en el celular y en el computador', 'Tener la cuenta lista y saber qué plan necesitas.', 6),
    (2, 2, 'Lo básico: chat, proyectos, archivos y artefactos', 'Entender las 4 piezas y pedirle bien a Claude con el método de 4 partes: contexto, tarea, formato y ejemplo.', 8),
    (2, 3, 'Tu primer proyecto: «Mi negocio»', 'Crear el proyecto y cargar la Ficha ALMA para que Claude te conozca.', 6),
    (3, 1, 'Qué es un agente, sin tecnicismos', 'Un agente es Claude con instrucciones, contexto y una tarea fija.', 5),
    (3, 2, 'Agente 1: estratega de marca', 'Afinar el arquetipo y sacar ideas de contenido en tu voz.', 7),
    (3, 3, 'Agente 2: guionista con filtro anti-IA', 'Guiones en viñetas que no suenen a robot.', 7),
    (3, 4, 'Agente 3: copy de tu landing', 'Dejar listo el texto de la landing para el módulo de Landing.', 6),
    (4, 1, 'Anatomía de una landing que funciona', 'Los 7 bloques: promesa, dolor, solución, quién te guía, prueba, oferta y acción.', 6),
    (4, 2, 'Pídele a Claude tu landing', 'Generar la página como artefacto con el copy del agente 3.', 10),
    (4, 3, 'Publícala gratis con tu link', 'Tener la landing en internet.', 8),
    (4, 4, 'Tu embudo mínimo', 'Botón a WhatsApp con mensaje prellenado y un formulario de 3 preguntas.', 6),
    (5, 1, 'Tu identidad desde el arquetipo', 'Colores, tipografía y tono en un mini manual de 1 página.', 7),
    (5, 2, 'Tu foto y tu video con el celular', 'Luz, encuadre y sonido, y grabar tu guion de 60 segundos.', 8),
    (5, 3, 'Creativos con Claude y Canva', 'Una portada, 3 piezas para redes y 3 ganchos para probar, dentro de tu landing.', 10),
    (6, 1, 'Los 5 números que importan', 'Visitas, clics a WhatsApp, contactos, citas o ventas y de dónde vienen.', 5),
    (6, 2, 'Tu hoja de control y tus links con UTM', 'Registrar todo en un solo lugar y saber de qué red llega cada contacto.', 7),
    (6, 3, 'Pídele a Claude tu panel', 'Un artefacto que lea la hoja, guardado en la pantalla de inicio del celular.', 6),
    (6, 4, 'Tu rutina de lunes', 'Revisar 3 números y tomar 1 decisión en 15 minutos.', 2),
    (7, 1, 'Lo que construiste y lo que sigue', 'Repasar el sistema armado y lo que ALMA no cubre a propósito: pauta, automatizaciones, contenido en volumen y medir ventas por pieza.', 5)
), m as (
  insert into modulos (curso_id, orden, letra, numerado, titulo, descripcion, entregable)
  select c.id, d.orden, d.letra, d.numerado, d.titulo, d.descripcion, d.entregable from c cross join mods d
  returning id, orden
)
insert into lecciones (modulo_id, orden, titulo, descripcion, video_url, duracion_min, recursos, vista_previa)
select m.id, l.orden, l.titulo, l.descripcion, null, l.duracion, '[]'::jsonb, (l.modulo = 0)
from m join lecs l on l.modulo = m.orden;
