import React, { useEffect, useState } from "react";
import { authFetch } from "../utils/auth";
// Hook para obtener datos del usuario autenticado
function useUserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("/usuario");
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const data = await res.json();
        if (isMounted) setUser(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUser();
    return () => { isMounted = false; };
  }, []);
  return { user, loading, error };
}
import { motion } from "framer-motion";
import BottomNavigation from "../components/BottomNavigation";
import {
  User as UserIcon,
  Heart,
  ChefHat,
  Package,
  LogOut,
  Settings,
  Bell,
  ArrowRight,
  Leaf,
  ShieldCheck
} from "lucide-react";



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
  const { user, loading, error } = useUserProfile();

  // Puedes definir los iconos aquí para mapearlos según la key de stats/settings
  const statsIcons = {
    recetasGuardadas: <ChefHat size={38} className="user-stats-icon" />,
    itemsDespensa: <Package size={38} className="user-stats-icon" />,
    aportaciones: <Heart size={38} className="user-stats-icon" />,
  };
  const settingsIcons = {
    restricciones: <ShieldCheck size={22} />,
    dieta: <Leaf size={22} />,
    notificaciones: <Bell size={22} />,
    logout: <LogOut size={22} />,
  };

  if (loading) return <div className="user-profile">Cargando perfil...</div>;
  if (error) return <div className="user-profile">Error: {error}</div>;
  if (!user) return null;

  return (
    <>
      <motion.div
        className="user-profile"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* Header */}
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
          >
            Editar Perfil
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="user-stats-grid" variants={containerVariants}>
          {user.stats && Object.entries(user.stats).map(([key, value]) => (
            <motion.div
              key={key}
              className={`user-stats-card user-stats-card--primary`}
              variants={itemVariants}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="user-stats-icon-bg">{statsIcons[key]}</span>
              <div className="user-stats-value">{value}</div>
              <div className="user-stats-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Settings List */}
        <motion.div className="user-settings-list" variants={containerVariants}>
          {user.settings && user.settings.map((item) => (
            <motion.button
              key={item.key}
              className={`user-settings-item${item.key === 'logout' ? " danger" : ""}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span
                className={`user-settings-icon user-settings-icon--${item.key === 'logout' ? 'danger' : 'primary'}`}
              >
                {settingsIcons[item.key]}
              </span>
              <span className="user-settings-label">{item.label}</span>
              <ArrowRight size={18} className="user-settings-arrow" />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
      <BottomNavigation />
    </>
  );
}