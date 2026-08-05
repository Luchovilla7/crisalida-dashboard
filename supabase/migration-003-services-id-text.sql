-- Migración 003: services.id de uuid a text
--
-- Bug: al eliminar/editar un servicio del catálogo salta
-- "invalid input syntax for type uuid: ..." y el servicio persiste al recargar.
--
-- Causa: la tabla `services` está vacía, así que la app muestra el catálogo
-- de respaldo definido en config/agency.ts, cuyos ids son slugs de texto
-- ("integraciones", "sistemas-internos", etc.) en vez de UUIDs. La columna
-- `services.id` es de tipo uuid, así que cualquier delete/update sobre esas
-- filas "de mentira" falla en la base. Como nunca existieron en la tabla,
-- no hay nada que borrar y por eso reaparecen al recargar.
--
-- Fix: pasar `id` a texto (igual que `service_id` en payments/tasks, que ya
-- es texto) y sembrar el catálogo con los mismos ids que usa el fallback,
-- para que los clientes/pagos/tareas que ya referencian esos ids no se
-- desvinculen.
--
-- Ejecutar en Supabase: Project -> SQL Editor -> New query -> pegar y correr.

alter table services alter column id drop default;
alter table services alter column id type text using id::text;
alter table services alter column id set default gen_random_uuid()::text;

insert into services (id, name, description, price, type) values
  ('automatizaciones', 'Automatizaciones', 'Flujos automatizados entre herramientas para eliminar tareas manuales.', 'Desde $ 400.000', 'proyecto'),
  ('chatbots-ia', 'Chatbots / Agentes IA', 'Agentes conversacionales con IA para ventas, soporte o atención al cliente.', 'Desde $ 600.000', 'proyecto'),
  ('presencia-digital', 'Presencia digital', 'Sitio web, landing pages y activos digitales de marca.', 'Desde $ 350.000', 'proyecto'),
  ('sistemas-internos', 'Sistemas internos', 'Paneles y herramientas a medida para operar el negocio del cliente.', 'Desde $ 900.000', 'proyecto'),
  ('integraciones', 'Integraciones', 'Conexión de APIs y plataformas (CRM, pagos, mensajería, etc.).', 'Desde $ 300.000', 'proyecto'),
  ('retainer-mensual', 'Retainer mensual', 'Soporte, mantenimiento y mejoras continuas mes a mes.', '$ 450.000 / mes', 'retainer')
on conflict (id) do nothing;
