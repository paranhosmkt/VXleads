const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

code = code.replace(
  "import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';",
  "import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';"
);

const oldHandleSubmit = `  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('spin');
  };`;

const newHandleSubmit = `  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadForm.email) {
      setLoading(true);
      try {
        const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
        if (actualCompanyId) {
          const q = query(collection(db, 'leads'), where('companyId', '==', actualCompanyId), where('email', '==', leadForm.email));
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
  };`;

code = code.replace(oldHandleSubmit, newHandleSubmit);

// Add name, email, phone fields to the form rendering
const oldFormRender = `            <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
              {formFields.map(field => (`;

const newFormRender = `            <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-5">
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
              {formFields.map(field => (`;

code = code.replace(oldFormRender, newFormRender);

fs.writeFileSync('src/pages/Roulette.tsx', code);
