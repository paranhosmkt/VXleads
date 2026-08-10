
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Share2, Copy, Check, Play, ChevronRight, QrCode, X, Gift } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import ReactPlayerRaw from 'react-player';
const ReactPlayer = ReactPlayerRaw as any;
import ScratchCard from '../components/ScratchCard';
import SlotMachine from '../components/SlotMachine';

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
  const [preSelectedPrize, setPreSelectedPrize] = useState<any>(null);

  const [leadForm, setLeadForm] = useState<Record<string, string>>({});
  const [formFields, setFormFields] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gameType, setGameType] = useState('roleta');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [scannedFromBadge, setScannedFromBadge] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
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
          setGameType(data.gameType || 'roleta');

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
    setStep('form');
  };

  const handleVideoEnd = () => {
    setStep('spin');
  };

  const handleQRScan = async (result: string) => {
    let parsedData = { name: '', email: '', phone: '' };
    let isOpenData = false;

    if (result.startsWith('BEGIN:VCARD')) {
      isOpenData = true;
      const lines = result.split(/[\r\n]+/);
      for (const line of lines) {
        if (line.startsWith('FN:')) parsedData.name = line.substring(3).trim();
        else if (line.startsWith('N:') && !parsedData.name) {
          const parts = line.substring(2).split(';');
          parsedData.name = parts.filter(Boolean).join(' ').trim();
        }
        else if (line.startsWith('EMAIL') && line.includes(':')) {
           parsedData.email = line.split(':')[1].trim();
        }
        else if (line.startsWith('TEL') && line.includes(':')) {
           parsedData.phone = line.split(':')[1].replace(/\D/g, '').trim();
        }
      }
    } else if (result.startsWith('MECARD:')) {
      isOpenData = true;
      const parts = result.substring(7).split(';');
      for (const part of parts) {
        if (part.startsWith('N:')) parsedData.name = part.substring(2).trim();
        else if (part.startsWith('EMAIL:')) parsedData.email = part.substring(6).trim();
        else if (part.startsWith('TEL:')) parsedData.phone = part.substring(4).replace(/\D/g, '').trim();
      }
    } else if (result.trim().startsWith('{')) {
      try {
        const data = JSON.parse(result);
        isOpenData = true;
        parsedData.name = data.name || data.nome || data.n || '';
        parsedData.email = data.email || data.e || '';
        parsedData.phone = (data.phone || data.telefone || data.tel || '').toString().replace(/\D/g, '');
      } catch (e) {
        // Not a valid JSON
      }
    } else if (result.includes('@') && !result.startsWith('http') && result.length < 100) {
      isOpenData = true;
      parsedData.email = result.trim();
    }

    if (isOpenData) {
      setLeadForm({
        ...leadForm,
        name: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || ''
      });
      setShowScanner(false);
      setScannedFromBadge(true);
    } else {
      alert('Conecte a API do evento para buscar os dados deste crachá. \n\nCódigo lido: ' + result.substring(0, 30) + (result.length > 30 ? '...' : ''));
      setShowScanner(false);
    }
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
    
    if (prizes.length > 0) {
      const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
      setPreSelectedPrize(prizes[randomPrizeIndex]);
    }
    
    if (videoUrl) {
      setStep('video');
    } else {
      setStep('spin');
    }
  };

    const spin = () => {
    if (isSpinning || !preSelectedPrize) return;
    setIsSpinning(true);
    setSelectedPrize(null);

    if (gameType === 'roleta') {
      const prizeCount = prizes.length;
      const prizeIndex = prizes.findIndex(p => p.id === preSelectedPrize.id);
      const sliceAngle = 360 / prizeCount;
      const extraSpins = 5;
      
      const angle_K = prizeIndex * sliceAngle + sliceAngle / 2;
      const targetRotationModulo = 360 - angle_K;
      
      let diff = targetRotationModulo - (rotation % 360);
      if (diff < 0) {
        diff += 360;
      }
      const finalRotation = rotation + diff + (extraSpins * 360);
      
      setRotation(finalRotation);
      setTimeout(() => finishGame(), 5000);
    } else if (gameType === 'caca_niquel') {
      setTimeout(() => finishGame(), 3000);
    } else {
      finishGame(); // Called directly by ScratchCard
    }
  };

  
  const handleRedeemPrize = async () => {
    if (createdLeadId) {
      try {
        const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
        if (actualCompanyId) {
          await updateDoc(doc(db, 'companies', actualCompanyId, 'leads', createdLeadId), {
            status: 'resgatado'
          });
        }
      } catch(e) {
        console.error("Error updating status", e);
      }
    }
    setSelectedPrize(null);
    setLeadForm({});
    setScannedFromBadge(false);
    setCreatedLeadId(null);
    setStep('intro');
  };

  const finishGame = async () => {
    setSelectedPrize(preSelectedPrize);
    setIsSpinning(false);
    setStep('prize');
    setSubmittingLead(true);
    try {
      const finalLeadData = {
        ...leadForm,
        companyId: companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid,
        prize: preSelectedPrize.nome,
        createdAt: serverTimestamp(),
        origin: window.location.origin,
        status: 'pending'
      };
      const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
      if (actualCompanyId) {
        const leadsRef = collection(db, 'companies', actualCompanyId, 'leads');
        const docRef = await addDoc(leadsRef, finalLeadData);
        setCreatedLeadId(docRef.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
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
          <p className="text-gray-600 mb-6">Este jogo está temporariamente indisponível devido a pendências no plano. Por favor, acesse o painel para regularizar.</p>
          <button 
            onClick={() => window.open('/painel', '_self')}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-700 transition-colors"
          >
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
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 50 50 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');
      
      const textAngle = startAngle + sliceAngle / 2;
      const textX = 50 + 35 * Math.cos((Math.PI * textAngle) / 180);
      const textY = 50 + 35 * Math.sin((Math.PI * textAngle) / 180);
      
      let lines = [prize.nome || 'Aguardando'];
      const maxLen = 14;
      if ((prize.nome || 'Aguardando').length > maxLen) {
        const words = (prize.nome || 'Aguardando').split(' ');
        lines = [];
        let currentLine = '';
        words.forEach((word) => {
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
            fontSize="3" 
            fontWeight="bold" 
            textAnchor="middle" 
            transform={`rotate(${textAngle + 90} ${textX} ${textY})`}
          >
            {lines.map((line, idx) => (
              <tspan key={idx} x={textX} dy={idx === 0 ? `-${(lines.length - 1) * 1.5}` : '3.5'}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r="50" fill="#f8fafc" />
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none' }}>
          {slices}
        </g>
        <circle cx="50" cy="50" r="3" fill="white" className="shadow-sm" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden relative flex-col items-center justify-center">
      {/* The main layout wrapper */}
      
      <div className="flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full max-w-4xl mx-auto min-h-[500px]">
        {/* Intro step */}
        {step === 'intro' && (
          <div className="animate-fade-in-up text-center w-full max-w-xl">
            {companyLogo && (
              <img src={companyLogo} alt={companyName} className="h-16 md:h-20 mx-auto mb-8 object-contain" />
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-indigo-900 mb-6 tracking-tight leading-tight">
              Bem-vindo à Roleta de Prêmios
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10">
              Preencha seus dados para girar a roleta e concorrer a brindes incríveis!
            </p>
            <button 
              onClick={() => setStep('form')}
              className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg md:text-xl rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all w-full md:w-auto"
            >
              Participar Agora
            </button>
          </div>
        )}

        {/* Video step */}
        {step === 'video' && videoUrl && (
          <div className="animate-fade-in-up w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative">
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              playing={true}
              controls={true}
              onEnded={handleVideoEnd}
            />
            <button 
              onClick={handleVideoEnd}
              className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              Pular vídeo
            </button>
          </div>
        )}

        {/* Form step */}
        {step === 'form' && (
          <div className="animate-fade-in-up w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-indigo-900 mb-2">Seus Dados</h2>
              <p className="text-gray-600">Preencha para liberar o jogo</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-indigo-200"
              >
                <QrCode size={20} />
                Ler QR Code do Crachá
              </button>
              
              {!scannedFromBadge ? (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">ou preencha manualmente</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
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
                </>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-700">
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <div>
                    <p className="font-bold">Informações lidas do crachá!</p>
                    {formFields.length > 0 && <p className="text-sm">Por favor, responda as perguntas abaixo para continuar.</p>}
                  </div>
                </div>
              )}
              
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
                  ) : (
                    <input 
                      required={field.required}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={leadForm[field.id] || ''}
                      onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-shadow"
                    />
                  )}
                </div>
              ))}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Confirmar e Jogar'}
              </button>
            </form>
          </div>
        )}

        {(step === 'spin' || step === 'prize') && (
          <div className="animate-fade-in-up w-full flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-900 mb-8 text-center drop-shadow-sm tracking-tight">
              Gire e <span className="text-yellow-500">Ganhe!</span>
            </h1>
            
            {gameType === 'roleta' && (
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-30 filter drop-shadow-md">
                  <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 50L0 15C0 15 5.5 0 20 0C34.5 0 40 15 40 15L20 50Z" fill="#EF4444"/>
                    <path d="M20 40L8 15C8 15 12 5 20 5C28 5 32 15 32 15L20 40Z" fill="#DC2626"/>
                  </svg>
                </div>
                
                <div className="w-full h-full rounded-full border-[12px] md:border-[16px] border-indigo-900 shadow-2xl relative overflow-hidden bg-indigo-900 ring-4 ring-yellow-400">
                  {renderWheel()}
                  
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-indigo-100">
                      <div className="w-10 h-10 md:w-16 md:h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Gift className="text-white w-5 h-5 md:w-8 md:h-8" />
                      </div>
                    </div>
                  </div>
                </div>

                {step === 'spin' && (
                  <button 
                    onClick={spin}
                    disabled={isSpinning}
                    className="absolute -bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-black text-xl md:text-2xl px-10 md:px-14 py-4 md:py-5 rounded-full shadow-[0_8px_0_#b45309,0_15px_20px_rgba(0,0,0,0.4)] active:shadow-[0_0px_0_#b45309,0_0px_0_rgba(0,0,0,0.4)] active:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-30 uppercase tracking-widest border-2 border-yellow-200"
                  >
                    Girar
                  </button>
                )}
              </div>
            )}

            {gameType === 'raspadinha' && (
              <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] mx-auto flex items-center justify-center">
                 {step === 'spin' ? (
                   <ScratchCard prizeText={preSelectedPrize?.nome || 'Prêmio'} onComplete={() => finishGame()} />
                 ) : (
                   <div className="bg-yellow-400 w-full h-full flex items-center justify-center p-6 text-center rounded-2xl shadow-2xl border-8 border-gray-400">
                     <span className="text-indigo-900 font-black text-3xl drop-shadow-sm">{selectedPrize?.nome}</span>
                   </div>
                 )}
              </div>
            )}

            {gameType === 'caca_niquel' && (
              <div className="relative w-full max-w-lg mx-auto bg-red-600 rounded-3xl border-8 border-red-800 p-6 shadow-2xl">
                <SlotMachine isSpinning={isSpinning} prizeText={selectedPrize?.nome} />
                
                {step === 'spin' && (
                  <button 
                    onClick={spin}
                    disabled={isSpinning}
                    className="mt-6 w-full bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black text-2xl py-4 rounded-xl shadow-[0_6px_0_#b45309] active:shadow-[0_0px_0_#b45309] active:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                  >
                    Girar
                  </button>
                )}
              </div>
            )}
            
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
                      onClick={handleRedeemPrize} 
                      className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition-colors w-full flex items-center justify-center"
                    >
                      Resgatar agora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showScanner && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Ler QR Code</h3>
                <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="w-full aspect-square bg-black flex items-center justify-center">
                <Scanner onScan={(result) => result && result[0] && handleQRScan(result[0].rawValue)} />
              </div>
              <div className="p-5 text-center text-sm text-gray-500">
                Aponte a câmera para o QR Code do crachá do visitante
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
