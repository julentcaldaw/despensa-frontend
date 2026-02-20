

import React, { useState } from 'react';
import { setToken } from '../utils/auth';
import { Mail, Lock } from 'lucide-react';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const Login = ({ onLogin, setShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión');
      setToken(data.token);
      onLogin && onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg" style={{ minHeight: '100vh' }}>
      <div className="login-container">
        <form className="login-card login-card-logo" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-logo-block">
            <img src="/logoA.png" alt="Logo" className="login-logo-img" />
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
          {error && <div className="login-error" style={{ color: '#dc2626', marginBottom: '0.5rem', textAlign: 'center' }}>{error}</div>}
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 0 }}
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="login-register-link"
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
