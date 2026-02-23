import React from 'react';
import BottomNavigation from '../components/BottomNavigation';
import MyShops from '../components/MyShops';

const User = ({ currentTab, onTabChange, shops, setShops }) => {
  return (
    <div className="user-container">
      <h2>Perfil de usuario</h2>
      <MyShops shops={shops} setShops={setShops} />
      <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

export default User;
