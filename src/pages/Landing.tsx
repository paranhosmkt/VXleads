/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import heroFallbackImg from '../assets/hero-fallback.png';
import InteractiveDemo from '../components/InteractiveDemo';
import { Target, XCircle, CheckCircle2, UserX, Database, TrendingDown, Zap, ShieldCheck, ListOrdered, Check, HelpCircle, ChevronDown, MonitorSmartphone, WifiOff, Link, Star, Instagram, Linkedin, Facebook, Mail, Phone, Gift, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const WHATSAPP_URL = "https://wa.me/5548999542785?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20VX%20Leads%20para%20o%20meu%20estande.";
const WHATSAPP_PHONE = "(48) 9 9954-2785";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy or restricted
      });
    }

    const handleOffline = () => setVideoFailed(true);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
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
        <div className="flex items-center gap-4">
          <a 
            href={WHATSAPP_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Entrar em contato</span>
          </a>
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
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8 text-left leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <a 
            href={WHATSAPP_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/30 cursor-pointer mb-6"
          >
            <MessageCircle size={22} />
            <span>Entrar em contato</span>
          </a>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 max-w-xl text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: t('landing.integration_note') }} />
            </p>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-2xl lg:max-w-none flex justify-center">
          <div className="w-full aspect-square bg-transparent relative overflow-visible flex items-center justify-center">
            <div className="w-full h-full relative flex items-center justify-center">
              {videoFailed ? (
                <img 
                  src={heroFallbackImg} 
                  alt="Simulador de Roleta VX Leads" 
                  className="w-full h-full object-contain select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video 
                  ref={videoRef}
                  src="https://videovxleads.s3.us-east-1.amazonaws.com/Video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setVideoFailed(true)}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
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

    
      {/* Gamification Mechanism & Benefits for the Stand */}
      <motion.section className="px-6 py-24 bg-white border-t border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-4 border border-blue-100">
              <Sparkles size={16} />
              <span>Metodologia Comprovada em Feiras</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Como Funciona a Gamificação no seu Estande
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Transforme o fluxo de pessoas do pavilhão em oportunidades reais de vendas através de uma experiência interativa, rápida e irresistível.
            </p>
          </div>

          {/* 4-Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="bg-gradient-to-b from-blue-50/60 to-white p-8 rounded-2xl border border-blue-100 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Atração no Corredor</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                O visual dinâmico de jogos (como roleta de prêmios ou raspadinha) em tablets e totens chama a atenção imediatamente e cria filas naturais no seu estande.
              </p>
            </div>

            <div className="bg-gradient-to-b from-blue-50/60 to-white p-8 rounded-2xl border border-blue-100 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cadastro Rápido</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Para liberar a jogada, o visitante insere dados essenciais (Nome, WhatsApp, E-mail e área de atuação) em menos de 20 segundos diretamente na tela.
              </p>
            </div>

            <div className="bg-gradient-to-b from-blue-50/60 to-white p-8 rounded-2xl border border-blue-100 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conexão de Marca</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Antes do sorteio, o participante assiste a um breve vídeo institucional ou responde a perguntas de qualificação para a sua equipe comercial.
              </p>
            </div>

            <div className="bg-gradient-to-b from-blue-50/60 to-white p-8 rounded-2xl border border-blue-100 relative shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recompensa & CRM</h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                O visitante ganha o prêmio ou brinde na hora e os dados caem instantaneamente no seu CRM para contato rápido e follow-up imediato.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-14 text-white relative overflow-hidden mb-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-3xl mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest block mb-2">Resultados Reais</span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Principais Benefícios para o seu Estande
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <TrendingDown className="rotate-180" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">Até 3x Mais Leads Captados</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Aumente expressivamente a conversão de pessoas que passam pelo corredor em contatos comerciais reais e engajados.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">Dados 100% Confiáveis</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Zero crachás ilegíveis ou cartões perdidos. O visitante digita o próprio WhatsApp e e-mail corretos para receber seu brinde.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <WifiOff size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">100% Funcional Offline</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    A internet da feira oscilou ou caiu? O sistema continua funcionando normalmente no tablet e sincroniza quando a conexão retornar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">Follow-up no Mesmo Dia</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Receba os contatos em tempo real no seu CRM para abordar o lead enquanto o interesse e o calor do evento ainda estão no ápice.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <Gift size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">Experiência Memorável</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Gere lembrança duradoura de marca e faça do seu estande uma das paradas mais elogiadas e divertidas de toda a feira.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl h-fit border border-blue-500/20">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-1.5">Produtividade da Equipe</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Libere seus vendedores de anotações manuais para que eles foquem em fazer reuniões e fechar negócios de alto valor.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="mt-12 pt-10 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Quer levar essa experiência para o seu próximo estande?</h4>
                <p className="text-gray-400 text-sm">Fale diretamente conosco e solicite uma demonstração ou proposta personalizada.</p>
              </div>
              <a 
                href={WHATSAPP_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/30 whitespace-nowrap cursor-pointer"
              >
                <MessageCircle size={20} />
                <span>Entrar em contato</span>
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Interactive Game Demo Section */}
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
                Ative o gatilho da recompensa. Visitantes adoram jogar e ganhar brindes, preenchendo dados reais com muito mais facilidade em roletas e raspadinhas.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Final WhatsApp CTA Section */}
      <motion.section className="px-6 py-20 bg-emerald-700 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800 text-emerald-200 font-semibold text-sm mb-6 border border-emerald-600">
            <MessageCircle size={16} />
            <span>Atendimento Rápido e Direto</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
            Pronto para revolucionar a captação de leads do seu estande?
          </h2>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fale diretamente com a nossa equipe pelo WhatsApp para tirar dúvidas, conhecer os formatos disponíveis e personalizar a solução para a sua próxima feira.
          </p>
          <a 
            href={WHATSAPP_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-black text-emerald-900 bg-white rounded-2xl hover:bg-emerald-50 transition-all shadow-2xl hover:scale-105 cursor-pointer"
          >
            <MessageCircle size={26} className="text-emerald-600" />
            <span>Entrar em contato</span>
          </a>
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
                <li>
                  <a 
                    href={WHATSAPP_URL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageCircle size={20} className="text-emerald-500" />
                    <span>WhatsApp: {WHATSAPP_PHONE}</span>
                  </a>
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
            <div className="flex items-center gap-6">
              <RouterLink to="/prototipo-roleta" className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer">
                Protótipo (API + Roleta)
              </RouterLink>
              <p className="text-gray-500 text-sm">
                {t('footer.design_by')} <span className="text-white font-medium">{t('footer.design_agency')}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
