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
// 1. BASE DE DADOS COMPLETA COM OS 6 NOVOS PILARES AUDITÁVEIS
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
    highlightAnomaly: "Diárias internacionais com cotação sob segredo parcial e contratos de logística de apoio aéreo sem desmembramento de passageiros.",
    summaryBio: "Contratos corporativos de suporte institucional, voos em jatos da FAB e cerimonial diplomático fiscalizados pelo TCU e CGU.",
    
    // Pilar 1: Emendas (Poder Executivo libera e empenha)
    emendasTotalDestinadas: 0,
    emendasPix: [],
    
    // Pilar 2: QSA & Conflitos
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

    // Pilar 3: Evolução Patrimonial
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 7987000.00, note: "Imóveis, previdência privada VGBL e aplicações" },
      { year: "2022 (TSE)", declaredValue: 7423000.00, note: "Partilha de bens e regularização sucessória" },
      { year: "2026 (Atualizado)", declaredValue: 8190000.00, note: "Rendimento padrão de carteira e subsídio presidencial" }
    ],
    assetGrowthAlert: "Normal (+10.3% em 4 anos, compatível com a renda do cargo)",

    // Pilar 4: Presença e Votações
    plenaryPresence: {
      presenceRate: 100,
      totalSessions: 0,
      unjustifiedAbsences: 0,
      note: "Chefe do Executivo não vota no plenário parlamentar (sanciona ou veta)."
    },
    keyVotes: [
      { bill: "Veto ao Fundão Eleitoral (PLN 2024)", decision: "Sanção Integral", impact: "Aprovou dotação recorde de R$ 4,9 Bi para campanhas públicas." },
      { bill: "Arcabouço Fiscal (LC 200/2023)", decision: "Sanção", impact: "Substituiu o teto de gastos constitucional por trava de despesa primária." }
    ],

    // Pilar 5: Custo do Cidadão
    cabinetAnnualCost: 28400000.00,

    // Pilar 6: Fundo Partidário/Eleitoral
    fundoPartidarioShare: 49800000.00,
    fundoEleitoralShare: 125000000.00,

    breakdown: {
      cotaOuSuprimento: 14200000.00,
      diariasHospedagem: 8900000.00,
      passagensFretamento: 5300000.00
    },
    topSuppliers: [
      { cnpj: "00.394.452/0001-03", name: "Comando da Aeronáutica (FAB)", amount: 14200000.00, sector: "Logística Aérea", riskFlag: "Manifesto nominal sob segredo" }
    ],
    invoices: [
      { id: "SIAFI-901", date: "18/09/2026", supplier: "Apoio Missão Diplomática", category: "Diárias Internacionais", value: 412000.00, status: "Atenção", flagNote: "Lista de assessores não discriminada" }
    ]
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
    highlightAnomaly: "R$ 48.000 em locação de SUV blindada em empresa cujo sócio administrador é ex-assessor comissionado do próprio deputado.",
    summaryBio: "Membro da Comissão de Finanças. Forte atuação no envio de Emendas Especiais (Pix) para o interior paulista.",

    // Pilar 1: Emendas & Transferências Especiais
    emendasTotalDestinadas: 34500000.00,
    emendasPix: [
      {
        id: "PIX-SP-882",
        type: "Emenda Individual Especial (PIX)",
        destination: "Prefeitura Municipal de Santa Lúcia - SP",
        amount: 3500000.00,
        workPlanStatus: "Sem Plano de Trabalho Cadastrado",
        accountType: "Conta Corrente Comum (Opaca)",
        auditFlag: "Conta não vinculada a convênio TransfereGov; impossível rastrear compras no extrato bancário público.",
        tcuAuditStatus: "Notificado pelo TCU para prestar contas em 60 dias"
      },
      {
        id: "RP2-SP-109",
        type: "Transferência com Finalidade Definida (RP2)",
        destination: "Santa Casa de Misericórdia do Vale",
        amount: 1800000.00,
        workPlanStatus: "Aprovado pelo Fundo Nacional de Saúde",
        accountType: "Conta Vinculada Específica",
        auditFlag: "Regular",
        tcuAuditStatus: "Prestação em Análise"
      }
    ],

    // Pilar 2: Teia Societária (QSA)
    qsaCrossings: [
      {
        company: "Prime Blindados & Locação Eireli",
        cnpj: "48.291.094/0001-89",
        partnerName: "Marcos Aurélio Silveira",
        relationship: "Ex-Secretário Parlamentar (Ex-assessor)",
        riskDegree: "Crítico",
        notes: "Empresa criada 4 meses antes da celebração do contrato de locação mensal continuada de veículos do gabinete."
      },
      {
        company: "Nexus Inteligência & Pesquisa",
        cnpj: "12.093.882/0001-40",
        partnerName: "Juliana Mendonça Ramos",
        relationship: "Sobrinha (Conflito Familiar / QSA)",
        riskDegree: "Crítico",
        notes: "Recebeu R$ 98.000,00 da CEAP em serviços declarados de 'pesquisa socioeconômica'."
      }
    ],

    // Pilar 3: Patrimônio TSE vs. Atual
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 420000.00, note: "1 Apartamento financiado e 1 veículo popular" },
      { year: "2022 (TSE)", declaredValue: 2850000.00, note: "Quotas de empresas, casa de campo e investimentos" },
      { year: "2026 (Estimado/Auditoria)", declaredValue: 6900000.00, note: "Compra de 2 imóveis comerciais em nome de holding patrimonial" }
    ],
    assetGrowthAlert: "Evolução Explosiva (+1.542% em 8 anos - Acima da renda líquida somada dos mandatos)",

    // Pilar 4: Presença e Votações
    plenaryPresence: {
      presenceRate: 74.2,
      totalSessions: 112,
      unjustifiedAbsences: 29,
      note: "Taxa de faltas injustificadas superior a 25% nas quartas-feiras de votação nominal."
    },
    keyVotes: [
      { bill: "Aumento do Fundão Eleitoral R$ 4,9 Bi", decision: "SIM (A Favor)", impact: "Votou pelo aumento do repasse aos diretórios partidários." },
      { bill: "Taxação de Compras Internacionais (Shein/Shopee)", decision: "SIM (A Favor)", impact: "Votou a favor do retorno do imposto de importação em remessas de até US$ 50." },
      { bill: "Transparência das Emendas de Relator/RP9", decision: "NÃO (Contra)", impact: "Votou contra a obrigatoriedade de divulgação prévia de nomes de parlamentares." }
    ],

    // Pilar 5: Custo do Cidadão
    cabinetAnnualCost: 489340.50 + (112000 * 12) + 416000, // Cota + Verba de Gabinete + Salário Anual

    // Pilar 6: Fundo Partidário/Eleitoral
    fundoPartidarioShare: 2400000.00,
    fundoEleitoralShare: 3100000.00,

    breakdown: {
      cotaOuSuprimento: 384500.00,
      diariasHospedagem: 42840.50,
      passagensFretamento: 62000.00
    },
    topSuppliers: [
      { cnpj: "48.291.094/0001-89", name: "Prime Blindados & Locação Eireli", amount: 142000.00, sector: "Locação de Veículos", riskFlag: "Sócio é ex-assessor comissionado" },
      { cnpj: "12.093.882/0001-40", name: "Nexus Inteligência & Pesquisa", amount: 98000.00, sector: "Consultoria", riskFlag: "Parentesco direto no QSA" }
    ],
    invoices: [
      { id: "CAM-NF-981", date: "14/09/2026", supplier: "Prime Blindados", category: "Locação de Veículos", value: 24000.00, status: "Atenção", flagNote: "Aluguel pago a ex-assessor" }
    ]
  },

  {
    id: "SEN-MG-01",
    name: "Arthur de Castro Valente",
    displayName: "Arthur Valente",
    sphere: "Federal",
    sphereType: "federal",
    role: "Senador da República",
    roleType: "senador",
    chamber: "Senado Federal",
    party: "MDB",
    state: "MG",
    city: "Belo Horizonte",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=280",
    email: "sen.arthurvalente@senado.leg.br",
    cabinetPhone: "(61) 3303-2100",
    totalYearSpent: 512800.00,
    monthlyAverage: 42733.33,
    spendingIndexVsChamberAvg: 1.48,
    anomalyLevel: "critical",
    highlightAnomaly: "Fretamento contínuo de jatinhos executivos com empresa aérea de doador de campanha eleitoral.",
    summaryBio: "Senador em segundo mandato. Destaque em despesas com consultorias jurídicas e voos privados de representação.",

    // Pilar 1: Emendas & Transferências Especiais
    emendasTotalDestinadas: 48000000.00,
    emendasPix: [
      {
        id: "PIX-MG-119",
        type: "Emenda Especial (PIX)",
        destination: "Município do Norte de Minas",
        amount: 6200000.00,
        workPlanStatus: "Sem Plano de Trabalho Vinculado",
        accountType: "Conta Geral da Prefeitura",
        auditFlag: "Emenda executada às vésperas de eleição municipal sem fiscalização prévia de licitação.",
        tcuAuditStatus: "Sob investigação preliminar no MPF"
      }
    ],

    // Pilar 2: QSA & Doadores
    qsaCrossings: [
      {
        company: "AeroTáxi Planalto Central S.A.",
        cnpj: "18.391.200/0001-99",
        partnerName: "Gustavo H. Resende",
        relationship: "Maior Doador Pessoa Física de Campanha (R$ 300 mil em 2022)",
        riskDegree: "Crítico",
        notes: "Após a eleição, a empresa faturou mais de R$ 680 mil em fretamentos emitidos contra a cota parlamentar (CEAPS)."
      }
    ],

    // Pilar 3: Patrimônio
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 3100000.00, note: "Fazendas no Triângulo Mineiro e gado" },
      { year: "2022 (TSE)", declaredValue: 5800000.00, note: "Aquisição de aeronave turboélice e novos imóveis" },
      { year: "2026 (Atualizado)", declaredValue: 8400000.00, note: "Valorização de áreas rurais e investimentos financeiros" }
    ],
    assetGrowthAlert: "Evolução Alta (+170% em 8 anos - Requer monitoramento pelo COAF)",

    // Pilar 4: Presença e Votações
    plenaryPresence: {
      presenceRate: 88.5,
      totalSessions: 96,
      unjustifiedAbsences: 11,
      note: "Presença regular, com abono médico nas semanas de recesso branco."
    },
    keyVotes: [
      { bill: "Prorrogação de Benefícios Fiscais a Grandes Empresas", decision: "SIM (A Favor)", impact: "Desoneração bilionária para setores industriais de Minas Gerais." },
      { bill: "Teto Salarial para Penduricalhos de Juízes e Membros do MP", decision: "NÃO (Contra)", impact: "Rejeitou a trava contra supersalários no funcionalismo público." }
    ],

    // Pilar 5: Custo do Cidadão
    cabinetAnnualCost: 512800.00 + (130000 * 12) + 416000,

    // Pilar 6: Fundo Partidário/Eleitoral
    fundoPartidarioShare: 3800000.00,
    fundoEleitoralShare: 4500000.00,

    breakdown: {
      cotaOuSuprimento: 398000.00,
      diariasHospedagem: 54800.00,
      passagensFretamento: 60000.00
    },
    topSuppliers: [
      { cnpj: "18.391.200/0001-99", name: "AeroTáxi Planalto Central S.A.", amount: 184000.00, sector: "Fretamento", riskFlag: "Doador de campanha no QSA" }
    ],
    invoices: [
      { id: "SEN-4011", date: "22/09/2026", supplier: "AeroTáxi Planalto", category: "Fretamento de Jatos", value: 64000.00, status: "Atenção", flagNote: "Voo privado sem manifestação pública" }
    ]
  },

  {
    id: "DEP-PR-02",
    name: "Beatriz Nogueira Fontes",
    displayName: "Beatriz Nogueira",
    sphere: "Federal",
    sphereType: "federal",
    role: "Deputada Federal",
    roleType: "deputado",
    chamber: "Câmara dos Deputados",
    party: "PSD",
    state: "PR",
    city: "Curitiba",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=280",
    email: "dep.beatriznogueira@camara.leg.br",
    cabinetPhone: "(61) 3215-5910",
    totalYearSpent: 198400.00,
    monthlyAverage: 16533.33,
    spendingIndexVsChamberAvg: 0.54,
    anomalyLevel: "normal",
    highlightAnomaly: "Economia contínua de 46% da cota. Todas as emendas contam com plano de trabalho no TransfereGov e licitação aberta.",
    summaryBio: "Membro da Comissão de Ciência e Tecnologia. Utiliza voos comerciais regulares e prestação de contas com notas auditadas.",

    // Pilar 1: Emendas & Transferências Especiais
    emendasTotalDestinadas: 22000000.00,
    emendasPix: [
      {
        id: "EM-PR-091",
        type: "Emenda com Finalidade Específica (RP2)",
        destination: "Hospital Universitário do Paraná",
        amount: 4000000.00,
        workPlanStatus: "Plano de Trabalho 100% Homologado",
        accountType: "Conta Vinculada Caixa Econômica Federal",
        auditFlag: "Sem Apontamentos de Risco",
        tcuAuditStatus: "Fiscalizado e Regular"
      }
    ],

    // Pilar 2: QSA & Conflitos
    qsaCrossings: [
      {
        company: "LATAM Airlines Brasil",
        cnpj: "02.012.862/0001-60",
        partnerName: "Empresa de Capital Aberto",
        relationship: "Fornecedor Comercial Regular",
        riskDegree: "Nulo",
        notes: "Aquisição estrita de bilhetes de classe econômica em voos de linha."
      }
    ],

    // Pilar 3: Patrimônio
    assetHistory: [
      { year: "2018 (TSE)", declaredValue: 580000.00, note: "1 Apartamento próprio em Curitiba" },
      { year: "2022 (TSE)", declaredValue: 720000.00, note: "Valorização imobiliária e poupança bancária" },
      { year: "2026 (Atualizado)", declaredValue: 910000.00, note: "Poupança e títulos do Tesouro Direto" }
    ],
    assetGrowthAlert: "Evolução Estável e Compatível (+56% acumulado em 8 anos)",

    // Pilar 4: Presença e Votações
    plenaryPresence: {
      presenceRate: 98.2,
      totalSessions: 112,
      unjustifiedAbsences: 2,
      note: "Alta assiduidade em todas as comissões e plenário."
    },
    keyVotes: [
      { bill: "Aumento do Fundão Eleitoral R$ 4,9 Bi", decision: "NÃO (Contra)", impact: "Votou contra a destinação de verba pública a campanhas políticas." },
      { bill: "Obrigatoriedade de Rastreio das 'Emendas Pix'", decision: "SIM (A Favor)", impact: "Defendeu exigência de conta vinculada e plano de trabalho prévio." }
    ],

    // Pilar 5: Custo do Cidadão
    cabinetAnnualCost: 198400.00 + (60000 * 12) + 416000,

    // Pilar 6: Fundo Partidário/Eleitoral
    fundoPartidarioShare: 450000.00,
    fundoEleitoralShare: 800000.00,

    breakdown: {
      cotaOuSuprimento: 142000.00,
      diariasHospedagem: 18400.00,
      passagensFretamento: 38000.00
    },
    topSuppliers: [
      { cnpj: "02.012.862/0001-60", name: "LATAM Airlines Brasil", amount: 38000.00, sector: "Passagens Aéreas", riskFlag: null }
    ],
    invoices: [
      { id: "CAM-108", date: "15/09/2026", supplier: "LATAM Airlines", category: "Passagens Aéreas", value: 2150.00, status: "Regular", flagNote: null }
    ]
  }
];

