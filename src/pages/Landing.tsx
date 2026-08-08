/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Chatbot from '../components/Chatbot';
import React, { useRef, useEffect, useState } from 'react';
import { Target, XCircle, CheckCircle2, UserX, Database, TrendingDown, Zap, ShieldCheck, ListOrdered, Check, HelpCircle, ChevronDown, Briefcase, DollarSign, MonitorSmartphone, WifiOff, Link, Star, Instagram, Linkedin, Facebook, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Link as RouterLink } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';


const conversionData = [
  { day: 'Dia 0 (Evento)', rate: 95 },
  { day: 'Dia 1', rate: 75 },
  { day: 'Dia 3', rate: 45 },
  { day: 'Dia 5', rate: 25 },
  { day: 'Dia 10', rate: 12 },
  { day: '15+ dias', rate: 5 },
];

function FaqItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <HelpCircle className="text-blue-600 shrink-0" size={24} />
          <h3 className="text-xl font-bold text-gray-900">{question}</h3>
        </div>
        <ChevronDown className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={24} />
      </button>
      <div 
        className={`px-6 md:px-8 pb-6 md:pb-8 pt-0 transition-all duration-300 ${isOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden pb-0'}`}
      >
        <div className="pl-10">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

const BUBBLE_TEXTS = [
  "Ganhei!", "Eu quero!", "Uhull!", "É prêmio!", "Quero cadastrar!",
  "Como funciona?", "Que legal!", "Vou participar!"
];

function Bubble({ initialDelay, zone }: { initialDelay: number; zone: 'topLeft' | 'topRight' | 'midRight'; key?: number }) {
  const [iteration, setIteration] = useState(0);
  const [config, setConfig] = useState({ 
    text: BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)], 
    top: 0, 
    left: 0,
    duration: 4, 
    delay: initialDelay 
  });

  useEffect(() => {
    const text = BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)];
    let top = 0;
    let left = 0;

    // Define fixed safe zones to prevent overlapping and avoid video elements
    if (zone === 'topLeft') {
      top = Math.random() * 10 - 5; // -5% to 5%
      left = Math.random() * 10 - 5; // -5% to 5%
    } else if (zone === 'topRight') {
      top = Math.random() * 10 - 5; // -5% to 5%
      left = Math.random() * 10 + 75; // 75% to 85%
    } else if (zone === 'midRight') {
      top = Math.random() * 10 + 15; // 15% to 25%
      left = Math.random() * 10 + 85; // 85% to 95%
    }
    
    setConfig({
      text,
      top,
      left,
      duration: 3 + Math.random() * 2,
      delay: iteration === 0 ? initialDelay : Math.random() * 1.5
    });
  }, [iteration, initialDelay, zone]);

  if (!config.text) return null;

  return (
    <motion.div
      key={iteration}
      className="absolute bg-white text-blue-600 font-bold px-4 py-2 rounded-2xl shadow-xl shadow-blue-900/10 border border-blue-100 flex items-center justify-center whitespace-nowrap text-sm md:text-base z-20 pointer-events-none"
      style={{ top: `${config.top}%`, left: `${config.left}%` }}
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.1, 1, 0.5],
        y: [10, -5, -15, -20]
      }}
      transition={{
        duration: config.duration,
        ease: "easeInOut",
        delay: config.delay,
        times: [0, 0.1, 0.9, 1]
      }}
      onAnimationComplete={() => setIteration(prev => prev + 1)}
    >
      {config.text}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-blue-100 rotate-45 pointer-events-none"></div>
    </motion.div>
  );
}

