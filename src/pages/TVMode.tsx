import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Loader2, Settings, Download, Save, X, Eye, EyeOff, Move } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';



const DraggableElement = ({ 
  id, 
  layout,
  setLayout,
  isOwner,
  children,
  className = ""
}: any) => {
  const item = layout[id] || { x: 0, y: 0, visible: true };
  const [pos, setPos] = useState({ x: item.x || 0, y: item.y || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setPos({ x: item.x || 0, y: item.y || 0 });
  }, [item.x, item.y]);

  if (!item.visible && !isOwner) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOwner) return;
    setIsDragging(true);
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;

    const rect = elRef.current?.getBoundingClientRect();
    const parentWidth = window.innerWidth;
    const parentHeight = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;

      if (rect) {
        const minX = pos.x - rect.left;
        const maxX = pos.x + parentWidth - rect.right;
        const minY = pos.y - rect.top;
        const maxY = pos.y + parentHeight - rect.bottom;

        if (newX < minX) newX = minX;
        if (newX > maxX) newX = maxX;
        if (newY < minY) newY = minY;
        if (newY > maxY) newY = maxY;
      }

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      setPos((currentPos) => {
        setLayout((prev: any) => ({
          ...prev,
          [id]: { ...prev[id], x: currentPos.x, y: currentPos.y }
        }));
        return currentPos;
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleVisible = () => {
    setLayout((prev: any) => ({
      ...prev,
      [id]: { ...prev[id], visible: !item.visible }
    }));
  };

  return (
    <div 
      ref={elRef}
      style={{ 
        transform: `translate(${pos.x}px, ${pos.y}px)`, 
        opacity: item.visible ? 1 : 0.4,
        position: 'relative',
        zIndex: isDragging ? 50 : 10,
      }}
      className={`group ${className} ${isOwner ? 'cursor-grab active:cursor-grabbing hover:outline hover:outline-2 hover:outline-blue-400 hover:outline-dashed' : ''}`}
      onMouseDown={handleMouseDown}
    >
      {isOwner && (
        <div 
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50"
        >
          <button 
            onClick={toggleVisible}
            className="bg-gray-800 text-white rounded-full p-1.5 hover:bg-gray-700 shadow-md"
            title={item.visible ? "Ocultar elemento" : "Mostrar elemento"}
          >
            {item.visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      )}
      <div className={!item.visible ? 'grayscale pointer-events-none' : ''} style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        {children}
      </div>
    </div>
  );
};

const DEFAULT_LAYOUT = {
  logo: { x: 0, y: 0, visible: true },
  title: { x: 0, y: 0, visible: true },
  subtitle: { x: 0, y: 0, visible: true },
  badge: { x: 0, y: 0, visible: true },
  qrcode: { x: 0, y: 0, visible: true },
  character: { x: 0, y: 0, visible: true },
};

export default function TVMode() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // States
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  

  // Customization states
  const [title, setTitle] = useState('Bem-vindo(a) ao\nestande da {companyName}');
  const [subtitle, setSubtitle] = useState('Escaneie o QR Code ao lado, jogue e ganhe brindes exclusivos!');
  const [bgColor, setBgColor] = useState('#111827');
  const [bgImageUrl, setBgImageUrl] = useState('');
  
  const [layout, setLayout] = useState<any>(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if owner
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === companyId) {
        setIsOwner(true);
      }
    });

    const fetchCompanyData = async () => {
      if (!companyId) return;
      try {
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        if (companyDoc.exists()) {
          const data = companyDoc.data();
          setCompanyName(data.razaoSocial || 'Empresa');
          setCompanyLogo(data.logoUrl || data.logoDataUrl || null);
          
          if (data.qrSettings) {
             setBgColor(data.qrSettings.bgColor || '#111827');
             setBgImageUrl(data.qrSettings.bgImageUrl || '');
             if (data.qrSettings.layout) {
                setLayout({ ...DEFAULT_LAYOUT, ...data.qrSettings.layout });
             }
          }

          
        }
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();

    return () => unsubscribe();
  }, [companyId]);

  const handleSaveSettings = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        qrSettings: { bgColor, bgImageUrl, layout }
      });
      setShowSettings(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pageRef.current) return;
    try {
      // Temporarily hide the owner UI elements during print if needed
      // but they are out of the pageRef anyway!
      const canvas = await html2canvas(pageRef.current, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save('qrcode-estande.pdf');
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF');
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current, { scale: 3, useCORS: true, allowTaint: true });
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Erro ao baixar QR Code');
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-white" /></div>;
  }

  const rouletteUrl = window.location.origin + `/roleta/${companyId}`;

  return (
    <div className="relative min-h-screen font-sans flex overflow-hidden">
      {isOwner && (
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white font-medium flex items-center gap-2 border border-white/30 transition-colors">
            <Settings size={18} /> Editar Página
          </button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 backdrop-blur-md rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-colors">
            <Download size={18} /> Salvar PDF
          </button>
          {layout !== DEFAULT_LAYOUT && (
            <button onClick={handleSaveSettings} disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 backdrop-blur-md rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-colors">
               {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Salvar Layout
            </button>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {isOwner && showSettings && (
        <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 flex flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-800">Editar Conteúdo</h2>
            <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Título Principal</label>
              <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <p className="text-[10px] text-gray-400 mt-1">Use {'{companyName}'} para inserir o nome da empresa.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Subtítulo</label>
              <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Cor de Fundo</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Imagem de Fundo (URL)</label>
              <input type="text" value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Fonte Principal</label>
              <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">
                <option value="Inter">Inter</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Playfair Display">Playfair Display</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Cor do Texto</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
            <div className="pt-2 text-xs text-gray-500">
              <p>Dica: Você pode clicar e arrastar os elementos na tela para reposicioná-los.</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button onClick={handleSaveSettings} disabled={saving} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Printable Area */}
      <div 
        ref={pageRef}
        className="w-full min-h-screen flex flex-col lg:flex-row relative overflow-x-hidden" 
        style={{ 
          backgroundColor: bgColor,
          backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: fontFamily
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        

        {/* Right Side - QR Code & Character */}
        <div className="w-full min-h-screen flex flex-col items-center justify-center relative z-10 pointer-events-none pb-12 lg:pb-0">
          <div className="flex flex-col items-center group pointer-events-auto relative z-20">
            <DraggableElement id="qrcode" layout={layout} setLayout={setLayout} isOwner={isOwner}>
              <div ref={qrRef} className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col items-center border-4 lg:border-8 border-white/50 backdrop-blur-sm relative z-20 pointer-events-none">
                <div className="absolute -top-5 lg:-top-6 bg-blue-600 text-white font-black px-6 py-1.5 lg:px-8 lg:py-2 rounded-full text-lg lg:text-xl shadow-xl uppercase tracking-widest">
                  Jogue Aqui
                </div>
                <div className="w-[200px] h-[200px] lg:w-[300px] lg:h-[300px]">
                  <QRCodeSVG value={rouletteUrl} width="100%" height="100%" level="H" includeMargin={false} />
                </div>
                <p className="mt-6 lg:mt-8 text-gray-500 font-bold text-lg lg:text-xl uppercase tracking-widest">Aponte a Câmera</p>
              </div>
            </DraggableElement>
            {isOwner && (
              <button onClick={handleDownloadQR} className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2 border border-white/30 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-30 pointer-events-auto">
                <Download size={18} /> Baixar Apenas QR Code
              </button>
            )}
          </div>
            
          
        </div>
      </div>
    </div>
  );
}
