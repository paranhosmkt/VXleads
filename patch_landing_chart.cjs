const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const importRecharts = `import { Link as RouterLink } from 'react-router-dom';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';`;
code = code.replace("import { Link as RouterLink } from 'react-router-dom';", importRecharts);

const chartData = `
const conversionData = [
  { day: 'Dia 0 (Evento)', rate: 95 },
  { day: 'Dia 1', rate: 75 },
  { day: 'Dia 3', rate: 45 },
  { day: 'Dia 5', rate: 25 },
  { day: 'Dia 10', rate: 12 },
  { day: '15+ dias', rate: 5 },
];
`;

code = code.replace("function FaqItem", chartData + "\nfunction FaqItem");

const chartSection = `
      {/* CRM Conversion Curve Section */}
      <section className="px-6 py-24 bg-indigo-900 border-t border-indigo-800 text-white overflow-hidden relative">
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
                  <YAxis stroke="#A5B4FC" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => \`\${val}%\`} />
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
      </section>
`;

const anchor = `{/* Why Choose Us Section */}`;
code = code.replace(anchor, chartSection + "\n    " + anchor);

fs.writeFileSync('src/pages/Landing.tsx', code);
