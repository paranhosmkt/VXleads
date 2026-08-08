import React, { useState, useEffect } from 'react';
import { Target, Building2, MapPin, User, Mail, Phone, Lock, FileText, ChevronLeft, Loader2, XCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planFromUrl = params.get('plan');
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    }
  }, [location.search]);
  const [discount, setDiscount] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('vxleads_discount_won');
    if (saved) setDiscount(saved);
  }, []);

  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    inscricaoEstadual: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    nomeContato: '',
    email: '',
    telefone: '',
    senha: '',
    confirmacaoSenha: '',
    logoDataUrl: ''
  });

  const getDiscountValue = () => {
    if (!discount) return 0;
    const match = discount.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };
  const discountValue = getDiscountValue();
  
  const calculatePrice = (basePrice: number) => {
    if (discountValue === 0) return basePrice;
    return basePrice * (1 - discountValue / 100);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('A logomarca deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    if (formData.senha !== formData.confirmacaoSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;

      // 2. Salvar dados da empresa no Firestore
      const companyData = {
        uid: user.uid,
        razaoSocial: formData.razaoSocial,
        cnpj: formData.cnpj,
        inscricaoEstadual: formData.inscricaoEstadual,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        nomeContato: formData.nomeContato,
        email: formData.email,
        telefone: formData.telefone,
        logoDataUrl: formData.logoDataUrl,
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        discountWon: localStorage.getItem('vxleads_discount_won') || null,
        plan: selectedPlan
      };
      await setDoc(doc(db, 'companies', user.uid), companyData);
      
      // 3. Enviar e-mail de verificação
      await sendEmailVerification(user);
      
      alert('Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para você.');
      navigate('/configurar-experiencia');
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {step === 1 && (
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
              <ChevronLeft size={20} />
              <span className="font-medium">Voltar</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">VX Leads</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-8 sm:p-12">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Escolha seu Plano</h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                Selecione o plano que melhor atende às necessidades da sua empresa. Você poderá alterar depois se precisar.
              </p>
              {discount && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl inline-flex items-center gap-3 animate-fade-in-up">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                    <Target size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-emerald-800 font-bold">Você tem um prêmio garantido!</p>
                    <p className="text-emerald-600 text-sm">{discount} válido para a sua primeira contratação.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {/* Starter */}
              <div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedPlan === 'starter' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedPlan('starter')}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 text-sm mb-4">Para pequenos estandes e ativações pontuais.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 797</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(797))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 797 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Captação de até 500 Leads</li>
                  <li>• 1 Jogo Interativo (Roleta)</li>
                  <li>• Suporte por E-mail</li>
                </ul>
              </div>
              
              {/* Pro */}
              <div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all relative ${selectedPlan === 'pro' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedPlan('pro')}
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">Mais Popular</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-500 text-sm mb-4">Para feiras médias e geração constante de leads.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 1.497</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(1497))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 1.497 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Captação de até 2.000 Leads</li>
                  <li>• 3 Jogos Interativos</li>
                  <li>• Suporte via WhatsApp</li>
                </ul>
              </div>
              
              {/* Enterprise */}
              <div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedPlan === 'enterprise' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedPlan('enterprise')}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 text-sm mb-4">Para grandes congressos e operações em escala.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">
                  {discountValue > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through font-normal">R$ 2.997</span>
                      <span className="text-emerald-600">R$ {formatPrice(calculatePrice(2997))} <span className="text-sm font-medium text-gray-500">/evento</span></span>
                    </div>
                  ) : (
                    <>R$ 2.997 <span className="text-sm font-medium text-gray-500">/evento</span></>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Captação Ilimitada</li>
                  <li>• Todos os Jogos + Personalizados</li>
                  <li>• Suporte 24/7 no Evento</li>
                </ul>
              </div>
              
              {/* Personalizado */}
              <div 
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedPlan === 'personalizado' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setSelectedPlan('personalizado')}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalizado</h3>
                <p className="text-gray-500 text-sm mb-4">Projeto sob medida para sua necessidade.</p>
                <div className="text-2xl font-black text-gray-900 mb-4">Sob Consulta</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Leads personalizados</li>
                  <li>• Dispositivos simultâneos ilimitados</li>
                  <li>• Integração CRM / Webhook</li>
                  <li>• Suporte 24/7 no Evento</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <a 
                href="https://wa.me/5511999999999?text=Ol%C3%A1,%20gostaria%20de%20falar%20com%20um%20consultor%20sobre%20os%20planos%20da%20VX%20Leads" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Converse com um consultor
              </a>
              <button 
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all w-full sm:w-auto ${selectedPlan ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Continuar para Dados da Empresa
              </button>
            </div>
          </div>
        </div>
      )}
  
      {step === 2 && (
        <div className="max-w-4xl mx-auto">
        
        
        <div className="mb-8 flex items-center justify-between">
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
            <span className="font-medium">Voltar para Planos</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Target className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">VX Leads</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-gray-900 p-8 sm:px-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl"></div>
            
            <h1 className="text-3xl font-extrabold text-white mb-2 relative z-10">Crie sua Conta Empresarial</h1>
            <p className="text-gray-400 relative z-10 max-w-xl mx-auto">
              Preencha os dados da sua empresa. As informações abaixo serão utilizadas para emissão automática de Notas Fiscais.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:px-12 space-y-10">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Seção: Dados da Empresa */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Building2 className="text-blue-600" size={24} />
                Dados da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logomarca (Opcional - até 2MB)</label>
                  <div className="flex items-center gap-4">
                    {formData.logoDataUrl && (
                      <img src={formData.logoDataUrl} alt="Logo preview" className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1 bg-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social</label>
                  <input
                    type="text"
                    name="razaoSocial"
                    required
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Nome completo da empresa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ</label>
                  <input
                    type="text"
                    name="cnpj"
                    required
                    value={formData.cnpj}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Inscrição Estadual</label>
                  <input
                    type="text"
                    name="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Opcional se isento"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Endereço (Nota Fiscal) */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <MapPin className="text-blue-600" size={24} />
                Endereço de Faturamento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    required
                    value={formData.cep}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logradouro</label>
                  <input
                    type="text"
                    name="endereco"
                    required
                    value={formData.endereco}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    name="numero"
                    required
                    value={formData.numero}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Ex: 123"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Sala, Andar, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    required
                    value={formData.bairro}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Bairro"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    required
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Cidade"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                  <select
                    name="estado"
                    required
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800 appearance-none"
                  >
                    <option value="">Selecione o Estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção: Acesso e Contato */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="text-blue-600" size={24} />
                Responsável e Acesso
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    name="nomeContato"
                    required
                    value={formData.nomeContato}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Nome de quem administrará a conta"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    E-mail (Login)
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="seu@email.com.br"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" />
                    Senha
                  </label>
                  <input
                    type="password"
                    name="senha"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Crie uma senha forte"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" />
                    Confirme a Senha
                  </label>
                  <input
                    type="password"
                    name="confirmacaoSenha"
                    required
                    value={formData.confirmacaoSenha}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4 mb-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Eu li e concordo com os{' '}
                <Link to="/termos-de-uso" target="_blank" className="text-blue-600 hover:underline">Termos de Uso</Link>
                {' '}e a{' '}
                <Link to="/politica-de-privacidade" target="_blank" className="text-blue-600 hover:underline">Política de Privacidade</Link>, 
                incluindo a coleta e uso dos meus dados para fins comerciais e conformidade com a LGPD.
              </label>
            </div>
            
            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto px-10 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-blue-600/30'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Concluir Cadastro Empresarial
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-4 text-center max-w-md">
                Ao concluir o cadastro, você concorda com nossos Termos de Serviço e Política de Privacidade.
              </p>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
