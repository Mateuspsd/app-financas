-- Prumo Finanças: cole tudo no Supabase em SQL Editor e clique em Run.

create table if not exists public.estado (
  user_id uuid primary key references auth.users on delete cascade,
  dados jsonb not null,
  atualizado timestamptz not null default now()
);

create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users on delete cascade,
  sub jsonb not null,
  criado timestamptz not null default now()
);

alter table public.estado enable row level security;
alter table public.push_subs enable row level security;

-- cada pessoa só vê e mexe nos próprios dados
drop policy if exists "estado do dono" on public.estado;
create policy "estado do dono" on public.estado
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "push do dono" on public.push_subs;
create policy "push do dono" on public.push_subs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
