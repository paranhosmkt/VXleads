const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Add import
const importStr = "import { Target, Users, Zap, Search, LayoutTemplate, MessageSquare, ChevronRight, CheckCircle2, Play, Sparkles } from 'lucide-react';";
const newImportStr = importStr + "\nimport Chatbot from '../components/Chatbot';";
code = code.replace(importStr, newImportStr);

// Also check if lucide imports are slightly different
if (code === fs.readFileSync('src/pages/Landing.tsx', 'utf8')) {
  // If no change, let's just insert after imports
  code = code.replace("import React", "import Chatbot from '../components/Chatbot';\nimport React");
}

// Add component
const endStr = `      </footer>
    </div>
  );
}`;
const newEndStr = `      </footer>
      <Chatbot />
    </div>
  );
}`;
code = code.replace(endStr, newEndStr);

fs.writeFileSync('src/pages/Landing.tsx', code);
