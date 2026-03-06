import React, { useEffect, useState } from "react";
import { ShoppingCart, User as UserIcon, Heart, ChefHat, Package, LogOut, Settings, Bell, ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import DietRestrictions from './DietRestrictions';
import DietPreferences from "./DietPreferences";
import BottomNavigation from "../components/BottomNavigation";
import { useAuth } from "../utils/AuthContext";
import EditProfile from "../components/EditProfile";
import MyShops from "../components/MyShops";
import AvatarSelector from "../components/AvatarSelector";
import { Pencil } from 'lucide-react';


const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } }
};

export default function User() {
  useEffect(() => {
    if (refetchUser) refetchUser();
    const handleFocus = () => {
      if (refetchUser) refetchUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMyShops, setShowMyShops] = useState(false);
  const { user, loading, error, logout, refetchUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const avatarList = [
    '/avatar/avatar1.jpg',
    '/avatar/avatar2.jpg',
    '/avatar/avatar3.jpg',
    '/avatar/avatar4.jpg',
    '/avatar/avatar5.jpg',
    '/avatar/avatar6.jpg',
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const handleAvatarSelect = async (avatar) => {
    if (updateUser) {
      await updateUser({ avatar: avatar.replace('/avatar/', '') });
      refetchUser();
    }
    setShowAvatarSelector(false);
  };

  const statsIcons = {
    recetasGuardadas: <ChefHat size={35} className="user-stats-icon" />,
    despensa: <Package size={35} className="user-stats-icon" />,
    listaCompra: <ShoppingCart size={35} className="user-stats-icon" />,
  };
  const settingsIcons = {
    restricciones: <ShieldCheck size={22} />,
    dieta: <Leaf size={22} />,
    tiendas: <Package size={22} />,
    logout: <LogOut size={22} />,
  };

  if (loading) return <div className="user-profile">Cargando perfil...</div>;
  if (error) return <div className="user-profile">Error: {error}</div>;
  if (!user || !user.avatar) return <div className="user-profile">No se ha podido cargar el perfil.</div>;
  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <div className="pantry-container">
          <div className="pantry-header flex flex-col items-center justify-center pt-5">
            <img src="/logoC.png" alt="Logo" className="logoA-img mx-auto mb-2" />
            <h2 className="pantry-title text-center font-sans text-[2.5rem] tracking-[.03em] mb-9">miPERFIL</h2>
          </div>
          <div className="user-columns" style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <motion.div className="user-header" variants={itemVariants}>
                <div className="user-avatar-wrapper" style={{ position: 'relative' }}>
                  <img
                    src={`/avatar/${user.avatar}`}
                    alt="Avatar"
                    className="user-avatar"
                  />
                  <button
                    className="user-avatar-edit-btn"
                    style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', borderRadius: '50%', border: 'none', width: '28px', height: '28px', fontSize: '1.2rem', cursor: 'pointer' }}
                    onClick={() => setShowAvatarSelector(true)}
                    title="Cambiar avatar"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <motion.button
                  className="user-edit-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowEditProfile(true)}
                >
                  Editar Perfil
                </motion.button>
              </motion.div>
              <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {user.settings && user.settings.filter(item => item.key === 'restricciones' || item.key === 'dieta').map((item) => (
                  <motion.button
                    key={item.key}
                    className={`user-settings-item`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={
                      item.key === 'restricciones'
                        ? () => navigate('/restricciones')
                        : item.key === 'dieta'
                        ? () => navigate('/dieta')
                        : undefined
                    }
                  >
                    <span className="user-settings-icon user-settings-icon--primary">
                      {settingsIcons[item.key]}
                    </span>
                    <span className="user-settings-label">{item.label}</span>
                    <ArrowRight size={18} className="user-settings-arrow" />
                  </motion.button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3.45rem', marginTop: '1.2rem' }}>
                {[
                  { key: 'recetasGuardadas', value: user.stats?.recetasGuardadas ?? 0 },
                  { key: 'despensa', value: user.pantryCount ?? 0 },
                  { key: 'listaCompra', value: user.shoppingListCount ?? 0 }
                ].map(({ key, value }) => {
                  const handleCardClick = () => {
                    if (key === 'despensa') navigate('/despensa');
                    if (key === 'listaCompra') navigate('/listacompra');
                  };
                  return (
                    <motion.div
                      key={key}
                      className={`user-stats-card user-stats-card--primary`}
                      variants={itemVariants}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={key === 'despensa' || key === 'listaCompra' ? handleCardClick : undefined}
                      style={{ cursor: key === 'despensa' || key === 'listaCompra' ? 'pointer' : 'default', flex: 1 }}
                    >
                      <div className="user-stats-value">{value}</div>
                      <div className="user-stats-label">
                        {key === 'listaCompra' ? 'Lista de la compra' : key === 'despensa' ? 'Despensa' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {user.settings && user.settings.filter(item => item.key === 'tiendas' || item.key === 'logout').map((item) => (
                  <motion.button
                    key={item.key}
                    className={`user-settings-item${item.key === 'logout' ? " danger" : ""}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={
                      item.key === 'logout'
                        ? handleLogout
                        : item.key === 'tiendas'
                        ? () => setShowMyShops(true)
                        : undefined
                    }
                  >
                    <span className={`user-settings-icon user-settings-icon--${item.key === 'logout' ? 'danger' : 'primary'}`}>
                      {settingsIcons[item.key]}
                    </span>
                    <span className="user-settings-label">{item.key === 'tiendas' ? 'Mis tiendas' : item.label}</span>
                    <ArrowRight size={18} className="user-settings-arrow" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          <EditProfile
            user={user}
            show={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            onSaved={refetchUser}
          />
          <BottomNavigation />
          {showMyShops && (
            <MyShops show={showMyShops} onClose={() => setShowMyShops(false)} shops={shops} setShops={setShops} />
          )}
          {showAvatarSelector && (
            <AvatarSelector
              avatars={avatarList}
              selectedAvatar={`/avatar/${user.avatar}`}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarSelector(false)}
            />
          )}
        </div> {/* pantry-container */}
      </div> {/* pantry-main-card */}
    </div> 
  )
}