function FloatingBubbles() {
  const bubbles: { delay: number; zone: 'topLeft' | 'topRight' | 'midRight' }[] = [
    { delay: 0, zone: 'topLeft' },
    { delay: 1.5, zone: 'topRight' },
    { delay: 3, zone: 'midRight' }
  ];

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {bubbles.map((bubble, i) => (
        <Bubble key={i} initialDelay={bubble.delay} zone={bubble.zone} />
      ))}
    </div>
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = "https://videovxleads.s3.us-east-1.amazonaws.com/Video.mp4";
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawFrame = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        drawFrame();
      }).catch((e) => {
        if (canvas && ctx) {
          canvas.width = 400;
          canvas.height = 400;
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#f8fafc');
          gradient.addColorStop(1, '#e2e8f0');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.font = 'bold 24px system-ui, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText('Simulador de Jogos', canvas.width / 2, canvas.height / 2);
        }
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Target size={22} strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tighter">
            VX<span className="text-blue-600">Leads</span>
          </div>
        </div>
        <RouterLink to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer inline-block">
          Login
        </RouterLink>
      </header>

      {/* Hero Section */}
      <motion.main className="px-6 py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center w-full gap-12 lg:gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1 flex flex-col items-start w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-[1.15] tracking-tight mb-6 text-left">
            Transforme seu estande em uma <span className="text-blue-600">máquina de atrair clientes</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10 text-left leading-relaxed">
            Engaje mais visitantes, capte leads qualificados e multiplique os resultados da sua marca em feiras e eventos. A única plataforma no Brasil que une jogos interativos, gamificação, captura offline e integração nativa com os principais CRMs.
          </p>
          <RouterLink to="/cadastro" className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 cursor-pointer inline-block mb-6">
            Quero revolucionar meu estande
          </RouterLink>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 max-w-xl text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Nota:</strong> O VX Leads pode ser complementar ao qrcode oficial do evento. Nosso foco é atrair visitantes no estande com gamificação, gerenciar brindes e qualificar leads, podendo ser integrado com o sistema da feira quando permitido.
            </p>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-2xl lg:max-w-none flex justify-center">
          <div className="w-full aspect-square bg-transparent relative overflow-visible flex items-center justify-center pointer-events-none">
            <canvas 
              ref={canvasRef}
              className="w-full h-full object-cover"
            ></canvas>
            <FloatingBubbles />
          </div>
        </div>
      </motion.main>

      {/* Logos CRMs */}
      <motion.section className="px-6 py-12 border-t border-gray-100 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Integração nativa com os principais CRMs do mercado</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60">
            <div className="text-2xl font-bold tracking-tight text-gray-900">RD Station</div>
            <div className="text-2xl font-bold tracking-tight text-gray-900">HubSpot</div>
            <div className="text-2xl font-bold tracking-tight text-gray-900">Pipedrive</div>
            <div className="text-2xl font-bold tracking-tight text-gray-900">Salesforce</div>
            <div className="text-2xl font-bold tracking-tight text-gray-900">ActiveCampaign</div>
          </div>
        </div>
      </motion.section>

      {/* Comparison Section */}
      <motion.section className="px-6 py-24 bg-gray-50 border-t border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">O Fim dos Estandes Vazios</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Veja por que a abordagem tradicional não funciona mais e como a gamificação muda o jogo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Problemas */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-red-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <XCircle size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Os problemas de sempre</h3>
              </div>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <UserX size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Público Passivo</h4>
                    <p className="text-gray-600 leading-relaxed">Visitantes ignoram seu estande em pavilhões barulhentos e concorridos.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dados Perdidos</h4>
                    <p className="text-gray-600 leading-relaxed">Brindes são entregues sem cadastro ou com dados falsos e ilegíveis.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Baixa conversão pós-evento</h4>
                    <p className="text-gray-600 leading-relaxed">Muitos cartões de visita e contatos diretos no whatsapp podem se perder e muitas vezes os leads esfriam.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Solução */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">A Solução VX Leads</h3>
              </div>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Atração Ativa</h4>
                    <p className="text-gray-600 leading-relaxed">A gamificação cria filas de espera, curiosidade e engajamento genuíno.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dados Qualificados</h4>
                    <p className="text-gray-600 leading-relaxed">O brinde só é liberado após a validação de um cadastro digital completo.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <ListOrdered size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Leads Organizados</h4>
                    <p className="text-gray-600 leading-relaxed">Planilha com os leads organizados e prontos para o seu CRM e seu time fazer contato e direcionar conteúdos.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

    
      {/* CRM Conversion Curve Section */}
      <motion.section className="px-6 py-24 bg-indigo-900 border-t border-indigo-800 text-white overflow-hidden relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-indigo-900 to-transparent"></div>
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-800/50 text-blue-300 font-semibold text-sm border border-indigo-700 mb-2">
              <TrendingDown size={16} className="mr-2 inline" /> O Tempo é Inimigo da Conversão
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              A Queda de Conversão <br/><span className="text-blue-400">Pós-Evento</span>
            </h2>
            <p className="text-lg md:text-xl text-indigo-200 leading-relaxed max-w-xl">
              Segundo pesquisas de <strong>Inside Sales Benchmarks</strong>, a probabilidade de venda despenca drasticamente com o passar dos dias. No dia do evento, a chance é de <strong>95%</strong>, mas cai para apenas <strong>12% no dia 10</strong>.
            </p>
            <p className="text-lg text-indigo-300 leading-relaxed max-w-xl">
              Com o <strong>VX Leads</strong>, o seu lead entra no dashboard em tempo real. Você pode agir enquanto o lead ainda está aquecido, reduzindo o tempo de resposta e multiplicando as chances de fechamento usando seu próprio CRM.
            </p>
          </div>
          
          <div className="w-full lg:w-[600px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
            <h3 className="text-center font-semibold text-indigo-100 mb-6 text-sm md:text-base uppercase tracking-widest">
              Probabilidade de Venda x Tempo de Follow-up
            </h3>
            <div className="w-full h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4F46E5" opacity={0.3} vertical={false} />
                  <XAxis dataKey="day" stroke="#A5B4FC" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#A5B4FC" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1B4B', borderColor: '#4338CA', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#60A5FA', fontWeight: 'bold' }}
                    labelStyle={{ color: '#A5B4FC', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="rate" name="Conversão" stroke="#60A5FA" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-indigo-400 mt-6 flex items-center justify-center gap-1.5">
              <span>Fonte: Dados baseados no Inside Sales Benchmarks</span>
            </div>
          </div>
        </div>
      </motion.section>

    {/* Why Choose Us Section */}
      <motion.section className="px-6 py-24 bg-white border-t border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Por que escolher a VX Leads?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A única plataforma do mercado desenhada especificamente para resolver os maiores gargalos da captação em feiras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <MonitorSmartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Software 100% SaaS</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa plataforma é independente de hardware. Use seu próprio tablet, smartphone ou alugue um totem com o seu fornecedor de preferência.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <WifiOff size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Funcionamento Offline</h3>
              <p className="text-gray-600 leading-relaxed">
                A internet da feira caiu? Sem problemas. O aplicativo (PWA) salva os leads localmente e sincroniza quando a conexão voltar.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Link size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integração Direta</h3>
              <p className="text-gray-600 leading-relaxed">
                Pare de exportar planilhas. Envie leads em tempo real via Webhook nativo para RD Station, HubSpot, Salesforce e mais.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Jogos Interativos</h3>
              <p className="text-gray-600 leading-relaxed">
                Ative o gatilho da recompensa. Visitantes adoram jogar e ganhar brindes, preenchendo dados reais com muito mais facilidade em roletas, raspadinhas e slot machines.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section className="px-6 py-24 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Como Funciona</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Implementar a gamificação no seu estande é simples e rápido. Veja o passo a passo.
            </p>
          </div>

          <div className="space-y-24">
            {/* Tópico 01 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-2">1</div>
                <h3 className="text-3xl font-bold text-gray-900">Faça seu cadastro</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Cadastrar é fácil, basta clicar no botão cadastrar e preencher o formulário curto com nome da empresa, e-mail, telefone, CNPJ e setor de atuação. Suba sua logomarca e uma breve descrição para que seus leads conheçam melhor a sua marca. Em seguida, confirme seu e-mail, crie uma senha segura e guarde-a com cuidado.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="https://i.ibb.co/bR8FfZKG/1.png" alt="Dashboard de Cadastro" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Tópico 02 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-2">2</div>
                <h3 className="text-3xl font-bold text-gray-900">Selecione seu personagem</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Escolha o avatar que melhor representará sua marca no VX Leads. Ele será o rosto da sua campanha e você pode ficar à vontade para usá-lo nas suas redes sociais para gerar ainda mais engajamento com o seu público.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="https://i.ibb.co/bR5HNqTB/2.png" alt="Seleção de Personagem" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Tópico 03 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-2">3</div>
                <h3 className="text-3xl font-bold text-gray-900">Adicione os brindes</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Digite nos campos os prêmios e brindes que irão compor os seus jogos. Defina a quantidade de cada item em estoque para que você tenha total controle das entregas e não tenha surpresas durante o evento.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="https://i.ibb.co/ccPm3YRt/3.png" alt="Configuração de Brindes" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Tópico 04 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-xl mb-2">4</div>
                <h3 className="text-3xl font-bold text-gray-900">Copie o link gerado</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Esse link é usado para abrir a tela de captura em um tablet ou totem no seu estande, onde os usuários podem ler o QR Code, fazer o cadastro, jogar e ganhar um brinde. Caso a internet tenha oscilações no evento, o jogo continua funcionando normalmente e o lead capturado é enviado automaticamente para o painel da sua empresa no VX Leads assim que a conexão retornar.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="https://i.ibb.co/848TH62h/4.png" alt="Link Gerado no Tablet" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Tópico 05 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 font-bold text-xl mb-2">5</div>
                <h3 className="text-3xl font-bold text-gray-900">Pronto para converter leads em clientes</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A mágica acontece: basta os usuários lerem o QR Code, fazerem o cadastro, assistirem o seu vídeo de pitch, preencherem as perguntas de qualificação e jogarem para ganhar brindes. O seu promoter apenas valida a tela de ganhador e entrega o prêmio. Após o evento, você exporta uma planilha com todos os leads qualificados para o seu CRM.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                  <img src="https://i.ibb.co/7MYLRVv/VX-Leads-Personagens-2.png" alt="CRM e Conversão" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section className="px-6 py-24 bg-gray-50 border-t border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Planos que cabem no seu evento</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha a melhor opção para transformar seu estande em uma máquina de captação de leads.
            </p>
          </div>
          
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-xl border border-gray-200 inline-flex items-center shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${!isAnnual ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Por Evento
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${isAnnual ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Anual (Eventos Ilimitados)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-500 min-h-[48px]">Para pequenos estandes e ativações pontuais.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 4.997" : "R$ 797"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Até {isAnnual ? "2.400" : "100"} leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Dispositivos simultâneos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Exportação CSV</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                Começar com Starter
              </RouterLink>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-blue-600 flex flex-col h-full relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                Mais Popular
              </div>
              <div className="mb-8 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-500 min-h-[48px]">Para feiras regionais e médias empresas.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 8.997" : "R$ 1.297"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Até {isAnnual ? "24.000" : "1.000"} leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">Dispositivos simultâneos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Gestão de Estoque</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Integração com CRM</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Suporte via WhatsApp</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano Pro
              </RouterLink>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 min-h-[48px]">Para grandes marcas e feiras maiores.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 24.997" : "R$ 3.597"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Até {isAnnual ? "240.000" : "10 mil"} Leads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Dispositivos simultâneos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">Integração CRM / Webhook</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Suporte 24/7 no Evento</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano
              </RouterLink>
            </div>

            {/* Personalizado Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-800 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Personalizado</h3>
                <p className="text-gray-400 min-h-[48px]">Projeto sob medida para sua necessidade.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Sob Consulta</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Leads personalizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Dispositivos simultâneos ilimitados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Interface personalizada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Modo Offline</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300 font-medium">Integrações completas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">Suporte 24/7 dedicado</span>
                </li>
              </ul>
              <RouterLink to="/cadastro" className="w-full block text-center py-3.5 px-6 font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors">
                Falar com um Consultor
              </RouterLink>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Consultant Program Section */}
      <motion.section className="px-6 py-24 bg-gray-900 text-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 font-semibold text-sm mb-6">
              <Briefcase size={18} />
              <span>Programa de Parceiros VX Leads</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ajude empresas a vender mais e seja muito bem remunerado</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
              Seja um consultor parceiro e receba comissão recorrente enquanto os seus clientes usarem a plataforma. Leve inovação e construa uma nova fonte de renda.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">Comissões generosas em todos os planos</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">Material de apoio e vendas pronto para usar</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">Painel exclusivo para acompanhar suas indicações</span>
              </li>
            </ul>
            <RouterLink to="/cadastro" className="px-8 py-4 inline-block font-bold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors">
              Quero ser um Consultor
            </RouterLink>
          </div>
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <img src="https://i.ibb.co/q3SrwYM5/6eafasf-3.png" alt="Programa de Parceiros VX Leads" className="w-full max-w-md rounded-2xl shadow-2xl shadow-blue-500/20 object-cover" />
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section className="px-6 py-24 bg-white border-t border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas e entenda exatamente como a plataforma VX Leads funciona.
            </p>
          </div>

          <div className="space-y-6">
            <FaqItem 
              question="O VX Leads é um software ou um totem físico?"
              answer={
                <>
                  O VX Leads é uma <strong>plataforma de software (SaaS)</strong>. Nós fornecemos o sistema web, o painel de controle e os jogos gamificados virtuais. <strong>O totem ou tablet físico não está incluso nos planos</strong>. Nossa plataforma pode ser acessada através de um link em qualquer dispositivo touch screen com navegador de internet (tablets, smartphones, totens ou telas interativas) que você já possua ou alugue com fornecedores locais.
                </>
              }
            />
            
            <FaqItem 
              question="Preciso de internet no evento para funcionar?"
              answer={
                <>
                  Você precisará de internet apenas no momento inicial para carregar o sistema no dispositivo e fazer o login. Depois disso, o sistema funciona em <strong>modo offline</strong> via PWA. Os leads capturados ficarão salvos localmente e serão sincronizados automaticamente com o seu painel de controle assim que o dispositivo for conectado novamente à internet.
                </>
              }
            />

            <FaqItem 
              question="O que significa 'Dispositivos Simultâneos' nos planos?"
              answer={
                <>
                  Agora todos os nossos planos possuem dispositivos simultâneos ilimitados. Isso significa que você pode conectar quantas telas, totens ou celulares de promotores quiser ao mesmo tempo, em qualquer plano. O limite será apenas a cota de leads de cada plano.
                </>
              }
            />

            <FaqItem 
              question="O VX Leads substitui o QR Code do crachá do evento?"
              answer={
                <>
                  <strong>Não.</strong> O QR Code do crachá do evento geralmente é uma ferramenta oficial da feira para troca de contatos e CRM interno. O VX Leads é uma ferramenta <strong>complementar</strong> focada em atrair visitantes para o seu estande através de gamificação, gerenciar a distribuição de brindes e qualificar esses leads. Quando a plataforma do evento permitir, nós podemos conectar o nosso leitor ao sistema deles para facilitar ainda mais o cadastro.
                </>
              }
            />

            <FaqItem 
              question="O VX Leads é um CRM ou se integra com o meu CRM?"
              answer={
                <>
                  <strong>O VX Leads não é um CRM</strong>. Nós somos uma plataforma especializada na <strong>captação e qualificação de leads</strong> durante os eventos. No entanto, você pode exportar facilmente todos os leads qualificados em uma planilha (Excel/CSV) diretamente do seu painel de controle. Essa planilha pode ser importada rapidamente em qualquer CRM do mercado (como RD Station, HubSpot, Pipedrive, Bitrix24, etc) para dar continuidade ao atendimento.
                </>
              }
            />
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <motion.footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Logo/About */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Target className="text-white" size={28} />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">VX Leads</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A plataforma definitiva para captar leads qualificados, engajar visitantes e multiplicar seus resultados em feiras e eventos.
              </p>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Políticas</h4>
              <ul className="space-y-4">
                <li>
                  <RouterLink to="/termos-de-uso" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Termos de Uso
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/politica-de-privacidade" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Política de Privacidade
                  </RouterLink>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contato</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Mail size={20} />
                  <span>contato@vxleads.com.br</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Phone size={20} />
                  <span>+55 (48) 9 8848-8957</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Acompanhe nossas redes sociais</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} VX Leads. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm">
              Design por: <span className="text-white font-medium">Eleve gestão e estratégia</span>
            </p>
          </div>
        </div>
      </motion.footer>
      <Chatbot />
    </div>
  );
}
