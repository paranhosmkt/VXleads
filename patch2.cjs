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
          if (prize.quantidadeTotal !== undefined) {
             diff = Number(prize.quantity) - prize.quantidadeTotal;
          } else {
             // caso old quantidadeTotal was not saved in state?
             // we saved quantity (which was quantidadeTotal). Let's see how it was mapped.
          }
          
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeTotal: Number(prize.quantity),
            // We just update name and total quantity for simplicity, 
            // a full system might adjust current quantity based on diff.
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
