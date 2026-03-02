import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('selectedCompany');
      localStorage.removeItem('activeTab');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao realizar login');
    }
  };

  return (
    <div className="auth-container glass">
      <h1>CoreTask</h1>
      <p className="subtitle">Bem-vindo de volta</p>
      
      <form onSubmit={handleLogin}>
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
          onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
          required
        />
        
        {error && <p style={{ color: '#ff4081', marginBottom: '15px', fontSize: '0.85rem' }}>{error}</p>}
        
        <button type="submit" className="btn-primary">
          <LogIn size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Entrar
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#b3b3b3' }}>
        Não tem uma conta? <Link to="/register" className="link">Cadastre-se</Link>
      </p>
    </div>
  );
}
