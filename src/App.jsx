import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {  
  Search, ShieldAlert, ArrowUpRight, FileText, CheckCircle2, Copy,  
  ExternalLink, ChevronRight, X, AlertCircle, Filter, Building2,  
  MapPin, Mail, Scale, Database, Terminal, ArrowRight, RefreshCw,
  TrendingUp, Users, SplitSquareVertical, Download, Eye, HelpCircle,
  FileCheck2, AlertTriangle, Layers, ArrowUpDown, Landmark, Globe,
  Server, Cpu, Check, Clock, Radio, Info, PieChart, ArrowRightLeft,
  DollarSign, Activity, Percent, BookOpen, AlertOctagon, TrendingDown,
  ChevronDown, Calculator, Vote, UserCheck, Briefcase, Share2, Award,
  LandmarkIcon, GitPullRequest, ShieldCheck, FileWarning, Coins, Zap
} from 'lucide-react';

// ============================================================================
// BASE DE DADOS NACIONAL AMPLIADA (VEREADORES, PREFEITOS, GOVERNADORES E PARLAMENTARES)
// ============================================================================
const INITIAL_DATABASE = [
  {
    id: "EXE-FED-01",
    name: "Presidência da República & Gabinetes",
    displayName: "Presidência e Ministérios",
    sphere: "Federal",
    sphereType: "federal",
    role: "Presidente & Chefia de Gabinete",
    roleType: "presidente",
    chamber: "Poder Executivo Federal",
    party: "Governo Federal",
    state: "DF",
    city: "Brasília",
    photo: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=280",
    email: "ouvidoria@presidencia.gov.br",
    cabinetPhone: "(61) 3411-1200",
    totalYearSpent: 28400000.00,
    monthlyAverage: 2366666.67,
    spendingIndexVsChamberAvg: 2.10,
    anomalyLevel: "warning",
    highlightAnomaly: "Diárias internacionais com cotação sob segredo parcial e contratos de logística de apoio aéreo.",
    summaryBio: "Contratos corporativos de suporte institucional, voos em jatos da FAB e cerimonial diplomático fiscalizados pelo TCU e CGU.",
    emendasTotalDestinadas: 0,
    emendasPix: [],
    qsaCrossings: [
      {
        company: "Comando Aéreo Logística FAB (Apoio)",
        cnpj: "00.394.452/0001-03",
        partnerName: "Órgão Estatal / Custeio Indireto",
        relationship: "Gestão Operacional de Defesa",
        riskDegree: "Médio",
        notes: "Uso do Artigo 86 do Decreto 93.872/86 para sigilo em faturas de hotelaria no exterior."
      }
    ],
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 7987000.00, note: "Imóveis, previdência privada VGBL e aplicações" },
      { year: "2022 (TSE)", declaredValue: 7423000.00, note: "Partilha de bens e regularização sucessória" },
      { year: "2026 (Atualizado)", declaredValue: 8190000.00, note: "Rendimento padrão de carteira e subsídio presidencial" }
    ],
    assetGrowthAlert: "Normal (+10.3% em 4 anos, compatível com a renda do cargo)",
    plenaryPresence: { presenceRate: 100, totalSessions: 0, unjustifiedAbsences: 0, note: "Chefe do Executivo não vota no plenário parlamentar." },
    keyVotes: [
      { bill: "Veto ao Fundão Eleitoral (PLN 2024)", decision: "Sanção Integral", impact: "Aprovou dotação recorde para campanhas públicas." }
    ],
    cabinetAnnualCost: 28400000.00,
    fundoPartidarioShare: 49800000.00,
    fundoEleitoralShare: 125000000.00,
    breakdown: { cotaOuSuprimento: 14200000.00, diariasHospedagem: 8900000.00, passagensFretamento: 5300000.00 },
    topSuppliers: [{ cnpj: "00.394.452/0001-03", name: "Comando da Aeronáutica (FAB)", amount: 14200000.00, sector: "Logística Aérea", riskFlag: "Manifesto nominal sob segredo" }],
    invoices: [{ id: "SIAFI-901", date: "18/09/2026", supplier: "Apoio Missão Diplomática", category: "Diárias Internacionais", value: 412000.00, status: "Atenção", flagNote: "Lista de assessores não discriminada" }]
  },
  {
    id: "DEP-SP-01",
    name: "Carlos Eduardo Mendonça",
    displayName: "Carlos Mendonça",
    sphere: "Federal",
    sphereType: "federal",
    role: "Deputado Federal",
    roleType: "deputado",
    chamber: "Câmara dos Deputados",
    party: "PL",
    state: "SP",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=280",
    email: "dep.carlosmendonca@camara.leg.br",
    cabinetPhone: "(61) 3215-5000",
    totalYearSpent: 489340.50,
    monthlyAverage: 40778.37,
    spendingIndexVsChamberAvg: 1.34,
    anomalyLevel: "critical",
    highlightAnomaly: "R$ 48.000 em locação de SUV blindada em empresa cujo sócio administrador é ex-assessor comissionado.",
    summaryBio: "Membro da Comissão de Finanças. Forte atuação no envio de Emendas Especiais (Pix) para o interior paulista.",
    emendasTotalDestinadas: 34500000.00,
    emendasPix: [
      {
        id: "PIX-SP-882",
        type: "Emenda Individual Especial (PIX)",
        destination: "Prefeitura Municipal de Santa Lúcia - SP",
        amount: 3500000.00,
        workPlanStatus: "Sem Plano de Trabalho Cadastrado",
        accountType: "Conta Corrente Comum (Opaca)",
        auditFlag: "Conta não vinculada a convênio TransfereGov; impossível rastrear compras no extrato bancário.",
        tcuAuditStatus: "Notificado pelo TCU para prestar contas em 60 dias"
      }
    ],
    qsaCrossings: [
      {
        company: "Prime Blindados & Locação Eireli",
        cnpj: "48.291.094/0001-89",
        partnerName: "Marcos Aurélio Silveira",
        relationship: "Ex-Secretário Parlamentar (Ex-assessor)",
        riskDegree: "Crítico",
        notes: "Empresa criada 4 meses antes da celebração do contrato de locação mensal continuada de veículos."
      }
    ],
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 420000.00, note: "1 Apartamento financiado e 1 veículo popular" },
      { year: "2022 (TSE)", declaredValue: 2850000.00, note: "Quotas de empresas, casa de campo e investimentos" },
      { year: "2026 (Atualizado)", declaredValue: 6900000.00, note: "Compra de 2 imóveis comerciais em nome de holding" }
    ],
    assetGrowthAlert: "Evolução Explosiva (+1.542% em 8 anos - Acima da renda líquida)",
    plenaryPresence: { presenceRate: 74.2, totalSessions: 112, unjustifiedAbsences: 29, note: "Taxa de faltas injustificadas superior a 25%." },
    keyVotes: [
      { bill: "Aumento do Fundão Eleitoral R$ 4,9 Bi", decision: "SIM (A Favor)", impact: "Votou pelo aumento do repasse aos diretórios." }
    ],
    cabinetAnnualCost: 489340.50 + (112000 * 12) + 416000,
    fundoPartidarioShare: 2400000.00,
    fundoEleitoralShare: 3100000.00,
    breakdown: { cotaOuSuprimento: 384500.00, diariasHospedagem: 42840.50, passagensFretamento: 62000.00 },
    topSuppliers: [{ cnpj: "48.291.094/0001-89", name: "Prime Blindados & Locação Eireli", amount: 142000.00, sector: "Locação de Veículos", riskFlag: "Sócio é ex-assessor" }],
    invoices: [{ id: "CAM-NF-981", date: "14/09/2026", supplier: "Prime Blindados", category: "Locação de Veículos", value: 24000.00, status: "Atenção", flagNote: "Aluguel pago a ex-assessor" }]
  },
  {
    id: "GOV-SP-01",
    name: "Tarcísio de Freitas (Exemplo Estadual)",
    displayName: "Gov. Tarcísio de Freitas",
    sphere: "Estadual",
    sphereType: "estadual",
    role: "Governador do Estado",
    roleType: "governador",
    chamber: "Governo do Estado de São Paulo",
    party: "REP",
    state: "SP",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=280",
    email: "atendimento@sp.gov.br",
    cabinetPhone: "(11) 2193-8000",
    totalYearSpent: 142000000.00,
    monthlyAverage: 11833333.33,
    spendingIndexVsChamberAvg: 1.45,
    anomalyLevel: "warning",
    highlightAnomaly: "Grandes concessões rodoviárias e repasses para secretarias sem detalhamento de despesa miúda.",
    summaryBio: "Chefe do Executivo Estadual de São Paulo. Gestão de infraestrutura, polícias estaduais e rede de saúde.",
    emendasTotalDestinadas: 0,
    emendasPix: [],
    qsaCrossings: [],
    assetHistory: [
      { year: "2022 (TSE)", declaredValue: 1200000.00, note: "Imóveis residenciais em Brasília e aplicações" }
    ],
    assetGrowthAlert: "Normal / Estável",
    plenaryPresence: { presenceRate: 100, totalSessions: 0, unjustifiedAbsences: 0, note: "Poder Executivo Estadual." },
    keyVotes: [],
    cabinetAnnualCost: 142000000.00,
    fundoPartidarioShare: 0,
    fundoEleitoralShare: 0,
    breakdown: { cotaOuSuprimento: 50000000.00, diariasHospedagem: 12000000.00, passagensFretamento: 8000000.00 },
    topSuppliers: [{ cnpj: "60.333.444/0001-12", name: "Consórcio Rodovias Paulistas", amount: 45000000.00, sector: "Infraestrutura", riskFlag: null }],
    invoices: [{ id: "GOV-SP-112", date: "10/09/2026", supplier: "Concessionária Viária", category: "Obras", value: 1250000.00, status: "Regular", flagNote: null }]
  },
  {
    id: "PREF-RJ-01",
    name: "Eduardo Paes (Exemplo Municipal)",
    displayName: "Prefeito Eduardo Paes",
    sphere: "Municipal",
    sphereType: "municipal",
    role: "Prefeito Municipal",
    roleType: "prefeito",
    chamber: "Prefeitura da Cidade do Rio de Janeiro",
    party: "PSD",
    state: "RJ",
    city: "Rio de Janeiro",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=280",
    email: "ouvidoria@rio.rj.gov.br",
    cabinetPhone: "(21) 2976-1000",
    totalYearSpent: 89000000.00,
    monthlyAverage: 7416666.67,
    spendingIndexVsChamberAvg: 1.25,
    anomalyLevel: "warning",
    highlightAnomaly: "Contratos de eventos municipais com dispensa de licitação em regime de urgência.",
    summaryBio: "Prefeito da capital fluminense. Gestão de transportes urbanos, escolas municipais e SUS municipal.",
    emendasTotalDestinadas: 0,
    emendasPix: [],
    qsaCrossings: [],
    assetHistory: [{ year: "2024 (TSE/TRIBUNAL)", declaredValue: 3500000.00, note: "Bens e investimentos declarados" }],
    assetGrowthAlert: "Estável",
    plenaryPresence: { presenceRate: 100, totalSessions: 0, unjustifiedAbsences: 0, note: "Poder Executivo Municipal." },
    keyVotes: [],
    cabinetAnnualCost: 89000000.00,
    fundoPartidarioShare: 0,
    fundoEleitoralShare: 0,
    breakdown: { cotaOuSuprimento: 30000000.00, diariasHospedagem: 5000000.00, passagensFretamento: 2000000.00 },
    topSuppliers: [{ cnpj: "33.444.555/0001-90", name: "Urbanizadora Carioca S.A.", amount: 25000000.00, sector: "Zeladoria Urbana", riskFlag: null }],
    invoices: [{ id: "PMC-RJ-44", date: "12/09/2026", supplier: "Urbanizadora", category: "Serviços", value: 350000.00, status: "Regular", flagNote: null }]
  },
  {
    id: "VER-SP-01",
    name: "Milton Leite (Exemplo Vereador)",
    displayName: "Ver. Milton Leite",
    sphere: "Municipal",
    sphereType: "municipal",
    role: "Vereador Municipal",
    roleType: "vereador",
    chamber: "Câmara Municipal de São Paulo",
    party: "UNIÃO",
    state: "SP",
    city: "São Paulo",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=280",
    email: "vermiltonleite@saopaulo.sp.leg.br",
    cabinetPhone: "(11) 3396-4000",
    totalYearSpent: 320000.00,
    monthlyAverage: 26666.67,
    spendingIndexVsChamberAvg: 1.10,
    anomalyLevel: "normal",
    highlightAnomaly: "Verba de gabinete utilizada dentro dos limites legais da Câmara Municipal.",
    summaryBio: "Vereador da capital paulista. Controle de verba de gabinete e auxílio-encargos gerais.",
    emendasTotalDestinadas: 5000000.00,
    emendasPix: [],
    qsaCrossings: [],
    assetHistory: [{ year: "2024", declaredValue: 4800000.00, note: "Imóveis na capital" }],
    assetGrowthAlert: "Compatível",
    plenaryPresence: { presenceRate: 92.0, totalSessions: 80, unjustifiedAbsences: 4, note: "Boa assiduidade." },
    keyVotes: [{ bill: "Revisão do Plano Master", decision: "SIM", impact: "Aprovou diretrizes de zoneamento urbano." }],
    cabinetAnnualCost: 320000.00 + (45000 * 12) + 240000,
    fundoPartidarioShare: 0,
    fundoEleitoralShare: 1500000.00,
    breakdown: { cotaOuSuprimento: 120000.00, diariasHospedagem: 10000.00, passagensFretamento: 0 },
    topSuppliers: [{ cnpj: "11.222.333/0001-44", name: "Gráfica Metropolitana", amount: 45000.00, sector: "Divulgação", riskFlag: null }],
    invoices: [{ id: "CMSP-88", date: "05/09/2026", supplier: "Gráfica", category: "Informativo", value: 8500.00, status: "Regular", flagNote: null }]
  }
];

