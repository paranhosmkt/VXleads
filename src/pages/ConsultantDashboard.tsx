import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, DollarSign, Copy, LogOut, Loader2, Building2, Calendar } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [consultantData, setConsultantData] = useState<any>(null);
  const [referredCompanies, setReferredCompanies] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const docRef = doc(db, 'consultants', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setConsultantData(data);

          // Fetch referred companies
          const companiesRef = collection(db, 'companies');
          const q = query(companiesRef, where('referredByCode', '==', data.referralCode));
          const querySnapshot = await getDocs(q);
          
          const companies: any[] = [];
          querySnapshot.forEach((doc) => {
            companies.push({ id: doc.id, ...doc.data() });
          });
          setReferredCompanies(companies);

          // Check Stripe Connect Status
          if (data.stripeAccountId) {
            try {
              const res = await fetch(`/api/connect-status/${data.stripeAccountId}`);
              const statusData = await res.json();
              setStripeStatus(statusData);
            } catch (err) {
              console.error("Failed to check stripe status", err);
            }
          }
        } else {
          // Not a consultant
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do consultor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      let accountId = consultantData?.stripeAccountId;
      
      // If no account yet, create one
      if (!accountId) {
        const createRes = await fetch('/api/create-connect-account', { method: 'POST' });
        const createData = await createRes.json();
        
        if (createData.error) {
          throw new Error(createData.error);
        }
        
        accountId = createData.accountId;
        
        // Save to firebase
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'consultants', user.uid);
          await updateDoc(docRef, { stripeAccountId: accountId });
          setConsultantData({ ...consultantData, stripeAccountId: accountId });
        }
      }

      // Generate link and redirect
      const linkRes = await fetch('/api/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      const linkData = await linkRes.json();
      
      if (linkData.url) {
        window.open(linkData.url, '_blank');
      }
    } catch (error) {
      console.error("Erro ao conectar ao Stripe:", error);
      alert("Ocorreu um erro ao iniciar a conexão bancária: " + (error.message || "Tente novamente."));
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const isStripeConnected = stripeStatus?.details_submitted && stripeStatus?.charges_enabled;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const copyToClipboard = () => {
    if (!consultantData) return;
    const link = `${window.location.origin}/cadastro?ref=${consultantData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to calculate 90% commission based on plan
  const getCommission = (plan: string, cycle: string) => {
    let price = 0;
    if (plan === 'starter') price = cycle === 'annual' ? 4997 : 797;
    if (plan === 'pro') price = cycle === 'annual' ? 8997 : 1497;
    if (plan === 'enterprise') price = cycle === 'annual' ? 24997 : 2997;
    return price * 0.90;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const totalCommissions = referredCompanies.reduce((acc, company) => {
    return acc + getCommission(company.plan, company.cycle);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="text-blue-500" />
            <span className="text-xl font-black tracking-tight">VX Leads <span className="font-light">Consultor</span></span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Welcome & Link Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Olá, {consultantData?.nome.split(' ')[0]}!</h1>
          <p className="text-gray-500 mb-6">Aqui está o seu painel de parcerias. Compartilhe seu link exclusivo para ganhar 10% em comissões.</p>
          
          {!isStripeConnected ? (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Configure sua conta para receber comissões</h3>
              <p className="text-yellow-700 mb-6">Você precisa conectar uma conta bancária de forma segura através da nossa parceria com o Stripe para liberar o seu link de indicação e receber seus pagamentos automaticamente.</p>
              
              <button 
                onClick={handleConnectStripe}
                disabled={isConnectingStripe}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
              >
                {isConnectingStripe ? <Loader2 className="animate-spin" size={20} /> : <DollarSign size={20} />}
                Conectar Conta Bancária Segura
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-100 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-blue-900 mb-1">Seu Link de Indicação (Código: {consultantData?.referralCode})</label>
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/cadastro?ref=${consultantData?.referralCode}`}
                className="w-full bg-white border border-blue-200 text-gray-700 p-3 rounded-lg outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard}
              className="w-full md:w-auto mt-2 md:mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Copy size={18} />
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Empresas Indicadas</p>
              <p className="text-3xl font-black text-gray-900">{referredCompanies.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="bg-green-50 p-4 rounded-xl text-green-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total em Comissões (10%)</p>
              <p className="text-3xl font-black text-gray-900">{formatCurrency(totalCommissions)}</p>
            </div>
          </div>
        </div>

        {/* Referred Companies List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Suas Indicações e Comissões</h2>
            <p className="text-sm text-gray-500 mt-1">O pagamento das comissões é liberado 30 dias após a ativação do plano pelo cliente.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Empresa</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Plano</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Ciclo</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Sua Comissão</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {referredCompanies.length > 0 ? (
                  referredCompanies.map(company => (
                    <tr key={company.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{company.razaoSocial}</p>
                            <p className="text-sm text-gray-500">{company.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-gray-700 font-medium">{company.plan || 'N/A'}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                          {company.cycle === 'annual' ? 'Anual' : 'Por Evento'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-green-600">
                        {formatCurrency(getCommission(company.plan, company.cycle))}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <Calendar size={12} />
                          Aguardando 30 dias
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      Você ainda não tem indicações. Comece a compartilhar o seu link!
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
