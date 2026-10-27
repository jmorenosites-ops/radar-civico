-- Radar Cívico: rastreamento documentado do anúncio ao destino do recurso.
-- Modelo inicial: valores em fases distintas não são aditivos.
-- A execução desta migração exige o SQL Editor ou uma conexão administrativa Supabase.
create extension if not exists pgcrypto;

create table if not exists public.rastreio_recursos (
  id uuid primary key default gen_random_uuid(),
  identificador_oficial text not null,
  titulo text not null,
  descricao text,
  area text,
  uf char(2),
  municipio text,
  ano_referencia int,
  orgao_origem text,
  orgao_destino text,
  valor_anunciado numeric(20,2),
  valor_previsto_repasse numeric(20,2),
  valor_transferido numeric(20,2),
  valor_autorizado numeric(20,2),
  valor_empenhado numeric(20,2),
  valor_liquidado numeric(20,2),
  valor_pago numeric(20,2),
  motivo_diferenca text,
  situacao text,
  fonte_url text not null check (fonte_url ~ '^https://'),
  fonte_atualizada_em date not null,
  origem_base text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (origem_base, identificador_oficial, ano_referencia),
  constraint valor_nao_negativo check (
    (valor_anunciado is null or valor_anunciado >= 0)
    and (valor_previsto_repasse is null or valor_previsto_repasse >= 0)
    and (valor_transferido is null or valor_transferido >= 0)
    and (valor_autorizado is null or valor_autorizado >= 0)
    and (valor_empenhado is null or valor_empenhado >= 0)
    and (valor_liquidado is null or valor_liquidado >= 0)
    and (valor_pago is null or valor_pago >= 0)
  )
);

create table if not exists public.rastreio_movimentos (
  id uuid primary key default gen_random_uuid(),
  recurso_id uuid not null references public.rastreio_recursos(id) on delete cascade,
  identificador_movimento text not null,
  tipo text not null check (tipo in ('repasse','pagamento','devolucao','cancelamento','ajuste')),
  data_evento date not null,
  valor numeric(20,2) not null check (valor >= 0),
  descricao text,
  orgao_origem text,
  orgao_destino text,
  fornecedor text,
  documento_numero text,
  fonte_url text not null check (fonte_url ~ '^https://'),
  origem_base text not null,
  criado_em timestamptz not null default now(),
  unique (origem_base, identificador_movimento)
);

create index if not exists rastreio_filtros on public.rastreio_recursos(ano_referencia, uf, area);
create index if not exists rastreio_movimentos_recurso on public.rastreio_movimentos(recurso_id, data_evento desc);

alter table public.rastreio_recursos enable row level security;
alter table public.rastreio_movimentos enable row level security;

drop policy if exists "Leitura publica de fluxos documentados" on public.rastreio_recursos;
create policy "Leitura publica de fluxos documentados"
  on public.rastreio_recursos for select to anon, authenticated using (true);

drop policy if exists "Leitura publica de movimentos documentados" on public.rastreio_movimentos;
create policy "Leitura publica de movimentos documentados"
  on public.rastreio_movimentos for select to anon, authenticated using (true);

revoke insert, update, delete on public.rastreio_recursos from anon, authenticated;
revoke insert, update, delete on public.rastreio_movimentos from anon, authenticated;
grant select on public.rastreio_recursos to anon, authenticated;
grant select on public.rastreio_movimentos to anon, authenticated;

comment on table public.rastreio_recursos is
'Instrumentos documentados em fontes oficiais. Nunca somar valores de fases diversas nem confundir anúncio com obrigação legal.';
comment on table public.rastreio_movimentos is
'Movimentos individualizados com documento oficial. Repasses e pagamentos podem representar etapas do mesmo dinheiro.';