const FUNDAO_PARTY_DATA = [
  { party: "PL", totalFundao: 886000000.00, spendingLawyers: 48000000.00, privateJets: 32000000.00, opinionPolls: 64000000.00, flag: "Maior beneficiário com 99 deputados eleitos." },
  { party: "PT", totalFundao: 814000000.00, spendingLawyers: 52000000.00, privateJets: 28000000.00, opinionPolls: 71000000.00, flag: "Forte concentração de repasses a institutos de pesquisa." },
  { party: "UNIÃO", totalFundao: 536000000.00, spendingLawyers: 38000000.00, privateJets: 24000000.00, opinionPolls: 41000000.00, flag: "Investigações sobre aluguel de jatinhos." },
  { party: "PSD", totalFundao: 421000000.00, spendingLawyers: 22000000.00, privateJets: 12000000.00, opinionPolls: 34000000.00, flag: "Equilíbrio entre candidaturas no Senado e Governos." },
  { party: "MDB", totalFundao: 362000000.00, spendingLawyers: 26000000.00, privateJets: 15000000.00, opinionPolls: 29000000.00, flag: "Uso de escritórios jurídicos com contratos contínuos." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("directory");
  const [politiciansData, setPoliticiansData] = useState(INITIAL_DATABASE);
  const [selectedPol, setSelectedPol] = useState(INITIAL_DATABASE[1]);
  
  const [notifyingItem, setNotifyingItem] = useState(null);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [userSalary, setUserSalary] = useState(3500);
  const [calcSelectedPolId, setCalcSelectedPolId] = useState(INITIAL_DATABASE[1].id);

  // Filtros de Esfera e Cargo
  const [sphereFilter, setSphereFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Sincronizado");
  const [liveApiFeed, setLiveApiFeed] = useState([]);

  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  const formatBRLDetailed = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(val);
  const formatMillions = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Bi`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} Mi`;
    return formatBRL(val);
  };

  const fetchLiveRealData = useCallback(async () => {
    setIsLiveSyncing(true);
    try {
      const res = await fetch("https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=12", {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dados) {
          setLiveApiFeed(data.dados);
          setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
        }
      }
    } catch (err) {
      console.warn("API oficial instável", err);
    } finally {
      setIsLiveSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveRealData();
  }, [fetchLiveRealData]);

  const filteredPoliticians = useMemo(() => {
    return politiciansData.filter(p => {
      const matchSphere = sphereFilter === "all" || p.sphereType === sphereFilter;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSphere && matchSearch;
    });
  }, [politiciansData, sphereFilter, searchTerm]);

  const citizenCalcMetrics = useMemo(() => {
    const annualGross = userSalary * 13.33;
    const estimatedTaxesPaidAnnual = annualGross * 0.385;
    const daysWorkedForTaxes = Math.round((estimatedTaxesPaidAnnual / annualGross) * 365);
    
    const pol = politiciansData.find(p => p.id === calcSelectedPolId) || politiciansData[1];
    const polCost = pol.cabinetAnnualCost;
    const citizensNeededToFundCabinet = Math.round(polCost / estimatedTaxesPaidAnnual);
    const citizenContributionToFundao = (4900000000 / 100000000).toFixed(2);

    return {
      annualGross,
      estimatedTaxesPaidAnnual,
      daysWorkedForTaxes,
      citizensNeededToFundCabinet,
      polCost,
      citizenContributionToFundao,
      polName: pol.displayName
    };
  }, [userSalary, calcSelectedPolId, politiciansData]);

  const generateEmendaPixPetition = (emenda, pol) => {
    return `AO MINISTÉRIO PÚBLICO FEDERAL (PROCURADORIA DA REPÚBLICA)
E AO TRIBUNAL DE CONTAS DA UNIÃO (SECEX-ESTADO)

ASSUNTO: REPRESENTAÇÃO CÍVICA E PEDIDO DE AUDITORIA SOBRE DESTINAÇÃO DE TRANSFERÊNCIA ESPECIAL ('EMENDA PIX') SEM PLANO DE TRABALHO REGISTRADO (LEI Nº 12.527/2011 E ADPF 854/STF)

Excelentíssimos Senhores Procuradores e Auditores,

Na qualidade de cidadão e contribuinte fiscalizador, apresento formalmente a presente notícia para apuração de indícios de opacidade:

1. AUTORIDADE / PARLAMENTAR: ${pol.name.toUpperCase()} (${pol.role} - ${pol.party}/${pol.state})
2. CÓDIGO DA TRANSFERÊNCIA: ${emenda.id}
3. DESTINATÁRIO: ${emenda.destination}
4. VALOR PAGO: ${formatBRLDetailed(emenda.amount)}
5. IRREGULARIDADE:
   - Situação TransfereGov: "${emenda.workPlanStatus}"
   - Conta Bancária: "${emenda.accountType}"
   - Alerta Cívico: "${emenda.auditFlag}"

REQUERIMENTO:
Requer-se a abertura de procedimento para exigir o envio imediato das notas fiscais e comprovantes de liquidação.

Brasil, ${new Date().toLocaleDateString('pt-BR')}.
Cidadão Fiscalizador`;
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">

      {/* =========================================================================
          BARRA DE TOPO EDITORIAL (RESPONSIVA E ALINHADA)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-4">
            
            {/* Logótipo */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
                  <Scale className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-tight text-slate-900 text-base">Radar Cívico</span>
                    <span className="text-[10px] font-bold font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      Transparência Plena 360°
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Auditoria unificada: Vereadores, Prefeitos, Deputados e Governadores</p>
                </div>
              </div>
            </div>

            {/* Menu de Abas */}
            <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "directory" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Diretório Nacional
              </button>

              <button
                onClick={() => setActiveTab("emendas_pix")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "emendas_pix" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Emendas Pix
              </button>

              <button
                onClick={() => setActiveTab("qsa_conflicts")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "qsa_conflicts" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-red-600" />
                Teia Societária
              </button>

              <button
                onClick={() => setActiveTab("citizen_calculator")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "citizen_calculator" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                Calculadora
              </button>

              <button
                onClick={() => setActiveTab("fundao_electoral")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "fundao_electoral" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-purple-600" />
                O "Fundão"
              </button>
            </nav>

            {/* Sincronizador */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md shrink-0">
              <span className={`w-2 h-2 rounded-full ${isLiveSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>{lastSyncTime}</span>
              <button 
                onClick={fetchLiveRealData} 
                disabled={isLiveSyncing}
                title="Sincronizar dados"
                className="hover:text-blue-600 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTEÚDO PRINCIPAL
      ======================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* =========================================================================
            ABA 1: DIRETÓRIO NACIONAL UNIFICADO (TODOS OS CARGOS)
        ========================================================================= */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  ESFERAS FEDERAL, ESTADUAL E MUNICIPAL UNIFICADAS
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Diretório Nacional de Gastos Públicos e Autoridades
                </h1>
                <p className="text-sm text-slate-600">
                  Consulte vereadores, prefeitos, deputados, senadores e governadores em um único lugar.
                </p>
              </div>

              {/* Filtros e Busca */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome, estado ou partido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  {['all', 'federal', 'estadual', 'municipal'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSphereFilter(s)}
                      className={`px-3 py-1 rounded font-mono uppercase text-[10px] font-bold transition ${
                        sphereFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de Políticos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPoliticians.map((pol) => (
                <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pol.sphere === 'Federal' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        pol.sphere === 'Estadual' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Esfera {pol.sphere}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{pol.party} • {pol.state}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img src={pol.photo} alt={pol.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{pol.displayName}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{pol.role}</p>
                        <p className="text-[11px] text-slate-600">{pol.city || pol.chamber}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Custo Anual / Gasto:</span>
                        <span className="font-bold text-slate-900">{formatMillions(pol.totalYearSpent)}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Média Mensal:</span>
                        <span className="font-bold text-slate-900">{formatBRL(pol.monthlyAverage)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {pol.summaryBio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setInspectingItem(pol)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspecionar Gastos
                    </button>
                    <button
                      onClick={() => setNotifyingItem({ ...pol, customPetition: `Ofício Cívico de Cobrança para ${pol.displayName} (${pol.role} - ${pol.party}/${pol.state}). Requer-se transparência sobre gastos públicos e aplicação de verbas no valor de ${formatBRL(pol.totalYearSpent)}.` })}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold font-mono flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" /> Cobrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: EMENDAS PIX
        ========================================================================= */}
        {activeTab === "emendas_pix" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                RASTREADOR DE EMENDAS ESPECIAIS (PIX)
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Emendas Pix e Transferências Diretas aos Municípios
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Monitore repasses federais enviados diretamente a prefeituras sem plano de trabalho prévio no TransfereGov.
              </p>
            </div>

            <div className="space-y-4">
              {politiciansData.map((pol) => {
                if (!pol.emendasPix || pol.emendasPix.length === 0) return null;
                return (
                  <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <img src={pol.photo} alt={pol.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{pol.role} • {pol.party}-{pol.state}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {pol.emendasPix.map((emenda) => (
                        <div key={emenda.id} className="p-4 bg-red-50/40 border border-red-200 rounded-xl text-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-red-100 text-red-800 border border-red-200">
                                {emenda.type}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm mt-1">{emenda.destination}</h4>
                            </div>
                            <div className="text-right font-mono">
                              <span className="text-slate-500 text-[11px] block">Valor</span>
                              <span className="text-base font-bold text-slate-900">{formatBRL(emenda.amount)}</span>
                            </div>
                          </div>
                          <div className="p-2.5 bg-white rounded border border-slate-200 flex justify-between items-center text-[11px]">
                            <span><strong>Status:</strong> {emenda.workPlanStatus}</span>
                            <button
                              onClick={() => setNotifyingItem({ ...pol, customPetition: generateEmendaPixPetition(emenda, pol) })}
                              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" /> Denunciar TCU / MPF
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: TEIA SOCIETÁRIA (QSA)
        ========================================================================= */}
        {activeTab === "qsa_conflicts" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                <GitPullRequest className="w-3.5 h-3.5 text-red-600" />
                RECEITA FEDERAL (QSA) X FORNECEDORES DE GABINETE
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Cruzamento de Parentesco e Sócio-Administradores
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Identifique empresas contratadas por gabinetes cujos sócios possuem vínculos familiares ou foram ex-assessores comissionados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {politiciansData.map((pol) => {
                if (!pol.qsaCrossings || pol.qsaCrossings.length === 0) return null;
                return (
                  <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <img src={pol.photo} alt={pol.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{pol.role} • {pol.party}/{pol.state}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pol.qsaCrossings.map((cross, i) => (
                        <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>{cross.company}</span>
                            <span className="text-red-600 font-mono">Risco {cross.riskDegree}</span>
                          </div>
                          <p className="text-[11px] text-slate-600"><strong>Vínculo:</strong> {cross.relationship}</p>
                          <p className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-200">{cross.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: CALCULADORA DO CONTRIBUINTE
        ========================================================================= */}
        {activeTab === "citizen_calculator" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                SIMULADOR DE ESFORÇO TRIBUTÁRIO
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                Calculadora do Cidadão: Quanto o Seu Trabalho Custa para o Estado?
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs space-y-4">
                <label className="text-xs font-bold uppercase font-mono text-slate-600 block">Sua Renda Bruta Mensal (R$):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">R$</span>
                  <input
                    type="number"
                    step="100"
                    value={userSalary}
                    onChange={(e) => setUserSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-base font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <label className="text-xs font-bold uppercase font-mono text-slate-600 block pt-2">Comparar com o Político:</label>
                <select
                  value={calcSelectedPolId}
                  onChange={(e) => setCalcSelectedPolId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                >
                  {politiciansData.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName} ({p.role})</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Dias Trabalhados para Impostos</span>
                    <div className="text-3xl font-extrabold font-mono text-red-600">{citizenCalcMetrics.daysWorkedForTaxes} dias</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Impostos Pagos no Ano</span>
                    <div className="text-2xl font-extrabold font-mono text-slate-900">{formatBRLDetailed(citizenCalcMetrics.estimatedTaxesPaidAnnual)}</div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Custo Anual de {citizenCalcMetrics.polName}</h4>
                  <div className="text-xl font-extrabold font-mono text-slate-900">{formatBRLDetailed(citizenCalcMetrics.polCost)}</div>
                  <p className="text-xs text-amber-900">
                    Trabalhadores com o seu salário necessários para bancar esta estrutura: <strong>{citizenCalcMetrics.citizensNeededToFundCabinet} pessoas</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 5: O FUNDÃO
        ========================================================================= */}
        {activeTab === "fundao_electoral" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                <Coins className="w-3.5 h-3.5 text-purple-600" />
                FUNDO ESPECIAL DE FINANCIAMENTO DE CAMPANHA
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                O "Fundão": R$ 4,9 Bilhões em Repasses aos Partidos
              </h2>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Partido</th>
                    <th className="py-3 px-4 text-right">Repasse Total</th>
                    <th className="py-3 px-4 text-right">Advocacia</th>
                    <th className="py-3 px-4 text-right">Jatinhos</th>
                    <th className="py-3 px-4">Alerta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {FUNDAO_PARTY_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-sm text-slate-900">{row.party}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">{formatMillions(row.totalFundao)}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{formatMillions(row.spendingLawyers)}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{formatMillions(row.privateJets)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{row.flag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE OFÍCIO */}
      {notifyingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-blue-700 flex items-center gap-2">
                <Scale className="w-4 h-4" /> Ofício Formal de Cobrança
              </span>
              <button onClick={() => setNotifyingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={notifyingItem.customPetition}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none"
            />
            <div className="flex justify-between items-center pt-2">
              {copyFeedback && <span className="text-emerald-700 text-xs font-semibold font-mono">Copiado com sucesso!</span>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyText(notifyingItem.customPetition)}
                  className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </button>
                <a
                  href={`mailto:ouvidoria@cgu.gov.br?subject=Denuncia%20Civica&body=${encodeURIComponent(notifyingItem.customPetition)}`}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" /> Enviar ao Fala.BR / MPF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAVETA DE INSPEÇÃO */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img src={inspectingItem.photo} alt={inspectingItem.name} className="w-12 h-12 rounded-xl object-cover border" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">{inspectingItem.displayName}</h2>
                  <p className="text-xs text-slate-500 font-mono">{inspectingItem.role} • {inspectingItem.party}/{inspectingItem.state}</p>
                </div>
              </div>
              <button onClick={() => setInspectingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 font-mono">Notas Fiscais e Gastos Registrados:</h3>
              <div className="space-y-2">
                {inspectingItem.invoices?.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{inv.supplier}</span>
                      <span className="font-mono">{formatBRLDetailed(inv.value)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">NF: {inv.id} • {inv.date} • {inv.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <footer className="border-t border-[#E2E8F0] mt-12 py-6 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Radar Cívico • Transparência Unificada (Vereadores, Prefeitos, Governadores, Deputados e Senadores)</span>
          <span>Bases: TransfereGov • Portal da Transparência • TSE • Art. 37 CF/88</span>
        </div>
      </footer>

    </div>
  );
}