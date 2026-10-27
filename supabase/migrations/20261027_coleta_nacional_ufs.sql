-- Expansão gradual nacional (27 UFs; 1 pedido por minuto ao Tesouro nas terças).
-- O processamento valida ano, período, ente, esquema e paginação antes de publicar dados.
alter table public.rastreio_recursos drop constraint if exists rastreio_recursos_esfera_check;
alter table public.rastreio_recursos add constraint rastreio_recursos_esfera_check
  check(esfera in ('Federal','Estadual','Municipal','Distrital'));
create table if not exists internal.entes_siconfi (
 id_ente integer primary key, uf char(2) not null unique, ativo boolean not null default true
);
revoke all on internal.entes_siconfi from public,anon,authenticated;
insert into internal.entes_siconfi(id_ente,uf) values
(11,'RO'),(12,'AC'),(13,'AM'),(14,'RR'),(15,'PA'),(16,'AP'),(17,'TO'),
(21,'MA'),(22,'PI'),(23,'CE'),(24,'RN'),(25,'PB'),(26,'PE'),(27,'AL'),(28,'SE'),(29,'BA'),
(31,'MG'),(32,'ES'),(33,'RJ'),(35,'SP'),(41,'PR'),(42,'SC'),(43,'RS'),
(50,'MS'),(51,'MT'),(52,'GO'),(53,'DF')
on conflict(id_ente) do update set uf=excluded.uf;

CREATE OR REPLACE FUNCTION internal.processar_rreo_sao_paulo()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'internal', 'public'
AS $function$
declare
  v_job record;
  v_content jsonb;
  v_count integer;
  v_total integer := 0;
  v_fonte text;
begin
  for v_job in
      select c.id,c.request_id,c.ente,c.exercicio,c.periodo,
        r.status_code,r.content,r.error_msg,r.timed_out
      from internal.coletas_siconfi c
      join net._http_response r on r.id = c.request_id
      where c.status = 'pendente'
      order by c.id
  loop
    begin
      if v_job.status_code is distinct from 200 then
         update internal.coletas_siconfi set status='erro',
           erro='HTTP '||coalesce(v_job.status_code::text,'ausente')||': '||coalesce(v_job.error_msg,'sem detalhe'),
           processada_em=now()
         where id=v_job.id;
         continue;
      end if;
      v_content := v_job.content::jsonb;
      if jsonb_typeof(v_content->'items') <> 'array' or (v_content->>'hasMore') <> 'false' then
        raise exception 'Resposta incompleta ou paginada — nenhuma atualização efetuada';
      end if;
      if jsonb_array_length(v_content->'items') < 50 then
        update internal.coletas_siconfi set status='sem_dados',
        erro='Relatório ainda não publicado ou sem registros suficientes',
        processada_em=now() where id=v_job.id;
        continue;
      end if;
      v_fonte := format('https://apidatalake.tesouro.gov.br/ords/cdwhprd/siconfi/tt/rreo?an_exercicio=%s&nr_periodo=%s&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%%2002&id_ente=%s',
        v_job.exercicio, v_job.periodo, v_job.ente);

      with registros as (
        select j.x from jsonb_array_elements(v_content->'items') as j(x)
        where j.x->>'cod_ibge' = v_job.ente::text
        and j.x->>'exercicio' = v_job.exercicio::text
        and j.x->>'periodo' = v_job.periodo::text
        and j.x->>'esfera' = case when v_job.ente=3550308 then 'M' else 'E' end
        and j.x->>'anexo' = 'RREO-Anexo 02'
        and j.x->>'cod_conta' = 'RREO2TotalDespesas'
        and j.x->>'rotulo' = 'Total das Despesas Exceto Intra-Orçamentárias'
        and j.x->>'conta' = any(array[
         'Legislativa','Judiciária','Essencial à Justiça','Administração','Defesa Nacional','Segurança Pública',
         'Relações Exteriores','Assistência Social','Previdência Social','Saúde','Trabalho','Educação','Cultura',
         'Direitos da Cidadania','Urbanismo','Habitação','Saneamento','Gestão Ambiental','Ciência e Tecnologia',
         'Agricultura','Organização Agrária','Indústria','Comércio e Serviços','Comunicações','Energia',
         'Transporte','Desporto e Lazer','Encargos Especiais']::text[])
      ), agrupado as (
        select x->>'conta' as area, max(x->>'uf') as uf, max(x->>'instituicao') as instituicao,
         max((x->>'valor')::numeric) filter(where x->>'coluna'='DOTAÇÃO ATUALIZADA (a)') as dotacao,
         max((x->>'valor')::numeric) filter(where x->>'coluna'='DESPESAS EMPENHADAS ATÉ O BIMESTRE (b)') as empenhado,
         max((x->>'valor')::numeric) filter(where x->>'coluna'='DESPESAS LIQUIDADAS ATÉ O BIMESTRE (d)') as liquidado
        from registros group by x->>'conta'
      ), upserted as (
        insert into public.rastreio_recursos (
          identificador_oficial,titulo,descricao,area,uf,esfera,municipio,ano_referencia,orgao_origem,
          valor_autorizado,valor_empenhado,valor_liquidado,situacao,fonte_url,fonte_atualizada_em,origem_base)
        select (case when v_job.ente=3550308 then 'RREO-ANEXO02-3550308-' else 'RREO-ANEXO02-E'||v_job.ente||'-' end)||v_job.exercicio||'-FUNCAO-'||area,
               area||' — '||instituicao||' ('||v_job.exercicio||')',
               format('Despesas por função até o %sº bimestre de %s, excluídas intraorçamentárias. Valores liquidados não equivalem a pagamentos.',
                  v_job.periodo,v_job.exercicio),
               area,uf,case when v_job.ente=3550308 then 'Municipal' when v_job.ente=53 then 'Distrital' else 'Estadual' end,
               case when v_job.ente=3550308 then 'São Paulo' else null end,v_job.exercicio,instituicao,
               dotacao,empenhado,liquidado,
               format('RREO %s, %sº bimestre (acumulado)',v_job.exercicio,v_job.periodo),
               v_fonte,current_date,'SICONFI-RREO-Anexo02'
        from agrupado where dotacao is not null
        on conflict(origem_base,identificador_oficial,ano_referencia) do update set
         descricao=excluded.descricao,
         titulo=excluded.titulo,uf=excluded.uf,esfera=excluded.esfera,orgao_origem=excluded.orgao_origem,
         valor_autorizado=excluded.valor_autorizado,
         valor_empenhado=excluded.valor_empenhado,
         valor_liquidado=excluded.valor_liquidado,
         situacao=excluded.situacao,fonte_url=excluded.fonte_url,
         fonte_atualizada_em=excluded.fonte_atualizada_em, atualizado_em=now()
        returning id
      )
      select count(*) into v_count from upserted;
      if v_count < 10 then
         raise exception 'Poucas funções identificadas (%); relatório não aceito',v_count;
      end if;
      update internal.coletas_siconfi set status='concluida',
        quantidade=v_count,erro=null,processada_em=now()
      where id=v_job.id;
      v_total := v_total + v_count;
    exception when others then
      update internal.coletas_siconfi set status='erro',
        erro=left(sqlerrm,500),processada_em=now()
      where id=v_job.id;
    end;
  end loop;
  return v_total;
