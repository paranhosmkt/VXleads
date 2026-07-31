import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import SelectCharacter from './pages/SelectCharacter';
import SetupPrizes from './pages/SetupPrizes';
import SetupForm from './pages/SetupForm';
import TVMode from './pages/TVMode';
import Roulette from './pages/Roulette';
import Dashboard from './pages/Dashboard';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/selecionar-personagem" element={<SelectCharacter />} />
        <Route path="/configurar-brindes" element={<SetupPrizes />} />
        <Route path="/configurar-experiencia" element={<SetupForm />} />
        <Route path="/tv/:companyId" element={<TVMode />} />
        <Route path="/roleta/:companyId" element={<Roulette />} />
        <Route path="/roleta" element={<Roulette />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}
