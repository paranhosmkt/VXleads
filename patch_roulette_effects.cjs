const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

// Add URL params reading to useEffect
const urlParamsEffect = `
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialForm: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      initialForm[key] = value;
    }
    setLeadForm(initialForm);
  }, []);
`;

code = code.replace(
  "useEffect(() => {",
  urlParamsEffect + "\n  useEffect(() => {"
);

fs.writeFileSync('src/pages/Roulette.tsx', code);
