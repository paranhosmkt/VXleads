const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupPrizes.tsx', 'utf8');

// Update prize state to include optional id and current quantity
code = code.replace(
  "const [prizes, setPrizes] = useState([{ name: '', quantity: '' }, { name: '', quantity: '' }]);",
  "const [prizes, setPrizes] = useState<any[]>([{ name: '', quantity: '' }, { name: '', quantity: '' }]);\n  const [prizesToDelete, setPrizesToDelete] = useState<string[]>([]);"
);

// Update data loading
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
                quantity: data.quantidadeTotal.toString(),
                quantidadeAtual: data.quantidadeAtual,
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

// Update deletion tracking
code = code.replace(
  "const handleRemovePrize = (index: number) => {",
  "const handleRemovePrize = (index: number) => {\n    if (prizes[index].id) {\n      setPrizesToDelete([...prizesToDelete, prizes[index].id]);\n    }"
);

fs.writeFileSync('src/pages/SetupPrizes.tsx', code);
