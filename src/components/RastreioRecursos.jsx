import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, FileSearch, Loader2, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ReceitasPublicas from './ReceitasPublicas';

const dinheiro = valor => valor == null || !Number.isFinite(Number(valor))
  ? 'Não informado'
  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
const dataBR = valor => {
  if (!valor) return 'Data não informada';
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : 'Data não informada';
};
const urlSegura = valor => {
  try {
    const url = new URL(valor);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
};

const statusMovimento = {
  repasse: 'Repasse entre órgãos ou entes',
  pagamento: 'Pagamento a fornecedor ou beneficiário',
  devolucao: 'Devolução de recursos',
  cancelamento: 'Cancelamento de valor previsto',
  ajuste: 'Ajuste documentado',
};

export default function RastreioRecursos() {
  const [registros, setRegistros] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [movimentos, setMovimentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMovimentos, setCarregandoMovimentos] = useState(false);
  const [erro, setErro] = useState(null);
  const [erroMovimentos, setErroMovimentos] = useState(null);
  const [busca, setBusca] = useState('');
  const [visiveis, setVisiveis] = useState(20);
  const [uf, setUf] = useState('');
  const [esfera, setEsfera] = useState('');
  const [ano, setAno] = useState('mais_recente');
  const [area, setArea] = useState('');

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      const { data, error } = await supabase
        .from('rastreio_recursos')
        .select('id,titulo,descricao,area,uf,municipio,orgao_origem,orgao_destino,ano_referencia,identificador_oficial,valor_anunciado,valor_previsto_repasse,valor_transferido,valor_autorizado,valor_empenhado,valor_liquidado,valor_pago,motivo_diferenca,situacao,fonte_url,fonte_atualizada_em,origem_base,esfera')
        .order('ano_referencia', { ascending: false })
        .order('uf', { ascending: true })
        .order('esfera', { ascending: true })
        .order('area', { ascending: true })
        .limit(1000);
      if (!ativo) return;
      setRegistros(error ? [] : (data || []));
      setErro(error ? 'O acompanhamento de recursos ainda não está conectado à base de dados.' : null);
      setCarregando(false);
    };
    carregar();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!selecionado) return;
    let ativo = true;
    const carregar = async () => {
      const { data, error } = await supabase
        .from('rastreio_movimentos')
        .select('id,tipo,data_evento,valor,descricao,orgao_origem,orgao_destino,fornecedor,documento_numero,fonte_url')
        .eq('recurso_id', selecionado.id)
        .order('data_evento', { ascending: false })
        .limit(200);
      if (!ativo) return;
      setMovimentos(error ? [] : (data || []));
      setErroMovimentos(error ? 'Não foi possível consultar os movimentos. Tente abrir os detalhes novamente.' : null);
      setCarregandoMovimentos(false);
    };
    carregar();
    return () => { ativo = false; };
  }, [selecionado]);

  const anos = [...new Set(registros.map(r => r.ano_referencia).filter(Boolean))].sort((a,b) => b-a);
  const anoAtivo = ano === 'mais_recente' ? anos[0] : Number(ano);

  const filtrados = (() => {
    const q = busca.trim().toLocaleLowerCase('pt-BR');
    return registros.filter(r => {
      if (uf && r.uf !== uf) return false;
      if (esfera && r.esfera !== esfera) return false;
      if (anoAtivo && Number(r.ano_referencia) !== anoAtivo) return false;
      if (area && r.area !== area) return false;
      if (!q) return true;
      const texto = [r.titulo, r.descricao, r.municipio, r.orgao_origem,
        r.orgao_destino, r.identificador_oficial].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
      return texto.includes(q);
    }).sort((a,b) => Number(b.ano_referencia || 0) - Number(a.ano_referencia || 0) || Number(b.valor_liquidado || 0) - Number(a.valor_liquidado || 0));
  })();

  const ufs = [...new Set(registros.map(r => r.uf).filter(Boolean))].sort();
  const areas = [...new Set(registros.map(r => r.area).filter(Boolean))].sort();

  const escopoDestaque = esfera || (uf && uf !== 'SP' ? 'Estadual' : 'Municipal');
  const possiveis = registros.filter(r => r.origem_base === 'SICONFI-RREO-Anexo02'
    && r.esfera === escopoDestaque && r.ano_referencia === anoAtivo
    && (!uf || r.uf === uf));
  const entidadeDestaque = possiveis[0]?.orgao_origem;
  const piloto = possiveis.filter(r => r.orgao_origem === entidadeDestaque);
  const principal = ['Educação', 'Saúde'].map(nome => piloto.find(r => r.area === nome)).filter(Boolean);
  const rankingAreas = [...piloto].filter(r => r.valor_liquidado != null && Number(r.valor_liquidado) >= 0)
    .sort((a,b) => Number(b.valor_liquidado) - Number(a.valor_liquidado)).slice(0,10);
  const maiorDespesa = Math.max(1, ...rankingAreas.map(r => Number(r.valor_liquidado)));

  const comparacao = registro => {
    // Comparar apenas promessa de repasse e repasse, nunca somar etapas orçamentárias.
    const base = registro.valor_previsto_repasse ?? registro.valor_anunciado;
    if (base == null || registro.valor_transferido == null) return null;
    const diferenca = Number(base) - Number(registro.valor_transferido);
    if (!Number.isFinite(diferenca)) return null;
    return { base, diferenca, ehPrevisto: registro.valor_previsto_repasse != null };
  };

  return (
    <section id="rastreio" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5" aria-labelledby="titulo-rastreio">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800">
          <FileSearch className="w-4 h-4" /> Rastreabilidade e execução
        </div>
        <h2 id="titulo-rastreio" className="text-xl font-bold text-slate-900">
          Para onde foi o dinheiro público?
        </h2>
        <p className="text-sm text-slate-600">
          Acompanhe recursos por órgão, município e finalidade, desde o anúncio até o pagamento,
          quando houver documentos oficiais que permitam ligar essas etapas.
        </p>
        <p className="text-xs text-slate-500">
          Anúncio não é liberação. Repasse não é pagamento final. Diferença entre valores não prova desvio.
          Cada etapa deve ter fonte e período comparáveis.
        </p>
      </div>

      {principal.length > 0 && (
        <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Execução por função — {entidadeDestaque} · {anoAtivo}</h3>
            <p className="text-xs text-slate-600 mt-1">Tesouro Nacional / SICONFI · {principal[0]?.situacao}. Dados acumulados no período, não pagamentos finais nem promessas eleitorais.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {principal.map(item => (
              <div key={item.id} className="rounded-lg bg-white border border-slate-200 p-3">
                <div className="font-semibold text-sm text-slate-900">{item.area}</div>
                <div className="text-xl font-bold text-blue-800 mt-1">{dinheiro(item.valor_liquidado)}</div>
                <p className="text-xs text-slate-500">Despesa liquidada acumulada no período</p>
                <p className="text-xs text-slate-600 mt-2">Dotação atualizada: {dinheiro(item.valor_autorizado)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Maiores despesas liquidadas por área</h4>
            {rankingAreas.map(item => (
              <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2 text-xs">
                <span className="truncate text-slate-700" title={item.area}>{item.area}</span>
                <div className="bg-slate-200 rounded-full h-3 overflow-hidden" role="img" aria-label={item.area + ': ' + dinheiro(item.valor_liquidado)}>
                  <div className="bg-blue-600 rounded-full h-full" style={{width: `${100 * Number(item.valor_liquidado) / maiorDespesa}%`}} />
                </div>
                <span className="hidden sm:inline text-right font-semibold tabular-nums text-slate-700">{dinheiro(item.valor_liquidado)}</span>
              </div>
            ))}
            <p className="text-[11px] text-slate-500">Cada barra compara uma função da mesma esfera e período. Áreas e subfunções não são somadas entre si.</p>
          </div>
          <p className="text-xs text-slate-600">Nenhum valor é atribuído a um político nem tratado como pagamento sem a fonte correspondente.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <label className="relative">
          <span className="sr-only">Pesquisar recurso</span>
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input value={busca} onChange={e => {setBusca(e.target.value);setVisiveis(20);}}
            placeholder="Programa, município, órgão..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-9 py-2.5 text-sm" />
        </label>
        <label>
          <span className="sr-only">Exercício</span>
          <select value={ano} onChange={e => {setAno(e.target.value);setVisiveis(20);}}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm">
            <option value="mais_recente">Exercício mais recente</option>
            {anos.map(a => <option key={a} value={String(a)}>{a}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select value={uf} onChange={e => {setUf(e.target.value);setVisiveis(20);}}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm">
            <option value="">Todas as UFs</option>
            {ufs.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Esfera de governo</span>
          <select value={esfera} onChange={e => {setEsfera(e.target.value);setVisiveis(20);}}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm">
            <option value="">Estado e município</option>
            <option value="Estadual">Governo estadual</option>
            <option value="Municipal">Governo municipal</option>
            <option value="Distrital">Distrito Federal</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Área</span>
          <select value={area} onChange={e => {setArea(e.target.value);setVisiveis(20);}}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm">
            <option value="">Todas as áreas</option>
            {areas.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <ReceitasPublicas ano={anoAtivo} uf={uf} esfera={esfera} />

      {carregando ? (
        <p className="flex items-center gap-2 text-xs text-slate-600"><Loader2 className="w-4 h-4 animate-spin" /> Consultando dados...</p>
      ) : erro ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          {erro} Não serão exibidos valores de exemplo como se fossem dados públicos.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          Nenhum fluxo financeiro documentado encontrado nos registros disponíveis. Isso não indica
          ausência de recursos ou gastos. A cobertura será ampliada conforme a integração das bases oficiais.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{filtrados.length} fluxos documentados encontrados. Exibindo {Math.min(visiveis, filtrados.length)}.</p>
          {filtrados.slice(0, visiveis).map(r => {
            const info = comparacao(r);
            const escolhido = selecionado?.id === r.id;
            return (
              <article key={r.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between gap-2 items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{r.titulo}</h3>
                    <p className="text-xs text-slate-600 mt-1">{r.area || 'Área não informada'} · {r.municipio || r.uf || 'Abrangência não informada'} · {r.ano_referencia || 'Ano não informado'}</p>
                  </div>
                  {r.situacao && <span className="text-[11px] rounded bg-slate-100 px-2 py-1 text-slate-600">{r.situacao}</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    ['Anunciado', r.valor_anunciado],
                    ['Repasse previsto', r.valor_previsto_repasse],
                    ['Transferido', r.valor_transferido],
                    ['Dotação atualizada', r.valor_autorizado],
                    ['Empenhado', r.valor_empenhado],
                    ['Liquidado', r.valor_liquidado],
                    ['Pago', r.valor_pago],
                  ].filter(([,valor]) => valor !== null && valor !== undefined).map(([nome, valor]) => (
                    <div key={nome} className="rounded bg-slate-50 p-2 border border-slate-100">
                      <div className="text-slate-500">{nome}</div>
                      <div className="font-bold text-slate-900 mt-1">{dinheiro(valor)}</div>
                    </div>
                  ))}
                </div>
                {r.origem_base === 'SICONFI-RREO-Anexo02' && r.valor_liquidado != null && Number(r.valor_autorizado) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Liquidado / dotação atualizada</span>
                      <span className="font-semibold">{(100 * Number(r.valor_liquidado) / Number(r.valor_autorizado)).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{width: `${Math.min(100, Math.max(0, 100 * Number(r.valor_liquidado) / Number(r.valor_autorizado)))}%`}} />
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Diferença entre dotação e liquidação: {dinheiro(Number(r.valor_autorizado) - Number(r.valor_liquidado))}.
                      Esse saldo não significa desvio ou transferência para outra área.
                    </p>
                    <p className="text-[11px] text-slate-500">O RREO Anexo 02 não identifica pagamentos individuais ou fornecedores.</p>
                  </div>
                )}
                {info && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-slate-800 space-y-1">
                    <div className="font-semibold">
                      {info.ehPrevisto ? 'Diferença entre repasse previsto e transferido' : 'Diferença entre anúncio e transferência'}:
                      {' '}{dinheiro(info.diferenca)}
                    </div>
                    <p>
                      {info.diferenca > 0
                        ? 'Parcela ainda não identificada como transferida nesta referência. Não significa dinheiro desaparecido.'
                        : info.diferenca < 0
                          ? 'O transferido supera a referência inicial; confira alterações e aditivos.'
                          : 'A transferência registrada corresponde à referência comparada.'}
                    </p>
                    <p>Motivo documentado: {r.motivo_diferenca || 'Não informado na fonte cadastrada.'}</p>
                  </div>
                )}
                <p className="text-xs text-slate-600">
                  {r.orgao_destino ? <>{r.orgao_origem || 'Origem não informada'} <ArrowRight className="w-3 h-3 inline" /> {r.orgao_destino}</> : <>Órgão responsável: {r.orgao_origem || 'Não informado'}</>}
                </p>
                <div className="flex gap-4 flex-wrap text-xs">
                  {urlSegura(r.fonte_url) && (
                    <a href={urlSegura(r.fonte_url)} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex gap-1 items-center">
                      Fonte oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="text-slate-500">Consulta registrada: {dataBR(r.fonte_atualizada_em)}</span>
                  <button type="button" className="text-blue-700 font-semibold underline"
                    onClick={() => {setMovimentos([]);setErroMovimentos(null);setCarregandoMovimentos(!escolhido);setSelecionado(escolhido ? null : r);}}>
                    {escolhido ? 'Ocultar detalhes' : 'Detalhes e comprovantes'}
                  </button>
                </div>
                {escolhido && (
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <h4 className="font-semibold text-xs">Movimentos individualizados com comprovantes</h4>
                    {carregandoMovimentos ? (
                      <p className="text-xs text-slate-600">Carregando...</p>
                    ) : erroMovimentos ? <p role="alert" className="text-xs text-amber-900">{erroMovimentos}</p> : movimentos.length === 0 ? (
                      <p className="text-xs text-slate-600">
                        Este registro não possui pagamentos individuais vinculados nesta base.
                        Para identificar fornecedores e documentos de pagamento, é necessária outra fonte oficial com esse detalhamento.
                      </p>
                    ) : movimentos.map(m => (
                      <div key={m.id} className="rounded bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                        <div className="flex justify-between font-semibold gap-2">
                          <span>{statusMovimento[m.tipo] || m.tipo}</span><span>{dinheiro(m.valor)}</span>
                        </div>
                        <p>{m.descricao || 'Descrição não informada'} · {dataBR(m.data_evento)}</p>
                        <p className="text-slate-600">{m.orgao_origem || 'Origem não informada'} → {m.fornecedor || m.orgao_destino || 'Destino não informado'}</p>
                        {m.documento_numero && <p className="text-slate-500">Documento: {m.documento_numero}</p>}
                        {urlSegura(m.fonte_url) && (
                          <a href={urlSegura(m.fonte_url)} target="_blank" rel="noopener noreferrer"
                            className="text-blue-700 underline inline-flex gap-1 items-center">
                            Consultar comprovante <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                    <p className="text-[11px] text-slate-500">Repasses e pagamentos representam etapas diferentes e não devem ser somados como uma única despesa.</p>
                  </div>
                )}
              </article>
            );
          })}
          {filtrados.length > visiveis && (
            <button type="button" onClick={() => setVisiveis(v => v + 20)}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100">
              Mostrar mais resultados ({Math.min(20, filtrados.length - visiveis)} próximos)
            </button>
          )}
        </div>
      )}
      <p className="text-[11px] text-slate-500">
        Referência metodológica: execução orçamentária (empenho, liquidação e pagamento)
        e transferências registradas em bases públicas. Falta de dado não constitui prova de desvio.
      </p>
    </section>
  );
}
