import React from 'react';
import { Package, ChefHat, User as UserIcon, ShoppingCart } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { key: '/despensa', label: 'Despensa', icon: Package },
  { key: '/recetas', label: 'Recetas', icon: ChefHat },
  { key: '/listacompra', label: 'Lista', icon: ShoppingCart },
  { key: '/usuario', label: 'Perfil', icon: UserIcon }
];

const BottomNavigation = () => {
  const location = useLocation();
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const isActive = location.pathname === key;
        return (
          <Link
            key={key}
            className={`nav-item${isActive ? ' active' : ''}`}
            to={key}
            aria-label={label}
          >
            <span className="nav-icon-wrapper">
              <Icon
                size={isActive ? 32 : 28}
                className="nav-icon"
              />
            </span>
            <span className="nav-label no-underline">{label}</span>
            {isActive && <span className="nav-indicator" />}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
