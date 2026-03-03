import React, { useEffect, useState } from "react";
import { ShoppingCart, User as UserIcon, Heart, ChefHat, Package, LogOut, Settings, Bell, ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import DietRestrictions from './DietRestrictions';
import DietPreferences from "./DietPreferences";
import BottomNavigation from "../components/BottomNavigation";
import { useAuth } from "../utils/AuthContext";
import EditProfile from "../components/EditProfile";

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
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { user, loading, error, logout, refetchUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const statsIcons = {
    recetasGuardadas: <ChefHat size={35} className="user-stats-icon" />,
    despensa: <Package size={35} className="user-stats-icon" />,
    listaCompra: <ShoppingCart size={35} className="user-stats-icon" />,
  };
  const settingsIcons = {
    restricciones: <ShieldCheck size={22} />,
    dieta: <Leaf size={22} />,
    notificaciones: <Bell size={22} />,
    logout: <LogOut size={22} />,
  };

  if (loading) return <div className="user-profile">Cargando perfil...</div>;
  if (error) return <div className="user-profile">Error: {error}</div>;
  if (!user || !user.avatar) return <div className="user-profile">No se ha podido cargar el perfil.</div>;
  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <div className="pantry-container">
          <div className="pantry-header" style={{ flexDirection: 'column', alignItems: 'center', paddingTop: '1.2rem' }}>
            <img src="/logoA.png" alt="Logo" style={{ maxWidth: '320px', width: '100%', height: 'auto', marginBottom: '0.7rem', marginTop: '-0.5rem' }} />
            <h2 className="pantry-title" style={{
              textAlign: 'center',
              fontFamily: 'Roboto, Montserrat, Poppins, Inter, Arial, sans-serif',
              letterSpacing: '0.03em',
              marginTop: '0.5rem',
              marginBottom: '2.2rem',
              position: 'relative'
            }}>miPERFIL</h2>
          </div>
          <div className="user-columns" style={{ display: 'flex', gap: '2rem' }}>
            {/* Columna izquierda: avatar y restricciones/preferencias */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <motion.div className="user-header" variants={itemVariants}>
                <div className="user-avatar-wrapper">
                  <img
                    src={`/${user.avatar}`}
                    alt="Avatar"
                    className="user-avatar"
                  />
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
                        ? () => setShowRestrictions(true)
                        : item.key === 'dieta'
                        ? () => setShowPreferences(true)
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
            {/* Columna derecha: stats y notificaciones/logout */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3rem', marginTop: '0.75rem' }}>
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
                {user.settings && user.settings.filter(item => item.key === 'notificaciones' || item.key === 'logout').map((item) => (
                  <motion.button
                    key={item.key}
                    className={`user-settings-item${item.key === 'logout' ? " danger" : ""}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={
                      item.key === 'logout'
                        ? handleLogout
                        : undefined
                    }
                  >
                    <span className={`user-settings-icon user-settings-icon--${item.key === 'logout' ? 'danger' : 'primary'}`}>
                      {settingsIcons[item.key]}
                    </span>
                    <span className="user-settings-label">{item.label}</span>
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
        </div> {/* pantry-container */}
      </div> {/* pantry-main-card */}
    </div> 
  )
}
