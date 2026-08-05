-- Migración 002: Tabla de servicios dinámicos
-- Ejecutar en Supabase: Project -> SQL Editor -> New query -> pegar y correr.

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text not null default '',
  type text not null default 'proyecto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS y política permisiva para anon
alter table services enable row level security;
drop policy if exists "allow all anon" on services;
create policy "allow all anon" on services for all to anon using (true) with check (true);
