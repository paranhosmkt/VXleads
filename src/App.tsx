import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SetupPrizes from './pages/SetupPrizes';
import SetupForm from './pages/SetupForm';
import TVMode from './pages/TVMode';
import Roulette from './pages/Roulette';
import Dashboard from './pages/Dashboard';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ConsultantRegister from './pages/ConsultantRegister';
import ConsultantDashboard from './pages/ConsultantDashboard';
import PrototypeRoulette from './pages/PrototypeRoulette';
import TriagemPage from './pages/TriagemPage';
import RoletaPremioPage from './pages/RoletaPremioPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/cadastro-consultor" element={<ConsultantRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route path="/configurar-brindes" element={<SetupPrizes />} />
        <Route path="/configurar-experiencia" element={<SetupForm />} />
        <Route path="/tv/:companyId" element={<TVMode />} />
        <Route path="/roleta/:companyId" element={<Roulette />} />
        <Route path="/roleta" element={<Roulette />} />
        <Route path="/prototipo-roleta" element={<PrototypeRoulette />} />
        <Route path="/triagem" element={<TriagemPage />} />
        <Route path="/roleta-premio" element={<RoletaPremioPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/painel-consultor" element={<ConsultantDashboard />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}
