import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-xl">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Voltar para a página inicial
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Política de Privacidade</h1>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p className="font-medium text-gray-900">
            A sua privacidade é importante para nós. Esta política explica como o VX Leads coleta e trata seus dados.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Coleta de Dados</h2>
          <p>
            Coletamos informações inseridas por você na plataforma, incluindo dados da empresa e dos visitantes do estande que participam da roleta.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Finalidade Comercial</h2>
          <p>
            Os dados coletados no estande e no painel administrativo são armazenados para <strong>fins comerciais</strong>. As empresas que utilizam a plataforma terão acesso aos dados inseridos pelos visitantes com o propósito de ações de marketing e prospecção.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Proteção de Dados (LGPD)</h2>
          <p>
            Temos o compromisso de proteger os dados seguindo as diretrizes da <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Os dados e informações sensíveis não serão vendidos, transferidos ou compartilhados com terceiros não autorizados pela empresa organizadora do estande.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Armazenamento</h2>
          <p>
            Os dados são armazenados em servidores seguros, com criptografia e controle de acesso, garantindo a disponibilidade e integridade das informações até o fim do seu evento.
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Direitos do Titular</h2>
          <p>
            Conforme a LGPD, o titular dos dados possui o direito de solicitar a exclusão de suas informações da nossa base a qualquer momento, o que será repassado ao cliente administrador da roleta para que efetue o bloqueio comercial.
          </p>
          
          <p className="mt-12 text-sm text-gray-500">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
