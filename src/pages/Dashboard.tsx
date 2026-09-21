import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Users, Gift, Download, Copy, ExternalLink, 
  Search, Loader2, LogOut, CheckCircle, Database, Settings, FileSpreadsheet, Target, Edit2, Trash2, X, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [companyName, setCompanyName] = useState('');
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [currentCycle, setCurrentCycle] = useState('event');
  const [formFields, setFormFields] = useState<any[]>([]);
  const [planStatus, setPlanStatus] = useState('active');
  const [discountWon, setDiscountWon] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const checkSession = async (uid: string) => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      if (sessionId) {
        setIsVerifying(true);
        try {
          const res = await fetch('/api/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
          });
          const data = await res.json();
          if (data.status === 'paid') {
            await updateDoc(doc(db, 'companies', uid), { planStatus: 'active' });
            setPlanStatus('active');
          }
          // Remove session_id from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.error('Error verifying session:', e);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const companyDoc = await getDoc(doc(db, 'companies', user.uid));
          if (companyDoc.exists()) {
            setCompanyName(companyDoc.data().razaoSocial || 'Sua Empresa');
            setCurrentPlan(companyDoc.data().plan || 'starter');
            setCurrentCycle(companyDoc.data().cycle || 'event');
            setFormFields(companyDoc.data().formFields || []);
            setPlanStatus(companyDoc.data().planStatus || 'pending');
            await checkSession(user.uid);
            setDiscountWon(companyDoc.data().discountWon || null);
          }
          
          // Buscar leads
          const leadsSnap = await getDocs(collection(db, 'companies', user.uid, 'leads'));
          let leadsData: any[] = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Se não houver leads na subcoleção ou para consolidar leads de eventos
          try {
            const eventLeadsSnap = await getDocs(collection(db, 'event_leads'));
            const eventLeads: any[] = eventLeadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Merge sem duplicar
            const existingIds = new Set(leadsData.map(l => l.crachaId || l.id));
            for (const el of eventLeads) {
              if (!existingIds.has(el.crachaId || el.id)) {
                leadsData.push(el);
              }
            }
          } catch (e) {
            console.warn('Aviso ao carregar event_leads no Dashboard:', e);
          }

          // sort by createdAt desc
          leadsData.sort((a, b) => {
             const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0));
             const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0));
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

  const handlePayment = async () => {
    if (!userId) return;
    try {
      const companyDoc = await getDoc(doc(db, 'companies', userId));
      let consultantStripeAccountId = null;
      let userEmail = auth.currentUser?.email || '';
      
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        if (companyData.referredByCode) {
          const q = query(collection(db, 'consultants'), where('referralCode', '==', companyData.referredByCode));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const consultantData = querySnapshot.docs[0].data() as any;
            if (consultantData?.stripeAccountId) {
              consultantStripeAccountId = consultantData.stripeAccountId;
            }
          }
        }
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentPlan,
          cycle: currentCycle,
          consultantStripeAccountId,
          email: userEmail,
          uid: userId
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao gerar pagamento: ' + (data.error || 'Tente novamente.'));
      }
    } catch (e: any) {
      console.error('Erro no checkout:', e);
      alert('Ocorreu um erro ao conectar ao pagamento.');
    }
  };

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
    
    
    const headers = ['Nome', 'Email', 'Telefone', ...formFields.map(f => f.label), 'Premio', 'Status', 'Data', 'Horario'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        ...formFields.map(f => `"${(lead[f.id] || '').toString().replace(/"/g, '""')}"`),
        `"${lead.prize || ''}"`,
        `"${lead.status || ''}"`,
        `"${lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : ''}"`,
        `"${lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''}"`
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
    
    
    
    const tableColumn = ['Nome', 'Email', 'Telefone', ...formFields.map(f => f.label), 'Prêmio', 'Status', 'Data', 'Horário'];
    const tableRows = leads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      ...formFields.map(f => lead[f.id] || ''),
      lead.prize || '',
      lead.status === 'resgatado' ? 'Resgatado' : 'Pendente',
      lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : '',
      lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : ''
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


  const [editingLead, setEditingLead] = useState<any>(null);

  
  const handleDeleteAllLeads = async () => {
    if (!userId) return;
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir TODOS os leads? Esta ação não pode ser desfeita.")) return;
    try {
      const leadsRef = collection(db, 'companies', userId, 'leads');
      const leadsSnapshot = await getDocs(leadsRef);
      // Restore prize quantities
      for (const leadDoc of leadsSnapshot.docs) {
        const data = leadDoc.data();
        if (data.prizeId) {
          try {
            const prizeRef = doc(db, 'companies', userId, 'prizes', data.prizeId);
            const prizeSnap = await getDoc(prizeRef);
            if (prizeSnap.exists()) {
              const currentQ = Number(prizeSnap.data().quantidadeAtual || 0);
              const totalQ = Number(prizeSnap.data().quantidadeTotal || currentQ);
              if (currentQ < totalQ) {
                await updateDoc(prizeRef, { quantidadeAtual: currentQ + 1 });
              }
            }
          } catch(e) {}
        }
      }
      
      const deletePromises = leadsSnapshot.docs.map(leadDoc => deleteDoc(leadDoc.ref));
      await Promise.all(deletePromises);
      setLeads([]);
      alert("Todos os leads foram excluídos com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir todos os leads", error);
      alert("Erro ao excluir leads.");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!userId) return;
    if (!window.confirm("Tem certeza que deseja excluir este lead?")) return;
    try {
      const leadToDelete = leads.find(l => l.id === leadId);
      if (leadToDelete && leadToDelete.prizeId) {
        try {
          const prizeRef = doc(db, 'companies', userId, 'prizes', leadToDelete.prizeId);
          const prizeSnap = await getDoc(prizeRef);
          if (prizeSnap.exists()) {
            const currentQ = Number(prizeSnap.data().quantidadeAtual || 0);
            const totalQ = Number(prizeSnap.data().quantidadeTotal || currentQ);
            if (currentQ < totalQ) {
              await updateDoc(prizeRef, { quantidadeAtual: currentQ + 1 });
            }
          }
        } catch(e) {}
      }
      
      await deleteDoc(doc(db, 'companies', userId, 'leads', leadId));
      setLeads(leads.filter(l => l.id !== leadId));
    } catch (error) {
      console.error("Erro ao excluir", error);
      alert("Erro ao excluir lead.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !editingLead) return;
    try {
      await updateDoc(doc(db, 'companies', userId, 'leads', editingLead.id), {
        name: editingLead.name || '',
        email: editingLead.email || '',
        phone: editingLead.phone || '',
        });
      setLeads(leads.map(l => l.id === editingLead.id ? editingLead : l));
      setEditingLead(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações.");
    }
  };

  const totalLeads = leads.length;
  const prizesAvailable = prizes.reduce((acc, p) => acc + (p.quantidadeAtual || 0), 0);
  const prizesDelivered = leads.filter(l => l.status === 'resgatado').length;
  const prizesPending = totalLeads - prizesDelivered;
  const chartData = [
    { name: 'Resgatados', value: prizesDelivered, fill: '#10b981' },
    { name: 'Pendentes', value: prizesPending, fill: '#f59e0b' }
  ];

  
  const filteredLeads = leads.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (l.name?.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term));
  });

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const rouletteLink = window.location.origin + `/roleta/${userId}`;

  if (planStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Target className="w-16 h-16 text-blue-600 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('dashboard.pending_payment')}</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Seu plano ainda não está ativo. Por favor, conclua o pagamento para liberar as funcionalidades do painel.
        </p>
        <div className="flex gap-4">
          
          <button
            onClick={handlePayment}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600/30"
          >
            Pagar Agora
          </button>

          <button
            onClick={() => auth.signOut().then(() => navigate('/'))}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-xs md:text-sm text-gray-500">{t('dashboard.control_panel')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/configurar-brindes')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            <span className="hidden md:inline">{t('dashboard.gifts')}</span>
          </button>

          <button 
            onClick={() => navigate('/configurar-experiencia')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            <span className="hidden md:inline">{t('dashboard.experience')}</span>
          </button>

          <button 
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-50 text-purple-700 font-semibold rounded-lg hover:bg-purple-100 transition-colors"
          >
            <QrCode size={18} />
            <span className="hidden md:inline">{t('dashboard.qrcode')}</span>
          </button>
          
          <button 
            onClick={() => window.open(rouletteLink, '_blank')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <ExternalLink size={18} />
            <span className="hidden md:inline">{t('dashboard.open_game')}</span>
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
              <h2 className="text-red-800 font-bold text-lg mb-1">{t('dashboard.inactive_plan')}</h2>
              <p className="text-red-600 text-sm">{t('dashboard.inactive_desc')}</p>
            </div>
            
            <button 
              onClick={handlePayment}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Regularizar Plano
            </button>

          </div>
        )}

        
        {discountWon && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
                <Gift size={24} />
              </div>
              <div>
                <h2 className="text-emerald-800 font-bold text-lg mb-1">{t('dashboard.welcome_prize')}</h2>
                <p className="text-emerald-600 text-sm">{t('dashboard.welcome_desc', { discount: discountWon })}</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap">
              Utilizar Desconto
            </button>
          </div>
        )}
        {/* URL Link Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{t('dashboard.tablet_link')}</h2>
            <p className="text-sm text-gray-500">{t('dashboard.tablet_desc')}</p>
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

        
        {/* Gráfico de Proporção */}
        {totalLeads > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/3">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('dashboard.gift_status')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('dashboard.gift_status_desc')}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-emerald-50 px-4 py-2 rounded-lg">
                  <span className="text-emerald-700 font-medium text-sm">{t('dashboard.redeemed')}</span>
                  <span className="text-emerald-700 font-bold">{prizesDelivered}</span>
                </div>
                <div className="flex justify-between items-center bg-amber-50 px-4 py-2 rounded-lg">
                  <span className="text-amber-700 font-medium text-sm">{t('dashboard.pending_gifts')}</span>
                  <span className="text-amber-700 font-bold">{prizesPending}</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-2/3 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} brindes`, 'Quantidade']}
                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('dashboard.total_leads')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('dashboard.gifts_delivered')}</p>
              <p className="text-3xl font-bold text-gray-900">{prizesDelivered}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <Gift size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('dashboard.gifts_available')}</p>
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
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">{t('dashboard.close')}</button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Use esta chave de API e endpoint para enviar os leads automaticamente para o seu CRM (RD Station, HubSpot, etc).
                Consulte a documentação técnica para o formato do Webhook.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.endpoint')}</label>
                  <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                    https://api.vxleads.com.br/v1/webhook/{userId}
                  </code>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{t('dashboard.access_token')}</label>
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
            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.captured_leads')}</h2>
            
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
                  onClick={handleDeleteAllLeads}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                  title="Excluir Todos os Leads"
                >
                  <Trash2 size={18} />
                  Limpar
                </button>
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
                  <th className="px-6 py-4 font-semibold">{t('dashboard.contact')}</th>
                  {formFields.map(field => (
                    <th key={field.id} className="px-6 py-4 font-semibold">{field.label}</th>
                  ))}
                  <th className="px-6 py-4 font-semibold">{t('dashboard.prize')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('dashboard.date')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('dashboard.time')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('dashboard.prize_status')}</th>
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
                      {formFields.map(field => (
                        <td key={field.id} className="px-6 py-4 text-gray-600">
                          {lead[field.id] || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 font-medium text-indigo-600">
                        {lead.prize}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleLeadStatus(lead.id, lead.status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
                            lead.status === 'resgatado' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {lead.status === 'resgatado' ? (
                            <><CheckCircle size={14} /> Resgatado</>
                          ) : (
                            <>{t('dashboard.mark_pending')}</>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                          title="Editar lead"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                          title="Excluir lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6 + formFields.length} className="px-6 py-12 text-center text-gray-500">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.edit_lead')}</h2>
              <button onClick={() => setEditingLead(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('dashboard.name')}</label>
                <input 
                  type="text" 
                  value={editingLead.name || ''} 
                  onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('dashboard.email')}</label>
                <input 
                  type="email" 
                  value={editingLead.email || ''} 
                  onChange={e => setEditingLead({...editingLead, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('dashboard.phone')}</label>
                <input 
                  type="text" 
                  value={editingLead.phone || ''} 
                  onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-md relative shadow-2xl flex flex-col items-center text-center">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <QrCode size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.game_qrcode')}</h2>
            <p className="text-gray-500 mb-8 max-w-[280px]">
              Use este QR Code em flyers, tótens ou telas para que os visitantes joguem pelo próprio celular.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 inline-block">
              <QRCodeSVG value={rouletteLink} size={220} level="H" includeMargin={false} />
            </div>

            <button 
              onClick={() => {
                const svg = document.querySelector('.bg-white.p-6 > svg');
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = 'qrcode-jogo.png';
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Download size={20} />
              Baixar QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
