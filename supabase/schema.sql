-- ---------------------------------------------------------------------------
-- Schema del Dashboard de Agencia
-- Ejecutar completo en Supabase: Project -> SQL Editor -> New query -> pegar y correr.
-- Se puede correr mas de una vez sin romper nada (usa IF NOT EXISTS).
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- CLIENTES ---------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  service_ids text[] not null default '{}',
  status text not null default 'lead',
  contract_value numeric not null default 0,
  start_date date,
  assigned_to text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists client_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

-- PIPELINE DE VENTAS (leads) ----------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  stage_id text not null default 'lead',
  position bigint not null default 0,
  estimated_value numeric not null default 0,
  probability int not null default 50,
  assigned_to text,
  service_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PROYECTOS ----------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid references clients(id) on delete set null,
  status text not null default 'activo',
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TAREAS ---------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  project_id uuid references projects(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  assigned_to text,
  due_date date,
  priority text not null default 'media',
  stage_id text not null default 'por-hacer',
  position bigint not null default 0,
  checklist jsonb not null default '[]',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PAGOS / FACTURACION -------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  service_id text,
  amount numeric not null default 0,
  month date not null default date_trunc('month', now()),
  status text not null default 'pendiente',
  is_retainer boolean not null default false,
  created_at timestamptz not null default now()
);

-- ACTIVIDAD RECIENTE (feed del panel general) -------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- SERVICIOS ----------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text not null default '',
  type text not null default 'proyecto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices utiles ------------------------------------------------------------
create index if not exists idx_tasks_stage on tasks(stage_id);
create index if not exists idx_leads_stage on leads(stage_id);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_tasks_client on tasks(client_id);
create index if not exists idx_projects_client on projects(client_id);
create index if not exists idx_payments_client on payments(client_id);
create index if not exists idx_client_notes_client on client_notes(client_id);
create index if not exists idx_client_links_client on client_links(client_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- El dashboard es una app interna sin login multiusuario: el acceso se protege
-- con una contraseña compartida a nivel de la app (ver DASHBOARD_PASSWORD) y la
-- API key de Supabase se usa UNICAMENTE del lado del servidor (nunca llega al
-- navegador). Por eso alcanza con una policy permisiva para el rol "anon".
-- Si en el futuro agregas login real por usuario, reemplaza estas policies por
-- reglas basadas en auth.uid().
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in select unnest(array['clients','client_notes','client_links','leads','projects','tasks','payments','activity_log','services'])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "allow all anon" on %I;', t);
    execute format('create policy "allow all anon" on %I for all to anon using (true) with check (true);', t);
  end loop;
end $$;
