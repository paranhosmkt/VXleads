import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Download, RefreshCw, Smartphone, 
  Trophy, CheckCircle2, Clock, Phone, Mail, Building, Briefcase, 
  ExternalLink, ArrowUpDown, Filter, Sparkles, Lock, KeyRound, LogOut, ArrowRight, ShieldCheck
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
      'Resp. Equipe (Q1)',
      'Resp. Obstáculo (Q2)',
      'Resp. Previsão (Q3)'
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
      `"${l.resposta1 || ''}"`,
      `"${l.resposta2 || ''}"`,
      `"${l.resposta3 || ''}"`
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
                  <th className="py-3 px-4 text-right">Triagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin inline mr-2 text-blue-400" />
                      Carregando leads do banco de dados em nuvem...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
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

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-medium text-[11px] transition-all border border-blue-500/30 cursor-pointer"
                        >
                          Ver Respostas
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
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
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

              {/* 3 Screening Questions Answers */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  Respostas da Triagem de Qualificação:
                </span>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">1. Tamanho da equipe em eventos:</div>
                  <div className="text-white font-bold pl-2 border-l-2 border-blue-500">
                    {selectedLead.resposta1 || 'Não respondida'}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">2. Maior obstáculo do estande na captação:</div>
                  <div className="text-white font-bold pl-2 border-l-2 border-blue-500">
                    {selectedLead.resposta2 || 'Não respondida'}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="text-slate-400 font-semibold">3. Previsão do próximo evento:</div>
                  <div className="text-white font-bold pl-2 border-l-2 border-blue-500">
                    {selectedLead.resposta3 || 'Não respondida'}
                  </div>
                </div>
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

      </main>
    </div>
  );
}