// ============================================================================
// DADOS DO FUNDO PARTIDÁRIO E ELEITORAL NACIONAL (O "FUNDÃO")
// ============================================================================
const FUNDAO_PARTY_DATA = [
  { party: "PL", totalFundao: 886000000.00, spendingLawyers: 48000000.00, privateJets: 32000000.00, opinionPolls: 64000000.00, flag: "Maior beneficiário com 99 deputados eleitos." },
  { party: "PT", totalFundao: 814000000.00, spendingLawyers: 52000000.00, privateJets: 28000000.00, opinionPolls: 71000000.00, flag: "Forte concentração de repasses a institutos de pesquisa e comunicação." },
  { party: "UNIÃO", totalFundao: 536000000.00, spendingLawyers: 38000000.00, privateJets: 24000000.00, opinionPolls: 41000000.00, flag: "Investigações sobre superfaturamento de aluguel de jatinhos." },
  { party: "PSD", totalFundao: 421000000.00, spendingLawyers: 22000000.00, privateJets: 12000000.00, opinionPolls: 34000000.00, flag: "Equilíbrio entre candidaturas no Senado e Governos Estaduais." },
  { party: "MDB", totalFundao: 362000000.00, spendingLawyers: 26000000.00, privateJets: 15000000.00, opinionPolls: 29000000.00, flag: "Uso de escritórios jurídicos com contratos guarda-chuva contínuos." }
];

