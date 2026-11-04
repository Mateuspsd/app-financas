-- Prumo · área da Casa (finanças do casal)
-- Cole tudo no Supabase em SQL Editor e clique em Run. Pode rodar mais de uma vez.

create table if not exists public.casas (
  id uuid primary key default gen_random_uuid(),
  nome text,
  codigo text unique not null,
  criado_por uuid references auth.users on delete set null,
  criado timestamptz not null default now()
);
create table if not exists public.casa_membros (
  casa_id uuid not null references public.casas on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  nome text,
  primary key (casa_id, user_id)
);
create table if not exists public.casa_gastos (
  id text primary key,
  casa_id uuid not null references public.casas on delete cascade,
  user_id uuid references auth.users on delete set null,
  pago_por uuid references auth.users on delete set null,
  valor numeric not null,
  descr text,
  data date not null,
  divisao text not null default 'metade',
  criado timestamptz not null default now()
);

create or replace function public.e_membro(c uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists(select 1 from casa_membros where casa_id = c and user_id = auth.uid())
$$;

alter table public.casas enable row level security;
alter table public.casa_membros enable row level security;
alter table public.casa_gastos enable row level security;

drop policy if exists "ver casa" on public.casas;
create policy "ver casa" on public.casas for select using (public.e_membro(id));
drop policy if exists "editar casa" on public.casas;
create policy "editar casa" on public.casas for update using (public.e_membro(id));

drop policy if exists "ver membros" on public.casa_membros;
create policy "ver membros" on public.casa_membros for select using (public.e_membro(casa_id));
drop policy if exists "mudar meu nome" on public.casa_membros;
create policy "mudar meu nome" on public.casa_membros for update using (user_id = auth.uid());
drop policy if exists "sair da casa" on public.casa_membros;
create policy "sair da casa" on public.casa_membros for delete using (user_id = auth.uid());

drop policy if exists "gastos da casa" on public.casa_gastos;
create policy "gastos da casa" on public.casa_gastos for all using (public.e_membro(casa_id)) with check (public.e_membro(casa_id));

create or replace function public.criar_casa(p_nome text, p_meu_nome text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_cod text;
begin
  if auth.uid() is null then raise exception 'faça login'; end if;
  loop
    v_cod := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from casas where codigo = v_cod);
  end loop;
  insert into casas (nome, codigo, criado_por) values (p_nome, v_cod, auth.uid()) returning id into v_id;
  insert into casa_membros (casa_id, user_id, nome) values (v_id, auth.uid(), p_meu_nome);
  return v_id;
end $$;

create or replace function public.entrar_casa(p_codigo text, p_meu_nome text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'faça login'; end if;
  select id into v_id from casas where codigo = upper(trim(p_codigo));
  if v_id is null then raise exception 'codigo nao encontrado'; end if;
  if (select count(*) from casa_membros where casa_id = v_id) >= 6 then raise exception 'casa cheia'; end if;
  insert into casa_membros (casa_id, user_id, nome) values (v_id, auth.uid(), p_meu_nome)
    on conflict (casa_id, user_id) do update set nome = excluded.nome;
  return v_id;
end $$;

grant execute on function public.criar_casa(text, text) to authenticated;
grant execute on function public.entrar_casa(text, text) to authenticated;

-- atualização ao vivo nos dois celulares
do $$ begin
  alter publication supabase_realtime add table public.casa_gastos;
exception when duplicate_object then null; when undefined_object then null; end $$;
