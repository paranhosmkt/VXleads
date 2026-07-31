import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Loader2, Share2, Copy, Check } from 'lucide-react';

const AVAILABLE_CHARACTERS = [
  {
    id: 'gui',
    name: 'Gui',
    description: 'Um personagem carismático e animado que vai interagir com seus leads.',
    imageUrl: 'https://i.ibb.co/N6nCj3Fw/6eafasf-2.png'
  }
];

const COLORS = [
  '#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#F46036', '#2E294E', '#1B998B'
];

export default function Roulette() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [character, setCharacter] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<any>(null);

  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', area: '' });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadCode, setLeadCode] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

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
        } else {
          setCharacter(AVAILABLE_CHARACTERS[0]);
        }
        
        const prizesSnap = await getDocs(collection(db, 'companies', uid, 'prizes'));
        const loadedPrizes = prizesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (loadedPrizes.length >= 2) {
          setPrizes(loadedPrizes);
        } else {
          setPrizes([
            { id: '1', nome: '10% de Desconto' },
            { id: '2', nome: 'Brinde Especial' },
            { id: '3', nome: 'Frete Grátis' },
            { id: '4', nome: 'Compre 1 Leve 2' },
          ]);
          if (!character) setCharacter(AVAILABLE_CHARACTERS[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId && companyId !== 'dev') {
      // Accessing via public link
      fetchCompanyData(companyId);
      // Check if the current user is the owner
      onAuthStateChanged(auth, (user) => {
        if (user && user.uid === companyId) {
          setIsOwner(true);
        }
      });
    } else {
      // Developer fallback or legacy /roleta without ID
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsOwner(true);
          await fetchCompanyData(user.uid);
        } else {
          setPrizes([
            { id: '1', nome: '10% de Desconto' },
            { id: '2', nome: 'Brinde Especial' },
            { id: '3', nome: 'Frete Grátis' },
            { id: '4', nome: 'Compre 1 Leve 2' },
          ]);
          setCharacter(AVAILABLE_CHARACTERS[0]);
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [companyId]);

  const spin = () => {
    if (isSpinning || prizes.length === 0) return;
    setIsSpinning(true);
    setSelectedPrize(null);
    setShowForm(false);
    setLeadCode('');
    setLeadForm({ name: '', email: '', phone: '', area: '' });

    const prizeCount = prizes.length;
    const sliceAngle = 360 / prizeCount;
    const extraSpins = 5;
    const randomPrizeIndex = Math.floor(Math.random() * prizeCount);
    
    const angle_K = randomPrizeIndex * sliceAngle + sliceAngle / 2;
    const targetRotationModulo = 360 - angle_K;
    
    let diff = targetRotationModulo - (rotation % 360);
    if (diff <= 0) diff += 360;
    
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6); 
    
    const newRotation = rotation + diff + (360 * extraSpins) + randomOffset;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPrize(prizes[randomPrizeIndex]);
    }, 5000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLead(true);
    
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      const targetUid = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
      
      if (targetUid && selectedPrize) {
        await addDoc(collection(db, 'companies', targetUid, 'leads'), { 
          ...leadForm, 
          prize: selectedPrize.nome, 
          code, 
          createdAt: new Date(),
          status: 'pending' // pending for redemption
        });
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeadCode(code);
      setShowForm(false);
    } catch (err) {
      console.error('Erro ao salvar lead', err);
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
      
      const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + sliceAngle)) / 180);
      const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + sliceAngle)) / 180);
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = 26;
      const textX = 50 + textRadius * Math.cos((Math.PI * textAngle) / 180);
      const textY = 50 + textRadius * Math.sin((Math.PI * textAngle) / 180);

      // Função simples para quebrar texto
      const words = prize.nome.split(' ');
      let lines: string[] = [];
      let currentLine = '';
      
      const maxLen = prizes.length > 5 ? 10 : 12;
      
      words.forEach((word: string) => {
        if ((currentLine + ' ' + word).trim().length > maxLen) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + ' ' + word : word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
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
            {lines.map((line, idx) => {
               // centralizar verticalmente baseado no número de linhas
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
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 relative z-10 w-full md:w-1/2">
        {isOwner && (
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

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-indigo-900 mb-8 md:mb-12 text-center drop-shadow-sm tracking-tight">
          Gire e <span className="text-yellow-500">Ganhe!</span>
        </h1>
        
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] mx-auto">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-30 filter drop-shadow-md">
             <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-yellow-400"></div>
          </div>

          <div 
            className="w-full h-full rounded-full border-8 border-indigo-100 bg-indigo-50 cursor-pointer overflow-hidden p-2"
            onClick={spin}
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
          
          <button 
            onClick={spin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center font-black text-indigo-900 text-xl z-20 hover:scale-110 transition-transform disabled:opacity-80 disabled:hover:scale-100 uppercase tracking-wider"
          >
            Girar
          </button>
        </div>

        {selectedPrize && (
           <div className="mt-12 bg-white p-8 rounded-3xl shadow-2xl animate-fade-in-up text-center max-w-md w-full border-4 border-yellow-400 relative">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 font-black px-6 py-2 rounded-full uppercase text-sm tracking-widest shadow-md">
               Prêmio
             </div>
             
             {!showForm && !leadCode && (
               <>
                 <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-2 mt-4">Parabéns, você ganhou!</h3>
                 <p className="text-3xl font-black text-indigo-700 leading-tight mb-6">{selectedPrize.nome}</p>
                 <button 
                   onClick={() => setShowForm(true)} 
                   className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors w-full shadow-lg hover:shadow-indigo-600/30"
                 >
                   Resgatar Brinde
                 </button>
               </>
             )}

             {showForm && (
               <form onSubmit={handleLeadSubmit} className="text-left mt-4 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                   <input required type="text" value={leadForm.name} onChange={(e) => setLeadForm({...leadForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Seu nome" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                   <input required type="email" value={leadForm.email} onChange={(e) => setLeadForm({...leadForm, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="seu@email.com" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                   <input required type="tel" value={leadForm.phone} onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="(00) 00000-0000" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação</label>
                   <input required type="text" value={leadForm.area} onChange={(e) => setLeadForm({...leadForm, area: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Ex: Marketing, Vendas..." />
                 </div>
                 <button 
                   type="submit"
                   disabled={submittingLead}
                   className="mt-4 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors w-full shadow-lg hover:shadow-indigo-600/30 flex items-center justify-center gap-2"
                 >
                   {submittingLead ? <Loader2 size={20} className="animate-spin" /> : 'Finalizar e Receber Código'}
                 </button>
               </form>
             )}

             {leadCode && (
               <div className="mt-4">
                 <h3 className="text-gray-500 font-medium uppercase tracking-wider mb-2">Seu código de resgate</h3>
                 <div className="bg-gray-100 rounded-2xl p-6 mb-4">
                   <p className="text-5xl font-black text-indigo-700 tracking-widest">{leadCode}</p>
                 </div>
                 <p className="text-sm text-gray-600 mb-6">
                   Enviamos este código para o seu e-mail. 
                   Apresente-o para a promotora no estande para retirar o seu <strong>{selectedPrize.nome}</strong>.
                 </p>
                 <button 
                   onClick={() => {
                     setSelectedPrize(null);
                     setLeadCode('');
                     setLeadForm({ name: '', email: '', phone: '', area: '' });
                   }} 
                   className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors w-full"
                 >
                   Voltar para a Roleta
                 </button>
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
                  Toque na roleta ao lado para testar a sua sorte! 🎁
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
