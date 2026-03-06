import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Fish, Egg, Check, Sprout, MilkOff,  Flame, Leaf
} from 'lucide-react';

const PREFERENCES = {
    none:            { label: 'Sin Preferencias', icon: Leaf, color: '#f0f4c3' },
  vegetarian:      { label: 'Vegetariano', icon: MilkOff, color: '#e0f7fa' },
  lacto_vegetarian:     { label: 'Lacto-Vegetariano', icon: Leaf, color: '#e0f7fa' },
  ovo_vegetarian:            { label: 'Ovo-Vegetariano', icon: Egg, color: '#f3e5f5' },
  vegan:    { label: 'Vegano', icon: Leaf, color: '#fff9c4' },
  pescetarian:      { label: 'Pescetariano', icon: Fish, color: '#ffe0b2' },
  keto:         { label: 'Keto', icon: Flame, color: '#e1f5fe' },
  paleo:         { label: 'Paleo', icon: Fish, color: '#e0f2f1' },
};

const containerVariants = {
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
};

export default function DietPreferences({ onBack, onSave }) {
    const navigate = useNavigate();
  const { user, loading, error } = useAuth();
  const [allPreferences, setAllPreferences] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!user && !loading) {
    return <div className="user-profile">Inicia sesión para ver tus preferencias.</div>;
  }

  useEffect(() => {
    fetch('/enum/diet_preference')
      .then(res => res.json())
      .then(data => {
        setAllPreferences(Array.isArray(data.values) ? data.values : []);
      });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('/usuario/preferencias', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setSelected(Array.isArray(data.preferences) ? data.preferences : []);
          setLoadingPreferences(false);
        })
        .catch(() => setLoadingPreferences(false));
    } else {
      setLoadingPreferences(false);
    }
  }, []);

  const handleToggle = key => {
    setSelected(sel =>
      sel.includes(key) ? sel.filter(k => k !== key) : [...sel, key]
    );
  };

  const handleSave = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('No autenticado.');
      return;
    }
    try {
      const res = await fetch('/usuario/preferencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: selected }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setSuccessMsg(data.message);
        setSelected(Array.isArray(data.preferences) ? data.preferences : selected);
        if (onSave) onSave(data.preferences);
      } else {
        setErrorMsg(data.message || 'Error al guardar.');
      }
    } catch (err) {
      setErrorMsg('Error de red.');
    }
  };

  if (loadingPreferences) {
    return <div className="pantry-bg-main"><div className="pantry-main-card"><p>Cargando preferencias...</p></div></div>;
  }

  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <header className="restrictions-header">
          <button
            className="restrictions-back"
            onClick={onBack ? onBack : () => navigate('/perfil')}
            aria-label="Volver"
            style={{ background: 'none', border: 'none', boxShadow: 'none', padding: 0, margin: 0, outline: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={28} />
          </button>
          <div>
            <h2 className="restrictions-title">misPREFERENCIAS</h2>
            <p className="restrictions-subtitle">Selecciona tus preferencias alimenticias para personalizar tu experiencia.</p>
          </div>
        </header>
        <div className='restrictions-msg'>
        {successMsg && <div className="restrictions-msg-success">{successMsg}</div>}
        {errorMsg && <div className="restrictions-msg-error">{errorMsg}</div>}
        </div>
        <motion.div
          className="restrictions-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {allPreferences.map((key) => {
            const meta = PREFERENCES[key] || { label: key, icon: Sprout, color: '#e0f4f7' };
            const Icon = meta.icon;
            const isActive = selected.includes(key);
            return (
              <motion.button
                key={key}
                className={`restriction-card${isActive ? ' restriction-card-active' : ''}`}
                style={{ background: meta.color }}
                variants={cardVariants}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleToggle(key)}
                aria-pressed={isActive}
              >
                <span className="restriction-icon-bg">
                  <Icon size={84} className="opacity-20" />
                </span>
                <span className="restriction-label">{meta.label}</span>
                {isActive && (
                  <span className="restriction-check">
                    <Check size={24} strokeWidth={3} className="text-primary drop-shadow-sm" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
        <button className="restrictions-save-btn" onClick={handleSave}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

