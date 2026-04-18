-- Enable pgvector extension for agent memories
create extension if not exists vector;

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'building', 'ready', 'deployed', 'error')),
  framework text default 'nextjs',
  settings jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Clones table (Clone Intelligence Engine results)
create table if not exists public.clones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source_url text not null,
  status text not null default 'pending' check (status in ('pending', 'crawling', 'analyzing', 'generating', 'complete', 'error')),
  site_report jsonb default '{}',
  detected_framework text,
  detected_components integer default 0,
  detected_api_endpoints integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.clones enable row level security;

create policy "Users can view own clones"
  on public.clones for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = clones.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own clones"
  on public.clones for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = clones.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Agent runs table
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agent_type text not null check (agent_type in ('planner', 'coder', 'critic', 'tester', 'reflector', 'clone')),
  status text not null default 'queued' check (status in ('queued', 'running', 'success', 'error')),
  input jsonb default '{}',
  output jsonb default '{}',
  error text,
  tokens_used integer default 0,
  duration_ms integer default 0,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.agent_runs enable row level security;

create policy "Users can view own agent runs"
  on public.agent_runs for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = agent_runs.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Agent memories table (pgvector enabled for semantic search)
create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_type text not null check (memory_type in ('task', 'approach', 'outcome', 'lesson', 'reflection')),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table public.agent_memories enable row level security;

create policy "Users can view own memories"
  on public.agent_memories for select
  using (auth.uid() = user_id);

create policy "Users can insert own memories"
  on public.agent_memories for insert
  with check (auth.uid() = user_id);

-- Create index for vector similarity search
create index if not exists agent_memories_embedding_idx
  on public.agent_memories
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Templates table
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'general',
  thumbnail_url text,
  code_snapshot jsonb default '{}',
  is_public boolean default true,
  author_id uuid references auth.users(id) on delete set null,
  usage_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.templates enable row level security;

create policy "Anyone can view public templates"
  on public.templates for select
  using (is_public = true);

create policy "Authors can manage own templates"
  on public.templates for all
  using (auth.uid() = author_id);

-- Auto-insert profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
