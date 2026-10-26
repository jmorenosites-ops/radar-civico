import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Scale, Filter, Users, Eye, Mail, Copy, 
  CheckCircle2, X, AlertTriangle, ExternalLink, Loader2, 
  MapPin, Building2, RefreshCw, FileText, ChevronRight
} from 'lucide-react';

const ESTADOS_BRASIL = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", 
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export default function App() {
  // Estados de pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUf, setSelectedUf] = useState("");
  const [politicians, setPoliticians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Estados de inspeção detalhada
  const [selectedPolitician, setSelectedPolitician] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  // Modal de denúncia / ofício
  const [petitionModal, setPetitionModal] = useState(null);
  const [copied, setCopied] = useState(false);

  // Formatação de valores
  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // 1. Pesquisa de políticos em direto na API Oficial da Câmara
  const fetchPoliticians = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      let url = `https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome`;
      if (searchTerm.trim()) url += `&nome=${encodeURIComponent(searchTerm.trim())}`;
      if (selectedUf) url += `&siglaUf=${selectedUf}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Erro ao consultar a API oficial.");
      const data = await res.json();
      setPoliticians(data.dados || []);
    } catch (err) {
      setErrorMsg("Não foi possível carregar os dados em direto. Verifique a sua ligação ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedUf]);

  // Carrega a listagem inicial
  useEffect(() => {
    fetchPoliticians();
  }, [fetchPoliticians]);

  // 2. Descarrega despesas reais e detalhadas daquele deputado específico
  const inspectPolitician = async (pol) => {
    setSelectedPolitician(pol);
    setIsLoadingExpenses(true);
    setExpenses([]);
    try {
      // Consulta as últimas despesas da cota parlamentar (CEAP)
      const res = await fetch(
        `https://dadosabertos.camara.leg.br/api/v2/deputados/${pol.id}/despesas?ordem=DESC&ordenarPor=dataDocumento&itens=25`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.dados || []);
      }
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  // Gerador de ofício com base nos dados oficiais
  const openPetitionModal = (pol) => {
    const totalGasto = expenses.reduce((acc, curr) => acc + (curr.valorLiquido || 0), 0);
    const textoOficio = `AO MINISTÉRIO PÚBLICO FEDERAL / CONTROLADORIA-GERAL DA UNIÃO (FALA.BR)

ASSUNTO: PEDIDO FORMAL DE ESCLARECIMENTO E PRESTAÇÃO DE CONTAS DE RECURSOS PÚBLICOS (LEI Nº 12.527/2011 E ART. 37 DA CF/88)

Excelentíssimos Senhores,

Na qualidade de cidadão e contribuinte, solicito a fiscalização e auditoria das despesas ressarcidas pela Cota para o Exercício da Atividade Parlamentar (CEAP) sob titularidade de:

PARLAMENTAR: ${pol.nome.toUpperCase()}
PARTIDO / UF: ${pol.siglaPartido} - ${pol.siglaUf}
ID OFICIAL NA CÂMARA: ${pol.id}
EMAIL DO GABINETE: ${pol.email}
TOTAL AMOSTRAL AUDITADO NO PERÍODO: ${formatBRL(totalGasto)}

FUNDAMENTAÇÃO:
Nos termos do Artigo 37 da Constituição Federal (Princípios da Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência) e da Lei de Acesso à Informação (Lei 12.527/2011), requer-se o envio detalhado das notas fiscais comprobatórias e justificativa da finalidade pública de tais despesas.

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
      
      {/* CABEÇALHO */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg">Radar Cívico</span>
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Dados Reais em Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-500">Auditoria pública conectada diretamente aos sistemas oficiais</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ligação direta: API Oficial da Câmara dos Deputados
          </div>
        </div>
      </header>

      {/* ÁREA DE BUSCA E FILTROS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pesquisar Políticos e Gastos da Cota Parlamentar
            </h1>
            <p className="text-sm text-slate-600">
              Digite o nome de qualquer parlamentar ou selecione o estado para inspecionar notas fiscais e reembolsos em tempo real.
            </p>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); fetchPoliticians(); }}
            className="flex flex-col md:flex-row items-center gap-3 pt-2"
          >
            {/* Input de Nome */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Exemplo: Nikolas, Boulos, Tabata, Lira, Eduardo..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>

            {/* Seletor de Estado */}
            <div className="w-full md:w-48">
              <select
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-blue-600 transition"
              >
                <option value="">Todos os Estados (UF)</option>
                {ESTADOS_BRASIL.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            {/* Botão de Pesquisa */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-xs"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Pesquisar
            </button>
          </form>
        </div>

        {/* FEEDBACK DE ERRO OU CARREGAMENTO */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* RESULTADOS DA PESQUISA */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-500 font-mono px-1">
            <span>Resultados encontrados: <strong>{politicians.length}</strong></span>
            <span>Origem: Dados Abertos Federais</span>
          </div>

          {isLoading ? (
            <div className="p-16 text-center space-y-3 bg-white border border-slate-200 rounded-xl">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-slate-500 font-mono">A consultar a base oficial em Brasília...</p>
            </div>
          ) : politicians.length === 0 ? (
            <div className="p-12 text-center space-y-2 bg-white border border-slate-200 rounded-xl">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700">Nenhum resultado encontrado</h3>
              <p className="text-xs text-slate-500">Tente buscar por outro termo ou limpe o filtro de estado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {politicians.map((pol) => (
                <div 
                  key={pol.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
                >
                  <div className="space-y-3">
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
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {pol.siglaPartido || "S/P"} • {pol.siglaUf}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate" title={pol.email}>
                          {pol.email || "E-mail sob consulta"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => inspectPolitician(pol)}
                    className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 border border-blue-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspecionar Gastos Reais
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* GAVETA LATERAL DE INSPEÇÃO DE DESPESAS REAIS */}
      {selectedPolitician && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Topo do Painel */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedPolitician.urlFoto} 
                    alt={selectedPolitician.nome} 
                    className="w-16 h-20 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" 
                  />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedPolitician.nome}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Deputado(a) Federal • {selectedPolitician.siglaPartido} - {selectedPolitician.siglaUf}
                    </p>
                    <p className="text-xs text-blue-700 font-mono mt-1">{selectedPolitician.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPolitician(null)} 
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Botão de Ação: Cobrar */}
              <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-xs text-amber-900">
                  Notou alguma despesa suspeita ou excessiva nesta listagem?
                </span>
                <button
                  onClick={() => openPetitionModal(selectedPolitician)}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Gerar Cobrança
                </button>
              </div>

              {/* Lista de Notas Fiscais e Reembolsos */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-slate-500 font-mono">
                    Últimas Notas Fiscais Registradas (CEAP):
                  </h3>
                  {expenses.length > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Total Amostral: {formatBRL(expenses.reduce((a, b) => a + (b.valorLiquido || 0), 0))}
                    </span>
                  )}
                </div>

                {isLoadingExpenses ? (
                  <div className="py-12 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-mono">A transferir notas fiscais e comprovativos oficiais...</p>
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl font-mono">
                    Nenhuma despesa recente registada ou cota não utilizada no período consultado.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {expenses.map((exp, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900 block">{exp.nomeFornecedor}</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              CNPJ/CPF: {exp.cnpjCpfFornecedor || "Não informado"}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {formatBRL(exp.valorLiquido)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                          <span>{exp.tipoDespesa}</span>
                          <span className="font-mono">{exp.dataDocumento || "Data não informada"}</span>
                        </div>

                        {exp.urlDocumento && (
                          <div className="pt-1">
                            <a 
                              href={exp.urlDocumento} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-mono"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver Nota Fiscal Original / Comprovativo
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedPolitician(null)}
              className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold font-mono mt-6"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE OFÍCIO / COBRANÇA */}
      {petitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-blue-700 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Notificação Cívica Formal
              </span>
              <button onClick={() => setPetitionModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              O texto abaixo foi gerado automaticamente com os dados oficiais de <strong>{petitionModal.pol.nome}</strong>. Pode copiá-lo para protocolar na plataforma <strong>Fala.BR (CGU)</strong> ou enviar diretamente para o e-mail do gabinete.
            </p>

            <textarea
              readOnly
              rows={12}
              value={petitionModal.textoOficio}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none select-all"
            />

            <div className="flex justify-between items-center pt-2">
              <div>
                {copied && (
                  <span className="text-emerald-700 text-xs font-semibold font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Copiado para a área de transferência!
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(petitionModal.textoOficio)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </button>
                <a
                  href={`mailto:${petitionModal.pol.email}?subject=Pedido%20de%20Esclarecimento%20de%20Gastos%20Publicos&body=${encodeURIComponent(petitionModal.textoOficio)}`}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Enviar ao Gabinete
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <footer className="border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Radar Cívico • Fiscalização e Transparência com Dados Governamentais Abertos</span>
          <span>Fonte: API de Dados Abertos da Câmara dos Deputados (Lei 12.527/2011)</span>
        </div>
      </footer>

    </div>
  );
}