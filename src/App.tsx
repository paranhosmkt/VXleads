import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import SelectCharacter from './pages/SelectCharacter';
import SetupPrizes from './pages/SetupPrizes';
import Roulette from './pages/Roulette';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/selecionar-personagem" element={<SelectCharacter />} />
        <Route path="/configurar-brindes" element={<SetupPrizes />} />
        <Route path="/roleta/:companyId" element={<Roulette />} />
        <Route path="/roleta" element={<Roulette />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
