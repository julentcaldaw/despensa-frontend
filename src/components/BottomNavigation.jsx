import React from 'react';
import { Package, ChefHat, User } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'despensa', label: 'Despensa', icon: Package },
  { key: 'recetas', label: 'Recetas', icon: ChefHat },
  { key: 'perfil', label: 'Perfil', icon: User }
];

const BottomNavigation = ({ currentTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`nav-item${currentTab === key ? ' active' : ''}`}
          onClick={() => onTabChange(key)}
          aria-label={label}
        >
          <span className="nav-icon-wrapper">
            <Icon
              size={currentTab === key ? 32 : 28}
              className="nav-icon"
            />
            {currentTab === key && <span className="nav-indicator" />}
          </span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;
