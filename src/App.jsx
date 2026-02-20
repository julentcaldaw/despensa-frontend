import React from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import User from './pages/User';
import Layout from './components/Layout';

function App() {
  const [showRegister, setShowRegister] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [view, setView] = React.useState('despensa');

  const handleLogin = (user) => {
    setUser(user);
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  if (user) {
    return (
      <Layout user={user} view={view} setView={setView}>
        {view === 'despensa' && <Pantry currentTab={view} onTabChange={setView} />}
        {view === 'recetas' && <Recipes currentTab={view} onTabChange={setView} />}
        {view === 'perfil' && <User currentTab={view} onTabChange={setView} />}
      </Layout>
    );
  }

  if (showRegister) {
    return (
      <>
        <Register onRegister={handleRegister} />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button onClick={() => setShowRegister(false)}>
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </>
    );
  }

  return <Login onLogin={handleLogin} setShowRegister={setShowRegister} />;
}

export default App;
