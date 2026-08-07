import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Termos de Uso e Consumo</h1>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p className="font-medium text-gray-900">
            Bem-vindo ao VX Leads. Ao utilizar nossa plataforma, você concorda com os seguintes termos:
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Do Objeto</h2>
          <p>
            O VX Leads é um software como serviço (SaaS) que fornece uma plataforma web, painel de controle e jogos interativos para captação de leads. <strong>Nenhum hardware (totens, tablets) está incluso</strong> na prestação do serviço.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Uso e Planos</h2>
          <p>
            Os planos (Starter, Pro, Enterprise) dão direito ao uso da plataforma de acordo com seus limites (quantidade de leads da cota escolhida). A assinatura pode ser feita na modalidade "Por Evento" ou "Anual".
          </p>
          
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Dispositivos Simultâneos</h2>
          <p>
            Atualmente, todos os planos permitem o uso de dispositivos simultâneos ilimitados, de modo que você pode acessar o mesmo link de captação em quantas telas ou celulares quiser ao mesmo tempo.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Cancelamento e Reembolso</h2>
          <p>
            Para pagamentos online, o cliente tem direito de arrependimento no prazo de 7 dias a contar da data de contratação, com reembolso integral. Todavia, caso a contratação ocorra num prazo inferior a 7 dias do evento e o serviço seja utilizado e finalizado no evento, a prestação do serviço é considerada consumada, e o cancelamento imotivado após a entrega da solução (planilha de leads gerada e leads captados) não gerará direito a estorno por configuração de má-fé e uso integral da ferramenta disponibilizada.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Responsabilidades</h2>
          <p>
            A plataforma exige conexão com internet nos dispositivos de exibição (modo online) ou funcionamento sem sincronia (modo offline). Não nos responsabilizamos por falhas de infraestrutura local, falta de energia no evento ou configurações equivocadas feitas pelo usuário.
          </p>
          
          <p className="mt-12 text-sm text-gray-500">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
