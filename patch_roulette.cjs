const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf-8');

const target1 = `    if (prizes.length > 0) {
      const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
      setPreSelectedPrize(prizes[randomPrizeIndex]);
    }`;

const replacement1 = `    if (prizes.length > 0) {
      // Filtrar apenas brindes com estoque > 0
      const availablePrizes = prizes.filter(p => (p.quantidadeAtual === undefined) || Number(p.quantidadeAtual) > 0);
      const pool = availablePrizes.length > 0 ? availablePrizes : prizes;
      
      // Sorteio ponderado pela quantidadeAtual
      const totalWeight = pool.reduce((sum, p) => sum + (Number(p.quantidadeAtual) || 1), 0);
      let randomVal = Math.random() * totalWeight;
      let selected = pool[0];
      for (const p of pool) {
        randomVal -= (Number(p.quantidadeAtual) || 1);
        if (randomVal <= 0) {
          selected = p;
          break;
        }
      }
      setPreSelectedPrize(selected);
    }`;

const target2 = `      if (actualCompanyId) {
        const leadsRef = collection(db, 'companies', actualCompanyId, 'leads');
        const docRef = await addDoc(leadsRef, finalLeadData);
        setCreatedLeadId(docRef.id);
      }`;

const replacement2 = `      if (actualCompanyId) {
        const leadsRef = collection(db, 'companies', actualCompanyId, 'leads');
        const docRef = await addDoc(leadsRef, finalLeadData);
        setCreatedLeadId(docRef.id);
        
        // Dar baixa no estoque do brinde
        if (preSelectedPrize && preSelectedPrize.id) {
          try {
            const prizeRef = doc(db, 'companies', actualCompanyId, 'prizes', preSelectedPrize.id);
            const prizeDoc = await getDoc(prizeRef);
            if (prizeDoc.exists()) {
              const currentQ = Number(prizeDoc.data().quantidadeAtual);
              if (currentQ > 0) {
                await updateDoc(prizeRef, { quantidadeAtual: currentQ - 1 });
              }
            }
          } catch(e) {
            console.error("Erro ao dar baixa no brinde", e);
          }
        }
      }`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/Roulette.tsx', code);
console.log("Patched Roulette.tsx");
