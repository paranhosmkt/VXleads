import React, { useState } from 'react';
import { Target, Mail, Lock, ChevronLeft, Loader2, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<'company' | 'consultant'>('company');
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;
      
      if (loginType === 'consultant') {
        const consultantRef = doc(db, 'consultants', user.uid);
        const consultantSnap = await getDoc(consultantRef);

        if (consultantSnap.exists()) {
          navigate('/painel-consultor');
          return;
        } else {
          setError('Nenhuma conta de consultor encontrada com este e-mail.');
          // firebase signout could be called here to prevent floating auth state, but it's fine
          return;
        }
      } else {
        const companyRef = doc(db, 'companies', user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const data = companySnap.data();
          const onboardingCompleted = data.onboardingCompleted !== false;

          if (!onboardingCompleted) {
            navigate('/configurar-experiencia');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError('Nenhuma conta de empresa encontrada com este e-mail.');
          return;
        }
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(t('login.error_invalid'));
      } else {
        setError('Ocorreu um erro ao realizar o login. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft size={20} />
            <span className="font-medium">{t('login.back')}</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 text-center bg-gray-900 border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 mb-4">
              <Target size={32} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{loginType === 'company' ? t('login.title') : 'Portal do Consultor'}</h1>
            <p className="text-gray-400">{loginType === 'company' ? t('login.subtitle') : 'Acesse seu painel de parcerias e acompanhe seus ganhos'}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginType('company')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  loginType === 'company'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sou Empresa
              </button>
              <button
                type="button"
                onClick={() => setLoginType('consultant')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  loginType === 'consultant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sou Consultor
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {loginType === 'company' ? 'E-mail Corporativo' : 'E-mail do Consultor'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  placeholder={t('login.email_ph')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <Link to="/recuperar-senha" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="senha"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                loading ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Ainda não tem uma conta?{' '}
                <Link to={loginType === 'company' ? "/cadastro" : "/cadastro-consultor"} className="text-blue-600 font-bold hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
