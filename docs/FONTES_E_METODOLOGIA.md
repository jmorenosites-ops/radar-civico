# Radar Cívico — Fontes, metodologia e limites (27/10/2026)

## Objetivo
Dar acesso unificado, verificável e apartidário aos registros oficiais de arrecadação e despesa pública no Brasil. **Dado ausente não é zero, suspeita ou prova de irregularidade.**

## Fontes integradas
- **SICONFI / Tesouro Nacional — RREO Anexo 01**: receitas realizadas acumuladas até o bimestre. Documentação: https://apidatalake.tesouro.gov.br/docs/siconfi/
- **SICONFI / Tesouro Nacional — RREO Anexo 02**: despesas por função (dotação atualizada, empenhadas e liquidadas). Documentação: https://apidatalake.tesouro.gov.br/docs/siconfi/
- **Câmara dos Deputados — Dados Abertos**: parlamentares federais e despesas parlamentares registradas na API. https://dadosabertos.camara.leg.br/
- **Fala.BR**: direcionamento externo para solicitar acesso à informação, quando o órgão for atendido pela plataforma. https://falabr.cgu.gov.br/

## Cobertura atual
- Despesas por função: 27 UFs (2026, RREO 4º bimestre), município de São Paulo (2025, 6º bimestre, e 2026, 4º bimestre).
- Receitas: 27 UFs e município de São Paulo (2026, RREO 4º bimestre).
- Consulta de deputados federais via API da Câmara, com paginação.
- Outros agentes públicos: registros locais legados aguardam validação específica das fontes.

## Semântica essencial
1. **Anúncio/compromisso**: não significa que o valor foi autorizado, empenhado ou transferido.
2. **Dotação atualizada**: autorização orçamentária, não desembolso.
3. **Empenho**: compromisso de despesa, não pagamento.
4. **Liquidação**: reconhecimento da entrega/execução conforme procedimentos contábeis; **não é sinônimo de dinheiro pago**.
5. **Pagamento**: requer registro de desembolso, que o RREO Anexo 02 não identifica por fornecedor.
6. **Receitas realizadas**: entradas informadas no relatório, inclusive transferências. Não equivale automaticamente a tributo arrecadado localmente.
7. **Impostos**, **taxas** e **transferências correntes** são componentes de agregados maiores como receitas correntes/receitas totais. Não somar os cartões entre si; também não somar recursos federais transferidos a estados/municípios como se fossem receitas públicas novas para um consolidado Brasil.
8. **Diferença entre dotação e liquidação**: saldo de execução, **não prova desvio** nem reaplicação em outra área.
9. Para rastrear promessa de R$ 1 milhão e repasse de R$ 150 mil, apenas comparar etapas de **um mesmo instrumento identificado documentalmente**, com período comparável. Os R$ 850 mil não podem ser classificados como desviados sem evidência.

## Atualização automatizada
- Supabase Postgres + pg_net + pg_cron, rotinas administrativas no schema privado `internal`.
- Coleta de despesas da cidade de São Paulo e das 27 UFs: terça a partir de 08:00 UTC, com processamento periódico.
- Coleta de receitas: terça a partir de 09:00 UTC, com processamento periódico.
- As respostas são verificadas antes de serem publicadas: sucesso HTTP, JSON completo (`hasMore=false`), ente, período, categoria e fonte.
- Importações idempotentes (chaves por ente, exercício e classificação); novas publicações atualizam valores anteriores do exercício, não duplicam bimestres no painel.
- Falha de atualização não substitui dados previamente publicados por zeros.
- A página principal só tem permissão de leitura pública nas tabelas com RLS. Rotinas de coleta não são expostas no cliente.

## Limites pendentes
- União federal e municípios além de São Paulo ainda não integrados ao painel fiscal.
- Detalhamento por órgão, programa, empenho, liquidação, fornecedor, pagamento, documento, cartões corporativos e transferências precisa de outras APIs oficiais além do RREO.
- Compromissos eleitorais exigem documentos originais, classificação do andamento com evidências e diferenciação entre proposta, tramitação e resultado.
- Dados legados de políticos sem fonte verificável não são mostrados como oficiais.
- O cliente carrega até 1.000 registros de despesa e 1.000 de receita; antes de integrar os mais de 5 mil municípios, implementar paginação de dados **no servidor** e agregações sem duplicidade.

## Implementação
- GitHub: `jmorenosites-ops/radar-civico`
- Frontend: React/Vite publicado na Vercel
- Banco/ETL: Supabase PostgreSQL, migrações e rotinas documentadas em `supabase/migrations`.
- As tabelas e rotinas atuais foram aplicadas no Supabase; **não executar os SQLs versionados cegamente em produção** sem antes conciliar o histórico de migrações, pois o conjunto foi evoluído incrementalmente por conexão administrativa.

O portal não é uma ferramenta de acusação automática nem substitui auditoria de tribunais de contas ou a verificação dos documentos originais.
