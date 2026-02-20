import React from 'react';
import BottomNavigation from '../components/BottomNavigation';

const User = ({ currentTab, onTabChange }) => {
  return (
    <div className="user-container">
      <h2>Perfil de usuario</h2>
      <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

export default User;
