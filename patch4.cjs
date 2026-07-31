const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

const loadingCode = `
        try {
          const prizesRef = collection(db, 'companies', user.uid, 'prizes');
          const snapshot = await getDocs(prizesRef);
          if (!snapshot.empty) {
            const loadedPrizes = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.nome,
                quantity: data.quantidadeAtual.toString(), // <-- Changed to current quantity
                createdAt: data.createdAt
              };
            });
            setPrizes(loadedPrizes.length > 0 ? loadedPrizes : [{ name: '', quantity: '' }, { name: '', quantity: '' }]);
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
`;
code = code.replace(/try\s*\{\s*const prizesRef[^]*?catch\s*\(err\)\s*\{/m, loadingCode.trim() + ' catch (err) {');

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
          batch.update(prizeRef, {
            nome: prize.name.trim(),
            quantidadeAtual: Number(prize.quantity)
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
