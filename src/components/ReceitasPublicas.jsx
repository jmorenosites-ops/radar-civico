import { useEffect, useMemo, useState } from 'react';
import { Landmark, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const reais = v => v == null ? 'Não informado'
  : new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(v));
const codigos = [
  ['ReceitasExcetoIntraOrcamentarias','Receitas realizadas, exceto intraorçamentárias'],
  ['Impostos','Impostos arrecadados'],
  ['Taxas','Taxas arrecadadas'],
  ['TransferenciasCorrentes','Transferências correntes recebidas'],
];
const urlOficial = v => {
  try {const x = new URL(v);return x.protocol === 'https:' ? x.href : null;} catch{return null;}
};

export default function ReceitasPublicas({ ano, uf, esfera }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  useEffect(() => {
    let ativo=true;
    (async () => {
      const {data,error}=await supabase.from('receitas_publicas')
        .select('ente_id,ano_referencia,periodo,esfera,uf,municipio,orgao_responsavel,codigo_conta,nome_conta,valor_realizado,valor_previsto,fonte_url,data_consulta')
        .limit(1000);
      if(!ativo) return;
      setRegistros(error?[]:(data||[]));
      setErro(error?'A base de receitas não está disponível nesta consulta.':null);
      setCarregando(false);
    })();
    return ()=>{ativo=false;};
  },[]);
  const entes=useMemo(() => {
    const filtrados=registros.filter(r => Number(r.ano_referencia) === Number(ano)
      && (!uf || r.uf === uf) && (!esfera || r.esfera === esfera));
    const grupos=new Map();
    for(const registro of filtrados) {
      const key=String(registro.ente_id)+'-'+registro.ano_referencia;
      if(!grupos.has(key)) grupos.set(key,[]);
      grupos.get(key).push(registro);
    }
    return [...grupos.values()];
  },[registros,ano,uf,esfera]);

  if(carregando) return <p className="text-xs text-slate-600 flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin"/> Carregando receitas oficiais...</p>;
  if(erro) return <div className="border border-amber-200 rounded-lg p-3 text-xs text-amber-900">{erro}</div>;
  if(!entes.length) return <p className="border border-slate-200 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
    Ainda não há receita oficial integrada para o período, estado e esfera escolhidos. A ausência de registros não representa arrecadação zero.
  </p>;

  return <div className="space-y-4">
    {entes.map(items => {
      const base=items[0];
      const fonte=urlOficial(base.fonte_url);
      const mapa=new Map(items.map(r=>[r.codigo_conta,r]));
      return <article key={base.ente_id+'-'+base.ano_referencia}
        className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
        <div>
          <div className="flex gap-2 items-center text-blue-700 font-semibold text-xs">
            <Landmark className="w-4 h-4"/> De onde vem o dinheiro
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">{base.orgao_responsavel}</h3>
          <p className="text-xs text-slate-600">
            Receita realizada de janeiro até o {Number(base.periodo)*2}º mês de {base.ano_referencia}
            {' '}— RREO Anexo 01, Tesouro Nacional
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {codigos.map(([code,label]) => {
            const dado=mapa.get(code);
            if(!dado) return null;
            return <div key={code} className="border border-slate-200 bg-white rounded-lg p-3">
              <p className="text-xs text-slate-600">{label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{reais(dado.valor_realizado)}</p>
              <p className="text-[11px] text-slate-500">Previsão atualizada: {reais(dado.valor_previsto)}</p>
            </div>;
          })}
        </div>
        <p className="text-xs text-slate-600">
          Impostos, taxas e transferências são componentes de receitas maiores.
          Não some esses cartões entre si: isso duplicaria valores. Receitas recebidas não significam valores já gastos.
        </p>
        {fonte && <a href={fonte} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-700 underline inline-flex items-center gap-1">
          Consultar a origem oficial <ExternalLink className="w-3 h-3"/>
        </a>}
      </article>;
    })}
  </div>;
}
