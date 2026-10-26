import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Scale, Filter, Users, Eye, Mail, Copy, 
  CheckCircle2, X, AlertTriangle, ExternalLink, Loader2, 
  MapPin, Building2, Landmark, RefreshCw, FileText
} from 'lucide-react';
import { supabase } from './supabaseClient';

const ESTADOS_BRASIL = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUf, setSelectedUf] = useState("");
  const [selectedCargo, setSelectedCargo] = useState("todos");
  
  const [politicians, setPoliticians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [petitionModal, setPetitionModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Consulta híbrida: Supabase (Presidente, Vereadores, Prefeitos, Gov) + API Câmara (Federais)
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    let results = [];

    try {
      // 1. Busca no Supabase (Executivo Federal, Municipal e Estadual)
      if (selectedCargo !== "deputado_federal") {
        let query = supabase.from('politicos').select('*');

        if (searchTerm.trim()) {
          query = query.ilike('nome_urna', `%${searchTerm.trim()}%`);
        }
        if (selectedUf) {
          query = query.eq('estado', selectedUf);
        }
        if (selectedCargo !== "todos") {
          query = query.ilike('cargo', `%${selectedCargo}%`);
        }

        const { data: supaData, error: supaError } = await query;
        if (!supaError && supaData) {
          const formattedSupa = supaData.map(p => ({
            id: `supa-${p.id}`,
            nome: p.nome_urna || p.nome,
            nomeCompleto: p.nome,
            siglaPartido: p.partido,
            siglaUf: p.estado,
            cargo: p.cargo,
            esfera: p.esfera,
            municipio: p.municipio,
            urlFoto: p.foto_url || "https://via.placeholder.com/150",
            origem: "Supabase",
            gastoAcumulado: p.gasto_acumulado
          }));
          results = [...results, ...formattedSupa];
        }
      }

      // 2. Busca na API Aberta da Câmara (Deputados Federais)
      if (selectedCargo === "todos" || selectedCargo === "deputado_federal") {
        let camaraUrl = `https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=15`;
        if (searchTerm.trim()) camaraUrl += `&nome=${encodeURIComponent(searchTerm.trim())}`;
        if (selectedUf) camaraUrl += `&siglaUf=${selectedUf}`;

        const res = await fetch(camaraUrl, { headers: { Accept: "application/json" } });
        if (res.ok) {
          const camaraData = await res.json();
          const formattedCamara = (camaraData.dados || []).map(d => ({
            id: d.id,
            nome: d.nome,
            nomeCompleto: d.nome,
            siglaPartido: d.siglaPartido,
            siglaUf: d.siglaUf,
            cargo: "Deputado Federal",
            esfera: "Federal",
            municipio: "Brasília / DF",
            urlFoto: d.urlFoto,
            email: d.email,
            origem: "Câmara Federal (API Ao Vivo)"
          }));
          results = [...results, ...formattedCamara];
        }
      }

      setPoliticians(results);
    } catch (err) {
      setErrorMsg("Ocorreu uma falha ao sincronizar as bases de dados.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedUf, selectedCargo]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Carrega despesas ao vivo para deputados federais
  const inspectPolitician = async (pol) => {
    setSelectedPolitician(pol);
    setIsLoadingExpenses(true);
    setExpenses([]);

    if (pol.esfera === "Federal" && !String(pol.id).startsWith("supa-")) {
      try {
        const res = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${pol.id}/despesas?ordem=DESC&ordenarPor=dataDocumento&itens=20`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          setExpenses(data.dados || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoadingExpenses(false);
  };

  const openPetitionModal = (pol) => {
    const textoOficio = `AO MINISTÉRIO PÚBLICO / TRIBUNAL DE CONTAS / FALA.BR

ASSUNTO: SOLICITAÇÃO FORMAL DE AUDITORIA E PRESTAÇÃO DE CONTAS (LEI 12.527/2011 E ART. 37 DA CF/88)

Excelentíssimos Senhores,

Na condição de cidadão e contribuinte, solicito a auditoria das despesas públicas e subsídios referentes à seguinte autoridade:

NOME: ${pol.nome.toUpperCase()}
CARGO: ${pol.cargo} (${pol.esfera})
PARTIDO / UF: ${pol.siglaPartido} - ${pol.siglaUf}
LOCALIDADE: ${pol.municipio || "Âmbito Nacional"}

REQUERIMENTO:
Requer-se a disponibilização integral dos comprovativos fiscais de despesas de gabinete, diárias e verbas indenizatórias do exercício corrente.

Data: ${new Date().toLocaleDateString('pt-BR')}
Cidadão Fiscalizador`;

    setPetitionModal({ pol, textoOficio });
  };

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg">Radar Cívico</span>
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Supabase + APIs Oficiais
                </span>
              </div>
              <p className="text-xs text-slate-500">Auditoria integrada: Presidência, Governadores, Deputados, Prefeitos e Vereadores</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Base sincronizada com o Supabase
          </div>
        </div>
      </header>

      {/* ÁREA DE BUSCA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pesquisar Políticos em Todas as Esferas
            </h1>
            <p className="text-sm text-slate-600">
              Filtre por cargo (Presidente, Governador, Prefeito, Vereador ou Deputado), estado ou digite o nome para auditar.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchAllData(); }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* Input Nome */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome do político..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>

            {/* Cargo */}
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="todos">Todos os Cargos</option>
              <option value="Presidente">Presidência da República</option>
              <option value="Governador">Governadores</option>
              <option value="Prefeito">Prefeitos</option>
              <option value="Vereador">Vereadores</option>
              <option value="deputado_federal">Deputados Federais (Ao Vivo)</option>
            </select>

            {/* Estado */}
            <select
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="">Todos os Estados (UF)</option>
              {ESTADOS_BRASIL.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition py-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Filtrar
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* LISTAGEM DOS RESULTADOS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono px-1">
            <span>Encontrados: <strong>{politicians.length}</strong></span>
            <span>Bases: Supabase + API Federal</span>
          </div>

          {isLoading ? (
            <div className="p-16 text-center bg-white border border-slate-200 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-slate-500 font-mono mt-3">A carregar registos unificados...</p>
            </div>
          ) : politicians.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">Nenhum resultado localizado</h3>
              <p className="text-xs text-slate-500">Tente ajustar os filtros ou a palavra-chave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {politicians.map((pol) => (
                <div key={pol.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pol.esfera === 'Federal' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        pol.esfera === 'Estadual' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {pol.esfera}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{pol.siglaPartido} • {pol.siglaUf}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img 
                        src={pol.urlFoto} 
                        alt={pol.nome} 
                        className="w-12 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate" title={pol.nome}>
                          {pol.nome}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{pol.cargo}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{pol.municipio}</p>
                      </div>
                    </div>

                    {pol.gastoAcumulado > 0 && (
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs font-mono flex justify-between">
                        <span className="text-slate-500">Gasto Anual:</span>
                        <span className="font-bold text-slate-900">{formatBRL(pol.gastoAcumulado)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => inspectPolitician(pol)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold font-mono transition flex items-center justify-center gap-1 border border-blue-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspecionar
                    </button>
                    <button
                      onClick={() => openPetitionModal(pol)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Gerar Cobrança"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* PAINEL LATERAL DE INSPEÇÃO */}
      {selectedPolitician && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <img src={selectedPolitician.urlFoto} alt={selectedPolitician.nome} className="w-14 h-16 rounded-xl object-cover border" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedPolitician.nome}</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedPolitician.cargo} • {selectedPolitician.siglaPartido}-{selectedPolitician.siglaUf}
                    </p>
                    <p className="text-[11px] text-slate-600">{selectedPolitician.municipio}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPolitician(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ROTEAMENTO DE AUDITORIA POR CARGO/ESFERA */}
              {selectedPolitician.cargo === "Presidente" || selectedPolitician.cargo === "Vice-Presidente" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <h3 className="font-bold text-amber-950 text-sm">Estrutura de Gastos do Poder Executivo Federal</h3>
                    <p className="text-amber-900 leading-relaxed">
                      Os gastos da Chefia de Estado e de Governo não utilizam a cota parlamentar (CEAP), sendo fiscalizados diretamente pelo <strong>TCU</strong> e controlados pelo <strong>Portal da Transparência (CGU) / SIAFI</strong>.
                    </p>
                    <div className="pt-2 border-t border-amber-200 font-mono text-[11px] space-y-1">
                      <div>• <strong>Cartão de Pagamentos (CPGF):</strong> Gastos de custeio e apoio ao gabinete.</div>
                      <div>• <strong>Diárias e Passagens:</strong> Missões diplomáticas e viagens domésticas.</div>
                      <div>• <strong>Apoio Logístico FAB:</strong> Fretamentos e deslocamentos em aeronaves oficiais.</div>
                    </div>
                  </div>

<div className="space-y-2 pt-2">
  <a
    href="https://portaldatransparencia.gov.br/cartoes"
    target="_blank"
    rel="noreferrer"
    className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-xs"
  >
    <ExternalLink className="w-4 h-4" />
    Consultar Cartões de Pagamento (CPGF)
  </a>

  <a
    href="https://portaldatransparencia.gov.br/viagens"
    target="_blank"
    rel="noreferrer"
    className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition flex items-center justify-center gap-2 border border-slate-300"
  >
    <ExternalLink className="w-4 h-4" />
    Painel de Viagens e Diárias Oficiais
  </a>
</div>
                </div>
              ) : selectedPolitician.esfera === "Federal" ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-slate-500 font-mono">Últimas Notas Fiscais (Cota CEAP):</h3>
                  {isLoadingExpenses ? (
                    <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
                  ) : expenses.length === 0 ? (
                    <div className="p-4 bg-slate-50 text-xs text-slate-500 rounded-lg">Sem despesas recentes registadas na API.</div>
                  ) : (
                    <div className="space-y-2">
                      {expenses.map((exp, i) => (
                        <div key={i} className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>{exp.nomeFornecedor}</span>
                            <span>{formatBRL(exp.valorLiquido)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{exp.tipoDespesa} • {exp.dataDocumento}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900">Transparência Municipal e Estadual</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Os dados deste político foram carregados a partir da base do Tribunal Superior Eleitoral (TSE) gravada no seu <strong>Supabase</strong>.
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">Origem: Prestação de Contas Eleitorais e Portal da Transparência Local.</p>
                </div>
              )}
            </div>

            <button onClick={() => setSelectedPolitician(null)} className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono font-semibold">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL COBRANÇA */}
      {petitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-blue-700 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Notificação Cívica
              </span>
              <button onClick={() => setPetitionModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <textarea readOnly rows={10} value={petitionModal.textoOficio} className="w-full bg-slate-50 border rounded-lg p-3 text-xs font-mono select-all focus:outline-none" />
            <div className="flex justify-between items-center">
              {copied && <span className="text-emerald-700 text-xs font-mono font-bold">Copiado com sucesso!</span>}
              <button onClick={() => handleCopy(petitionModal.textoOficio)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> Copiar Notificação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Radar Cívico • Transparência Unificada (Supabase + Dados Abertos Governamentais)
        </div>
      </footer>
    </div>
  );
}