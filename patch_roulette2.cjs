const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

const dynamicForm = `
                 {formFields.map(field => (
                   <div key={field.id}>
                     <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                     {field.type === 'long_text' ? (
                       <textarea 
                         required={field.required}
                         value={leadForm[field.id] || ''}
                         onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                         rows={3}
                       />
                     ) : field.type === 'multiple_choice' ? (
                       <div className="space-y-2">
                         {field.options?.map((opt, i) => (
                           <label key={i} className="flex items-center gap-2 cursor-pointer">
                             <input 
                               type="radio" 
                               name={field.id}
                               value={opt}
                               required={field.required}
                               checked={leadForm[field.id] === opt}
                               onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                               className="text-indigo-600 focus:ring-indigo-600"
                             />
                             <span className="text-sm text-gray-700">{opt}</span>
                           </label>
                         ))}
                       </div>
                     ) : field.type === 'dropdown' ? (
                       <select
                         required={field.required}
                         value={leadForm[field.id] || ''}
                         onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                       >
                         <option value="">Selecione...</option>
                         {field.options?.map((opt, i) => (
                           <option key={i} value={opt}>{opt}</option>
                         ))}
                       </select>
                     ) : (
                       <input 
                         required={field.required}
                         type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                         value={leadForm[field.id] || ''}
                         onChange={(e) => setLeadForm({...leadForm, [field.id]: e.target.value})}
                         className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                       />
                     )}
                   </div>
                 ))}
`;

const oldForm = `                 <div>
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
                 </div>`;

code = code.replace(oldForm, dynamicForm);

fs.writeFileSync('src/pages/Roulette.tsx', code);
