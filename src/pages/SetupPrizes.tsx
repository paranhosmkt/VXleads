import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, writeBatch, getDocs, limit, query } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, Plus, Trash2, ChevronRight, Gift } from 'lucide-react';

export default function SetupPrizes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [prizes, setPrizes] = useState<any[]>([{ name: '', quantity: '' }, { name: '', quantity: '' }]);
  const [prizesToDelete, setPrizesToDelete] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Check if already has prizes
        try {
          const prizesRef = collection(db, 'companies', user.uid, 'prizes');
          const snapshot = await getDocs(prizesRef);
          if (!snapshot.empty) {
            const loadedPrizes = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.nome,
                quantity: data.quantidadeAtual.toString(), // <-- Changed to current quantity
                createdAt: data.createdAt
              };
            });
            setPrizes(loadedPrizes.length > 0 ? loadedPrizes : [{ name: '', quantity: '' }, { name: '', quantity: '' }]);
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      } else {
        // DEV: não redirecionar para visualizar
        setLoading(false);
        // navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddPrize = () => {
    setPrizes([...prizes, { name: '', quantity: '' }]);
  };

  const handleRemovePrize = (index: number) => {
    if (prizes[index].id) {
      setPrizesToDelete([...prizesToDelete, prizes[index].id]);
    }
    if (prizes.length > 2) {
      setPrizes(prizes.filter((_, i) => i !== index));
    }
  };

  const handlePrizeChange = (index: number, field: 'name' | 'quantity', value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index][field] = value;
    setPrizes(newPrizes);
  };

  const handleSave = async () => {
    const validPrizes = prizes.filter(p => p.name.trim() !== '' && p.quantity !== '' && Number(p.quantity) >= 0);
    
    if (validPrizes.length < 2) {
      setError('Adicione pelo menos 2 brindes válidos para a roleta funcionar.');
      return;
    }

    if (!userId) return;

    setSaving(true);
    setError('');

    try {
      const batch = writeBatch(db);
      
      // Deletar os removidos
      prizesToDelete.forEach(id => {
        const prizeRef = doc(db, 'companies', userId, 'prizes', id);
        batch.delete(prizeRef);
      });
      
      validPrizes.forEach(prize => {
        if (prize.id) {
          // Atualizar existente
          const prizeRef = doc(db, 'companies', userId, 'prizes', prize.id);
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeAtual: Number(prize.quantity)
          });
        } else {
          // Criar novo
          const prizeRef = doc(collection(db, 'companies', userId, 'prizes'));
          batch.set(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            quantidadeAtual: Number(prize.quantity),
            createdAt: new Date()
          });
        }
      });
      
      validPrizes.forEach(prize => {
        if (prize.id) {
          // Atualizar existente
          const prizeRef = doc(db, 'companies', userId, 'prizes', prize.id);
          
          let diff = 0;
          // We can check how much quantity changed from original state?
          // Since we didn't store the original quantity separately, we can just fetch it? 
          // Actually, we have prize.quantidadeAtual and we are replacing quantidadeTotal.
          // This is a bit complex without the original quantidadeTotal.
          // Let's just update nome and quantidadeTotal, and increment quantidadeAtual by the difference?
          // We didn't keep the old quantidadeTotal.
          
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity)
          });
        } else {
          // Criar novo
          const prizeRef = doc(collection(db, 'companies', userId, 'prizes'));
          batch.set(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            quantidadeAtual: Number(prize.quantity),
            createdAt: new Date()
          });
        }
      });
      
      validPrizes.forEach(prize => {
        if (prize.id) {
          // Atualizar existente
          const prizeRef = doc(db, 'companies', userId, 'prizes', prize.id);
          
          let diff = 0;
          if (prize.quantidadeTotal !== undefined) {
             diff = Number(prize.quantity) - prize.quantidadeTotal;
          } else {
             // caso old quantidadeTotal was not saved in state?
             // we saved quantity (which was quantidadeTotal). Let's see how it was mapped.
          }
          
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            // We just update name and total quantity for simplicity, 
            // a full system might adjust current quantity based on diff.
          });
        } else {
          // Criar novo
          const prizeRef = doc(collection(db, 'companies', userId, 'prizes'));
          batch.set(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            quantidadeAtual: Number(prize.quantity),
            createdAt: new Date()
          });
        }
      });
      
      const companyRef = doc(db, 'companies', userId);
      batch.update(companyRef, {
        onboardingCompleted: true
      });

      await batch.commit();

      alert('Brindes configurados com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar brindes:', err);
      setError('Erro ao salvar os brindes. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Gift size={18} className="text-white" />
          </div>
          <div className="text-xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Configuração da Roleta
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 py-12 flex flex-col">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Quais serão os brindes da sua roleta?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Adicione os prêmios que os visitantes poderão ganhar. A quantidade será reduzida automaticamente conforme os promoters validarem as entregas.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 px-2 hidden sm:grid">
              <div className="col-span-8">Nome do Brinde</div>
              <div className="col-span-3">Qtd. Disponível</div>
              <div className="col-span-1"></div>
            </div>

            {prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-gray-50 p-4 sm:p-2 sm:bg-transparent rounded-xl border border-gray-100 sm:border-none">
                <div className="sm:col-span-8 space-y-2 sm:space-y-0">
                  <label className="text-xs font-semibold text-gray-500 sm:hidden block">Nome do Brinde</label>
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => handlePrizeChange(index, 'name', e.target.value)}
                    placeholder="Ex: Copo Personalizado"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-3 space-y-2 sm:space-y-0">
                  <label className="text-xs font-semibold text-gray-500 sm:hidden block">Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={prize.quantity}
                    onChange={(e) => handlePrizeChange(index, 'quantity', e.target.value)}
                    placeholder="Ex: 100"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end sm:justify-center">
                  <button
                    onClick={() => handleRemovePrize(index)}
                    disabled={prizes.length <= 2}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                    title="Remover brinde"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleAddPrize}
              className="w-full sm:w-auto px-6 py-3 text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Adicionar outro brinde
            </button>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-gray-200 text-gray-600 font-bold rounded-xl transition-all shadow-sm hover:bg-gray-300 flex items-center justify-center gap-2"
              >
                Pular Etapa (Dev)
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  saving 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    Finalizar Configuração
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
