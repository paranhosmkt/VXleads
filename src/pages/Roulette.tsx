
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Share2, Copy, Check, Play, ChevronRight } from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'];

const AVAILABLE_CHARACTERS = [
  { id: 'gui', name: 'Gui', imageUrl: 'https://i.ibb.co/N6nCj3Fw/6eafasf-2.png' },
  { id: 'ana', name: 'Ana', imageUrl: 'https://i.ibb.co/rwx062S1/Mascote-2-2.png' },
  { id: 'carlos', name: 'Carlos', imageUrl: 'https://i.ibb.co/n8v2wPnn/Mascote-3-2.png' },
  { id: 'bia', name: 'Bia', imageUrl: 'https://i.ibb.co/ZzkZ26hM/Mascote-4-2.png' }
];

type Step = 'intro' | 'video' | 'form' | 'spin' | 'prize';

export default function Roulette() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [character, setCharacter] = useState<any>(null);
  
  const [step, setStep] = useState<Step>('intro');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);

  const [leadForm, setLeadForm] = useState<Record<string, string>>({});
  const [formFields, setFormFields] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [submittingLead, setSubmittingLead] = useState(false);
  
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [planType, setPlanType] = useState('Starter');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialForm: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      initialForm[key] = value;
    }
    setLeadForm(initialForm);
  }, []);

  useEffect(() => {
    const fetchCompanyData = async (uid: string) => {
      try {
        const companyDoc = await getDoc(doc(db, 'companies', uid));
        if (companyDoc.exists()) {
          const data = companyDoc.data();
          
          if (data.planStatus === 'inactive') {
            setIsInactive(true);
            setLoading(false);
            return;
          }
          
          const charId = data.personagemId || 'gui';
          const char = AVAILABLE_CHARACTERS.find(c => c.id === charId) || AVAILABLE_CHARACTERS[0];
          setCharacter(char);
          setCompanyLogo(data.logoDataUrl || null);
          setCompanyName(data.razaoSocial || '');
          setPlanType(data.planType || 'Starter');
          setVideoUrl(data.videoUrl || null);

          if (data.formFields && data.formFields.length > 0) {
            setFormFields(data.formFields);
          } else {
            setFormFields([]);
          }
        } else {
          setCharacter(AVAILABLE_CHARACTERS[0]);
          setFormFields([]);
        }
        
        const prizesSnap = await getDocs(collection(db, 'companies', uid, 'prizes'));
        const loadedPrizes = prizesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (loadedPrizes.length >= 2) {
          setPrizes(loadedPrizes);
        } else {
          setPrizes([
            { id: '1', nome: 'Aguardando selecionar' },
            { id: '2', nome: 'Aguardando selecionar' },
            { id: '3', nome: 'Aguardando selecionar' },
            { id: '4', nome: 'Aguardando selecionar' },
          ]);
          // removed
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && companyId !== 'dev') {
      fetchCompanyData(companyId);
      onAuthStateChanged(auth, (user) => {
        if (user && user.uid === companyId) {
          setIsOwner(true);
        }
      });
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsOwner(true);
          await fetchCompanyData(user.uid);
        } else {
          setPrizes([
            { id: '1', nome: 'Aguardando selecionar' },
            { id: '2', nome: 'Aguardando selecionar' },
            { id: '3', nome: 'Aguardando selecionar' },
            { id: '4', nome: 'Aguardando selecionar' },
          ]);
          setCharacter(AVAILABLE_CHARACTERS[0]);
          setFormFields([]);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [companyId]);

  const handleStart = () => {
    if (videoUrl) {
      setStep('video');
    } else {
      setStep('form');
    }
  };

  const handleVideoEnd = () => {
    setStep('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadForm.email) {
      setLoading(true);
      try {
        const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
        if (actualCompanyId) {
          const q = query(collection(db, 'companies', actualCompanyId, 'leads'), where('email', '==', leadForm.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            alert('Este brinde já foi resgatado para o e-mail informado.');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    setStep('spin');
  };

  const spin = () => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    const prizeCount = prizes.length;
    const sliceAngle = 360 / prizeCount;
    const extraSpins = 5;
    const randomPrizeIndex = Math.floor(Math.random() * prizeCount);
    
    const angle_K = randomPrizeIndex * sliceAngle + sliceAngle / 2;
    const targetRotationModulo = 360 - angle_K;
    
    let diff = targetRotationModulo - (rotation % 360);
    if (diff < 0) {
      diff += 360;
    }
    const finalRotation = rotation + diff + (extraSpins * 360);
    
    setRotation(finalRotation);

    setTimeout(async () => {
      const finalPrize = prizes[randomPrizeIndex];
      setSelectedPrize(finalPrize);
      setIsSpinning(false);
      setStep('prize');

      setSubmittingLead(true);
      try {
        const finalLeadData = {
          ...leadForm,
          companyId: companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid,
          prize: finalPrize.nome,
          createdAt: serverTimestamp(),
          origin: window.location.origin
        };
        const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
        if (actualCompanyId) {
          const leadsRef = collection(db, 'companies', actualCompanyId, 'leads');
          await addDoc(leadsRef, finalLeadData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSubmittingLead(false);
      }
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isInactive) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano Inativo</h2>
          <p className="text-gray-600 mb-6">Esta roleta está temporariamente indisponível devido a pendências no plano. Por favor, acesse o painel para regularizar.</p>
          <button onClick={() => navigate('/login')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Acessar Painel
          </button>
        </div>
      </div>
    );
  }

  const renderWheel = () => {
    if (prizes.length === 0) return null;
    
    const slices = prizes.map((prize, i) => {
      const sliceAngle = 360 / prizes.length;
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      const textAngle = startAngle + sliceAngle / 2;
      const textX = 50 + 35 * Math.cos((Math.PI * textAngle) / 180);
      const textY = 50 + 35 * Math.sin((Math.PI * textAngle) / 180);
      
      let lines = [prize.nome || 'Aguardando'];
      const maxLen = 14;
      if ((prize.nome || 'Aguardando').length > maxLen) {
        const words = (prize.nome || 'Aguardando').split(' ');
        lines = [];
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + ' ' + word).length <= maxLen) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
      }
      
      if (lines.length > 3) {
        lines = lines.slice(0, 3);
        lines[2] = lines[2].substring(0, maxLen - 2) + '...';
      }

      return (
        <g key={prize.id || i}>
          <path d={pathData} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="0.5" />
          <text 
            x={textX} 
            y={textY} 
            fill="white" 
            fontSize="4" 
            fontWeight="bold"
            textAnchor="middle" 
            alignmentBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
            style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {lines.map((line: string, idx: number) => {
               const yOffset = (idx - (lines.length - 1) / 2) * 1.2;
               return (
                 <tspan key={idx} x={textX} dy={idx === 0 ? `${yOffset}em` : '1.2em'}>
                   {line}
                 </tspan>
               );
            })}
          </text>
        </g>
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl" style={{ transform: 'rotate(-90deg)' }}>
        {slices}
        <circle cx="50" cy="50" r="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#4B5563" />
      </svg>
    );
  };

  const copyShareLink = () => {
    const link = window.location.origin + `/roleta/${companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden relative">
      
      {step === 'video' && videoUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe 
              className="w-full h-full max-w-5xl aspect-video"
              src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&controls=0&showinfo=0&rel=0`} 
              frameBorder="0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              autoPlay 
              className="w-full h-full max-w-5xl object-contain"
              onEnded={handleVideoEnd}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          
          <button 
            onClick={handleVideoEnd}
            className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full backdrop-blur-md transition-colors font-semibold"
          >
            Pular Vídeo
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full md:w-1/2 min-h-[500px]">
        {isOwner && planType !== 'Starter' && (
          <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Share2 size={18} />
              <span className="font-semibold text-sm">Compartilhar Roleta</span>
            </button>
            {showShare && (
              <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 animate-fade-in-up w-72">
                <p className="text-xs text-gray-500 mb-2 font-medium">Link do Totem (Dispositivos ilimitados no plano atual)</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.origin + `/roleta/${companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid}`}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none"
                  />
                  <button 
                    onClick={copyShareLink}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {companyLogo && (
          <div className="mb-6 h-20 w-auto flex items-center justify-center">
            <img src={companyLogo} alt={companyName} className="max-h-full max-w-full object-contain filter drop-shadow-sm" />
          </div>
        )}

        {step === 'intro' && (
          <div className="text-center animate-fade-in-up max-w-md w-full">
            <h1 className="text-4xl md:text-5xl font-black text-indigo-900 mb-6 tracking-tight">
              Bem-vindo(a)!
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Participe da nossa experiência interativa e concorra a brindes exclusivos.
            </p>
            <button 
              onClick={handleStart}
              className="w-full bg-yellow-400 text-indigo-900 text-xl font-black uppercase tracking-wider py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              <Play size={24} fill="currentColor" />
              Começar
            </button>
          </div>
        )}

        {step === 'form' && (
          <div className="w-full max-w-md animate-fade-in-up">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Falta pouco!</h2>
            <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                <input required type="text" value={leadForm.name || ''} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail Profissional</label>
                <input required type="email" value={leadForm.email || ''} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
                <input required type="tel" value={leadForm.phone || ''} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow" />
              </div>
              {formFields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                  {field.type === 'long_text' ? (
                    <textarea 
                      required={field.required}
                      value={leadForm[field.id] || ''}
                      onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                      rows={3}
                    />
                  ) : field.type === 'multiple_choice' ? (
                    <div className="space-y-3">
                      {field.options?.map((opt: string, i: number) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <input 
                            type="radio" 
                            name={field.id}
                            value={opt}
                            required={field.required}
                            checked={leadForm[field.id] === opt}
                            onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                          />
                          <span className="text-gray-700 font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'dropdown' ? (
                    <select
                      required={field.required}
                      value={leadForm[field.id] || ''}
                      onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none"
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map((opt: string, i: number) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      required={field.required}
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      value={leadForm[field.id] || ''}
                      onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                    />
                  )}
                </div>
              ))}
              <button 
                type="submit"
                className="mt-6 w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Girar a Roleta
                <ChevronRight size={20} />
              </button>
            </form>
          </div>
        )}

        {(step === 'spin' || step === 'prize') && (
          <div className="animate-fade-in-up w-full flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-900 mb-8 text-center drop-shadow-sm tracking-tight">
              Gire e <span className="text-yellow-500">Ganhe!</span>
            </h1>
            
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] mx-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-30 filter drop-shadow-md"> 
                 <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400"></div>
              </div>
              <div 
                className="w-full h-full rounded-full border-8 border-indigo-100 bg-indigo-50 cursor-pointer overflow-hidden p-2"
                onClick={step === 'spin' ? spin : undefined}
              >
                <div 
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl relative"
                  style={{ 
                    transform: `rotate(${rotation}deg)`, 
                    transition: 'transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)' 
                  }}
                >
                  {renderWheel()}
                </div>
              </div>
              
              {step === 'spin' && (
                <button 
                  onClick={spin}
                  disabled={isSpinning}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center font-black text-indigo-900 text-xl z-20 hover:scale-110 transition-transform disabled:opacity-80 disabled:hover:scale-100 uppercase tracking-wider"
                >
                  Girar
                </button>
              )}
            </div>
            
            {step === 'prize' && selectedPrize && (
              <div className="mt-12 bg-white p-8 rounded-3xl shadow-2xl animate-fade-in-up text-center max-w-md w-full border-4 border-yellow-400 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 font-black px-6 py-2 rounded-full uppercase text-sm tracking-widest shadow-md">
                  Prêmio
                </div>
                
                <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-2 mt-4">Parabéns, você ganhou!</h3>
                <p className="text-3xl font-black text-indigo-700 leading-tight mb-6">{selectedPrize.nome}</p>
                
                {submittingLead ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
                    <p className="text-gray-500 font-medium">Registrando prêmio...</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-6 font-medium">
                      Prêmio registrado com sucesso no sistema.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedPrize(null);
                        setLeadForm({});
                        setStep('intro');
                      }} 
                      className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition-colors w-full flex items-center justify-center"
                    >
                      Retirar brinde
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center items-end bg-indigo-50 relative z-0 mt-8 md:mt-0 p-4 md:p-8 w-full md:w-1/2 min-h-[300px]">
        {character && (
          <div className="relative max-w-2xl w-full flex justify-center pb-4 md:pb-0">
             <div className="absolute -top-28 md:-top-40 left-1/2 -translate-x-[80%] md:-translate-x-[70%] bg-white p-5 rounded-3xl rounded-br-none shadow-xl max-w-[220px] md:max-w-[280px] z-20 transform -rotate-2 animate-bounce-slow">
               <p className="text-gray-800 font-bold text-base md:text-lg leading-snug">
                 {step === 'intro' ? 'Pronto para uma experiência incrível?' :
                  step === 'video' ? 'Assista ao nosso vídeo rapidinho!' :
                  step === 'form' ? 'Preencha os dados para girar a roleta!' :
                  'Toque na roleta ao lado para testar a sua sorte! 🎁'}
               </p>
               <div className="absolute -bottom-4 right-12 w-8 h-8 bg-white transform rotate-45"></div>
             </div>
             <img src={character.imageUrl} alt={character.name} className="w-[90%] md:w-[80%] max-w-md mx-auto h-auto object-contain relative z-10 drop-shadow-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
