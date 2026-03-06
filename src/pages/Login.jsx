import React, { useState } from 'react';
import { setToken } from '../utils/auth';
import { useAuth } from '../utils/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
        try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');
      setToken(data.token);
      login(data.token);
      navigate('/despensa');
    } catch (err) {
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg min-h-screen">
      <div className="login-container">
        <form className="login-card login-card-logo" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-logo-block">
            <img src="/logoC.png" alt="Logo" className="logoA-img" />
            <p className="login-app-subtitle">Tu cocina inteligente</p>
          </div>
          <h2 className="login-title">Iniciar Sesión</h2>
          <div className="input-group">
            <span className="input-icon">
              <Mail size={20} />
            </span>
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <Lock size={20} />
            </span>
            <input
              className="login-input"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="login-error text-red-600 mb-2 text-center">{error}</div>}
          <button
            className="btn-primary mt-0"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="login-register-link p-0 font-inherit cursor-pointer"
          >
            ¿No tienes cuenta? Regístrate
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Login;
