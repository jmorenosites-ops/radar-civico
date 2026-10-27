-- Perfis legados ficam ocultos até existir comprovação da fonte oficial.
-- Não altera ou apaga os registros históricos já armazenados.
alter table public.politicos add column if not exists fonte_validada boolean not null default false;
alter table public.politicos add column if not exists fonte_validacao_url text;
alter table public.politicos add column if not exists fonte_validacao_em date;
alter table public.politicos enable row level security;
revoke insert,update,delete on public.politicos from anon,authenticated;
do $$
begin
 if not exists(
   select 1 from pg_constraint
   where conname='politicos_validacao_documentada'
     and conrelid='public.politicos'::regclass
 ) then
  alter table public.politicos add constraint politicos_validacao_documentada
  check(not fonte_validada or
    (fonte_validacao_url ~ '^https://' and fonte_validacao_em is not null));
 end if;
end;
$$;
