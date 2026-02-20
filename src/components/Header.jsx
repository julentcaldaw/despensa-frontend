import React from 'react';

const Header = ({ user, view, setView }) => {
  return (
    <header className="header-main">
      <div className="header-content">
        <img src="/logo.png" alt="Logo desPENSA" className="header-logo" />
        {user && (
          <nav className="header-nav">
            <button className="header-nav-btn" onClick={() => setView('pantry')}>Inventario</button>
            <button className="header-nav-btn" onClick={() => setView('recipes')}>Recetas</button>
            <button className="header-nav-btn" onClick={() => setView('favorites')}>Favoritos</button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
