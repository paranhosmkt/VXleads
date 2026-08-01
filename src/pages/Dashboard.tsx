import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Users, Gift, Download, Copy, ExternalLink, 
  Search, Loader2, LogOut, CheckCircle, Database, Settings, FileSpreadsheet, Target
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [planStatus, setPlanStatus] = useState('active');
  const [leads, setLeads] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const companyDoc = await getDoc(doc(db, 'companies', user.uid));
          if (companyDoc.exists()) {
            setCompanyName(companyDoc.data().razaoSocial || 'Sua Empresa');
            setPlanStatus(companyDoc.data().planStatus || 'active');
          }
          
          // Buscar leads
          const leadsSnap = await getDocs(collection(db, 'companies', user.uid, 'leads'));
          const leadsData: any[] = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          // sort by createdAt desc
          leadsData.sort((a, b) => {
             const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
             const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
             return bDate - aDate;
          });
          setLeads(leadsData);
          
          // Buscar brindes
          const prizesSnap = await getDocs(collection(db, 'companies', user.uid, 'prizes'));
          const prizesData = prizesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setPrizes(prizesData);
          
        } catch (err) {
          console.error("Erro ao carregar dados", err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copiado!');
  };

  const downloadCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Area', 'Premio', 'Status', 'Data'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.area || ''}"`,
        `"${lead.prize || ''}"`,
        `"${lead.status || ''}"`,
        `"${lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_vxleads.csv`;
    link.click();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.text(`Relatório de Leads - ${companyName}`, 14, 15);
    
    const tableColumn = ['Nome', 'Email', 'Telefone', 'Prêmio', 'Status', 'Data'];
    const tableRows = leads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.prize || '',
      lead.status === 'resgatado' ? 'Resgatado' : 'Pendente',
      lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : ''
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`leads_vxleads.pdf`);
  };

  const toggleLeadStatus = async (leadId: string, currentStatus: string) => {
    if (!userId) return;
    const newStatus = currentStatus === 'resgatado' ? 'pending' : 'resgatado';
    try {
      await updateDoc(doc(db, 'companies', userId, 'leads', leadId), { status: newStatus });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error("Erro ao atualizar status", error);
      alert("Erro ao atualizar o status do lead.");
    }
  };

  const totalLeads = leads.length;
  const prizesAvailable = prizes.reduce((acc, p) => acc + (p.quantidadeAtual || 0), 0);
  const prizesDelivered = leads.filter(l => l.status === 'resgatado').length;
  
  const filteredLeads = leads.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (l.name?.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term));
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const rouletteLink = window.location.origin + `/roleta/${userId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-blue-600 text-white p-2 md:p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
              <Target size={20} strokeWidth={2.5} className="md:w-[22px] md:h-[22px]" />
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter hidden sm:block">
              VX<span className="text-blue-600">Leads</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-base md:text-xl font-bold text-gray-900 truncate max-w-[120px] md:max-w-none">{companyName}</h1>
            <p className="text-xs md:text-sm text-gray-500">Painel de Controle</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/configurar-brindes')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            <span className="hidden md:inline">Brindes</span>
          </button>
          <button 
            onClick={() => navigate('/selecionar-personagem')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            <span className="hidden md:inline">Personagem</span>
          </button>

          <button 
            onClick={() => navigate('/configurar-experiencia')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            <span className="hidden md:inline">Experiência</span>
          </button>

          <button 
            onClick={() => window.open(window.location.origin + `/tv/${userId}`, '_blank')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ExternalLink size={18} />
            <span className="hidden md:inline">Modo TV</span>
          </button>
          
          <button 
            onClick={() => window.open(rouletteLink, '_blank')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <ExternalLink size={18} />
            <span className="hidden md:inline">Abrir Roleta</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        
        {planStatus === 'inactive' && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h2 className="text-red-800 font-bold text-lg mb-1">Seu plano está inativo</h2>
              <p className="text-red-600 text-sm">O acesso à roleta pelos seus clientes está bloqueado. Regularize sua assinatura para voltar a capturar leads.</p>
            </div>
            <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
              Regularizar Plano
            </button>
          </div>
        )}

        {/* URL Link Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Link do seu Totem</h2>
            <p className="text-sm text-gray-500">Use este link no dispositivo que ficará no estande para as pessoas jogarem.</p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={rouletteLink}
              className="flex-1 md:w-80 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
            />
            <button 
              onClick={() => copyToClipboard(rouletteLink)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
              title="Copiar link"
            >
              <Copy size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Brindes Entregues</p>
              <p className="text-3xl font-bold text-gray-900">{prizesDelivered}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <Gift size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Brindes Disponíveis (Estoque)</p>
              <p className="text-3xl font-bold text-gray-900">{prizesAvailable}</p>
            </div>
          </div>
        </div>

        {/* API Info Modal / Section */}
        {showSettings && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                Integração API com CRM
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">Fechar</button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Use esta chave de API e endpoint para enviar os leads automaticamente para o seu CRM (RD Station, HubSpot, etc).
                Consulte a documentação técnica para o formato do Webhook.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Endpoint</label>
                  <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                    https://api.vxleads.com.br/v1/webhook/{userId}
                  </code>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Token de Acesso</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      readOnly 
                      value={`vx_${userId}_token`} 
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                    />
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
                      Gerar Novo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Leads Capturados</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar lead ou código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={downloadCSV}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <FileSpreadsheet size={18} />
                  CSV
                </button>
                <button 
                  onClick={downloadPDF}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Download size={18} />
                  PDF
                </button>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="Configurar Integração"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Contato</th>
                  <th className="px-6 py-4 font-semibold">Área</th>
                  <th className="px-6 py-4 font-semibold">Prêmio Ganho</th>
                  <th className="px-6 py-4 font-semibold text-center">Data</th>
                  <th className="px-6 py-4 font-semibold text-right">Status / Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{lead.name}</p>
                        <div className="text-xs text-gray-500 flex flex-col mt-1 space-y-0.5">
                          <span>{lead.email}</span>
                          <span>{lead.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{lead.area}</td>
                      <td className="px-6 py-4 font-medium text-indigo-600">
                        {lead.prize}
                      </td>

                      <td className="px-6 py-4 text-center text-gray-500">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleLeadStatus(lead.id, lead.status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            lead.status === 'resgatado' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {lead.status === 'resgatado' ? (
                            <><CheckCircle size={14} /> Resgatado</>
                          ) : (
                            <>Pendente (Marcar)</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
