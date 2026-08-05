-- ---------------------------------------------------------------------------
-- Migracion 004: soporte de multi-moneda (ARS / USD) para clientes y pagos.
-- Ejecutar en Supabase: Project -> SQL Editor -> New query -> pegar y correr.
-- Se puede correr mas de una vez sin romper nada (usa IF NOT EXISTS).
-- ---------------------------------------------------------------------------

alter table clients add column if not exists currency text not null default 'ARS';
alter table payments add column if not exists currency text not null default 'ARS';
