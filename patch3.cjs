const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

const saveCode = `
      const batch = writeBatch(db);
      
      // Deletar os removidos
      prizesToDelete.forEach(id => {
        const prizeRef = doc(db, 'companies', userId, 'prizes', id);
        batch.delete(prizeRef);
      });
      
      validPrizes.forEach(prize => {
        if (prize.id) {
          // Atualizar existente
          const prizeRef = doc(db, 'companies', userId, 'prizes', prize.id);
          
          let diff = 0;
          // We can check how much quantity changed from original state?
          // Since we didn't store the original quantity separately, we can just fetch it? 
          // Actually, we have prize.quantidadeAtual and we are replacing quantidadeTotal.
          // This is a bit complex without the original quantidadeTotal.
          // Let's just update nome and quantidadeTotal, and increment quantidadeAtual by the difference?
          // We didn't keep the old quantidadeTotal.
          
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity)
          });
        } else {
          // Criar novo
          const prizeRef = doc(collection(db, 'companies', userId, 'prizes'));
          batch.set(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            quantidadeAtual: Number(prize.quantity),
            createdAt: new Date()
          });
        }
      });
`;
code = code.replace(/const batch = writeBatch\(db\);[^]*?\}\);/m, saveCode.trim());

fs.writeFileSync('src/pages/SetupPrizes.tsx', code);
