
import React, { useState } from 'react';
import { setToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
    setSuccess('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al registrar');
      if (data.token) setToken(data.token);
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <form className="login-card login-card-logo" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-logo-block">
            <img src="/logoA.png" alt="Logo" className="login-logo-img" />
            <p className="login-app-subtitle">Tu cocina inteligente</p>
          </div>
          <h2 className="login-title">Registro</h2>
          <div className="input-group">
            <input
              className="login-input"
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <input
              className="login-input"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
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
          {success && <div className="login-success" style={{ color: '#059669', marginBottom: '0.5rem', textAlign: 'center' }}>{success}</div>}
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 0 }}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="login-register-link"
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
