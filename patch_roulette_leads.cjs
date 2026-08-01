const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

const oldLeads = `        const leadsRef = collection(db, 'leads');
        await addDoc(leadsRef, finalLeadData);`;

const newLeads = `        const actualCompanyId = companyId && companyId !== 'dev' ? companyId : auth.currentUser?.uid;
        if (actualCompanyId) {
          const leadsRef = collection(db, 'companies', actualCompanyId, 'leads');
          await addDoc(leadsRef, finalLeadData);
        }`;

code = code.replace(oldLeads, newLeads);

// Fix the read for duplicate email to also query the subcollection
const oldDup = `          const q = query(collection(db, 'leads'), where('companyId', '==', actualCompanyId), where('email', '==', leadForm.email));`;
const newDup = `          const q = query(collection(db, 'companies', actualCompanyId, 'leads'), where('email', '==', leadForm.email));`;

code = code.replace(oldDup, newDup);

fs.writeFileSync('src/pages/Roulette.tsx', code);
