const fs = require('fs');
let code = fs.readFileSync('src/pages/SetupForm.tsx', 'utf8');

const oldHandleAddField = `  const handleAddField = () => {
    const newField = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      label: 'Nova Pergunta',
      required: false,
      options: []
    };
    setFormFields([...formFields, newField]);
  };`;

const newHandleAddField = `  const handleAddField = () => {
    if (formFields.length >= 5) {
      alert('O limite máximo é de 5 perguntas.');
      return;
    }
    const newField = {
      id: Date.now().toString(),
      type: 'multiple_choice',
      label: 'Nova Pergunta',
      required: false,
      options: []
    };
    setFormFields([...formFields, newField]);
  };`;

code = code.replace(oldHandleAddField, newHandleAddField);

const oldButton = `<button 
              onClick={handleAddField}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors"
            >
              <Plus size={18} />
              Adicionar Campo
            </button>`;

const newButton = `<button 
              onClick={handleAddField}
              disabled={formFields.length >= 5}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Adicionar Campo ({formFields.length}/5)
            </button>`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/pages/SetupForm.tsx', code);
