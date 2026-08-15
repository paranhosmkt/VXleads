import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ChevronLeft, Loader2, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function ConsultantRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmacaoSenha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.nome });

      // Generate a simple referral code based on name and random number
      const codeBase = formData.nome.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const referralCode = `${codeBase}${codeSuffix}`;

      // Save consultant data
      await setDoc(doc(db, 'consultants', user.uid), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        role: 'consultant',
        referralCode: referralCode,
        createdAt: serverTimestamp(),
      });

      alert('Cadastro de consultor realizado com sucesso!');
      navigate('/painel-consultor');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.senha);
          const user = userCredential.user;

          const codeBase = formData.nome.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
          const codeSuffix = Math.floor(1000 + Math.random() * 9000);
          const referralCode = `${codeBase}${codeSuffix}`;

          await setDoc(doc(db, 'consultants', user.uid), {
            nome: formData.nome || user.displayName || 'Consultor',
            email: formData.email,
            telefone: formData.telefone,
            role: 'consultant',
            referralCode: referralCode,
            createdAt: serverTimestamp(),
          }, { merge: true });

          alert('Sua conta existente foi vinculada como Consultor com sucesso!');
          navigate('/painel-consultor');
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/wrong-password' || signInErr.code === 'auth/invalid-credential') {
            setError('Este e-mail já possui cadastro. Insira sua senha correta para ativar a conta de consultor.');
          } else {
            setError('Este e-mail já está em uso.');
          }
        }
      } else {
        console.error('Erro ao cadastrar consultor:', err);
        setError('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft size={20} />
            <span className="font-medium">Voltar para a página inicial</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-900 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-6">
              <Target size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Seja um Consultor VX Leads</h1>
            <p className="text-gray-400">Comece a indicar clientes e ganhe 10% de comissão recorrente.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="João da Silva"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone / WhatsApp</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="tel"
                    name="telefone"
                    required
                    value={formData.telefone}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="password"
                    name="senha"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirme a Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="password"
                    name="confirmacaoSenha"
                    required
                    value={formData.confirmacaoSenha}
                    onChange={handleChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta de Consultor'}
            </button>
            
            <p className="text-center text-gray-500 mt-4 text-sm">
              Já tem uma conta? <Link to="/login" className="text-blue-600 font-medium">Faça login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
