-- Corrige el tipo de la columna "position" (int -> bigint) en leads y tasks.
-- Necesario porque el drag & drop usa timestamps (Date.now()) para ordenar
-- las tarjetas, y esos numeros no entran en un "int" de Postgres.
alter table leads alter column position type bigint;
alter table tasks alter column position type bigint;
