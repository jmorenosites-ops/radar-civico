-- Radar Cívico: compromissos verificáveis por pessoa e mandato.
-- Aplicar no SQL Editor do projeto Supabase, antes de publicar registros.
create extension if not exists pgcrypto;

create table if not exists public.compromissos (
  id uuid primary key default gen_random_uuid(),
  origem_pessoa text not null check (origem_pessoa in ('camara', 'supabase')),
  id_pessoa text not null,
  mandato text,
  titulo text not null,
  descricao text not null,
  tipo text not null check (tipo in ('campanha', 'gestao', 'institucional')),
  tema text,
  status text not null default 'nao_verificado'
    check (status in ('concluido', 'em_andamento', 'nao_cumprido', 'nao_verificado')),
  fonte_compromisso_url text not null check (fonte_compromisso_url ~ '^https://'),
  evidencia_url text check (evidencia_url is null or evidencia_url ~ '^https://'),
  observacao text,
  periodo_inicio date,
  periodo_fim date,
  data_verificacao date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint status_com_evidencia check (
    status = 'nao_verificado' or
    (evidencia_url is not null and data_verificacao is not null)
  )
);

create index if not exists compromissos_por_pessoa
  on public.compromissos (origem_pessoa, id_pessoa, data_verificacao desc);

alter table public.compromissos enable row level security;

drop policy if exists "Leitura publica de compromissos" on public.compromissos;
create policy "Leitura publica de compromissos" on public.compromissos
  for select to anon, authenticated using (true);

-- Não conceder inserts ou updates ao cliente anônimo.
revoke insert, update, delete on public.compromissos from anon, authenticated;
grant select on public.compromissos to anon, authenticated;

comment on table public.compromissos is
  'Compromissos de campanha e gestão documentados; status não é inferido pela ausência de registros.';
