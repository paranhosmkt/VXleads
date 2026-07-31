const fs = require('fs');
let code = fs.readFileSync('src/pages/SelectCharacter.tsx', 'utf8');

const loadingCode = `
        try {
          const docRef = doc(db, 'companies', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().personagemId) {
            setSelectedCharacter(docSnap.data().personagemId);
            setCustomName(docSnap.data().nomePersona || '');
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
`;
code = code.replace(/try\s*\{\s*const docRef[^]*?catch\s*\(err\)\s*\{/m, loadingCode.trim() + ' catch (err) {');

const saveCode = `
      await updateDoc(doc(db, 'companies', userId), {
        personagemId: selectedCharacter,
        nomePersona: customName.trim(),
        // não marcamos setupPrizes como concluído aqui, isso é na próxima tela
      });

      // Se for apenas edição e já passou pelo onboarding, não força ir pra brindes
      // Mas para manter simples, vamos sempre mandar para configurar-brindes
      navigate('/configurar-brindes');
`;
code = code.replace(/await updateDoc\([^]*?navigate\('\/configurar-brindes'\);/m, saveCode.trim());

fs.writeFileSync('src/pages/SelectCharacter.tsx', code);
