import { useEffect, useState } from 'react';
import { ExternalLink, FileCheck2, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const STATUS = {
  concluido: { label: 'Concluído (com evidência)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  em_andamento: { label: 'Em andamento (com evidência)', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  nao_cumprido: { label: 'Não cumprido (documentado)', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  nao_verificado: { label: 'Não verificado', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const TIPOS = {
  campanha: 'Promessa de campanha',
  gestao: 'Compromisso de gestão',
  institucional: 'Meta institucional',
};

function linkOficial(url) {
  if (!url) return null;
  try {
    const result = new URL(url);
    return result.protocol === 'https:' ? result.href : null;
  } catch {
    return null;
  }
}

export default function Compromissos({ politico }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const origem = String(politico.id).startsWith('supa-') ? 'supabase' : 'camara';
  const idPessoa = String(politico.rawId);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      setErro(false);
      setRegistros([]);
      const { data, error } = await supabase
        .from('compromissos')
        .select('id,titulo,descricao,tipo,tema,status,fonte_compromisso_url,evidencia_url,data_verificacao,periodo_inicio,periodo_fim,observacao')
        .eq('origem_pessoa', origem)
        .eq('id_pessoa', idPessoa)
        .order('data_verificacao', { ascending: false, nullsFirst: false })
        .limit(200);
      if (!ativo) return;
      setErro(Boolean(error));
      setRegistros(error ? [] : (data || []));
      setCarregando(false);
    };
    carregar();
    return () => { ativo = false; };
  }, [origem, idPessoa]);

  const dataFormatada = (valor) => {
    if (!valor) return null;
    const [ano, mes, dia] = valor.slice(0, 10).split('-');
    return dia && mes && ano ? `${dia}/${mes}/${ano}` : null;
  };

  return (
    <section className="pt-5 border-t border-slate-200 space-y-3" aria-label="Compromissos documentados">
      <div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-blue-700" />
          <h3 className="font-bold text-slate-900 text-sm">Compromissos e resultados documentados</h3>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Promessas eleitorais e metas de gestão são categorias diferentes. O andamento só é
          classificado quando há documentação consultável. Não verificado não significa não cumprido.
        </p>
      </div>

      {carregando ? (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Consultando compromissos...
        </div>
      ) : erro ? (
        <p className="text-xs p-3 rounded border border-amber-200 bg-amber-50 text-amber-900">
          A base de compromissos ainda não está disponível. Nenhuma classificação foi presumida.
        </p>
      ) : registros.length === 0 ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <p className="text-xs text-slate-700">
            Nenhum compromisso com fonte e evidência foi cadastrado para esta pessoa até o momento.
            Isso não significa que ela não tenha apresentado propostas.
          </p>
          <a href="https://divulgacandcontas.tse.jus.br/divulga/#/"
             target="_blank" rel="noopener noreferrer"
             className="text-xs text-blue-700 underline inline-flex gap-1 items-center">
            Consultar propostas registradas no TSE <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="border rounded px-2 py-1 bg-slate-50 text-slate-700">
              {registros.length} itens documentados
            </span>
            {Object.entries(STATUS).map(([codigo, cfg]) => {
              const total = registros.filter(item => item.status === codigo).length;
              return total > 0 ? <span key={codigo} className={`border rounded px-2 py-1 ${cfg.color}`}>
                {cfg.label}: {total}
              </span> : null;
            })}
          </div>
          <div className="space-y-3">
            {registros.map(item => {
              const status = STATUS[item.status] || STATUS.nao_verificado;
              const urlOrigem = linkOficial(item.fonte_compromisso_url);
              const urlEvidencia = linkOficial(item.evidencia_url);
              return (
                <article key={item.id} className="border border-slate-200 rounded-lg bg-white p-3 space-y-2">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className={`border rounded px-2 py-0.5 ${status.color}`}>{status.label}</span>
                    <span className="bg-slate-100 text-slate-700 rounded px-2 py-0.5">
                      {TIPOS[item.tipo] || 'Compromisso'}
                    </span>
                    {item.tema && <span className="bg-slate-100 rounded px-2 py-0.5">{item.tema}</span>}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.titulo}</h4>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{item.descricao}</p>
                  {item.observacao && <p className="text-xs text-slate-600">{item.observacao}</p>}
                  {item.data_verificacao && (
                    <p className="text-[11px] text-slate-500">
                      Última verificação: {dataFormatada(item.data_verificacao)}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {urlOrigem && <a href={urlOrigem} target="_blank" rel="noopener noreferrer"
                      className="text-blue-700 underline inline-flex items-center gap-1">
                      Documento da proposta <ExternalLink className="w-3 h-3" />
                    </a>}
                    {urlEvidencia && <a href={urlEvidencia} target="_blank" rel="noopener noreferrer"
                      className="text-blue-700 underline inline-flex items-center gap-1">
                      Evidência do resultado <ExternalLink className="w-3 h-3" />
                    </a>}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
