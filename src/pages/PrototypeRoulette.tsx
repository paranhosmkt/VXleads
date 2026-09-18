import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { 
  Target, Sparkles, CheckCircle2, ArrowRight, RotateCcw, 
  Table, Download, Send, Globe, Code2, Copy, Check, 
  ChevronDown, ChevronUp, RefreshCw, Smartphone, Award,
  Info, ExternalLink, HelpCircle
} from 'lucide-react';

function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (document.body.contains(canvas)) document.body.removeChild(canvas);
    return;
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444'];
  const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; rot: number; vRot: number }[] = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rot += p.vRot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frames++;
    if (frames < 120) {
      requestAnimationFrame(animate);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(animate);
}

interface ParticipantData {
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  crachaId: string;
  origem: string;
}

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: { id: string; label: string; desc?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Qual o tamanho da sua equipe comercial / de atendimento em eventos?',
    subtitle: 'Ajuda a dimensionar o volume de totens ou tablets ideais.',
    options: [
      { id: 'A', label: '1 a 3 pessoas', desc: 'Operação enxuta, foco em automação total' },
      { id: 'B', label: '4 a 10 pessoas', desc: 'Equipe média para fluxo constante' },
      { id: 'C', label: 'Mais de 10 pessoas', desc: 'Grande estande com múltiplos promotores' },
      { id: 'D', label: 'Apenas sócios / diretoria', desc: 'Foco exclusivo em tomadores de decisão' }
    ]
  },
  {
    id: 2,
    title: 'Qual o maior obstáculo do seu estande na captação de leads?',
    subtitle: 'Identifica o gargalo principal do seu funil presencial.',
    options: [
      { id: 'A', label: 'Atrair o visitante do corredor', desc: 'Pessoas passam direto sem parar' },
      { id: 'B', label: 'Anotações em papel ou crachás perdidos', desc: 'Dados ilegíveis ou esquecidos na mala' },
      { id: 'C', label: 'Follow-up demorado após a feira', desc: 'Dias para entrar em contato com o lead' },
      { id: 'D', label: 'Falta de qualificação na hora', desc: 'Não sabe quem tem poder de compra' }
    ]
  },
  {
    id: 3,
    title: 'Qual a previsão do próximo evento ou feira da sua empresa?',
    subtitle: 'Para mapear o tempo hábil de implantação da gamificação.',
    options: [
      { id: 'A', label: 'Próximos 30 a 60 dias', desc: 'Precisamos de solução rápida e pronta' },
      { id: 'B', label: 'Neste semestre', desc: 'Estamos na fase de planejamento e cotação' },
      { id: 'C', label: 'Ano que vem', desc: 'Montando o orçamento anual de eventos' },
      { id: 'D', label: 'Apenas avaliando protótipo', desc: 'Estudando novas tecnologias para o futuro' }
    ]
  }
];

const PRIZES = [
  { id: 'p1', name: 'Brinde Especial VIP', color: '#3B82F6', icon: '🎁' },
  { id: 'p2', name: 'Desconto de 20%', color: '#10B981', icon: '🏷️' },
  { id: 'p3', name: 'Consultoria de Estande', color: '#8B5CF6', icon: '⭐' },
  { id: 'p4', name: 'Kit Boas-Vindas', color: '#F59E0B', icon: '📦' },
  { id: 'p5', name: 'Diagnóstico Comercial', color: '#EC4899', icon: '📊' },
  { id: 'p6', name: 'Powerbank / Brinde Tech', color: '#06B6D4', icon: '⚡' },
];

export interface LeadSubmission {
  id: string;
  dataHora: string;
  // Dados API
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  crachaId: string;
  origem: string;
  // Respostas triagem
  resposta1: string;
  resposta2: string;
  resposta3: string;
  // Roleta
  premio: string;
  voucher: string;
  statusEnvioPlanilha: 'Enviado' | 'Pendente' | 'Simulado';
}

