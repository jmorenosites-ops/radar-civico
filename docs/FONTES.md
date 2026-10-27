# Integrações e cobertura do Radar Cívico

Verificado em 27/10/2026. Nenhum dado fictício é publicado.

## Dados integrados

- Supabase `xwmtyoakahfnmjtquqfh`: 721 registros SICONFI de execução por função, sendo 652 estaduais (26 UFs), 24 distritais e 45 municipais (SP). Referências 2025–2026; estados e DF apenas 2026 nesta verificação. Há 224 registros de receitas, 64 autoridades e nenhum movimento individual na tabela legada `rastreio_movimentos`. São contagens de registros, não totais financeiros.
- SICONFI: RREO Anexo 01 para receitas e Anexo 02 para dotação, empenho e liquidação. Rotinas de coleta existentes em `supabase/migrations` e tabelas públicas protegidas por RLS. O aplicativo não escreve nessas tabelas.
- Transferegov / Transferências Especiais: nova consulta ao vivo pelo servidor Vercel, em `GET /api/fontes`. Planos por exercício/parlamentar; lançamentos por conta oficialmente vinculada, CNPJ do ente ou do favorecido; subtransações pelo identificador oficial do lançamento. Paginação de 20 registros com contagem da consulta. Não grava nem inventa pagamentos na tabela legada.
- Câmara dos Deputados: deputados e despesas da cota parlamentar, incluindo fornecedores/documentos disponibilizados pela fonte, na consulta de autoridades existente.
- Preservados: políticos e ministros, compromissos com evidência, Fala.BR, ausência de fotos e o rodapé solicitado.

## Limitações

SICONFI não representa todos os municípios nesta instalação. A interface lê até 1.000 registros de execução e 1.000 de receitas, limite declarado na tela. Os anexos utilizados não identificam fornecedores; períodos acumulados e categorias hierárquicas não podem ser somados entre si. Empenho, liquidação e pagamento são fases distintas.

A nova integração cobre somente Transferências Especiais: sem TED, convênios, discricionárias/legais e fundo a fundo. O ano do plano não restringe o ano dos lançamentos bancários. Contas podem ser compartilhadas por planos: vínculo por conta não imputa automaticamente um pagamento a uma emenda. Aplicações, resgates, créditos e débitos não são todos pagamentos a fornecedores. Subtransações mostram situação oficial, inclusive pagamentos pendentes ou não concluídos. Não somar lançamentos e subtransações. Favorecidos podem não estar identificados e documentos podem vir mascarados.

A API de despesas federais do Portal da Transparência exige chave própria e ainda não está integrada. Nenhuma chave deve ser colocada em variáveis `VITE_` ou enviada ao navegador. Não há cobertura universal de fornecedores nem conciliação de todo o fluxo União → ente → fornecedor. A cota parlamentar não representa toda a despesa federal.

As consultas podem falhar. Nesse caso a interface informa indisponibilidade, sem tratar o erro como gasto zero. Cache de 5 minutos com uso de resposta anterior durante revalidação por até mais 10 minutos. O horário da consulta não é a data de atualização do produtor.

## Validação e desenvolvimento

Node 22.12+ ou 24; `npm ci`, `npm test`, `npm run lint` e `npm run build`. Para verificar contratos com respostas oficiais reais, definir `RADAR_TESTE_REDE=1` antes de `npm test`. Sem essa variável somente o teste de rede é ignorado. Nenhuma resposta pública de exemplo é usada como dado de produção.

Vite sozinho não serve `api/fontes.js`; use ambiente Vercel ou `vercel dev` para o fluxo completo. A rota fixa o servidor oficial, valida filtros, restringe métodos a GET, aplica timeout de 18 segundos e retorna erro explícito para respostas incompatíveis. As fontes abertas do Transferegov não exigem chave adicional.

## Documentação oficial

- [SICONFI](https://apidatalake.tesouro.gov.br/docs/siconfi/)
- [Portal de APIs Transferegov](https://api-publica.transferegov.gestao.gov.br/)
- [OpenAPI de Transferências Especiais](https://api-publica.transferegov.gestao.gov.br/especiais/openapi.json)
- [Câmara](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Portal da Transparência](https://portaldatransparencia.gov.br/api-de-dados)

Criado por um neurodivergente brasileiro
