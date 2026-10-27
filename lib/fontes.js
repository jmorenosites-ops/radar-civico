const base = 'https://api-publica.transferegov.gestao.gov.br/especiais/';
const fontes = {
  planos: { path:'planos-acao-especiais', filtros:{ano:'ano_plano_acao', parlamentar:'nome_parlamentar_emenda_plano_acao', id:'id_plano_acao'} },
  lancamentos: { path:'gestao-financeira-lancamentos-especiais', filtros:{cnpj:'cnpj_ente_solicitante_gestao_financeira', fornecedor:'doc_favorecido_gestao_financeira', conta:'id_agencia_conta'} },
  pagamentos: { path:'gestao-financeira-subtransacoes-especiais', filtros:{lancamento:'id_lancamento_gestao_financeira'} },
};
export function criarConsulta(params) {
  const fonte=fontes[params.get('fonte')];
  if(!fonte) throw new Error('Fonte não permitida.');
  for(const chave of params.keys()) {
    if(!['fonte','pagina',...Object.keys(fonte.filtros)].includes(chave) || params.getAll(chave).length!==1) throw new Error('Filtro não permitido.');
  }
  const pagina=params.get('pagina')||'1';
  if(!/^[1-9]\d{0,5}$/.test(pagina)) throw new Error('Página inválida.');
  const url=new URL(fonte.path,base);
  url.searchParams.set('pagina',pagina);
  url.searchParams.set('tamanho_da_pagina','20');
  for(const [chave,oficial] of Object.entries(fonte.filtros)) {
    const valor=params.get(chave)?.trim();
    if(!valor) continue;
    if(valor.length>120) throw new Error('Filtro muito longo.');
    if(chave==='ano' && !/^(19|20)\d{2}$/.test(valor)) throw new Error('Ano inválido.');
    if(['cnpj','fornecedor'].includes(chave) && !/^\d{14}$/.test(valor)) throw new Error('CNPJ deve conter 14 dígitos.');
    if(chave==='id' && !/^\d{1,12}$/.test(valor)) throw new Error('Identificador inválido.');
    if(['conta','lancamento'].includes(chave) && !/^[\d-]{1,40}$/.test(valor)) throw new Error('Identificador inválido.');
    url.searchParams.set(oficial,valor);
  }
  if(params.get('fonte')==='pagamentos' && !params.get('lancamento')) throw new Error('Informe o lançamento para consultar pagamentos.');
  return url;
}
export function validarPagina(body) {
  if(!body || !Array.isArray(body.data) || body.data.length>20 ||
    !['total_items','total_pages','page_number','page_size'].every(k=>Number.isSafeInteger(body[k]) && body[k]>=0) ||
    body.page_number<1 || body.page_size<1 || body.page_size>20 || body.total_items<body.data.length ||
    body.data.some(row=>!row || typeof row!=='object' || Array.isArray(row))) throw new Error('Resposta oficial fora do esquema esperado.');
  return body;
}
