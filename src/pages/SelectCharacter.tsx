import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, CheckCircle2, ChevronRight, User, Target } from 'lucide-react';

const AVAILABLE_CHARACTERS = [
  {
    id: 'gui',
    name: 'Gui',
    description: 'Um personagem carismático e animado que vai interagir com seus leads.',
    imageUrl: 'https://i.ibb.co/N6nCj3Fw/6eafasf-2.png'
  }
];

export default function SelectCharacter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [selectedCharacter, setSelectedCharacter] = useState<string>('gui'); // Já deixa o 'gui' pré-selecionado pois é o único
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Verifica se já tem personagem selecionado
        try {
          const docRef = doc(db, 'companies', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().personagemId) {
            setSelectedCharacter(docSnap.data().personagemId);
            setCustomName(docSnap.data().nomePersona || '');
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Erro ao buscar dados:", err);
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

  const handleSave = async () => {
    if (!customName.trim()) {
      setError('Por favor, dê um nome para o seu personagem.');
      return;
    }

    if (!userId) return;

    setSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'companies', userId);
      await updateDoc(doc(db, 'companies', userId), {
        personagemId: selectedCharacter,
        nomePersona: customName.trim(),
        // não marcamos setupPrizes como concluído aqui, isso é na próxima tela
      });

      // Se for apenas edição e já passou pelo onboarding, não força ir pra brindes
      // Mas para manter simples, vamos sempre mandar para configurar-brindes
      navigate('/configurar-brindes');
    } catch (err) {
      console.error('Erro ao salvar personagem:', err);
      setError('Erro ao salvar as configurações. Tente novamente.');
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
      {/* Topbar simples */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Passo Final do Cadastro
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha quem vai representar sua marca
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Este personagem aparecerá nos jogos interagindo com seus visitantes e comemorando as vitórias. Dê um nome que combine com a sua empresa!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Visualização e Seleção de Personagens */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Selecione o seu personagem:</h2>
              
              {/* Personagem em Destaque */}
              <div className="relative w-full aspect-square max-w-sm mx-auto bg-gray-100 rounded-3xl overflow-hidden shadow-inner border border-gray-200">
                {AVAILABLE_CHARACTERS.map(char => (
                  <img 
                    key={char.id}
                    src={char.imageUrl} 
                    alt={char.name} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${selectedCharacter === char.id ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                  />
                ))}
              </div>

              <div className="text-center">
                 <h3 className="text-2xl font-bold text-gray-900">{AVAILABLE_CHARACTERS.find(c => c.id === selectedCharacter)?.name}</h3>
                 <p className="text-base text-gray-500 mt-2">{AVAILABLE_CHARACTERS.find(c => c.id === selectedCharacter)?.description}</p>
              </div>

              {/* Carrossel de Opções */}
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x justify-center">
                {AVAILABLE_CHARACTERS.map(char => (
                  <div 
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 transition-all p-2 flex-shrink-0 snap-center ${
                      selectedCharacter === char.id 
                        ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105' 
                        : 'border-gray-200 bg-white hover:border-blue-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
                
                <div className="w-24 flex-shrink-0 flex items-center justify-center p-2 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 opacity-60">
                  <span className="text-xs text-center text-gray-500 font-medium leading-tight">Mais opções<br/>em breve...</span>
                </div>
              </div>
            </div>

            {/* Customização do Personagem */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personalize:</h2>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qual será o nome dele no seu estande?
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Sorteador, Assistente VX, etc."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !customName.trim()}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  saving || !customName.trim() 
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
                    Salvar e Ir para o Painel
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