end;
$function$
;
CREATE OR REPLACE FUNCTION internal.solicitar_proximo_estado()
 RETURNS bigint
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'internal', 'public'
AS $function$
declare
 v_ano integer; v_periodo integer; v_mes integer;
 v_ente integer; v_request bigint;
begin
 v_mes := extract(month from current_date)::int;
 if v_mes <= 2 then
   v_ano := extract(year from current_date)::int - 1;
   v_periodo := 6;
 else
   v_ano := extract(year from current_date)::int;
   v_periodo := (v_mes-1)/2;
 end if;
 select e.id_ente into v_ente
 from internal.entes_siconfi e
 where e.ativo
 and not exists(
   select 1 from internal.coletas_siconfi c
   where c.ente=e.id_ente and c.exercicio=v_ano and c.periodo=v_periodo
   and c.solicitada_em >= date_trunc('week',now())
 )
 order by e.id_ente limit 1;
 if v_ente is null then return null; end if;
 select net.http_get(
  url := 'https://apidatalake.tesouro.gov.br/ords/cdwhprd/siconfi/tt/rreo',
  params := jsonb_build_object(
   'an_exercicio',v_ano::text,
   'nr_periodo',v_periodo::text,
   'co_tipo_demonstrativo','RREO',
   'no_anexo','RREO-Anexo 02',
   'id_ente',v_ente::text
  ),
  timeout_milliseconds := 20000
 ) into v_request;
 insert into internal.coletas_siconfi(request_id,ente,exercicio,periodo)
 values(v_request,v_ente,v_ano,v_periodo);
 return v_request;
end; $function$
;
revoke all on function internal.solicitar_proximo_estado() from public,anon,authenticated;
select cron.unschedule('radar-civico-siconfi-estado-sp-consultar');
select cron.schedule('radar-civico-siconfi-ufs-consultar','2-58 8 * * 2',
 'select internal.solicitar_proximo_estado();');
select cron.schedule('radar-civico-siconfi-sp-processar','*/5 8 * * 2',
 'select internal.processar_rreo_sao_paulo();');
