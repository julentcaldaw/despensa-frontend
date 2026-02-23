import React from 'react';
import { removeToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import MyShops from '../components/MyShops';


const User = ({ currentTab, onTabChange, shops, setShops }) => {
  const navigate = typeof useNavigate === 'function' ? useNavigate() : () => {};

  const handleLogout = () => {
    removeToken();
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="user-container">
      <h2>Perfil de usuario</h2>
      <button className="btn-primary" style={{marginBottom:'1rem'}} onClick={handleLogout}>
        Cerrar sesión
      </button>
      <MyShops shops={shops} setShops={setShops} />
      <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

export default User;
