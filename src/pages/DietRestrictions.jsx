import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Milk, Wheat, Nut, Fish, Egg, Check, Sprout, WheatOff, MilkOff, Cow, Flame, Droplets, HeartPulse, Filter, Apple, Droplet, Salt, TestTube, Leaf, Trash2
} from 'lucide-react';

const RESTRICTIONS = {
  sin_gluten:      { label: 'Sin Gluten', icon: WheatOff, color: '#ffe5e0' },
  sin_lactosa:     { label: 'Intolerante a la Lactosa', icon: MilkOff, color: '#e0f7fa' },
  aplv:            { label: 'Alergia a la Proteína de la Leche', icon: Milk, color: '#f3e5f5' },
  frutos_secos:    { label: 'Alergia a Frutos Secos', icon: Nut, color: '#fff9c4' },
  cacahuetes:      { label: 'Alergia a Cacahuetes', icon: Nut, color: '#ffe0b2' },
  marisco:         { label: 'Marisco', icon: Fish, color: '#e1f5fe' },
  pescado:         { label: 'Pescado', icon: Fish, color: '#e0f2f1' },
  huevo:           { label: 'Alergia al Huevo', icon: Egg, color: '#fffde7' },
  soja:            { label: 'Alergia a la Soja', icon: Leaf, color: '#e8f5e9' },
  sesamo:          { label: 'Alergia a Sésamo', icon: Sprout, color: '#f8bbd0' },
  mostaza:         { label: 'Alergia a Mostaza', icon: Flame, color: '#fff8e1' },
  apio:            { label: 'Alergia a Apio', icon: Leaf, color: '#dcedc8' },
  sulfitos:        { label: 'Alergia a Sulfitos', icon: Droplets, color: '#f0f4c3' },
  altramuces:      { label: 'Alergia a Altramuces', icon: Sprout, color: '#f5f5dc' },
  diabeticos:      { label: 'Diabéticos', icon: HeartPulse, color: '#e1bee7' },
  fodmap:          { label: 'FODMAP', icon: Filter, color: '#b2dfdb' },
  fructosa:        { label: 'Intolerancia a Fructosa', icon: Apple, color: '#ffe0e0' },
  histamina:       { label: 'Intolerancia a Histamina', icon: Droplet, color: '#b3e5fc' },
  hiposodica:      { label: 'Dieta Hiposódica', icon: Leaf, color: '#f0f4c3' },
  bajo_potasio:    { label: 'Bajo Potasio', icon: Leaf, color: '#c8e6c9' },
  bajo_purinas:    { label: 'Bajo Purinas', icon: Filter, color: '#f5f5f5' },
  bajo_residuos:   { label: 'Bajo Residuos', icon: Trash2, color: '#ffe0b2' },
  fenilcetonuria:  { label: 'Fenilcetonuria', icon: TestTube, color: '#e1f5fe' },
  astringente:     { label: 'Dieta Astringente', icon: Droplet, color: '#f8bbd0' },
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

export default function DietRestrictions({ onBack, onSave }) {
  const { user, loading, error } = useAuth();
  const [allRestrictions, setAllRestrictions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingRestrictions, setLoadingRestrictions] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!user && !loading) {
    return <div className="user-profile">Inicia sesión para ver tus restricciones.</div>;
  }

  useEffect(() => {
    fetch('/api/enum/diet_restriction')
      .then(res => res.json())
      .then(data => {
        setAllRestrictions(Array.isArray(data.values) ? data.values : []);
      });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/usuario/restricciones', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setSelected(Array.isArray(data.restrictions) ? data.restrictions : []);
          setLoadingRestrictions(false);
        })
        .catch(() => setLoadingRestrictions(false));
    } else {
      setLoadingRestrictions(false);
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
      const res = await fetch('/api/usuario/restricciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restrictions: selected }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setSuccessMsg(data.message);
        setSelected(Array.isArray(data.restrictions) ? data.restrictions : selected);
        if (onSave) onSave(data.restrictions);
      } else {
        setErrorMsg(data.message || 'Error al guardar.');
      }
    } catch (err) {
      setErrorMsg('Error de red.');
    }
  };

  if (loadingRestrictions) {
    return <div className="pantry-bg-main"><div className="pantry-main-card"><p>Cargando restricciones...</p></div></div>;
  }

  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <header className="restrictions-header">
          <button className="restrictions-back" onClick={onBack} aria-label="Volver">
            <ArrowLeft size={28} />
          </button>
          <div>
            <h2 className="restrictions-title">Restricciones</h2>
            <p className="restrictions-subtitle">Selecciona tus alergias o intolerancias para personalizar tu experiencia.</p>
          </div>
        </header>
        {successMsg && <div className="pantry-error-primary" style={{ color: '#10b981', marginBottom: '1rem' }}>{successMsg}</div>}
        {errorMsg && <div className="pantry-error-primary" style={{ color: '#ef4444', marginBottom: '1rem' }}>{errorMsg}</div>}
        <motion.div
          className="restrictions-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {allRestrictions.map((key) => {
            const meta = RESTRICTIONS[key] || { label: key, icon: Sprout, color: '#e0f4f7' };
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
                  <Icon size={84} style={{ opacity: 0.08 }} />
                </span>
                <span className="restriction-label">{meta.label}</span>
                {isActive && (
                  <span className="restriction-check">
                    <Check size={24} strokeWidth={3} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.10))' }} />
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
