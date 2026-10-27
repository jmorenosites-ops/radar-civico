-- Radar Cívico: indicadores de receitas realizadas do SICONFI (RREO Anexo 01).
-- Não somar categorias hierárquicas (impostos estão contidos em receitas tributárias e totais).
create table if not exists public.receitas_publicas(
 id uuid primary key default gen_random_uuid(),
 ente_id integer not null,
 ano_referencia integer not null,
 periodo integer not null check(periodo between 1 and 6),
 esfera text not null check(esfera in('Municipal','Estadual','Distrital','Federal')),
 uf char(2) not null,
 municipio text,
 orgao_responsavel text not null,
 codigo_conta text not null,
 nome_conta text not null,
 valor_previsto numeric(20,2),
 valor_realizado numeric(20,2),
 fonte_url text not null check(fonte_url ~ '^https://'),
 data_consulta date not null,
 origem_base text not null default 'SICONFI-RREO-Anexo01',
 atualizado_em timestamptz not null default now(),
 unique(ente_id,ano_referencia,codigo_conta,origem_base)
);
create index if not exists receitas_publicas_filtro
 on public.receitas_publicas(ano_referencia,uf,esfera,codigo_conta);
alter table public.receitas_publicas enable row level security;
drop policy if exists "Leitura publica de receitas oficiais" on public.receitas_publicas;
create policy "Leitura publica de receitas oficiais" on public.receitas_publicas
 for select to anon,authenticated using(true);
revoke insert,update,delete on public.receitas_publicas from anon,authenticated;
grant select on public.receitas_publicas to anon,authenticated;
comment on table public.receitas_publicas is
 'Receitas realizadas acumuladas até o bimestre; categorias não são aditivas entre si.';
