import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Nota: As rotas de usuários agora pedem token, 
      // mas para cadastro público, o backend deve permitir sem token.
      // Vou assumir que essa rota específica será aberta ou usarei o endpoint de cadastro correto.
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/auth/register`, { name, email, password });
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('activeTab');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Erro ao realizar cadastro';
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-container glass">
      <h1>CoreTask</h1>
      <p className="subtitle">Crie sua conta</p>
      
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Nome Completo" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister(e)}
          required
        />
        
        {error && <p style={{ color: '#ff4081', marginBottom: '15px', fontSize: '0.85rem' }}>{error}</p>}
        
        <button type="submit" className="btn-primary">
          <UserPlus size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Cadastrar
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#b3b3b3' }}>
        Já tem uma conta? <Link to="/login" className="link">Faça login</Link>
      </p>
    </div>
  );
}
