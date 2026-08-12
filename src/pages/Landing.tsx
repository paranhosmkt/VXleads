/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Chatbot from '../components/Chatbot';
import InteractiveDemo from '../components/InteractiveDemo';
import React, { useRef, useEffect, useState } from 'react';
import { Target, XCircle, CheckCircle2, UserX, Database, TrendingDown, Zap, ShieldCheck, ListOrdered, Check, HelpCircle, ChevronDown, Briefcase, DollarSign, MonitorSmartphone, WifiOff, Link, Star, Instagram, Linkedin, Facebook, Mail, Phone, PlaySquare, Gamepad2, Gift, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    <div className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 md:p-4 flex items-center justify-between gap-3 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="text-blue-600 shrink-0" size={18} />
          <h3 className="text-base font-bold text-gray-900">{question}</h3>
        </div>
        <ChevronDown className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </button>
      <div 
        className={`px-3 md:px-4 pb-3 md:pb-4 pt-0 transition-all duration-300 ${isOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden pb-0'}`}
      >
        <div className="pl-7">
          <p className="text-gray-600 leading-relaxed text-sm">{answer}</p>
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

export default function Landing() {
  const { t } = useTranslation();
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
        <div className="flex items-center gap-4">          <RouterLink to="/login" className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer inline-block">
            {t('nav.login')}
          </RouterLink>
        </div>
      </header>

      {/* Hero Section */}
      <motion.main className="px-6 py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center w-full gap-12 lg:gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex-1 flex flex-col items-start w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 max-w-2xl leading-[1.15] tracking-tight mb-6 text-left">
            {t('hero.title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('hero.title2')}</span> {t('hero.title3')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10 text-left leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <RouterLink to="/cadastro" className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 cursor-pointer inline-block mb-6">
            Quero revolucionar meu estande
          </RouterLink>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 max-w-xl text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: t('landing.integration_note') }} />
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
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">{t('landing.integration_title')}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('landing.problem_solution.title')}</h2>
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
                <h3 className="text-2xl font-bold text-gray-900">{t('landing.problem_solution.problems_title')}</h3>
              </div>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <UserX size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.p1_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.p1_desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <Database size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.p2_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.p2_desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-red-50 text-red-500 p-2 rounded-lg h-fit">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.p3_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.p3_desc')}</p>
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
                <h3 className="text-2xl font-bold text-gray-900">{t('landing.problem_solution.solutions_title')}</h3>
              </div>
              
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.s1_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.s1_desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.s2_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.s2_desc')}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg h-fit">
                    <ListOrdered size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{t('landing.problem_solution.s3_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.problem_solution.s3_desc')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

    
      {/* Interactive Demo Section */}
      <section className="relative z-10 px-6">
        <InteractiveDemo />
      </section>

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
              {t('landing.conversion.title1')} <br/><span className="text-blue-400">{t('landing.conversion.title2')}</span>
            </h2>
            <p className="text-lg md:text-xl text-indigo-200 leading-relaxed max-w-xl">
              <span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p1') }} />
            </p>
            <p className="text-lg text-indigo-300 leading-relaxed max-w-xl">
              <span dangerouslySetInnerHTML={{ __html: t('landing.conversion.p2') }} />
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
              <span>{t('landing.conversion.source')}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('landing.features.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A única plataforma do mercado desenhada especificamente para resolver os maiores gargalos da captação em feiras.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <MonitorSmartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.f1_title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa plataforma é independente de hardware. Use seu próprio tablet ou smartphone com o seu fornecedor de preferência.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <WifiOff size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.f2_title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                A internet da feira caiu? Sem problemas. O aplicativo (PWA) salva os leads localmente e sincroniza quando a conexão voltar.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Link size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.f3_title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                Pare de exportar planilhas. Envie leads em tempo real via Webhook nativo para RD Station, HubSpot, Salesforce e mais.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('landing.features.f4_title')}</h3>
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
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('landing.how_it_works.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Veja como é simples usar o VX Leads no seu estande.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* Expositor */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('landing.how_it_works.exhibitor_title')}</h3>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.e1_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.how_it_works.e1_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.e2_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.how_it_works.e2_desc')}</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.e3_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.how_it_works.e3_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">4</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.e4_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.how_it_works.e4_desc')}</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">5</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.e5_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">{t('landing.how_it_works.e5_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visitante */}
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('landing.how_it_works.visitor_title')}</h3>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 text-green-600 font-bold flex items-center justify-center border border-green-100">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.v1_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      O promoter escaneia o QR Code do crachá do visitante com o tablet de forma rápida e prática, se não for possível conectar com os dados do crachá ele pode preencher manualmente nome, e-mail, whatsapp e área de atuação.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 text-green-600 font-bold flex items-center justify-center border border-green-100">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.v2_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      O visitante assiste a um breve vídeo sobre a sua empresa antes de liberar o jogo, gerando{' '}
                      <span className="relative inline-block group cursor-help text-green-700 font-medium underline decoration-dotted underline-offset-4">
                        brand awareness
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 font-normal text-center leading-relaxed">
                          Consciência de marca: aumenta o reconhecimento e familiaridade do público com a sua empresa.
                          <svg className="absolute top-full left-1/2 -translate-x-1/2 text-gray-900" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                            <path d="M8 8L0 0H16L8 8Z" />
                          </svg>
                        </span>
                      </span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-50 text-green-600 font-bold flex items-center justify-center border border-green-100">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t('landing.how_it_works.v3_title')}</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Ele interage com o jogo, ganha um brinde na hora e sai satisfeito, enquanto você se conecta com ele e aumenta as chances de venda.
                    </p>
                  </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('pricing.title')}</h2>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('pricing.starter.name')}</h3>
                <p className="text-gray-500 min-h-[48px]">{t('pricing.starter.desc')}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 4.997" : "R$ 797"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{isAnnual ? t('pricing.starter.leads_annual') : t('pricing.starter.leads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.unlimited_devices')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.offline')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.csv')}</span>
                </li>
              </ul>
              <RouterLink to={`/cadastro?plan=starter&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-blue-600 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                Começar com Starter
              </RouterLink>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-blue-600 flex flex-col h-full relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                Mais Popular
              </div>
              <div className="mb-8 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('pricing.pro.name')}</h3>
                <p className="text-gray-500 min-h-[48px]">{t('pricing.pro.desc')}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 8.997" : "R$ 1.297"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{isAnnual ? t('pricing.pro.leads_annual') : t('pricing.pro.leads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">{t('pricing.features.unlimited_devices')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.offline')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.stock')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.crm')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_whatsapp')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.course_conversion')}</span>
                </li>
              </ul>
              <RouterLink to={`/cadastro?plan=pro&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano Pro
              </RouterLink>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('pricing.enterprise.name')}</h3>
                <p className="text-gray-500 min-h-[48px]">{t('pricing.enterprise.desc')}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{isAnnual ? "R$ 24.997" : "R$ 3.597"}</span>
                  <span className="text-gray-500 font-medium">{isAnnual ? "/ano" : "/evento"}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{isAnnual ? t('pricing.enterprise.leads_annual') : t('pricing.enterprise.leads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.unlimited_devices')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.offline')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-medium">{t('pricing.features.crm')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('pricing.features.support_247')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.community_group')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.course_conversion')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-600 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700 font-semibold text-indigo-700">{t('pricing.features.script_templates')}</span>
                </li>
              </ul>
              <RouterLink to={`/cadastro?plan=enterprise&cycle=${isAnnual ? "annual" : "event"}`} className="w-full block text-center py-3.5 px-6 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30">
                Assinar Plano Enterprise
              </RouterLink>
            </div>

            {/* Personalizado Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-800 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.custom.name')}</h3>
                <p className="text-gray-400 min-h-[48px]">{t('pricing.custom.desc')}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{t('pricing.custom.price')}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.custom_leads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.unlimited_devices')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.custom_interface')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.offline')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300 font-medium">{t('pricing.features.full_integrations')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-300">{t('pricing.features.support_dedicated')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-yellow-400 font-semibold">{t('pricing.features.community_group')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-yellow-400 font-semibold">{t('pricing.features.course_conversion')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-yellow-400 font-semibold">{t('pricing.features.script_templates')}</span>
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
              <span>{t('landing.partners.tag')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t('landing.partners.title')}</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl">
              Seja um consultor parceiro e receba comissão recorrente enquanto os seus clientes usarem a plataforma. Leve inovação e construa uma nova fonte de renda.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">{t('landing.partners.b1')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">{t('landing.partners.b2')}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full text-blue-400"><Check size={16} strokeWidth={3} /></div>
                <span className="text-gray-300">{t('landing.partners.b3')}</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">{t('landing.faq.title')}</h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas e entenda exatamente como a plataforma VX Leads funciona.
            </p>
          </div>

          <div className="space-y-3">
                        <FaqItem 
              question={t('landing.faq.q1')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a1') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q2')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a2') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q3')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a3') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q4')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a4') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q5')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a5') }} />}
            />
            <FaqItem 
              question={t('landing.faq.q6')}
              answer={<span dangerouslySetInnerHTML={{ __html: t('landing.faq.a6') }} />}
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
              <h4 className="text-white font-bold text-lg mb-6">{t('footer.legal')}</h4>
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
              <h4 className="text-white font-bold text-lg mb-6">{t('footer.contact') || 'Contato'}</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Mail size={20} />
                  <span>{t('footer.contact_email') || 'contato@vxleads.com.br'}</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Phone size={20} />
                  <span>+55 (48) 9 8848-8957</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">{t('footer.social') || 'Siga nossas redes sociais'}</h4>
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
              {t('footer.design_by')} <span className="text-white font-medium">{t('footer.design_agency')}</span>
            </p>
          </div>
        </div>
      </motion.footer>
      <Chatbot />
    </div>
  );
}
