-- ---------------------------------------------------------------------------
-- Migracion 005: moneda (ARS / USD) para servicios del catalogo.
-- Ejecutar en Supabase: Project -> SQL Editor -> New query -> pegar y correr.
-- Se puede correr mas de una vez sin romper nada (usa IF NOT EXISTS).
-- ---------------------------------------------------------------------------

alter table services add column if not exists currency text not null default 'ARS';
