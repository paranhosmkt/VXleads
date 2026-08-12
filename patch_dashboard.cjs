const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const targetDeleteAll = `      const leadsSnapshot = await getDocs(leadsRef);
      const deletePromises = leadsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);`;

const replaceDeleteAll = `      const leadsSnapshot = await getDocs(leadsRef);
      // Restore prize quantities
      for (const leadDoc of leadsSnapshot.docs) {
        const data = leadDoc.data();
        if (data.prizeId) {
          try {
            const prizeRef = doc(db, 'companies', userId, 'prizes', data.prizeId);
            const prizeSnap = await getDoc(prizeRef);
            if (prizeSnap.exists()) {
              const currentQ = Number(prizeSnap.data().quantidadeAtual || 0);
              const totalQ = Number(prizeSnap.data().quantidadeTotal || currentQ);
              if (currentQ < totalQ) {
                await updateDoc(prizeRef, { quantidadeAtual: currentQ + 1 });
              }
            }
          } catch(e) {}
        }
      }
      
      const deletePromises = leadsSnapshot.docs.map(leadDoc => deleteDoc(leadDoc.ref));
      await Promise.all(deletePromises);`;

const targetDeleteOne = `    try {
      await deleteDoc(doc(db, 'companies', userId, 'leads', leadId));
      setLeads(leads.filter(l => l.id !== leadId));`;

const replaceDeleteOne = `    try {
      const leadToDelete = leads.find(l => l.id === leadId);
      if (leadToDelete && leadToDelete.prizeId) {
        try {
          const prizeRef = doc(db, 'companies', userId, 'prizes', leadToDelete.prizeId);
          const prizeSnap = await getDoc(prizeRef);
          if (prizeSnap.exists()) {
            const currentQ = Number(prizeSnap.data().quantidadeAtual || 0);
            const totalQ = Number(prizeSnap.data().quantidadeTotal || currentQ);
            if (currentQ < totalQ) {
              await updateDoc(prizeRef, { quantidadeAtual: currentQ + 1 });
            }
          }
        } catch(e) {}
      }
      
      await deleteDoc(doc(db, 'companies', userId, 'leads', leadId));
      setLeads(leads.filter(l => l.id !== leadId));`;

code = code.replace(targetDeleteAll, replaceDeleteAll);
code = code.replace(targetDeleteOne, replaceDeleteOne);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx for lead deletion");
