import { useState } from 'react';

const moeda=v=>v==null || !Number.isFinite(Number(v)) ? 'Não informado' : Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const campo='border border-slate-300 rounded-lg p-2 text-sm w-full';
const botao='rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-800 disabled:opacity-40';

export default function TransferenciasOficiais() {
  const [modo,setModo]=useState('planos');
  const [ano,setAno]=useState(String(new Date().getFullYear()));
  const [parlamentar,setParlamentar]=useState('');
  const [cnpj,setCnpj]=useState('');
  const [fornecedor,setFornecedor]=useState('');
  const [resultado,setResultado]=useState(null);
  const [consulta,setConsulta]=useState(null);
  const [erro,setErro]=useState('');
  const [carregando,setCarregando]=useState(false);

  async function consultar(params) {
    setCarregando(true);setErro('');setResultado(null);setConsulta(params);
    try {
      const resposta=await fetch('/api/fontes?'+params,{signal:AbortSignal.timeout(25000)});
      const dados=await resposta.json();
      if(!resposta.ok) throw new Error(dados.erro||'Não foi possível consultar a fonte oficial.');
      setResultado(dados);
    } catch(error) {setErro(error.name==='TimeoutError'?'A consulta excedeu o tempo disponível. Tente novamente.':error.message);}
    finally {setCarregando(false);}
  }
  function enviar(e) {
    e.preventDefault();
    const params=new URLSearchParams({fonte:modo,pagina:'1'});
    if(modo==='planos') {if(ano) params.set('ano',ano);if(parlamentar.trim()) params.set('parlamentar',parlamentar.trim());}
    else {if(cnpj) params.set('cnpj',cnpj.replace(/\D/g,''));if(fornecedor) params.set('fornecedor',fornecedor.replace(/\D/g,''));}
    consultar(params);
  }
  const tipo=consulta?.get('fonte');
  return <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4" aria-labelledby="transferencias-titulo">
    <h2 id="transferencias-titulo" className="text-xl font-bold">Transferências, pagamentos e favorecidos</h2>
    <p className="text-sm text-slate-600">Consulta ao vivo no Transferegov — módulo Transferências Especiais. A consulta abaixo possui filtros próprios e não acompanha os filtros do SICONFI.</p>
    <div className="flex gap-2">
      <button className={botao} disabled={carregando} aria-pressed={modo==='planos'} onClick={()=>{setModo('planos');setResultado(null);setErro('');}}>Planos de ação</button>
      <button className={botao} disabled={carregando} aria-pressed={modo==='lancamentos'} onClick={()=>{setModo('lancamentos');setResultado(null);setErro('');}}>Movimentações e favorecidos</button>
    </div>
    <form onSubmit={enviar} className="grid sm:grid-cols-3 gap-3 items-end">
      {modo==='planos'? <>
        <label className="text-xs">Ano do plano<input className={campo} type="number" min="1900" max="2099" required value={ano} onChange={e=>setAno(e.target.value)}/></label>
        <label className="text-xs">Nome do parlamentar (opcional)<input className={campo} maxLength={120} value={parlamentar} onChange={e=>setParlamentar(e.target.value)}/></label>
      </>:<>
        <label className="text-xs">CNPJ do ente solicitante (opcional)<input className={campo} maxLength={18} value={cnpj} onChange={e=>setCnpj(e.target.value)}/></label>
        <label className="text-xs">CNPJ do favorecido (opcional)<input className={campo} maxLength={18} value={fornecedor} onChange={e=>setFornecedor(e.target.value)}/></label>
      </>}
      <button className={botao} disabled={carregando}>{carregando?'Consultando fonte oficial...':'Consultar dados oficiais'}</button>
    </form>
    <p className="text-xs text-slate-600">Planos e emendas não comprovam repasse. Lançamentos incluem créditos, débitos, aplicações e resgates: não são todos pagamentos a fornecedores. Valores de lançamentos e subtransações não devem ser somados. A situação é a informada pela fonte.</p>
    {erro && <p role="alert" className="text-sm text-amber-900 bg-amber-50 p-3 rounded">{erro}</p>}
    {resultado && <div className="space-y-3" aria-live="polite">
      <p className="text-xs text-slate-600">{resultado.total_items.toLocaleString('pt-BR')} registros na consulta oficial · Página {resultado.page_number} de {resultado.total_pages || 1} · {resultado.data.length} nesta página. Consulta: {new Date(resultado.consultado_em).toLocaleString('pt-BR')}.</p>
      <a className="text-xs text-blue-700 underline" href={resultado.fonte_url} target="_blank" rel="noopener noreferrer">Abrir resposta oficial desta página</a>
      {!resultado.data.length && <p className="text-sm">Nenhum registro retornado para estes filtros. Isso não significa ausência de transferências ou gastos.</p>}
      {resultado.data.map(r=>tipo==='planos'?<article key={r.id_plano_acao} className="border rounded-lg p-3 space-y-2 text-sm">
        <h3 className="font-bold">Plano {r.codigo_plano_acao} · {r.nome_objeto || 'Objeto não informado'}</h3>
        <p>{r.nome_parlamentar_emenda_plano_acao || 'Parlamentar não informado'} · {r.ano_plano_acao} · Situação: {r.situacao_plano_acao || 'Não informada'}</p>
        <p>Custeio previsto: {moeda(r.valor_custeio_plano_acao)} · Investimento previsto: {moeda(r.valor_investimento_plano_acao)}</p>
        <p className="text-xs">{r.detalhamento_objeto}</p>
        {r.id_agencia_conta && <button className={botao} disabled={carregando} onClick={()=>consultar(new URLSearchParams({fonte:'lancamentos',conta:r.id_agencia_conta,pagina:'1'}))}>Consultar lançamentos da conta vinculada</button>}
      </article>:tipo==='lancamentos'?<article key={r.id_lancamento_gestao_financeira} className="border rounded-lg p-3 space-y-2 text-sm">
        <h3 className="font-bold">{r.nome_ente_solicitante_gestao_financeira || 'Ente não informado'}</h3>
        <p>{r.descricao_gestao_financeira || 'Descrição não informada'} · {r.data_lancamento_gestao_financeira || 'Data não informada'}</p>
        <p>{moeda(r.valor_gestao_financeira)} · Operação: {r.tipo_operacao_gestao_financeira==='D'?'Débito':r.tipo_operacao_gestao_financeira==='C'?'Crédito':r.tipo_operacao_gestao_financeira || 'Não informada'}</p>
        <p>Favorecido: {r.nome_favorecido_gestao_financeira || 'Não identificado pela fonte'} · Documento: {r.doc_favorecido_gestao_financeira || 'Não informado'}</p>
        <p className="text-xs">Identificador oficial: {r.id_lancamento_gestao_financeira}</p>
        {r.quantidade_subtransacoes_lancamento_gestao_financeira>0 && <button className={botao} disabled={carregando} onClick={()=>consultar(new URLSearchParams({fonte:'pagamentos',lancamento:r.id_lancamento_gestao_financeira,pagina:'1'}))}>Consultar subtransações e situação de pagamento</button>}
      </article>:<article key={r.id_subtransacao_gestao_financeira} className="border rounded-lg p-3 space-y-2 text-sm">
        <h3 className="font-bold">{r.nome_beneficiario_subtransacao_gestao_financeira || 'Beneficiário não identificado'}</h3>
        <p>{moeda(r.valor_subtransacao_gestao_financeira)} · {r.data_pagamento_subtransacao_gestao_financeira || 'Data de pagamento não informada'}</p>
        <p>Situação do pagamento: {r.situacao_pagamento_subtransacao_gestao_financeira || 'Não informada'} · Estado: {r.estado_subtransacao_gestao_financeira || 'Não informado'}</p>
        <p>{r.descricao_subtransacao_gestao_financeira}</p>
        <p>Documento do beneficiário: {r.numero_documento_beneficiario_subtransacao_gestao_financeira || 'Não informado'}</p>
      </article>)}
      <div className="flex gap-3">
        <button className={botao} disabled={carregando || resultado.page_number<=1} onClick={()=>{const p=new URLSearchParams(consulta);p.set('pagina',String(resultado.page_number-1));consultar(p);}}>Página anterior</button>
        <button className={botao} disabled={carregando || resultado.page_number>=resultado.total_pages} onClick={()=>{const p=new URLSearchParams(consulta);p.set('pagina',String(resultado.page_number+1));consultar(p);}}>Próxima página</button>
      </div>
    </div>}
    <details className="text-xs text-slate-600 border-t pt-3">
      <summary className="cursor-pointer font-semibold">Cobertura real e limitações das fontes</summary>
      <ul className="list-disc pl-5 space-y-2 mt-3">
        <li>SICONFI: receitas realizadas (RREO Anexo 01) e execução por função (Anexo 02). A cobertura é dos entes e períodos efetivamente coletados; não é de todos os municípios. A consulta local exibe até 1.000 registros de execução e 1.000 de receitas. Esses anexos não identificam fornecedores.</li>
        <li>Transferegov: somente Transferências Especiais nesta integração, com paginação de 20 registros. Os filtros de ano e parlamentar se aplicam aos planos; os lançamentos seguem conta ou CNPJ e podem ser de outros anos. Registros sem favorecido identificado permanecem sem identificação.</li>
        <li>Pagamentos: subtransações vinculadas por identificador oficial ao lançamento. Contas podem ser compartilhadas por mais de um plano; consulta por conta não atribui automaticamente cada pagamento a uma emenda. Documentos pessoais podem vir ocultados pela fonte.</li>
        <li>Câmara: despesas da cota parlamentar com fornecedor e documento na consulta do deputado. Reembolso da cota não representa toda a despesa federal.</li>
        <li>Portal da Transparência: a API de despesas federais exige chave própria e ainda não está integrada aqui. <a className="underline text-blue-700" href="https://portaldatransparencia.gov.br/api-de-dados" target="_blank" rel="noopener noreferrer">Documentação oficial</a>. Convênios, TED e outros módulos do Transferegov não estão cobertos por esta consulta.</li>
        <li>Consulta ao vivo pode sofrer indisponibilidade e tem cache de até 15 minutos. Horário da consulta não é data de atualização do dado. Nenhum valor é estimado para preencher lacunas.</li>
      </ul>
      <a className="underline text-blue-700 inline-block mt-3" href="https://api-publica.transferegov.gestao.gov.br/especiais/docs" target="_blank" rel="noopener noreferrer">Documentação oficial do Transferegov</a>
    </details>
  </section>;
}
