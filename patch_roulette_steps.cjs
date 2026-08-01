const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf8');

const oldHandleStart = `  const handleStart = () => {
    if (videoUrl) {
      setStep('video');
    } else if (formFields.length > 0) {
      setStep('form');
    } else {
      setStep('spin');
    }
  };`;

const newHandleStart = `  const handleStart = () => {
    if (videoUrl) {
      setStep('video');
    } else {
      setStep('form');
    }
  };`;

const oldHandleVideoEnd = `  const handleVideoEnd = () => {
    if (formFields.length > 0) {
      setStep('form');
    } else {
      setStep('spin');
    }
  };`;

const newHandleVideoEnd = `  const handleVideoEnd = () => {
    setStep('form');
  };`;

code = code.replace(oldHandleStart, newHandleStart);
code = code.replace(oldHandleVideoEnd, newHandleVideoEnd);

fs.writeFileSync('src/pages/Roulette.tsx', code);
