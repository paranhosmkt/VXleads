import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AVAILABLE_CHARACTERS = [
  {
    id: 'gui',
    name: 'Gui',
    description: 'Um personagem carismático e animado que vai interagir com seus leads.',
    imageUrl: 'https://i.ibb.co/N6nCj3Fw/6eafasf-2.png'
  }
];

export default function TVMode() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [planType, setPlanType] = useState('Starter');

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      try {
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (companyDoc.exists()) {
          const data = companyDoc.data();
          setCompanyName(data.razaoSocial || 'Empresa');
          setCompanyLogo(data.logoUrl || null);
          setPlanType(data.planType || 'Starter');
          setVideoUrl(data.videoUrl || null);
          
          if (data.characterId) {
            const char = AVAILABLE_CHARACTERS.find(c => c.id === data.characterId);
            setCharacter(char || AVAILABLE_CHARACTERS[0]);
          } else {
            setCharacter(AVAILABLE_CHARACTERS[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-white" />
      </div>
    );
  }

  const rouletteUrl = window.location.origin + `/roleta/${companyId}`;

  return (
    <div className="min-h-screen bg-gray-900 flex overflow-hidden relative font-sans">
      {/* Video Background (if provided) */}
      {videoUrl && (
        <div className="absolute inset-0 z-0 opacity-40">
          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
            <iframe 
              className="w-full h-full scale-[1.2]"
              src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}&controls=0&showinfo=0&rel=0`} 
              frameBorder="0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              autoPlay 
              muted 
              loop 
              className="w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-0"></div>

      {/* Main Content */}
      <div className="flex-1 flex items-center p-16 z-10">
        <div className="max-w-4xl">
          {companyLogo && (
            <div className="mb-12 bg-white/10 p-6 rounded-3xl backdrop-blur-md inline-block border border-white/20 shadow-2xl">
              <img src={companyLogo} alt={companyName} className="h-32 object-contain filter drop-shadow-lg" />
            </div>
          )}
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight drop-shadow-2xl">
            Bem-vindo(a) ao <br/> estande da <span className="text-blue-400">{companyName}</span>
          </h1>
          
          <p className="text-3xl text-gray-300 max-w-2xl leading-relaxed mb-16 drop-shadow-md">
            {['Enterprise', 'Personalizado'].includes(planType) ? (
              <>
                Escaneie o QR Code ao lado, gire a roleta e <strong className="text-yellow-400">ganhe brindes exclusivos!</strong>
              </>
            ) : (
              <>
                Gire a roleta no totem e <strong className="text-yellow-400">ganhe brindes exclusivos!</strong>
              </>
            )}
          </p>
          
          <div className="flex items-center gap-8 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20 w-max shadow-2xl animate-pulse">
            <div className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-2xl">
              100% Grátis
            </div>
            <p className="text-xl text-white font-medium pr-8">Participe agora mesmo</p>
          </div>
        </div>
      </div>

      {/* Right Side - QR Code & Character */}
      <div className="w-1/3 flex flex-col items-center justify-center relative z-10 bg-gradient-to-l from-blue-900/40 to-transparent">
        {['Enterprise', 'Personalizado'].includes(planType) && (
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center transform hover:scale-105 transition-transform duration-500 border-8 border-white/50 backdrop-blur-sm relative z-20">
            <div className="absolute -top-6 bg-blue-600 text-white font-black px-8 py-2 rounded-full text-xl shadow-xl uppercase tracking-widest">
              Jogue Aqui
            </div>
            <QRCodeSVG value={rouletteUrl} size={300} level="H" includeMargin={false} />
            <p className="mt-8 text-gray-500 font-bold text-xl uppercase tracking-widest">Aponte a Câmera</p>
          </div>
        )}
          
        
        {character && (
          <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-[600px] z-10 opacity-90 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <img src={character.imageUrl} alt="Character" className="w-full h-auto animate-bounce-slow" />
          </div>
        )}
      </div>
    </div>
  );
}
