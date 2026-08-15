import React, { useState } from 'react';
import { Mail, ChevronLeft, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao enviar email de recuperação:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Não encontramos nenhuma conta com este e-mail.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError('Ocorreu um erro ao enviar o link. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit">
            <ChevronLeft size={20} />
            <span className="font-medium">Voltar para o login</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
            <p className="text-gray-500 mb-6">
              Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
            </p>

            {success ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">E-mail enviado!</h3>
                  <p className="text-sm">Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="seuemail@exemplo.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Enviar link de recuperação'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
