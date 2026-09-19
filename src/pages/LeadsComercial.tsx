import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Download, RefreshCw, Smartphone, 
  Trophy, CheckCircle2, Clock, Phone, Mail, Building, Briefcase, 
  ExternalLink, ArrowUpDown, Filter, Sparkles, Lock, KeyRound, LogOut, ArrowRight, ShieldCheck,
  Code2, Copy, Check, X, Database, Cloud
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ACCESS_PASSWORD = 'adeptmec2027';
const AUTH_STORAGE_KEY = 'vx_empresa_leads_auth';

interface EventLead {
  id: string;
  dataHora: string;
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  crachaId: string;
  origem: string;
  jogoEscolhido: string;
  premioGanho: string;
  voucher: string;
  opcoesSelecionadasIds?: number[];
  respostasTriagem?: string;
  produtosDirecionados?: string;
  produtosArray?: string[];
  resposta1?: string;
  resposta2?: string;
  resposta3?: string;
  createdAt?: any;
}

export default function LeadsComercial() {
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [leads, setLeads] = useState<EventLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGame, setFilterGame] = useState<string>('todos');
  const [selectedLead, setSelectedLead] = useState<EventLead | null>(null);

  // Direct Firebase API Integration Modal
  const [showApiModal, setShowApiModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testLeadId, setTestLeadId] = useState('6aaee39e34cf9a3a6283ba77');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Authentication submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword.trim() === ACCESS_PASSWORD) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setInputPassword('');
  };

  // Real-time synchronization with Firestore collection 'event_leads'
  useEffect(() => {
    setLoading(true);
    const leadsRef = collection(db, 'event_leads');
    const q = query(leadsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: EventLead[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as EventLead);
        });

        // Fallback: merge with local storage submissions if any offline
        try {
          const localStr = localStorage.getItem('vx_proto_submissions');
          if (localStr) {
            const localLeads = JSON.parse(localStr);
            localLeads.forEach((loc: EventLead) => {
              if (!fetched.find(f => f.crachaId === loc.crachaId && f.nome === loc.nome)) {
                fetched.push(loc);
              }
            });
          }
        } catch (e) {
          // ignore
        }

        setLeads(fetched);
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore subscription error (fallback to local):', error);
        // Fallback to local storage
        try {
          const localStr = localStorage.getItem('vx_proto_submissions');
          if (localStr) {
            setLeads(JSON.parse(localStr));
          }
        } catch (e) {
          // ignore
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      (lead.nome || '').toLowerCase().includes(term) ||
      (lead.empresa || '').toLowerCase().includes(term) ||
      (lead.cargo || '').toLowerCase().includes(term) ||
      (lead.crachaId || '').toLowerCase().includes(term) ||
      (lead.whatsapp || '').includes(term) ||
      (lead.voucher || '').toLowerCase().includes(term);

    const matchGame = filterGame === 'todos' || lead.jogoEscolhido === filterGame;
    return matchSearch && matchGame;
  });

  // Export to CSV
  const exportCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      'Data/Hora',
      'Nome',
      'Empresa',
      'Cargo',
      'WhatsApp',
      'Email',
      'Crachá ID',
      'Jogo',
      'Prêmio',
      'Voucher',
      'Produtos Direcionados',
      'Opções Triagem Selecionadas'
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.dataHora || ''}"`,
      `"${l.nome || ''}"`,
      `"${l.empresa || ''}"`,
      `"${l.cargo || ''}"`,
      `"${l.whatsapp || ''}"`,
      `"${l.email || ''}"`,
      `"${l.crachaId || ''}"`,
      `"${l.jogoEscolhido || ''}"`,
      `"${l.premioGanho || ''}"`,
      `"${l.voucher || ''}"`,
      `"${l.produtosDirecionados || l.resposta2 || ''}"`,
      `"${l.respostasTriagem || l.resposta1 || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_comercial_evento_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated, display login access lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Users size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              VX<span className="text-blue-500">Leads</span>
            </span>
          </div>
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Voltar ao Início
          </a>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Painel da Empresa
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Área restrita para a empresa organizadora visualizar leads, perguntas, respostas da triagem, vouchers e prêmios captados em tempo real.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Digite a senha de acesso..."
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      if (authError) setAuthError(false);
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
                      authError ? 'border-red-500 focus:border-red-500' : 'border-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>
                {authError && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">
                    Senha incorreta. Verifique e tente novamente.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Acessar Painel de Leads</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Acesso restrito e criptografado</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                VX<span className="text-blue-500">Leads</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Banco de Dados em Tempo Real
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Painel Comercial da Empresa • Leads, Perguntas e Prêmios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
            title="Ver credenciais e endpoints diretos da API do Firebase"
          >
            <Database size={14} className="text-amber-400" />
            <span className="hidden sm:inline">API Direta Firebase</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Exportar dados para Excel/Planilha"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <a
            href="https://pristine-lead-scan-go.base44.app/?is_new_user=true"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>Abrir Base44</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
            title="Sair do Painel"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        
        {/* KPI Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Total de Leads Captados</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {leads.length}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Roletas Giradas</span>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
              {leads.filter(l => l.jogoEscolhido === 'roleta').length}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Raspadinhas Concluídas</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
              {leads.filter(l => l.jogoEscolhido === 'raspadinha').length}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Caça-Níqueis Acionados</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              {leads.filter(l => l.jogoEscolhido === 'caca_niquel').length}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, crachá, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Filtrar Jogo:</span>
            <select
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="todos">Todos os Jogos</option>
              <option value="roleta">🎡 Roleta</option>
              <option value="raspadinha">✨ Raspadinha</option>
              <option value="caca_niquel">🎰 Caça-Níquel</option>
            </select>
          </div>
        </div>

        {/* Table of Leads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Participante</th>
                  <th className="py-3 px-4">Empresa & Cargo</th>
                  <th className="py-3 px-4">Contato (Whats / Email)</th>
                  <th className="py-3 px-4">Crachá ID</th>
                  <th className="py-3 px-4">Jogo & Prêmio</th>
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Produtos Indicados</th>
                  <th className="py-3 px-4 text-right">Triagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin inline mr-2 text-blue-400" />
                      Carregando leads do banco de dados em nuvem...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {lead.nome.charAt(0)}
                          </div>
                          <div>
                            <div>{lead.nome}</div>
                            <div className="text-[10px] font-normal text-slate-500">{lead.dataHora}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{lead.empresa || '—'}</div>
                        <div className="text-[11px] text-slate-400">{lead.cargo || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-emerald-400 font-mono text-[11px]">{lead.whatsapp || '—'}</div>
                        <div className="text-[11px] text-slate-400">{lead.email || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
                          {lead.crachaId || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">
                            {lead.jogoEscolhido === 'roleta' && '🎡'}
                            {lead.jogoEscolhido === 'raspadinha' && '✨'}
                            {lead.jogoEscolhido === 'caca_niquel' && '🎰'}
                          </span>
                          <span className="font-semibold text-amber-300">{lead.premioGanho}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 text-[11px]">
                          {lead.voucher || '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {lead.produtosDirecionados ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {lead.produtosDirecionados.split(',').map((p, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                {p.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-medium text-[11px] transition-all border border-blue-500/30 cursor-pointer"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Lead Triagem Answers Details */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">{selectedLead.nome}</h3>
                    <p className="text-xs text-slate-400">{selectedLead.empresa} • {selectedLead.cargo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">WhatsApp</span>
                  <span className="text-emerald-400 font-bold">{selectedLead.whatsapp || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">E-mail</span>
                  <span className="text-slate-300 truncate block">{selectedLead.email || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Crachá ID</span>
                  <span className="text-blue-400 font-bold">{selectedLead.crachaId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Prêmio & Voucher</span>
                  <span className="text-yellow-400 font-bold">{selectedLead.voucher}</span>
                </div>
              </div>

              {/* Soluções / Produtos Direcionados */}
              {(selectedLead.produtosDirecionados || selectedLead.resposta2) && (
                <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Produtos / Soluções Recomendadas:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedLead.produtosDirecionados || selectedLead.resposta2 || '').split(',').map((prod, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-200 border border-blue-500/40 font-bold text-xs">
                        {prod.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Respostas da Triagem */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Cenários e Situações Identificadas na Empresa:
                </span>

                <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-2">
                  <div className="text-slate-400 font-semibold leading-relaxed">
                    "Com base na realidade da sua empresa hoje quais das situações abaixo acontecem:"
                  </div>
                  <div className="text-white font-medium pl-3 border-l-2 border-emerald-500 leading-relaxed whitespace-pre-line">
                    {selectedLead.respostasTriagem || selectedLead.resposta1 || 'Não informada'}
                  </div>
                </div>

                {/* Legacy backward compat if available */}
                {selectedLead.resposta3 && !selectedLead.respostasTriagem && (
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                    <div className="text-slate-400 font-semibold">Observações / Previsão:</div>
                    <div className="text-white font-medium pl-2 border-l-2 border-blue-500">
                      {selectedLead.resposta3}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API FIREBASE DIRECT INTEGRATION MODAL */}
        {showApiModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Acesso Direto à API do Firebase Firestore</h3>
                    <p className="text-xs text-slate-400">Credenciais e endpoints oficiais para o Base44 ou qualquer sistema externo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Parametros e Segredos do Projeto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">API Key (apiKey / Segredo)</span>
                  <span className="font-mono text-blue-400 font-bold break-all">AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Project ID (projectId)</span>
                  <span className="font-mono text-white font-bold">gen-lang-client-0914985094</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Database ID (firestoreDatabaseId)</span>
                  <span className="font-mono text-amber-400 font-bold break-all">ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">App ID (appId)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">1:239443020505:web:1e21020dea0711496f8cc8</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Auth Domain (authDomain)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">gen-lang-client-0914985094.firebaseapp.com</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Storage Bucket (storageBucket)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">gen-lang-client-0914985094.firebasestorage.app</span>
                </div>
              </div>

              {/* JSON de Configuração Completo */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <KeyRound size={16} className="text-amber-400" />
                    <span>Firebase Config Object (JSON Completo para Base44 / Secrets)</span>
                  </div>
                  <button
                    onClick={() => {
                      const jsonConfig = JSON.stringify({
                        apiKey: "AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E",
                        authDomain: "gen-lang-client-0914985094.firebaseapp.com",
                        projectId: "gen-lang-client-0914985094",
                        storageBucket: "gen-lang-client-0914985094.firebasestorage.app",
                        messagingSenderId: "239443020505",
                        appId: "1:239443020505:web:1e21020dea0711496f8cc8",
                        firestoreDatabaseId: "ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88"
                      }, null, 2);
                      navigator.clipboard.writeText(jsonConfig);
                      setCopiedKey('json');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'json' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'json' ? 'Copiado!' : 'Copiar Objeto JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-amber-300/90 overflow-x-auto border border-slate-800">
{`{
  "apiKey": "AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E",
  "authDomain": "gen-lang-client-0914985094.firebaseapp.com",
  "projectId": "gen-lang-client-0914985094",
  "storageBucket": "gen-lang-client-0914985094.firebasestorage.app",
  "messagingSenderId": "239443020505",
  "appId": "1:239443020505:web:1e21020dea0711496f8cc8",
  "firestoreDatabaseId": "ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88"
}`}
                </pre>
              </div>

              {/* Endpoint 1: REST API Query por crachaId */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Cloud size={16} className="text-amber-400" />
                    <span>1. Consulta REST Direta por Crachá (POST runQuery)</span>
                  </div>
                  <button
                    onClick={() => {
                      const snippet = `curl -X POST "https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E" \\
  -H "Content-Type: application/json" \\
  -d '{"structuredQuery": {"from": [{"collectionId": "event_leads"}], "where": {"fieldFilter": {"field": {"fieldPath": "crachaId"}, "op": "EQUAL", "value": {"stringValue": "SEU_CRACHA_ID"}}}}}'`;
                      navigator.clipboard.writeText(snippet);
                      setCopiedKey('curl');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'curl' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'curl' ? 'Copiado!' : 'Copiar cURL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Utilize este endpoint HTTP puro no Base44 ou qualquer backend para buscar os dados de um participante pelo crachá:
                </p>
                <code className="block p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-amber-300 break-all select-all border border-slate-800">
                  POST https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E
                </code>
              </div>

              {/* Endpoint 2: Snippet JavaScript para o Base44 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Code2 size={16} className="text-blue-400" />
                    <span>2. Código JavaScript para colar no Base44</span>
                  </div>
                  <button
                    onClick={() => {
                      const code = `async function getLeadFromFirebase(crachaId) {
  const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'event_leads' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'crachaId' },
            op: 'EQUAL',
            value: { stringValue: crachaId }
          }
        }
      }
    })
  });
  const data = await res.json();
  if (data && data[0] && data[0].document) {
    const f = data[0].document.fields;
    return {
      premio: f.premioGanho?.stringValue || f.premio?.stringValue,
      voucher: f.voucher?.stringValue,
      problemas: f.resposta1?.stringValue,
      possiveisSolucoes: f.resposta2?.stringValue,
      codigoVoucher: f.codigoVoucher?.stringValue || f.voucher?.stringValue
    };
  }
  return null;
}`;
                      navigator.clipboard.writeText(code);
                      setCopiedKey('js');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'js' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'js' ? 'Copiado!' : 'Copiar Função'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800 max-h-44">
{`async function getLeadFromFirebase(crachaId) {
  const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'event_leads' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'crachaId' },
            op: 'EQUAL',
            value: { stringValue: crachaId }
          }
        }
      }
    })
  });
  const data = await res.json();
  if (data && data[0] && data[0].document) {
    const f = data[0].document.fields;
    return {
      premio: f.premioGanho?.stringValue || f.premio?.stringValue,
      voucher: f.voucher?.stringValue,
      problemas: f.resposta1?.stringValue,
      possiveisSolucoes: f.resposta2?.stringValue,
      codigoVoucher: f.codigoVoucher?.stringValue || f.voucher?.stringValue
    };
  }
  return null;
}`}
                </pre>
              </div>

              {/* Testador em Tempo Real */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Testador da API Direta do Firebase</span>
                </div>
                <p className="text-xs text-slate-400">
                  Teste a chamada HTTP em tempo real contra o Firebase Firestore para ver a resposta imediata:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testLeadId}
                    onChange={(e) => setTestLeadId(e.target.value)}
                    placeholder="Digite o ID do crachá (Ex: 6aaee39e34cf9a3a6283ba77)"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    onClick={async () => {
                      if (!testLeadId.trim()) return;
                      setTestLoading(true);
                      setTestResponse(null);
                      try {
                        const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E`;
                        const res = await fetch(url, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            structuredQuery: {
                              from: [{ collectionId: 'event_leads' }],
                              where: {
                                fieldFilter: {
                                  field: { fieldPath: 'crachaId' },
                                  op: 'EQUAL',
                                  value: { stringValue: testLeadId.trim() }
                                }
                              }
                            }
                          })
                        });
                        const data = await res.json();
                        setTestResponse(JSON.stringify(data, null, 2));
                      } catch (err: any) {
                        setTestResponse(`Erro ao consultar API: ${err.message}`);
                      } finally {
                        setTestLoading(false);
                      }
                    }}
                    disabled={testLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testLoading ? 'Consultando...' : 'Testar Consulta'}
                  </button>
                </div>

                {testResponse && (
                  <pre className="p-3 bg-slate-900 rounded-xl text-[10px] font-mono text-emerald-300 overflow-x-auto border border-emerald-500/20 max-h-56">
                    {testResponse}
                  </pre>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowApiModal(false)}
                  className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
        <p>VX Leads • Painel Comercial da Empresa (Acesso Restrito)</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Autenticado com a chave da empresa</span>
        </div>
      </footer>
    </div>
  );
}