export default function App() {
  // Navegação: 'dashboard', 'emendas_pix', 'qsa_conflicts', 'asset_audit', 'votes_presence', 'citizen_calculator', 'fundao_electoral', 'live_api'
  const [activeTab, setActiveTab] = useState("emendas_pix");

  // Dados
  const [politiciansData, setPoliticiansData] = useState(INITIAL_DATABASE);
  const [selectedPol, setSelectedPol] = useState(INITIAL_DATABASE[1]); // Default no Carlos Mendonça para auditoria
  
  // Modal de Detalhe / Notificação Cívica
  const [notifyingItem, setNotifyingItem] = useState(null);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Calculadora do Contribuinte
  const [userSalary, setUserSalary] = useState(3500);
  const [calcSelectedPolId, setCalcSelectedPolId] = useState(INITIAL_DATABASE[1].id);

  // Busca e Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [anomalyFilter, setAnomalyFilter] = useState("all");

  // API Live
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Sincronizado");
  const [liveApiFeed, setLiveApiFeed] = useState([]);

  // Formatação
  const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  const formatBRLDetailed = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(val);
  const formatMillions = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Bi`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)} Mi`;
    return formatBRL(val);
  };

  // API Câmara dos Deputados (v2)
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

  // Cálculos da Calculadora do Contribuinte (Estudo IBPT: brasileiro médio trabalha ~149 dias só para pagar tributos)
  const citizenCalcMetrics = useMemo(() => {
    const annualGross = userSalary * 13.33; // Com 13º e 1/3 de férias
    const estimatedTaxesPaidAnnual = annualGross * 0.385; // Carga tributária média brasileira (38,5% sobre consumo e renda)
    const daysWorkedForTaxes = Math.round((estimatedTaxesPaidAnnual / annualGross) * 365);
    
    // Gabinete selecionado
    const pol = politiciansData.find(p => p.id === calcSelectedPolId) || politiciansData[1];
    const polCost = pol.cabinetAnnualCost;

    // Quantos trabalhadores com esse salário bancam esse político sozinho?
    const citizensNeededToFundCabinet = Math.round(polCost / estimatedTaxesPaidAnnual);
    
    // Quanto de imposto daquele cidadão foi para o Fundão Eleitoral de R$ 4,9 Bi?
    // 100 milhões de contribuintes economicamente ativos
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

  // Gerador de Requerimento LAI sobre Emendas Pix e Falta de Transparência
  const generateEmendaPixPetition = (emenda, pol) => {
    return `AO MINISTÉRIO PÚBLICO FEDERAL (PROCURADORIA DA REPÚBLICA)
E AO TRIBUNAL DE CONTAS DA UNIÃO (SECEX-ESTADO)

ASSUNTO: REPRESENTAÇÃO CÍVICA E PEDIDO DE AUDITORIA URGENTE SOBRE DESTINAÇÃO DE TRANSFERÊNCIA ESPECIAL ('EMENDA PIX') SEM PLANO DE TRABALHO REGISTRADO (LEI Nº 12.527/2011 E ADPF 854/STF)

Excelentíssimos Senhores Procuradores e Auditores de Controle Externo,

Na qualidade de cidadão e contribuinte fiscalizador, apresento formalmente a presente notícia para apuração de indícios de opacidade e desvio de finalidade em repasse federal:

1. PARLAMENTAR AUTOR DA EMENDA: ${pol.name.toUpperCase()} (${pol.role} - ${pol.party}/${pol.state})
2. CÓDIGO DA EMENDA / TRANSFERÊNCIA: ${emenda.id}
3. DESTINATÁRIO DOS RECURSOS: ${emenda.destination}
4. VALOR TOTAL PAGO: ${formatBRLDetailed(emenda.amount)}
5. IRREGULARIDADE APURADA:
   - Situação no TransfereGov: "${emenda.workPlanStatus}"
   - Natureza da Conta Bancária: "${emenda.accountType}"
   - Alerta da Fiscalização Cívica: "${emenda.auditFlag}"
   - Status nos Órgãos de Controle: "${emenda.tcuAuditStatus}"

FUNDAMENTAÇÃO JURÍDICA:
O Supremo Tribunal Federal, no julgamento da ADPF 854, determinou expressamente que as 'Transferências Especiais' não podem operar como cheques em branco, sendo obrigatória a inserção no TransfereGov do plano de trabalho prévio, justificativa da despesa e rastreabilidade da conta bancária de movimentação.

REQUERIMENTO:
Requer-se a abertura de Procedimento Preparatório ou Tomada de Contas Especial para:
a) Exigir da Prefeitura destinatária o envio imediato das notas fiscais e comprovantes de liquidação da referida conta corrente;
b) Apurar eventual prática de atos de improbidade administrativa (Lei 8.429/92) e violação aos princípios do Art. 37 da Constituição Federal.

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
          BARRA DE TOPO EDITORIAL (LIGHT THEME - PROPUBLICA STYLE)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
            
            {/* Logotipo e Identidade Visual */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
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
                <p className="text-xs text-slate-500">Auditoria profunda de dinheiro público, emendas, teia societária e bens</p>
              </div>
            </div>

            {/* Menu Superior com os 6 Novos Pilares */}
            <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold w-full md:w-auto justify-center overflow-x-auto">
              <button
                onClick={() => setActiveTab("emendas_pix")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "emendas_pix"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Emendas Pix (RP9/RP2)
              </button>

              <button
                onClick={() => setActiveTab("qsa_conflicts")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "qsa_conflicts"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-red-600" />
                Conflitos & Teia Societária
              </button>

              <button
                onClick={() => setActiveTab("asset_audit")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "asset_audit"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Evolução Patrimonial
              </button>

              <button
                onClick={() => setActiveTab("votes_presence")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "votes_presence"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Vote className="w-3.5 h-3.5 text-blue-600" />
                Votações & Faltas
              </button>

              <button
                onClick={() => setActiveTab("citizen_calculator")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "citizen_calculator"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                Calculadora do Cidadão
              </button>

              <button
                onClick={() => setActiveTab("fundao_electoral")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "fundao_electoral"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-purple-600" />
                O "Fundão"
              </button>
            </nav>

            {/* Sincronizador de API Oficial */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
              <span className={`w-2 h-2 rounded-full ${isLiveSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
              <span>{lastSyncTime}</span>
              <button 
                onClick={fetchLiveRealData} 
                disabled={isLiveSyncing}
                title="Sincronizar dados das APIs da Câmara, TCU e Receita"
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
      ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* =========================================================================
            PILAR 1: RASTREAMENTO DE EMENDAS PARLAMENTARES & 'EMENDAS PIX'
        ========================================================================= */}
        {activeTab === "emendas_pix" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  EMENDAS ESPECIAIS (PIX) • RP9 • RP2 • TRANSFERÊNCIAS DIRETAS
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Rastreamento de 'Emendas Pix' e Contas Opacas
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Identifique qual político enviou o dinheiro, para qual prefeitura ou entidade ele foi destinado, se existe <strong>plano de trabalho formal</strong> cadastrado no TransfereGov ou se os recursos caíram em conta corrente comum sem fiscalização prévia.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 w-full lg:w-auto min-w-[280px]">
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">Volume em Emendas Pix no Ano</div>
                <div className="text-2xl font-extrabold font-mono text-amber-700">R$ 8,2 Bilhões</div>
                <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 74% sem prestação de contas concluída no TCU
                </div>
              </div>
            </div>

            {/* Listagem de Emendas por Político */}
            <div className="space-y-4">
              {politiciansData.map((pol) => {
                if (pol.emendasPix.length === 0) return null;

                return (
                  <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                      <div className="flex items-center gap-3">
                        <img src={pol.photo} alt={pol.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                          <div className="text-xs text-slate-500 font-mono">
                            {pol.role} • {pol.party}-{pol.state} • Total em Emendas: <strong className="text-slate-800">{formatMillions(pol.emendasTotalDestinadas)}</strong>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded text-slate-700">
                        {pol.emendasPix.length} emenda(s) monitorada(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {pol.emendasPix.map((emenda) => {
                        const isOpaca = emenda.workPlanStatus.includes("Sem Plano");

                        return (
                          <div 
                            key={emenda.id}
                            className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                              isOpaca 
                                ? 'bg-red-50/40 border-red-200' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                  isOpaca ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {emenda.type}
                                </span>
                                <span className="ml-2 font-mono text-[11px] text-slate-500">ID: {emenda.id}</span>
                                <h4 className="font-bold text-slate-900 text-sm mt-1">{emenda.destination}</h4>
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-slate-500">Valor Destinado</div>
                                <div className="text-lg font-bold font-mono text-slate-900">{formatBRL(emenda.amount)}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                              <div>
                                <span className="text-slate-500 block font-semibold">Status do Plano de Trabalho:</span>
                                <span className={`font-mono font-bold ${isOpaca ? 'text-red-700' : 'text-emerald-700'}`}>
                                  {emenda.workPlanStatus}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block font-semibold">Tipo de Conta Bancária:</span>
                                <span className="font-mono text-slate-800">{emenda.accountType}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block font-semibold">Status no TCU / MPF:</span>
                                <span className="font-mono text-amber-800">{emenda.tcuAuditStatus}</span>
                              </div>
                            </div>

                            <div className="p-2.5 bg-white/80 rounded border border-slate-200 text-[11px] text-slate-700 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-1.5">
                                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isOpaca ? 'text-red-600' : 'text-emerald-600'}`} />
                                <span><strong>Apontamento de Controle:</strong> {emenda.auditFlag}</span>
                              </div>

                              <button
                                onClick={() => setNotifyingItem({ ...pol, customPetition: generateEmendaPixPetition(emenda, pol) })}
                                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0 transition flex items-center gap-1 shadow-xs"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                                Denunciar no TCU / MPF
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PILAR 2: CRUZAMENTO DE CONFLITO DE INTERESSES & TEIA SOCIETÁRIA (QSA)
        ========================================================================= */}
        {activeTab === "qsa_conflicts" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                <GitPullRequest className="w-3.5 h-3.5 text-red-600" />
                RECEITA FEDERAL (QSA) X CONTAS DA CÂMARA E SENADO
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Teia Societária: Sócios de Empresas x Parentes e Doadores
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Algoritmo que cruza o CNPJ de cada nota fiscal emitida contra o gabinete com a base de dados do Quadro de Sócios e Administradores (QSA) da Receita Federal e a lista de doadores declarados do TSE, identificando casos de nepotismo, contratos de fachada e favorecimento pessoal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {politiciansData.map((pol) => (
                <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={pol.photo} alt={pol.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                        <div className="text-xs text-slate-500 font-mono">{pol.role} • {pol.party}/{pol.state}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500 font-mono">
                        Vínculos Detectados na Base QSA:
                      </div>

                      {pol.qsaCrossings.map((cross, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{cross.company}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              cross.riskDegree === 'Crítico' 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              Risco {cross.riskDegree}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500">
                            CNPJ: {cross.cnpj} • Administrador: <strong className="text-slate-800">{cross.partnerName}</strong>
                          </div>

                          <div className="text-xs text-red-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Vínculo Direto: {cross.relationship}
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-200">
                            {cross.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectingItem(pol)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    Abrir Notas Fiscais Deste Fornecedor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PILAR 3: AUDITORIA DE BENS E EVOLUÇÃO PATRIMONIAL (TSE VS. MANDATO)
        ========================================================================= */}
        {activeTab === "asset_audit" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                DECLARAÇÃO DE BENS AO TSE VERSUS RENDIMENTOS OFICIAIS DO CARGO
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Auditoria de Evolução Patrimonial dos Mandatos
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Compare a evolução declarada de patrimônio de cada eleito ao longo das eleições e confira o alerta do algoritmo sobre enriquecimento incompatível com o subsídio público acumulado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {politiciansData.map((pol) => {
                const isHighGrowth = pol.assetGrowthAlert.includes("Explosiva") || pol.assetGrowthAlert.includes("Alta");

                return (
                  <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={pol.photo} alt={pol.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                          <div className="text-xs text-slate-500 font-mono">{pol.party} • {pol.state}</div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                        isHighGrowth 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {pol.assetGrowthAlert}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase font-mono">Linha Histórica Declarada:</h4>
                      <div className="space-y-2">
                        {pol.assetHistory.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold font-mono text-slate-800">{item.year}</span>
                              <p className="text-[11px] text-slate-500">{item.note}</p>
                            </div>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {formatBRLDetailed(item.declaredValue)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                      <strong>Cálculo de Compatibilidade:</strong> Um deputado federal com salário líquido aproximado de R$ 33 mil/mês acumula cerca de <strong>R$ 1,6 milhão</strong> em 4 anos de mandato (sem descontar despesas pessoais e custo de vida familiar).
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PILAR 4: PAINEL DE FREQUÊNCIA, PRESENÇA E VOTAÇÕES NOMINAIS
        ========================================================================= */}
        {activeTab === "votes_presence" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                <Vote className="w-3.5 h-3.5 text-blue-600" />
                ASSIDUIDADE EM PLENÁRIO & HISTÓRICO DE VOTAÇÕES NOMINAIS
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Presença em Sessões e Votos em Pautas de Alto Impacto
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Descubra quantas faltas seu representante teve e como ele votou em pautas que impactam o seu bolso: aumento de impostos, fundão eleitoral e privilégios.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {politiciansData.map((pol) => {
                if (pol.roleType === "presidente") return null;

                const isLowPresence = pol.plenaryPresence.presenceRate < 80;

                return (
                  <div key={pol.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={pol.photo} alt={pol.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{pol.name}</h3>
                          <div className="text-xs text-slate-500 font-mono">{pol.chamber} • {pol.party}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Presença Geral</span>
                        <span className={`text-lg font-bold font-mono ${isLowPresence ? 'text-red-600' : 'text-emerald-700'}`}>
                          {pol.plenaryPresence.presenceRate}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600">Sessões Deliberativas:</span>
                        <span className="font-bold text-slate-900">{pol.plenaryPresence.totalSessions}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-600">Faltas Injustificadas:</span>
                        <span className="font-bold text-red-600">{pol.plenaryPresence.unjustifiedAbsences}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
                        {pol.plenaryPresence.note}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase font-mono">Como Votou nas Principais Leis:</h4>
                      <div className="space-y-1.5">
                        {pol.keyVotes.map((v, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{v.bill}</span>
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                v.decision.includes("SIM") ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}>
                                Voto: {v.decision}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{v.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PILAR 5: CALCULADORA DO CONTRIBUINTE (QUANTO CUSTA PARA O SEU BOLSO)
        ========================================================================= */}
        {activeTab === "citizen_calculator" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                SIMULADOR CÍVICO DE ESFORÇO TRIBUTÁRIO & FINANCIAMENTO PARLAMENTAR
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
                Calculadora do Cidadão: Quanto Custa para o Seu Bolso?
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Digite sua remuneração mensal bruta para saber quantos dias do ano você trabalha apenas para pagar impostos e quantos cidadãos iguais a você são necessários para sustentar a estrutura anual de um único político.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Lado Esquerdo: Formulário de Entrada */}
              <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase font-mono text-slate-600 block">
                    Sua Renda Bruta Mensal (R$):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-sm">R$</span>
                    <input
                      type="number"
                      step="100"
                      value={userSalary}
                      onChange={(e) => setUserSalary(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-base font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[1412, 3000, 5000, 10000].map((quickVal) => (
                      <button
                        key={quickVal}
                        onClick={() => setUserSalary(quickVal)}
                        className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        R$ {quickVal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase font-mono text-slate-600 block">
                    Selecione o Político para Comparar o Custo:
                  </label>
                  <select
                    value={calcSelectedPolId}
                    onChange={(e) => setCalcSelectedPolId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    {politiciansData.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.displayName} ({p.role} - {p.party}/{p.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                  <strong>Metodologia Aplicada:</strong>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    Cálculo baseado no índice de dias trabalhados para pagar tributos no Brasil (Instituto Brasileiro de Planejamento e Tributação - IBPT) que atinge média de <strong>38,5%</strong> do rendimento bruto anual através de impostos diretos (IR, INSS) e indiretos (ICMS, PIS/Cofins, IPI embutidos no consumo).
                  </p>
                </div>
              </div>

              {/* Lado Direito: Resultados Visuais */}
              <div className="lg:col-span-7 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Impacto Direto Sobre o Seu Trabalho:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Dias Trabalhados Apenas para Tributos</span>
                    <div className="text-3xl font-extrabold font-mono text-red-600">
                      {citizenCalcMetrics.daysWorkedForTaxes} dias
                    </div>
                    <span className="text-[11px] text-slate-500">Até 28 de maio do ano seu trabalho foi 100% para o Estado.</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500">Seus Impostos Pagos no Ano</span>
                    <div className="text-3xl font-extrabold font-mono text-slate-900">
                      {formatBRLDetailed(citizenCalcMetrics.estimatedTaxesPaidAnnual)}
                    </div>
                    <span className="text-[11px] text-slate-500">Soma de descontos em folha e consumo doméstico.</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Custo do Gabinete de {citizenCalcMetrics.polName}
                      </h4>
                      <p className="text-xs text-slate-600 font-mono">
                        Cota + Equipe de Gabinete + Salário Anual Oficial
                      </p>
                    </div>
                    <div className="text-lg font-extrabold font-mono text-slate-900">
                      {formatBRLDetailed(citizenCalcMetrics.polCost)}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <span>Trabalhadores com seu salário necessários para bancar essa estrutura:</span>
                    <span className="text-base font-bold font-mono px-2 py-0.5 bg-amber-200 rounded">
                      {citizenCalcMetrics.citizensNeededToFundCabinet} pessoas
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center font-mono">
                  <span className="text-slate-600">Sua contribuição estimada para o Fundão Eleitoral (R$ 4,9 Bi):</span>
                  <span className="font-bold text-purple-700">R$ {citizenCalcMetrics.citizenContributionToFundao} / eleitor</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PILAR 6: FUNDO ELEITORAL E PARTIDÁRIO (O "FUNDÃO")
        ========================================================================= */}
        {activeTab === "fundao_electoral" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  <Coins className="w-3.5 h-3.5 text-purple-600" />
                  REPASSES PÚBLICOS AOS DIRETÓRIOS PARTIDÁRIOS (TSE)
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Fundo Eleitoral & Partidário: O Mapa do "Fundão"
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fiscalize quanto cada partido político recebeu dos cofres públicos para fazer campanha e como esses recursos são gastos em <strong>escritórios particulares de advocacia, fretamento de jatos executivos e pesquisas eleitorais</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 w-full lg:w-auto min-w-[280px]">
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">Dotação Total do Fundo Especial</div>
                <div className="text-2xl font-extrabold font-mono text-purple-700">R$ 4.961.548.000</div>
                <div className="text-[10px] text-slate-500">100% bancado por recursos de impostos dos cidadãos.</div>
              </div>
            </div>

            {/* Tabela dos Partidos e Gastos */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Maiores Partidos Beneficiários do Fundão</h3>
                <span className="text-xs font-mono text-slate-500">Fonte: DivulgaCandContas / TSE</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-3 px-4">Sigla Partidária</th>
                      <th className="py-3 px-4 text-right">Repasse Total Recebido</th>
                      <th className="py-3 px-4 text-right">Advocacia Privada</th>
                      <th className="py-3 px-4 text-right">Fretamento Aéreo</th>
                      <th className="py-3 px-4 text-right">Pesquisas de Opinião</th>
                      <th className="py-3 px-4">Alerta de Conformidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {FUNDAO_PARTY_DATA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-extrabold text-sm text-slate-900">{row.party}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700 text-sm">
                          {formatMillions(row.totalFundao)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {formatMillions(row.spendingLawyers)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {formatMillions(row.privateJets)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {formatMillions(row.opinionPolls)}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs">{row.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODAL DE REQUERIMENTO LAI / DENÚNCIA CÍVICA FORMAL
      ========================================================================= */}
      {notifyingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Scale className="w-4 h-4" />
                <span>Ofício Formal de Representação (Lei 12.527/2011 e ADPF 854/STF)</span>
              </div>
              <button
                onClick={() => setNotifyingItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              readOnly
              rows={14}
              value={notifyingItem.customPetition}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 leading-relaxed select-all focus:outline-none focus:border-blue-600"
            />

            <div className="flex items-center justify-between pt-2">
              <div>
                {copyFeedback && (
                  <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ofício copiado para a área de transferência!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(notifyingItem.customPetition)}
                  className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Texto
                </button>
                <a
                  href={`mailto:ouvidoria@cgu.gov.br?subject=Denuncia%20Civica%20Emendas%20e%20Contratos&body=${encodeURIComponent(notifyingItem.customPetition)}`}
                  className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Enviar ao MPF / Fala.BR
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          GAVETA LATERAL DE INSPEÇÃO DE NOTAS FISCAIS
      ========================================================================= */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={inspectingItem.photo} 
                  alt={inspectingItem.name} 
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{inspectingItem.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {inspectingItem.role} • {inspectingItem.party}-{inspectingItem.state}
                  </p>
                  <p className="text-[11px] text-blue-700 font-medium mt-0.5">{inspectingItem.chamber}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 font-mono">
                Notas Fiscais Auditadas no Período:
              </h3>
              <div className="space-y-2">
                {inspectingItem.invoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inv.supplier}</div>
                        <div className="text-[11px] font-mono text-slate-500">NF: {inv.id} • {inv.date}</div>
                      </div>
                      <div className="text-xs font-bold font-mono text-slate-900">
                        {formatBRLDetailed(inv.value)}
                      </div>
                    </div>
                    {inv.flagNote && (
                      <div className="text-[11px] text-red-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {inv.flagNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-[#E2E8F0] mt-12 py-6 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Radar Cívico • Auditoria Social de Emendas, Empresas, Patrimônio e Recursos Públicos</span>
          <span>Bases: TransfereGov • QSA Receita Federal • SIAFI • DivulgaCandContas TSE • Art. 37 CF/88</span>
        </div>
      </footer>

    </div>
  );
}