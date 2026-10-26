import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Scale, Filter, Users, Eye, Mail, Copy, 
  CheckCircle2, X, AlertTriangle, ExternalLink, Loader2, 
  MapPin, Building2, Landmark, RefreshCw, FileText,
  Award, DollarSign, ShieldCheck
} from 'lucide-react';
import { supabase } from './supabaseClient';

const ESTADOS_BRASIL = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

// Mapeamento oficial dos Tribunais de Contas por Estado (TCE/TCM)
const MAPA_TRIBUNAIS_CONTAS = {
  SP: { nome: "TCE-SP / TCM-SP", url: "https://www.tcesp.tc.br/" },
  RJ: { nome: "TCE-RJ / TCM-Rio", url: "https://www.tcerj.tc.br/" },
  MG: { nome: "TCE-MG", url: "https://www.tce.mg.gov.br/" },
  RS: { nome: "TCE-RS", url: "https://portal.tce.rs.gov.br/" },
  PR: { nome: "TCE-PR", url: "https://www.tce.pr.gov.br/" },
  SC: { nome: "TCE-SC", url: "https://www.tcesc.tc.br/" },
  BA: { nome: "TCE-BA / TCM-BA", url: "https://www.tce.ba.gov.br/" },
  PE: { nome: "TCE-PE", url: "https://www.tce.pe.gov.br/" },
  CE: { nome: "TCE-CE", url: "https://www.tce.ce.gov.br/" },
  GO: { nome: "TCE-GO / TCM-GO", url: "https://www.tce.go.gov.br/" },
  DF: { nome: "TCDF (Distrito Federal)", url: "https://www.tc.df.gov.br/" },
  ES: { nome: "TCE-ES", url: "https://www.tcees.tc.br/" },
  MT: { nome: "TCE-MT", url: "https://www.tce.mt.gov.br/" },
  MS: { nome: "TCE-MS", url: "https://www.tce.ms.gov.br/" },
  PA: { nome: "TCE-PA / TCM-PA", url: "https://www.tcepa.tc.br/" },
  AM: { nome: "TCE-AM", url: "https://www.tce.am.gov.br/" },
  MA: { nome: "TCE-MA", url: "https://www.tce.ma.gov.br/" },
  PB: { nome: "TCE-PB", url: "https://tce.pb.gov.br/" },
  RN: { nome: "TCE-RN", url: "https://www.tce.rn.gov.br/" },
  AL: { nome: "TCE-AL", url: "https://www.tceal.tc.br/" },
  PI: { nome: "TCE-PI", url: "https://www.tcepi.tc.br/" },
  SE: { nome: "TCE-SE", url: "https://www.tce.se.gov.br/" },
  RO: { nome: "TCE-RO", url: "https://tcero.tc.br/" },
  TO: { nome: "TCE-TO", url: "https://www.tceto.tc.br/" },
  AC: { nome: "TCE-AC", url: "https://www.tceac.tc.br/" },
  AP: { nome: "TCE-AP", url: "https://www.tce.ap.gov.br/" },
  RR: { nome: "TCE-RR", url: "https://www.tcerr.tc.br/" }
};

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
      // 1. Busca no Supabase
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
            rawId: p.id,
            nome: p.nome_urna || p.nome,
            nomeCompleto: p.nome,
            siglaPartido: p.partido,
            siglaUf: p.estado,
            cargo: p.cargo,
            esfera: p.esfera,
            municipio: p.municipio,
            anoEleicao: p.ano_eleicao || 2024,
            situacao: p.situacao || "Eleito",
            urlFoto: p.foto_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            origem: "Supabase (TSE)",
            gastoAcumulado: Number(p.gasto_acumulado) || 0,
            linkTse: p.link_tse,
            linkTransparencia: p.link_transparencia
          }));
          results = [...results, ...formattedSupa];
        }
      }

      // 2. Busca na API Aberta da Câmara (Deputados Federais)
      if (selectedCargo === "todos" || selectedCargo === "deputado_federal") {
        let camaraUrl = `https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=16`;
        if (searchTerm.trim()) camaraUrl += `&nome=${encodeURIComponent(searchTerm.trim())}`;
        if (selectedUf) camaraUrl += `&siglaUf=${selectedUf}`;

        const res = await fetch(camaraUrl, { headers: { Accept: "application/json" } });
        if (res.ok) {
          const camaraData = await res.json();
          const formattedCamara = (camaraData.dados || []).map(d => ({
            id: d.id,
            rawId: d.id,
            nome: d.nome,
            nomeCompleto: d.nome,
            siglaPartido: d.siglaPartido,
            siglaUf: d.siglaUf,
            cargo: "Deputado Federal",
            esfera: "Federal",
            municipio: "Brasília / DF",
            urlFoto: d.urlFoto,
            email: d.email,
            anoEleicao: 2022,
            situacao: "Em Exercício",
            origem: "Câmara Federal (API Ao Vivo)",
            gastoAcumulado: 0,
            linkTse: `https://dadosabertos.camara.leg.br/api/v2/deputados/${d.id}`,
            linkTransparencia: `https://www.camara.leg.br/deputados/${d.id}`
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

    const isFederalCamara = pol.esfera === "Federal" && !String(pol.id).startsWith("supa-");

    if (isFederalCamara) {
      try {
        const res = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${pol.rawId}/despesas?ordem=DESC&ordenarPor=dataDocumento&itens=25`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          setExpenses(data.dados || []);
        }
      } catch (e) {
        console.error("Erro ao buscar despesas da câmara:", e);
      }
    }
    setIsLoadingExpenses(false);
  };

  const openPetitionModal = (pol) => {
    const textoOficio = `AO MINISTÉRIO PÚBLICO / TRIBUNAL DE CONTAS / SISTEMA FALA.BR

ASSUNTO: REQUERIMENTO FORMAL DE TRANSPARÊNCIA E AUDITORIA DE RECURSOS PÚBLICOS (LEI Nº 12.527/2011 E ART. 37 DA CF/88)

Excelentíssimos Senhores,

Na qualidade de cidadão e contribuinte fiscalizador, solicito a disponibilização detalhada e auditoria das contas públicas e subsídios referentes à seguinte autoridade:

NOME: ${pol.nome.toUpperCase()} (${pol.nomeCompleto})
CARGO: ${pol.cargo} (${pol.esfera})
PARTIDO / UF: ${pol.siglaPartido} - ${pol.siglaUf}
LOCALIDADE: ${pol.municipio || "Âmbito Estadual/Nacional"}

FUNDAMENTAÇÃO JURÍDICA:
Com amparo no Art. 5º, XXXIII e Art. 37 da Constituição Federal de 1988, combinados com a Lei de Acesso à Informação (Lei 12.527/2011), requer-se:
1. O detalhamento das notas fiscais comprobatórias de verba de gabinete, cota parlamentar ou suprimento de fundos;
2. A prestação de contas dos valores pagos a título de diárias, assessoria e serviços de divulgação;
3. Relatório circunstanciado de assiduidade em sessões deliberativas.

Data: ${new Date().toLocaleDateString('pt-BR')}
Cidadão Fiscalizador`;

    setPetitionModal({ pol, textoOficio });
  };

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper para link do Tribunal de Contas
  const getTribunalContas = (uf) => {
    return MAPA_TRIBUNAIS_CONTAS[uf] || { nome: "Tribunal de Contas da União (TCU)", url: "https://portal.tcu.gov.br/" };
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
                  Transparência 360°
                </span>
              </div>
              <p className="text-xs text-slate-500">Auditoria integrada de todas as esferas: Presidência, Governadores, Deputados, Prefeitos e Vereadores</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Conexão: Supabase + API Câmara + Portais Oficiais
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
              Audite prefeitos, vereadores, governadores, deputados federais e a presidência com dados oficiais.
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
            <span>Resultados: <strong>{politicians.length}</strong></span>
            <span>Origem: Supabase (TSE) + API Federal</span>
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
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"; }}
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

      {/* PAINEL LATERAL DE INSPEÇÃO COMPLETA */}
      {selectedPolitician && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* CABEÇALHO DO PERFIL */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedPolitician.urlFoto} 
                    alt={selectedPolitician.nome} 
                    className="w-14 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"; }}
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedPolitician.nome}</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedPolitician.cargo} • {selectedPolitician.siglaPartido}-{selectedPolitician.siglaUf}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">{selectedPolitician.municipio}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Situação: {selectedPolitician.situacao || "Eleito"} ({selectedPolitician.anoEleicao || 2024})
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedPolitician(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ROTEAMENTO DE AUDITORIA POR CARGO */}
              {selectedPolitician.cargo === "Presidente" || selectedPolitician.cargo === "Vice-Presidente" ? (
                /* CASO 1: PRESIDÊNCIA */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                    <h3 className="font-bold text-amber-950 text-sm">Estrutura de Gastos do Poder Executivo Federal</h3>
                    <p className="text-amber-900 leading-relaxed">
                      Os gastos da Presidência da República não utilizam cota parlamentar (CEAP), sendo fiscalizados diretamente pelo <strong>TCU</strong> e controlados pelo <strong>Portal da Transparência (CGU) / SIAFI</strong>.
                    </p>
                    <div className="pt-2 border-t border-amber-200 font-mono text-[11px] space-y-1">
                      <div>• <strong>Cartão de Pagamentos (CPGF):</strong> Gastos de custeio e apoio ao gabinete.</div>
                      <div>• <strong>Diárias e Viagens Oficiais:</strong> Missões diplomáticas e roteiros de comitiva.</div>
                      <div>• <strong>Aeronaves e Fretamento:</strong> Apoio operacional e de segurança da FAB.</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href="https://portaldatransparencia.gov.br/cartoes"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Auditar Cartão Corporativo (CPGF) na CGU
                    </a>

                    <a
                      href="https://portaldatransparencia.gov.br/viagens"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition flex items-center justify-center gap-2 border border-slate-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Consultar Painel de Viagens e Diárias
                    </a>
                  </div>
                </div>

              ) : selectedPolitician.cargo === "Deputado Federal" && !String(selectedPolitician.id).startsWith("supa-") ? (
                /* CASO 2: DEPUTADOS FEDERAIS (API DA CÂMARA EM TEMPO REAL) */
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase text-slate-500 font-mono">Últimas Notas Fiscais Registradas (CEAP):</h3>
                    <a
                      href={`https://www.camara.leg.br/deputados/${selectedPolitician.rawId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                    >
                      Página Oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {isLoadingExpenses ? (
                    <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
                  ) : expenses.length === 0 ? (
                    <div className="p-4 bg-slate-50 border rounded-lg text-xs text-slate-500 font-mono space-y-2">
                      <p>Nenhuma despesa recente devolvida na listagem rápida da API oficial.</p>
                      <a
                        href={`https://www.camara.leg.br/deputados/${selectedPolitician.rawId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-bold block"
                      >
                        Clique aqui para ver a prestação completa no site da Câmara →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {expenses.map((exp, i) => (
                        <div key={i} className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="truncate pr-2">{exp.nomeFornecedor}</span>
                            <span className="font-mono shrink-0">{formatBRL(exp.valorLiquido)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{exp.tipoDespesa} • {exp.dataDocumento}</p>
                          {exp.urlDocumento && (
                            <a href={exp.urlDocumento} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-mono pt-0.5">
                              <ExternalLink className="w-3 h-3" /> Ver Nota Fiscal Original
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              ) : (
                /* CASO 3: VEREADORES, PREFEITOS E GOVERNADORES (MUNICIPAL / ESTADUAL) */
                <div className="space-y-4">
                  {/* Card de Informações Financeiras */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase font-mono">Gasto / Verba Anual Estimada:</span>
                      <span className="text-base font-extrabold font-mono text-slate-900">
                        {selectedPolitician.gastoAcumulado > 0 ? formatBRL(selectedPolitician.gastoAcumulado) : "Sob prestação anual"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Registro de custeio e subsídio referente a <strong>{selectedPolitician.municipio} - {selectedPolitician.siglaUf}</strong>.
                    </p>
                  </div>

                  {/* Links de Auditoria Oficial sem Google e sem Home Genérica */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-500 font-mono">Acesso Direto aos Órgãos de Controle:</h4>
                    
                    {/* Link 1: Ficha Oficial do TSE (DivulgaCand) */}
                    <a
                      href={selectedPolitician.linkTse || `https://divulgacandcontas.tse.jus.br/divulga/#/estados/${selectedPolitician.siglaUf}/municipios`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full p-3 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold flex items-center justify-between group transition shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-slate-900 group-hover:text-emerald-700 font-bold block">
                            {selectedPolitician.linkTse ? "Ficha Completa no TSE: Bens e Doadores" : "Consultar Candidatura no TSE (DivulgaCand)"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Declaração de patrimônio, bens e receitas de campanha
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </a>

                    {/* Link 2: Portal da Transparência da Câmara/Prefeitura/Governo */}
                    {selectedPolitician.linkTransparencia && (
                      <a
                        href={selectedPolitician.linkTransparencia}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-xs font-semibold flex items-center justify-between group transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-slate-900 group-hover:text-blue-700 font-bold block">
                              Portal da Transparência de {selectedPolitician.municipio || selectedPolitician.siglaUf}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Folha de pagamento, contratos e verbas de gabinete
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </a>
                    )}

                    {/* Link 3: Tribunal de Contas Estadual Oficial (TCE / TCM) */}
                    <a
                      href={getTribunalContas(selectedPolitician.siglaUf).url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full p-3 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-xs font-semibold flex items-center justify-between group transition shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Landmark className="w-4 h-4 text-slate-700 shrink-0" />
                        <div>
                          <span className="text-slate-900 group-hover:text-blue-700 font-bold block">
                            {getTribunalContas(selectedPolitician.siglaUf).nome} (Fiscalização Oficial)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Auditoria externa de conformidade e julgamento de contas
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </a>
                  </div>

                  {/* Gerador de Cobrança Formal */}
                  <button
                    onClick={() => openPetitionModal(selectedPolitician)}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-2 shadow-xs mt-2"
                  >
                    <Mail className="w-4 h-4" />
                    Gerar Notificação LAI / Cobrar Transparência
                  </button>
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
                <Scale className="w-4 h-4" /> Notificação Cívica Formal
              </span>
              <button onClick={() => setPetitionModal(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <textarea readOnly rows={12} value={petitionModal.textoOficio} className="w-full bg-slate-50 border rounded-lg p-3 text-xs font-mono select-all focus:outline-none" />
            <div className="flex justify-between items-center">
              {copied && <span className="text-emerald-700 text-xs font-mono font-bold">Copiado com sucesso!</span>}
              <div className="flex gap-2">
                <button onClick={() => handleCopy(petitionModal.textoOficio)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copiar Notificação
                </button>
                <a
                  href={`https://falabr.cgu.gov.br`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Protocolar no Fala.BR
                </a>
              </div>
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