export default function PrototypeRoulette() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Participant Data from API / URL params
  const [participant, setParticipant] = useState<ParticipantData>({
    nome: searchParams.get('nome') || 'Mariana Costa',
    email: searchParams.get('email') || 'mariana.costa@logtech.com.br',
    whatsapp: searchParams.get('whatsapp') || '(11) 98765-4321',
    empresa: searchParams.get('empresa') || 'LogTech Brasil',
    cargo: searchParams.get('cargo') || 'Diretora de Operações',
    crachaId: searchParams.get('crachaId') || 'CR-9482',
    origem: searchParams.get('origem') || 'API_App_Evento'
  });

  const [isSimulatingApi, setIsSimulatingApi] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Webhook Configuration for Google Sheets & Base44
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('vx_proto_webhook_url') || '';
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBase44Code, setCopiedBase44Code] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<'base44' | 'sheets'>('base44');

  // Screening Questions State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Roulette Game State
  const [step, setStep] = useState<'screening' | 'spin' | 'won'>('screening');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof PRIZES)[0] | null>(null);
  const [voucherCode, setVoucherCode] = useState('');

  // Submissions Log (Saved in localStorage)
  const [submissions, setSubmissions] = useState<LeadSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('vx_proto_submissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState<string | null>(null);

  // Update participant when search params change
  useEffect(() => {
    const nome = searchParams.get('nome');
    if (nome) {
      setParticipant({
        nome: nome,
        email: searchParams.get('email') || '',
        whatsapp: searchParams.get('whatsapp') || '',
        empresa: searchParams.get('empresa') || '',
        cargo: searchParams.get('cargo') || '',
        crachaId: searchParams.get('crachaId') || 'CR-' + Math.floor(1000 + Math.random() * 9000),
        origem: searchParams.get('origem') || 'API_App_Evento'
      });
    }
  }, [searchParams]);

  // Save webhook URL in localStorage
  useEffect(() => {
    localStorage.setItem('vx_proto_webhook_url', webhookUrl);
  }, [webhookUrl]);

  // Save submissions in localStorage
  useEffect(() => {
    localStorage.setItem('vx_proto_submissions', JSON.stringify(submissions));
  }, [submissions]);

  const handleSelectAnswer = (optionLabel: string) => {
    const currentQ = QUESTIONS[currentQuestionIdx];
    const newAnswers = { ...answers, [currentQ.id]: optionLabel };
    setAnswers(newAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIdx(prev => prev + 1);
      }, 250);
    } else {
      // Finished all 3 screening questions! Move to wheel spin
      setTimeout(() => {
        setStep('spin');
      }, 350);
    }
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Random prize selection
    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[randomIndex];

    // Calculate rotation: at least 5 full rotations + segment angle
    const segmentAngle = 360 / PRIZES.length;
    // Arrow is at top (270 deg or 90 deg depending on canvas orientation, standard center-top is 270)
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = rotation + (360 * 6) + targetAngle - (rotation % 360);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      const code = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
      setVoucherCode(code);
      setStep('won');

      // Trigger Confetti Celebration
      triggerConfetti();

      // Send to Sheet / Webhook
      recordSubmission(prize.name, code);
    }, 4500);
  };

  const recordSubmission = async (prizeName: string, voucher: string) => {
    const newSubmission: LeadSubmission = {
      id: 'sub_' + Date.now(),
      dataHora: new Date().toLocaleString('pt-BR'),
      nome: participant.nome,
      email: participant.email,
      whatsapp: participant.whatsapp,
      empresa: participant.empresa,
      cargo: participant.cargo,
      crachaId: participant.crachaId,
      origem: participant.origem,
      resposta1: answers[1] || 'Não respondeu',
      resposta2: answers[2] || 'Não respondeu',
      resposta3: answers[3] || 'Não respondeu',
      premio: prizeName,
      voucher: voucher,
      statusEnvioPlanilha: webhookUrl ? 'Enviado' : 'Simulado'
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // If Webhook URL is configured, send the complete payload
    if (webhookUrl.trim()) {
      setSendingWebhook(true);
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Standard for Google Apps Script Webhook
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newSubmission)
        });
        setLastSubmissionStatus('Enviado com sucesso para a planilha via Webhook!');
      } catch (err: any) {
        console.error('Erro ao enviar webhook:', err);
        setLastSubmissionStatus('Falha ao conectar no webhook, salvo localmente.');
      } finally {
        setSendingWebhook(false);
      }
    } else {
      setLastSubmissionStatus('Gravado no histórico do protótipo (pronto para exportar CSV ou conectar Google Sheets).');
    }
  };

  const restartFlow = () => {
    setStep('screening');
    setCurrentQuestionIdx(0);
    setAnswers({});
    setWonPrize(null);
    setVoucherCode('');
  };

  const downloadCSV = () => {
    if (submissions.length === 0) {
      alert('Nenhum dado registrado para exportar ainda.');
      return;
    }

    const headers = [
      'Data/Hora',
      'Nome',
      'E-mail',
      'WhatsApp',
      'Empresa',
      'Cargo',
      'Crachá ID',
      'Origem API',
      'Pergunta 1 (Tamanho Equipe)',
      'Pergunta 2 (Gargalo Estande)',
      'Pergunta 3 (Previsão Evento)',
      'Prêmio Sorteado',
      'Código Voucher'
    ];

    const rows = submissions.map(s => [
      `"${s.dataHora}"`,
      `"${s.nome}"`,
      `"${s.email}"`,
      `"${s.whatsapp}"`,
      `"${s.empresa}"`,
      `"${s.cargo}"`,
      `"${s.crachaId}"`,
      `"${s.origem}"`,
      `"${s.resposta1}"`,
      `"${s.resposta2}"`,
      `"${s.resposta3}"`,
      `"${s.premio}"`,
      `"${s.voucher}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_prototipo_roleta_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sampleGoogleAppsScript = `// CÓDIGO GOOGLE APPS SCRIPT (Cole em Extensões > Apps Script na sua Planilha Google):
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Se for a primeira linha, cria os cabeçalhos
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Data/Hora", "Nome", "E-mail", "WhatsApp", "Empresa", "Cargo", 
      "Crachá ID", "Origem", "Pergunta 1", "Pergunta 2", "Pergunta 3", "Prêmio", "Voucher"
    ]);
  }
  
  // Adiciona a linha com os dados da triagem + roleta
  sheet.appendRow([
    data.dataHora,
    data.nome,
    data.email,
    data.whatsapp,
    data.empresa,
    data.cargo,
    data.crachaId,
    data.origem,
    data.resposta1,
    data.resposta2,
    data.resposta3,
    data.premio,
    data.voucher
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "sucesso" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const sampleBase44Snippet = `// EXTREMAMENTE SIMPLES NO BASE44:
// 1. Em qualquer Ação / Botão / Automação no Base44, faça uma chamada HTTP:
POST https://${window.location.host}/api/integracao/base44
Content-Type: application/json

{
  "leadId": "10492",
  "nome": "{{lead.nome}}",
  "whatsapp": "{{lead.whatsapp}}",
  "empresa": "{{lead.empresa}}",
  "cargo": "{{lead.cargo}}",
  "email": "{{lead.email}}",
  "crachaId": "{{lead.crachaId}}",
  "origem": "Base44_App"
}

// Resposta recebida da API:
// { "success": true, "gameUrl": "/prototipo-roleta?nome=...&..." }
// Basta redirecionar o visitante para gameUrl ou abrir no tablet!`;

  const copyScriptCode = () => {
    navigator.clipboard.writeText(sampleGoogleAppsScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyBase44Code = () => {
    navigator.clipboard.writeText(sampleBase44Snippet);
    setCopiedBase44Code(true);
    setTimeout(() => setCopiedBase44Code(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RouterLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Target size={20} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              VX<span className="text-blue-500">Leads</span>
            </span>
          </RouterLink>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Protótipo Interativo
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <Code2 size={16} className="text-blue-400" />
            <span className="hidden sm:inline">Configurações da</span> Planilha & API
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
          <RouterLink
            to="/"
            className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
          >
            Voltar ao Site
          </RouterLink>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        
        {/* API Participant Identification Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Dados Recebidos via API / App do Evento
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Validado
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {participant.nome}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-400 mt-1">
                  <span>🏢 {participant.empresa}</span>
                  <span>•</span>
                  <span>💼 {participant.cargo}</span>
                  <span>•</span>
                  <span>📱 {participant.whatsapp}</span>
                  <span>•</span>
                  <span className="font-mono text-blue-300">ID: {participant.crachaId}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSimulatingApi(!isSimulatingApi)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg self-start sm:self-center transition-all cursor-pointer"
            >
              {isSimulatingApi ? 'Ocultar Simulador' : 'Simular Outro Participante'}
            </button>
          </div>

          {/* Collapsible API Simulator Panel */}
          {isSimulatingApi && (
            <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Nome do Visitante</label>
                <input
                  type="text"
                  value={participant.nome}
                  onChange={e => setParticipant({ ...participant, nome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Empresa</label>
                <input
                  type="text"
                  value={participant.empresa}
                  onChange={e => setParticipant({ ...participant, empresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Cargo</label>
                <input
                  type="text"
                  value={participant.cargo}
                  onChange={e => setParticipant({ ...participant, cargo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={participant.whatsapp}
                  onChange={e => setParticipant({ ...participant, whatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">E-mail</label>
                <input
                  type="email"
                  value={participant.email}
                  onChange={e => setParticipant({ ...participant, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Crachá / ID API</label>
                <input
                  type="text"
                  value={participant.crachaId}
                  onChange={e => setParticipant({ ...participant, crachaId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3 text-xs text-slate-400 flex items-center justify-between pt-2">
                <span>💡 Dica: Você também pode abrir esta página passando parâmetros na URL: <code className="text-blue-300">?nome=Carlos&empresa=Inovax&cargo=CEO</code></span>
                <button
                  onClick={() => {
                    setParticipant({
                      nome: 'Rodrigo Medeiros',
                      email: 'rodrigo@agritech.com.br',
                      whatsapp: '(48) 99123-4567',
                      empresa: 'AgriTech Sul',
                      cargo: 'Head de Compras',
                      crachaId: 'CR-7721',
                      origem: 'Totem_Entrada'
                    });
                  }}
                  className="text-blue-400 underline hover:text-blue-300 cursor-pointer"
                >
                  Carregar Exemplo VIP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Integration Config & Instructions Drawer */}
        {showConfigPanel && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="text-blue-400" size={22} />
                <h3 className="text-lg font-bold text-white">Central de Integração: Base44 & Planilha</h3>
              </div>
              <button
                onClick={() => setShowConfigPanel(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            {/* Integration Tabs */}
            <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveConfigTab('base44')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeConfigTab === 'base44'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Integração com App Base44 (API / Webhook)
              </button>
              <button
                onClick={() => setActiveConfigTab('sheets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeConfigTab === 'sheets'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Envio para Planilha Google
              </button>
            </div>

            {activeConfigTab === 'base44' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  O nosso backend já disponibiliza o endpoint <code className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded font-mono">POST /api/integracao/base44</code> pronto para receber os leads criados no seu app do Base44.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Endpoint de Recepção (Webhook Base44)
                      </label>
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-blue-300 select-all">
                        https://{window.location.host}/api/integracao/base44
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 space-y-2">
                      <strong className="text-white block font-semibold">Como configurar no Base44:</strong>
                      <ol className="list-decimal list-inside space-y-1 text-slate-400">
                        <li>No Base44, adicione uma ação no botão ou formulário de cadastro.</li>
                        <li>Escolha a ação <strong>HTTP / Webhook POST</strong> apontando para a URL acima.</li>
                        <li>Envie o corpo JSON com os dados do lead (nome, empresa, cargo, etc).</li>
                        <li>O Base44 recebe de volta o link exclusivo da roleta pronto para ser aberto!</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Exemplo de Requisição (cURL / Base44)
                      </label>
                      <button
                        onClick={copyBase44Code}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        {copiedBase44Code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedBase44Code ? 'Copiado!' : 'Copiar Exemplo'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                      {sampleBase44Snippet}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Ao final do giro da roleta, todos os dados coletados (dados do Base44 + as 3 respostas de triagem + prêmio ganho) são enviados para a sua planilha via Webhook.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      URL do Webhook da Planilha (Opcional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => alert(webhookUrl ? 'Webhook salvo com sucesso!' : 'URL limpa.')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Se você não tiver um webhook agora, não tem problema: <strong>todas as respostas e prêmios ficam gravados na tabela abaixo</strong> e você pode baixar a planilha em <strong className="text-blue-300">.CSV</strong> a qualquer momento!
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Script do Google Sheets (Apps Script)
                      </label>
                      <button
                        onClick={copyScriptCode}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedCode ? 'Copiado!' : 'Copiar Script'}</span>
                      </button>
                    </div>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-36">
                      {sampleGoogleAppsScript}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: SCREENING QUESTIONS (3 Multiple Choice) */}
        {step === 'screening' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400 mb-2.5">
                <span className="text-blue-400">Perguntas de Triagem</span>
                <span>Pergunta {currentQuestionIdx + 1} de {QUESTIONS.length}</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-3 border border-blue-500/20">
                <Sparkles size={14} />
                <span>Triagem Comercial Rápida</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-snug">
                {QUESTIONS[currentQuestionIdx].title}
              </h3>
              <p className="text-sm text-slate-400 mb-8">
                {QUESTIONS[currentQuestionIdx].subtitle}
              </p>

              {/* Options */}
              <div className="space-y-3.5">
                {QUESTIONS[currentQuestionIdx].options.map(option => {
                  const isSelected = answers[QUESTIONS[currentQuestionIdx].id] === option.label;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.label)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                        }`}>
                          {option.id}
                        </div>
                        <div>
                          <div className="font-semibold text-base sm:text-lg text-white">
                            {option.label}
                          </div>
                          {option.desc && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {option.desc}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-700 text-transparent'
                      }`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800 text-xs sm:text-sm">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-semibold cursor-pointer"
                >
                  ← Pergunta Anterior
                </button>

                <span className="text-slate-500">
                  Responda para liberar a roleta de prêmios
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ROULETTE WHEEL */}
        {step === 'spin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
                <CheckCircle2 size={14} />
                <span>Triagem Concluída com Sucesso!</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                Gire a Roleta e Ganhe seu Prêmio
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                Parabéns {participant.nome}! Você desbloqueou 1 rodada exclusiva.
              </p>

              {/* Interactive SVG Wheel */}
              <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] mx-auto my-6">
                {/* Pointer / Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-30 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-yellow-400"></div>
                </div>

                {/* Rotating Wheel Disk */}
                <div 
                  className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden transition-transform duration-[4500ms] ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {PRIZES.map((prize, i) => {
                      const total = PRIZES.length;
                      const angle = 360 / total;
                      const startAngle = i * angle;
                      const endAngle = (i + 1) * angle;
                      
                      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                      
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                      const textAngle = startAngle + angle / 2;
                      const textRadius = 32;
                      const tx = 50 + textRadius * Math.cos((Math.PI * textAngle) / 180);
                      const ty = 50 + textRadius * Math.sin((Math.PI * textAngle) / 180);

                      return (
                        <g key={prize.id}>
                          <path d={pathData} fill={prize.color} stroke="#0f172a" strokeWidth="0.8" />
                          <text
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize="4"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                          >
                            {prize.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-900 border-4 border-yellow-400 flex items-center justify-center shadow-lg z-20">
                    <Sparkles className="text-yellow-400" size={24} />
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <div className="mt-8">
                <button
                  disabled={isSpinning}
                  onClick={handleSpinWheel}
                  className="px-10 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isSpinning ? 'Girando a Roleta...' : 'GIRAR AGORA!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PRIZE REVEAL & SHEET SUBMISSION STATUS */}
        {step === 'won' && wonPrize && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden animate-fade-in">
            <div className="max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl">
                {wonPrize.icon}
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Parabéns, Você Ganhou!
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-2">
                {wonPrize.name}
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-6 inline-block w-full max-w-sm">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Voucher de Validação
                </div>
                <div className="text-2xl font-mono font-black text-yellow-400 tracking-widest">
                  {voucherCode}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Apresente este código para a equipe do estande para retirar seu brinde.
                </div>
              </div>

              {/* Instant Synchronization Box */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 mb-8 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 size={18} />
                  <span>Circuito Completo: Todos os dados foram consolidados!</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed mb-3">
                  {lastSubmissionStatus}
                </p>
                
                <div className="bg-slate-950/80 rounded-xl p-3 text-xs space-y-1 font-mono text-slate-300 border border-emerald-500/20">
                  <div><strong>Participante:</strong> {participant.nome} ({participant.empresa} - {participant.cargo})</div>
                  <div><strong>Origem / Crachá:</strong> {participant.origem} / {participant.crachaId}</div>
                  <div><strong>Tamanho Equipe:</strong> {answers[1]}</div>
                  <div><strong>Principal Desafio:</strong> {answers[2]}</div>
                  <div><strong>Momento de Compra:</strong> {answers[3]}</div>
                  <div className="text-yellow-400 font-bold"><strong>Prêmio Sorteado:</strong> {wonPrize.name} ({voucherCode})</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={restartFlow}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <RotateCcw size={16} />
                  <span>Testar Próximo Visitante</span>
                </button>

                <button
                  onClick={downloadCSV}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Download size={16} />
                  <span>Baixar Planilha (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOG OF SUBMISSIONS / SPREADSHEET PREVIEW */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Table size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">
                  Histórico de Envios para a Planilha ({submissions.length})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Visualização em tempo real das linhas salvas no circuito (API + 3 Perguntas de Triagem + Prêmio).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                <Download size={14} />
                <span>Exportar Planilha Excel/CSV</span>
              </button>
              {submissions.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Deseja limpar o histórico de testes?')) {
                      setSubmissions([]);
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <Table size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">Nenhum envio registrado ainda.</p>
              <p className="text-xs text-slate-500 mt-1">
                Responda as 3 perguntas de triagem acima e gire a roleta para ver os dados caírem aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Data/Hora</th>
                    <th className="py-3 px-3">Visitante (API)</th>
                    <th className="py-3 px-3">Empresa & Cargo</th>
                    <th className="py-3 px-3">Q1: Tamanho Equipe</th>
                    <th className="py-3 px-3">Q2: Principal Desafio</th>
                    <th className="py-3 px-3">Q3: Momento Compra</th>
                    <th className="py-3 px-3">Prêmio Roleta</th>
                    <th className="py-3 px-3">Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{sub.dataHora}</td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {sub.nome}
                        <div className="text-[10px] text-slate-400 font-mono">{sub.whatsapp}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {sub.empresa}
                        <div className="text-[10px] text-slate-400">{sub.cargo}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[150px] truncate" title={sub.resposta1}>{sub.resposta1}</td>
                      <td className="py-3 px-3 max-w-[150px] truncate" title={sub.resposta2}>{sub.resposta2}</td>
                      <td className="py-3 px-3 max-w-[150px] truncate" title={sub.resposta3}>{sub.resposta3}</td>
                      <td className="py-3 px-3 font-bold text-yellow-400 whitespace-nowrap">{sub.premio}</td>
                      <td className="py-3 px-3 font-mono text-blue-300 font-semibold">{sub.voucher}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Technical Architecture Explanation Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 text-xs text-slate-400 leading-relaxed">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Info size={16} className="text-blue-400" />
            <span>Como este circuito é integrado na prática em feiras?</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-blue-400 block mb-1">1. Entrada via API / QR Code</strong>
              Quando o promoter escaneia o crachá do participante ou quando o app oficial do evento gera o link, ele abre esta página com parâmetros na URL (ex: <code>?nome=...&empresa=...&crachaId=...</code>).
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-emerald-400 block mb-1">2. Triagem + Gamificação</strong>
              O participante responde às 3 perguntas de múltipla escolha direto na tela touchscreen ou no próprio celular, liberando a rotação da roleta para ganhar o brinde.
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <strong className="text-purple-400 block mb-1">3. Gravação na Planilha / CRM</strong>
              Ao sair o prêmio, os dados são enviados instantaneamente via Webhook para a planilha Google Sheets ou CRM, permitindo follow-up imediato da equipe comercial.
            </div>
          </div>
        </div>

      </main>

      {/* Discrete Footer Link */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>VX Leads • Protótipo Funcional de Gamificação, Triagem e Integração com Planilhas</p>
      </footer>
    </div>
  );
}
