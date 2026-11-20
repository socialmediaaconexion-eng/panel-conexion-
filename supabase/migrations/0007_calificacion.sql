-- Calificación inmediata del embudo: viable (llamada de diagnóstico) o asesoria (regalo de 20 min).
alter table leads add column if not exists calificacion text check (calificacion in ('viable', 'asesoria'));
