export function consultaCamara(params) {
  const tipo=params.get('tipo');
  if(!['deputados','despesas'].includes(tipo)) throw new Error('Tipo de consulta inválido.');
  for(const key of params.keys()) if(!['tipo','id','uf','nome','pagina'].includes(key)||params.getAll(key).length!==1) throw new Error('Filtro não permitido.');
  const pagina=params.get('pagina')||'1';
  if(!/^(?:[1-9]|10)$/.test(pagina)) throw new Error('Página inválida.');
  const id=params.get('id');
  if(tipo==='despesas' && !/^\d{1,9}$/.test(id||'')) throw new Error('Identificador inválido.');
  const url=new URL(tipo==='deputados'?'deputados':`deputados/${id}/despesas`,'https://dadosabertos.camara.leg.br/api/v2/');
  url.searchParams.set('ordem',tipo==='deputados'?'ASC':'DESC');
  url.searchParams.set('ordenarPor',tipo==='deputados'?'nome':'dataDocumento');
  url.searchParams.set('itens','100');url.searchParams.set('pagina',pagina);
  if(params.get('uf')) {
    if(!/^[A-Z]{2}$/.test(params.get('uf'))) throw new Error('UF inválida.');
    url.searchParams.set('siglaUf',params.get('uf'));
  }
  if(params.get('nome')) {
    if(params.get('nome').length>120) throw new Error('Nome muito longo.');
    url.searchParams.set('nome',params.get('nome'));
  }
  return url;
}
export function reescreverLinks(links,params) {
  if(!Array.isArray(links)) throw new Error('Links oficiais inválidos.');
  return links.map(link=>{
    if(link.rel!=='next') return link;
    const url=new URL(link.href);
    if(url.origin!=='https://dadosabertos.camara.leg.br' || url.pathname!=='/api/v2/deputados') throw new Error('Link de paginação inválido.');
    const proxima=new URLSearchParams(params);proxima.set('pagina',url.searchParams.get('pagina')||'');
    consultaCamara(proxima);
    return {...link,href:'/api/camara?'+proxima};
  });
}
