const fs = require('fs');
let code = fs.readFileSync('src/pages/Roulette.tsx', 'utf-8');

if (!code.includes('import ReactPlayer')) {
  code = code.replace(/import \{ Scanner \} from '@yudiel\/react-qr-scanner';/, "import { Scanner } from '@yudiel/react-qr-scanner';\nimport ReactPlayer from 'react-player';");
}

if (!code.includes('import { Gift }')) {
  code = code.replace(/import \{ Loader2, Share2, Copy, Check, Play, ChevronRight, QrCode, X \} from 'lucide-react';/, "import { Loader2, Share2, Copy, Check, Play, ChevronRight, QrCode, X, Gift } from 'lucide-react';");
}
fs.writeFileSync('src/pages/Roulette.tsx', code);
