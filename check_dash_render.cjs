const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes('if (planStatus === \'pending\')')) {
  const returnContentRegex = /return \(\n\s*<div className="min-h-screen bg-gray-50">/g;
  code = code.replace(returnContentRegex, `if (planStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Target className="w-16 h-16 text-blue-600 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Pendente</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Seu plano ainda não está ativo. Por favor, conclua o pagamento para liberar as funcionalidades do painel.
        </p>
        <button
          onClick={() => navigate('/cadastro')}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Voltar para Planos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">`);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
}
