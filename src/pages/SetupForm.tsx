import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Plus, Trash2, ArrowLeft, Save, Video, LayoutList } from 'lucide-react';

export default function SetupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [videoUrl, setVideoUrl] = useState('');
  const [formFields, setFormFields] = useState<any[]>([
    { id: 'area', type: 'multiple_choice', label: 'Área de Atuação', required: true, options: [] },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, 'companies', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.formFields && data.formFields.length > 0) {
              setFormFields(data.formFields);
            }
            if (data.videoUrl) {
              setVideoUrl(data.videoUrl);
            }
          }
        } catch (err) {
          console.error("Erro ao carregar dados", err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddField = () => {
    if (formFields.length >= 5) {
      alert('O limite máximo é de 5 perguntas.');
      return;
    }
    const newField = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      label: 'Nova Pergunta',
      required: false,
      options: []
    };
    setFormFields([...formFields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  const handleChangeField = (id: string, key: string, value: any) => {
    setFormFields(formFields.map(f => {
      if (f.id === id) {
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  const handleAddOption = (id: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === id) {
        return { ...f, options: [...(f.options || []), 'Nova Opção'] };
      }
      return f;
    }));
  };

  const handleChangeOption = (fieldId: string, index: number, value: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...f.options];
        newOptions[index] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const handleRemoveOption = (fieldId: string, index: number) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...f.options];
        newOptions.splice(index, 1);
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'companies', userId), {
        videoUrl,
        formFields
      });
      alert('Configurações salvas com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      console.error("Erro ao salvar", err);
      alert('Erro ao salvar as configurações.');
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurar Experiência</h1>
              <p className="text-gray-500">Personalize o formulário e o vídeo do seu estande.</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar
          </button>
        </div>

        {/* Video Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Video size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Vídeo Promocional</h2>
              <p className="text-sm text-gray-500">Adicione um link de vídeo (YouTube ou MP4 direto) para atrair mais clientes.</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link do Vídeo</label>
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou link direto .mp4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <LayoutList size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Formulário Dinâmico</h2>
                <p className="text-sm text-gray-500">Crie os campos que seus leads precisarão preencher.</p>
              </div>
            </div>
            <button 
              onClick={handleAddField}
              disabled={formFields.length >= 5}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Adicionar Campo ({formFields.length}/5)
            </button>
          </div>
          
          <div className="space-y-4">
            {formFields.map((field, index) => (
              <div key={field.id} className="p-5 border border-gray-100 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Pergunta / Label</label>
                    <input 
                      type="text"
                      value={field.label}
                      onChange={(e) => handleChangeField(field.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                    <select 
                      value={field.type}
                      onChange={(e) => handleChangeField(field.id, 'type', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    >
                      <option value="multiple_choice">Múltipla Escolha</option>
                      <option value="dropdown">Lista Suspensa</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-end h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        onChange={(e) => handleChangeField(field.id, 'required', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Obrigatório</span>
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end pt-5">
                    <button 
                      onClick={() => handleRemoveField(field.id)}
                      className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                      title="Remover campo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Options for multiple_choice and dropdown */}
                {(field.type === 'multiple_choice' || field.type === 'dropdown') && (
                  <div className="mt-4 pt-4 border-t border-gray-200 pl-4 border-l-2 border-l-blue-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Opções</label>
                    <div className="space-y-2">
                      {field.options?.map((opt: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={opt}
                            onChange={(e) => handleChangeOption(field.id, optIndex, e.target.value)}
                            className="flex-1 max-w-sm px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md outline-none focus:border-blue-500"
                          />
                          <button 
                            onClick={() => handleRemoveOption(field.id, optIndex)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => handleAddOption(field.id)}
                        className="text-sm text-blue-600 font-medium hover:underline mt-2 inline-block"
                      >
                        + Adicionar Opção
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            ))}
            
            {formFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum campo adicionado. O formulário está vazio.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
