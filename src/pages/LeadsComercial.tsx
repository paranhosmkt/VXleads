import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Download, RefreshCw, Smartphone, 
  Trophy, CheckCircle2, Clock, Phone, Mail, Building, Briefcase, 
  ExternalLink, ArrowUpDown, Filter, Sparkles, Lock, KeyRound, LogOut, ArrowRight, ShieldCheck,
  Code2, Copy, Check, X, Database, Cloud, Award, Edit2, Trash2, Save, AlertTriangle
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ACCESS_PASSWORD = 'adeptmec2027';
const AUTH_STORAGE_KEY = 'vx_empresa_leads_auth';

interface EventLead {
  id: string;
  _docId?: string;
  leadId?: string;
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
  const [onlyRecurring, setOnlyRecurring] = useState(false);
  const [selectedLead, setSelectedLead] = useState<EventLead | null>(null);

  // Edit and Delete state
  const [editingLead, setEditingLead] = useState<EventLead | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<EventLead>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<EventLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenEdit = (lead: EventLead) => {
    setEditingLead(lead);
    setEditFormData({
      nome: lead.nome || '',
      empresa: lead.empresa || '',
      cargo: lead.cargo || '',
      whatsapp: lead.whatsapp || '',
      email: lead.email || '',
      crachaId: lead.crachaId || '',
      jogoEscolhido: lead.jogoEscolhido || 'roleta',
      premioGanho: lead.premioGanho || '',
      voucher: lead.voucher || '',
      produtosDirecionados: lead.produtosDirecionados || lead.resposta2 || '',
      respostasTriagem: lead.respostasTriagem || lead.resposta1 || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingEdit(true);

    try {
      const updatedFields = {
        ...editFormData,
        premio: editFormData.premioGanho,
        codigoVoucher: editFormData.voucher,
        resposta1: editFormData.respostasTriagem,
        resposta2: editFormData.produtosDirecionados,
        updatedAt: serverTimestamp()
      };

      // 1. Update in Firebase Firestore
      await setDoc(doc(db, 'event_leads', editingLead.id), updatedFields, { merge: true });

      // 2. Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === editingLead.id ? ({ ...l, ...editFormData } as EventLead) : l))
      );
      if (selectedLead?.id === editingLead.id) {
        setSelectedLead((prev) => (prev ? ({ ...prev, ...editFormData } as EventLead) : null));
      }

      // 3. Update localStorage fallback
      try {
        const localStr = localStorage.getItem('vx_proto_submissions');
        if (localStr) {
          const list = JSON.parse(localStr);
          const updatedList = list.map((item: any) =>
            item.id === editingLead.id ? { ...item, ...editFormData } : item
          );
          localStorage.setItem('vx_proto_submissions', JSON.stringify(updatedList));
        }
      } catch (e) {
        // ignore
      }

      setActionFeedback({
        type: 'success',
        message: `Lead "${editFormData.nome}" atualizado com sucesso na base de dados!`
      });
      setEditingLead(null);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
      setActionFeedback({
        type: 'error',
        message: 'Erro ao salvar alterações no banco de dados. Tente novamente.'
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);

    const target = leadToDelete;
    const docId = (target as any)._docId || target.id;
    const crachaClean = target.crachaId ? target.crachaId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : '';
    const leadIdClean = (target as any).leadId ? (target as any).leadId.trim().replace(/[^a-zA-Z0-9_-]/g, '_') : '';

    // Collect all candidate document IDs in Firestore
    const candidateIds = new Set<string>();
    if (docId) candidateIds.add(docId);
    if (target.id) candidateIds.add(target.id);
    if (crachaClean) candidateIds.add(crachaClean);
    if (leadIdClean) candidateIds.add(leadIdClean);
    if (target.crachaId) candidateIds.add(target.crachaId);

    try {
      // 1. Delete direct docs from Firestore
      for (const idToDelete of candidateIds) {
        try {
          await deleteDoc(doc(db, 'event_leads', idToDelete));
        } catch (delDocErr) {
          console.warn(`Tentativa de exclusão do doc ${idToDelete}:`, delDocErr);
        }
      }

      // 2. Query any remaining documents in Firestore matching this crachaId
      if (target.crachaId) {
        try {
          const qCracha = query(collection(db, 'event_leads'), where('crachaId', '==', target.crachaId));
          const snapCracha = await getDocs(qCracha);
          for (const d of snapCracha.docs) {
            await deleteDoc(doc(db, 'event_leads', d.id));
          }
        } catch (qErr) {
          console.warn('Erro ao consultar por crachaId:', qErr);
        }
      }

      // 3. Clear server cache and trigger REST API deletion
      const apiDeleteId = docId || target.crachaId || target.id;
      if (apiDeleteId) {
        try {
          await fetch(`/api/leads/${encodeURIComponent(apiDeleteId)}`, { method: 'DELETE' });
        } catch (apiErr) {
          console.warn('Erro ao chamar DELETE /api/leads:', apiErr);
        }
      }

      // 4. Remove from localStorage offline cache
      try {
        const localStr = localStorage.getItem('vx_proto_submissions');
        if (localStr) {
          const list = JSON.parse(localStr);
          const updatedList = list.filter((item: any) => {
            if (item.id === target.id || item.id === docId) return false;
            if (target.crachaId && (item.crachaId === target.crachaId || item.id === target.crachaId)) return false;
            if (target.nome && item.nome === target.nome && item.dataHora === target.dataHora) return false;
            return true;
          });
          localStorage.setItem('vx_proto_submissions', JSON.stringify(updatedList));
        }
      } catch (e) {
        // ignore
      }

      // 5. Update local state immediately
      setLeads((prev) => prev.filter((l) => {
        if (l.id === target.id || (l as any)._docId === docId) return false;
        if (target.crachaId && l.crachaId === target.crachaId) return false;
        if (candidateIds.has(l.id)) return false;
        return true;
      }));

      if (selectedLead && (selectedLead.id === target.id || selectedLead.crachaId === target.crachaId || (selectedLead as any)._docId === docId)) {
        setSelectedLead(null);
      }

      setActionFeedback({
        type: 'success',
        message: `Lead "${target.nome}" excluído permanentemente da base de dados!`
      });
      setLeadToDelete(null);
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err: any) {
      console.error('Erro ao excluir lead:', err);
      setActionFeedback({
        type: 'error',
        message: `Erro ao excluir lead: ${err.message || 'Tente novamente.'}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

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

    const unsubscribe = onSnapshot(
      leadsRef,
      (snapshot) => {
        const fetched: EventLead[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          const docId = d.id;
          fetched.push({
            ...data,
            id: docId,
            _docId: docId,
            crachaId: data.crachaId || data.leadId || docId
          } as EventLead);
        });

        // Fallback: merge with local storage submissions if any offline
        try {
          const localStr = localStorage.getItem('vx_proto_submissions');
          if (localStr) {
            const localLeads = JSON.parse(localStr);
            localLeads.forEach((loc: EventLead) => {
              const locId = loc.id;
              const locCracha = loc.crachaId;
              const exists = fetched.some(f => f.id === locId || (locCracha && f.crachaId === locCracha));
              if (!exists) {
                fetched.push(loc);
              }
            });
          }
        } catch (e) {
          // ignore
        }

        // Sort descending by creation date
        fetched.sort((a, b) => {
          const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return bTime - aTime;
        });

        setLeads(fetched);
        setLoading(false);
      },
      async (error) => {
        console.warn('Firestore subscription warning, trying server proxy fallback:', error);
        try {
          const res = await fetch('/api/leads');
          if (res.ok) {
            const data = await res.json();
            if (data.leads && Array.isArray(data.leads) && data.leads.length > 0) {
              setLeads(data.leads);
              setLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          // ignore
        }

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

  // Helper to identify same participant across multiple draws (badge id, email, or normalized name)
  const getLeadKey = (lead: EventLead) => {
    if (lead.crachaId && lead.crachaId.trim() && lead.crachaId !== 'N/A' && lead.crachaId !== 'CR-0000') {
      return `cracha:${lead.crachaId.trim().toLowerCase()}`;
    }
    if (lead.email && lead.email.trim()) {
      return `email:${lead.email.trim().toLowerCase()}`;
    }
    if (lead.nome && lead.nome.trim() && !['visitante', 'participante', 'visitante convidado', 'teste lead'].includes(lead.nome.trim().toLowerCase())) {
      return `nome:${lead.nome.trim().toLowerCase()}`;
    }
    return `id:${lead.id}`;
  };

  // Group and compute participation stats per lead (how many draws each person participated in)
  const leadStatsMap = useMemo(() => {
    const map = new Map<string, { count: number; draws: EventLead[] }>();
    
    // Sort oldest first to order each draw (1º sorteio, 2º sorteio...)
    const chronological = [...leads].sort((a, b) => {
      const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return aTime - bTime;
    });

    chronological.forEach((l) => {
      const key = getLeadKey(l);
      const entry = map.get(key) || { count: 0, draws: [] };
      entry.count += 1;
      entry.draws.push(l);
      map.set(key, entry);
    });
    return map;
  }, [leads]);

  // KPIs
  const totalDraws = leads.length;
  const uniqueParticipantsCount = leadStatsMap.size;
  const recurringParticipantsCount = Array.from(leadStatsMap.values()).filter((v: { count: number; draws: EventLead[] }) => v.count > 1).length;

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

    if (onlyRecurring) {
      const stats = leadStatsMap.get(getLeadKey(lead));
      if (!stats || stats.count <= 1) return false;
    }

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
      <div className="min-h-screen bg-[#17232d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <header className="border-b border-slate-700/60 bg-[#17232d] px-4 sm:px-8 py-4 flex items-center justify-between">
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
          <div className="max-w-md w-full bg-[#2a353f] border border-slate-700/60 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Painel da Empresa
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
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
                    className={`w-full pl-10 pr-4 py-3 bg-[#17232d] border rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                      authError ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'
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

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Acesso restrito e criptografado</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#17232d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#17232d] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-amber-300 text-xs font-semibold border border-amber-500/40 transition-colors cursor-pointer"
            title="Ver credenciais e endpoints diretos da API do Firebase"
          >
            <Database size={14} className="text-amber-400" />
            <span className="hidden sm:inline">API Direta Firebase</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer"
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2a353f] hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-medium border border-slate-700/80 transition-colors cursor-pointer"
            title="Sair do Painel"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg animate-fade-in ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/40 border-red-500/50 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* KPI Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#2a353f] border border-slate-700/60 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total de Sorteios</span>
              <Trophy size={14} className="text-yellow-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalDraws}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sorteios / giros registrados</div>
          </div>

          <div className="bg-[#2a353f] border border-slate-700/60 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Visitantes Únicos</span>
              <Users size={14} className="text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
              {uniqueParticipantsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Leads distintos captados</div>
          </div>

          <div className={`bg-[#2a353f] border p-4 rounded-2xl shadow-lg transition-all ${
            recurringParticipantsCount > 0 ? 'border-amber-500/50 bg-gradient-to-b from-[#2a353f] to-amber-950/20' : 'border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="text-amber-300 font-bold">Leads Recorrentes (&gt;1)</span>
              <Sparkles size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              {recurringParticipantsCount}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-0.5">
              {recurringParticipantsCount > 0 ? `${recurringParticipantsCount} participaram de múltiplos sorteios` : 'Nenhum lead repetido ainda'}
            </div>
          </div>

          <div className="bg-[#2a353f] border border-slate-700/60 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Engajamento por Jogo</span>
              <Award size={14} className="text-purple-400" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-bold">
              <span className="text-blue-300" title="Roleta">🎡 {leads.filter(l => l.jogoEscolhido === 'roleta').length}</span>
              <span className="text-slate-500">•</span>
              <span className="text-purple-300" title="Raspadinha">✨ {leads.filter(l => l.jogoEscolhido === 'raspadinha').length}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300" title="Caça-Níquel">🎰 {leads.filter(l => l.jogoEscolhido === 'caca_niquel').length}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Roleta, Raspadinha e Caça-Níquel</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#2a353f] border border-slate-700/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-lg">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, crachá, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#17232d] border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Toggle: Only Recurring Leads */}
            <button
              type="button"
              onClick={() => setOnlyRecurring(!onlyRecurring)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                onlyRecurring
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/10'
                  : 'bg-[#17232d] text-slate-300 border-slate-700/80 hover:bg-[#202d38]'
              }`}
            >
              <Sparkles size={13} className={onlyRecurring ? 'text-amber-400' : 'text-slate-400'} />
              <span>Múltiplos Sorteios (&gt;1)</span>
              {recurringParticipantsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30 text-amber-200">
                  {recurringParticipantsCount}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-400 shrink-0 hidden md:inline">Filtrar Jogo:</span>
            <select
              value={filterGame}
              onChange={(e) => setFilterGame(e.target.value)}
              className="bg-[#17232d] border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="todos">Todos os Jogos</option>
              <option value="roleta">🎡 Roleta</option>
              <option value="raspadinha">✨ Raspadinha</option>
              <option value="caca_niquel">🎰 Caça-Níquel</option>
            </select>
          </div>
        </div>

        {/* Table of Leads */}
        <div className="bg-[#2a353f] border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 bg-[#17232d] text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  <th className="py-3.5 px-4">Participante</th>
                  <th className="py-3.5 px-4">Empresa & Cargo</th>
                  <th className="py-3.5 px-4">Contato (Whats / Email)</th>
                  <th className="py-3.5 px-4">Crachá ID</th>
                  <th className="py-3.5 px-4">Sorteios Realizados</th>
                  <th className="py-3.5 px-4">Jogo & Prêmio</th>
                  <th className="py-3.5 px-4">Voucher</th>
                  <th className="py-3.5 px-4">Produtos Indicados</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <RefreshCw size={20} className="animate-spin inline mr-2 text-blue-400" />
                      Carregando leads do banco de dados em nuvem...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const leadKey = getLeadKey(lead);
                    const stats = leadStatsMap.get(leadKey);
                    const totalParticipacoes = stats?.count || 1;
                    const drawIndex = stats ? stats.draws.findIndex(d => d.id === lead.id) + 1 : 1;

                    return (
                      <tr 
                        key={lead.id}
                        className="hover:bg-[#2a353f]/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {lead.nome.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{lead.nome}</span>
                                {totalParticipacoes > 1 && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    {totalParticipacoes}x
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-normal text-slate-400">{lead.dataHora}</div>
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
                          <span className="px-2 py-0.5 rounded bg-[#2a353f] border border-slate-700/80 font-mono text-[11px] text-slate-300">
                            {lead.crachaId || 'N/A'}
                          </span>
                        </td>

                        {/* Sorteios Participados Column */}
                        <td className="py-3.5 px-4">
                          {totalParticipacoes > 1 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm w-fit">
                                <Sparkles size={11} className="text-amber-400" />
                                {totalParticipacoes} Sorteios
                              </span>
                              <span className="text-[10px] text-amber-400/80 font-medium">
                                (Registro do {drawIndex}º sorteio)
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                              <CheckCircle2 size={12} className="text-emerald-500" /> 1 participação
                            </span>
                          )}
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
                          <span className="font-mono font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30 text-[11px]">
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
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedLead(lead)}
                              title="Ver respostas completas da triagem"
                              className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-medium text-[11px] transition-all border border-blue-500/30 cursor-pointer"
                            >
                              Detalhes
                            </button>
                            <button
                              onClick={() => handleOpenEdit(lead)}
                              title="Editar dados do lead no banco de dados"
                              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-medium transition-all border border-amber-500/30 cursor-pointer"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setLeadToDelete(lead)}
                              title="Excluir lead permanentemente da base"
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-600 hover:text-white font-medium transition-all border border-red-500/30 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Lead Triagem Answers Details */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#17232d] border border-slate-700/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
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
                  className="w-8 h-8 rounded-full bg-[#2a353f] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Participation History Summary inside Modal */}
              {(() => {
                const sKey = getLeadKey(selectedLead);
                const sStats = leadStatsMap.get(sKey);
                if (!sStats) return null;

                return (
                  <div className="p-3.5 bg-[#2a353f] border border-slate-700/60 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                        <Trophy size={14} className="text-yellow-400" />
                        <span>Sorteios Deste Lead ({sStats.count} participação{sStats.count > 1 ? 'ões' : ''})</span>
                      </div>
                      {sStats.count > 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Sparkles size={10} /> Lead Recorrente ({sStats.count} sorteios)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">1º sorteio</span>
                      )}
                    </div>

                    {sStats.count > 1 && (
                      <div className="space-y-1.5 pt-1">
                        {sStats.draws.map((d, idx) => (
                          <div
                            key={d.id || idx}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              d.id === selectedLead.id
                                ? 'bg-[#17232d] border-blue-500/60 ring-1 ring-blue-500/30'
                                : 'bg-[#17232d]/60 border-slate-700/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                                  <span>
                                    {d.jogoEscolhido === 'roleta' && '🎡 Roleta'}
                                    {d.jogoEscolhido === 'raspadinha' && '✨ Raspadinha'}
                                    {d.jogoEscolhido === 'caca_niquel' && '🎰 Caça-Níquel'}
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-amber-300">{d.premioGanho}</span>
                                  {d.id === selectedLead.id && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                                      Registro Atual
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400">{d.dataHora}</div>
                              </div>
                            </div>
                            <span className="font-mono text-yellow-300 text-[11px] font-bold bg-[#2a353f] px-2 py-0.5 rounded border border-yellow-400/20">
                              {d.voucher}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Contact info grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#2a353f] p-3.5 rounded-xl border border-slate-700/60 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">WhatsApp</span>
                  <span className="text-emerald-400 font-bold">{selectedLead.whatsapp || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">E-mail</span>
                  <span className="text-slate-200 truncate block">{selectedLead.email || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Crachá ID</span>
                  <span className="text-blue-400 font-bold">{selectedLead.crachaId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Prêmio & Voucher</span>
                  <span className="text-yellow-400 font-bold">{selectedLead.voucher}</span>
                </div>
              </div>

              {/* Soluções / Produtos Direcionados */}
              {(selectedLead.produtosDirecionados || selectedLead.resposta2) && (
                <div className="p-3.5 bg-[#2a353f] border border-blue-500/40 rounded-xl space-y-2">
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Cenários e Situações Identificadas na Empresa:
                </span>

                <div className="p-3.5 bg-[#2a353f] border border-slate-700/60 rounded-xl text-xs space-y-2">
                  <div className="text-slate-300 font-semibold leading-relaxed">
                    "Com base na realidade da sua empresa hoje quais das situações abaixo acontecem:"
                  </div>
                  <div className="text-white font-medium pl-3 border-l-2 border-emerald-500 leading-relaxed whitespace-pre-line">
                    {selectedLead.respostasTriagem || selectedLead.resposta1 || 'Não informada'}
                  </div>
                </div>

                {/* Legacy backward compat if available */}
                {selectedLead.resposta3 && !selectedLead.respostasTriagem && (
                  <div className="p-3 bg-[#2a353f] border border-slate-700/60 rounded-xl text-xs space-y-1">
                    <div className="text-slate-400 font-semibold">Observações / Previsão:</div>
                    <div className="text-white font-medium pl-2 border-l-2 border-blue-500">
                      {selectedLead.resposta3}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const l = selectedLead;
                      setLeadToDelete(l);
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Excluir Lead
                  </button>
                  <button
                    onClick={() => {
                      const l = selectedLead;
                      handleOpenEdit(l);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={14} />
                    Editar Dados
                  </button>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-white text-xs font-bold cursor-pointer border border-slate-700/60 transition-colors"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDITAR LEAD NA BASE DE DADOS */}
        {editingLead && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#17232d] border border-slate-700/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Editar Lead no Banco de Dados</h3>
                    <p className="text-xs text-slate-400">Atualize as informações que são sincronizadas no Firebase Firestore</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingLead(null)}
                  className="w-8 h-8 rounded-full bg-[#2a353f] hover:bg-[#34424e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={editFormData.nome || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Crachá ID</label>
                    <input
                      type="text"
                      value={editFormData.crachaId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, crachaId: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Empresa</label>
                    <input
                      type="text"
                      value={editFormData.empresa || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, empresa: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Cargo</label>
                    <input
                      type="text"
                      value={editFormData.cargo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cargo: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={editFormData.whatsapp || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">E-mail</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Jogo do Sorteio</label>
                    <select
                      value={editFormData.jogoEscolhido || 'roleta'}
                      onChange={(e) => setEditFormData({ ...editFormData, jogoEscolhido: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="roleta">🎡 Roleta de Prêmios</option>
                      <option value="raspadinha">✨ Raspadinha Digital</option>
                      <option value="caca_niquel">🎰 Caça-Níquel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Prêmio Ganho</label>
                    <input
                      type="text"
                      value={editFormData.premioGanho || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, premioGanho: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Código do Voucher</label>
                    <input
                      type="text"
                      value={editFormData.voucher || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, voucher: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-yellow-300 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">Produtos Direcionados</label>
                    <input
                      type="text"
                      placeholder="Ex: Software de Gestão, Scanner Industrial"
                      value={editFormData.produtosDirecionados || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, produtosDirecionados: e.target.value })}
                      className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-blue-300 font-medium focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                    Cenários / Respostas da Triagem
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.respostasTriagem || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, respostasTriagem: e.target.value })}
                    className="w-full bg-[#2a353f] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Opções marcadas pelo participante na triagem..."
                  />
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLead(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700/60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE LEAD */}
        {leadToDelete && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#17232d] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg">
                <Trash2 size={28} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Excluir Lead da Base de Dados?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Você está prestes a remover o lead de <strong className="text-white">{leadToDelete.nome}</strong> (Crachá: <span className="font-mono text-blue-400">{leadToDelete.crachaId || leadToDelete.id}</span>).
                </p>
                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-[11px] text-red-300 text-left flex items-start gap-2 mt-2">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>Esta ação é irreversível e excluirá o registro permanentemente do banco de dados em nuvem Firebase Firestore.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setLeadToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700/60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Sim, Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API FIREBASE DIRECT INTEGRATION MODAL */}
        {showApiModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#17232d] border border-slate-700/60 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
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
                  className="w-8 h-8 rounded-full bg-[#2a353f] hover:bg-[#34424e] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Parametros e Segredos do Projeto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">API Key (apiKey / Segredo)</span>
                  <span className="font-mono text-blue-400 font-bold break-all">AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E</span>
                </div>
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Project ID (projectId)</span>
                  <span className="font-mono text-white font-bold">gen-lang-client-0914985094</span>
                </div>
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Database ID (firestoreDatabaseId)</span>
                  <span className="font-mono text-amber-400 font-bold break-all">ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88</span>
                </div>
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">App ID (appId)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">1:239443020505:web:1e21020dea0711496f8cc8</span>
                </div>
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Auth Domain (authDomain)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">gen-lang-client-0914985094.firebaseapp.com</span>
                </div>
                <div className="p-3 bg-[#2a353f] rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Storage Bucket (storageBucket)</span>
                  <span className="font-mono text-slate-300 font-bold break-all">gen-lang-client-0914985094.firebasestorage.app</span>
                </div>
              </div>

              {/* JSON de Configuração Completo */}
              <div className="p-4 bg-[#2a353f] rounded-2xl border border-slate-700/60 space-y-2">
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
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#17232d] hover:bg-[#1f2e3b] text-amber-400 border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'json' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'json' ? 'Copiado!' : 'Copiar Objeto JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#17232d] rounded-xl text-[11px] font-mono text-amber-300/90 overflow-x-auto border border-slate-700/60">
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
              <div className="p-4 bg-[#2a353f] rounded-2xl border border-slate-700/60 space-y-2">
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
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#17232d] hover:bg-[#1f2e3b] text-blue-400 border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'curl' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'curl' ? 'Copiado!' : 'Copiar cURL'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300">
                  Utilize este endpoint HTTP puro no Base44 ou qualquer backend para buscar os dados de um participante pelo crachá:
                </p>
                <code className="block p-3 bg-[#17232d] rounded-xl text-[11px] font-mono text-amber-300 break-all select-all border border-slate-700/60">
                  POST https://firestore.googleapis.com/v1/projects/gen-lang-client-0914985094/databases/ai-studio-vxleads-3f221bd2-d7b1-412f-8b8b-acc20b7d9c88/documents:runQuery?key=AIzaSyDDLpIvt2mxiVdka_KEeLfyKnKJm9VHz5E
                </code>
              </div>

              {/* Endpoint 2: Snippet JavaScript para o Base44 */}
              <div className="p-4 bg-[#2a353f] rounded-2xl border border-slate-700/60 space-y-2">
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
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#17232d] hover:bg-[#1f2e3b] text-blue-400 border border-slate-700/60 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'js' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'js' ? 'Copiado!' : 'Copiar Função'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-[#17232d] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-700/60 max-h-44">
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
              <div className="p-4 bg-[#2a353f] rounded-2xl border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Testador da API Direta do Firebase</span>
                </div>
                <p className="text-xs text-slate-300">
                  Teste a chamada HTTP em tempo real contra o Firebase Firestore para ver a resposta imediata:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testLeadId}
                    onChange={(e) => setTestLeadId(e.target.value)}
                    placeholder="Digite o ID do crachá (Ex: 6aaee39e34cf9a3a6283ba77)"
                    className="flex-1 px-3 py-2 bg-[#17232d] border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder:text-slate-500"
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
                  <pre className="p-3 bg-[#17232d] rounded-xl text-[10px] font-mono text-emerald-300 overflow-x-auto border border-emerald-500/20 max-h-56">
                    {testResponse}
                  </pre>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowApiModal(false)}
                  className="px-6 py-2 rounded-xl bg-[#2a353f] hover:bg-[#34424e] text-white text-xs font-bold cursor-pointer border border-slate-700/60 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/60 bg-[#17232d] py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
        <p>VX Leads • Painel Comercial da Empresa (Acesso Restrito)</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Autenticado com a chave da empresa</span>
        </div>
      </footer>
    </div>
  );
}
