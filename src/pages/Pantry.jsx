const CATEGORY_MAP = {
  lacteos_huevos: { class: 'category-dairy', icon: <Egg /> },
  frutas_verduras: { class: 'category-veg', icon: <Leaf /> },
  carnes_pescados: { class: 'category-meat', icon: <Fish /> },
  despensa_granos: { class: 'category-pantry', icon: <Coffee /> },
  condimentos_aceites: { class: 'category-condiment', icon: <Salad /> },
  snacks_extras: { class: 'category-snack', icon: <Cookie /> }
};

import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Trash2, Leaf, Egg, Cookie, ScanLine, Salad, Fish, Coffee
} from 'lucide-react';
import { authFetch } from '../utils/auth';
import { useAuth } from '../utils/AuthContext';
import AddIngredientPantry from '../components/AddIngredientPantry';
import Scanner from '../components/Scanner';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';
import { useNavigate } from 'react-router-dom';

const Pantry = ({ currentTab, onTabChange }) => {
  const { user, loading, error } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [errorIngredients, setErrorIngredients] = useState('');
  const [allIngredients, setAllIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanProduct, setScanProduct] = useState(null);
  const [showAddedMsg, setShowAddedMsg] = useState(false);
  const [scanCategory, setScanCategory] = useState('frutas_verduras');
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState('frutas_verduras');
  const [addError, setAddError] = useState('');

  if (!user && !loading) {
    return <div className="user-profile">Inicia sesión para ver tu despensa.</div>;
  }

  const handleDelete = async (id) => {
    try {
      setLoadingIngredients(true);
      setErrorIngredients('');
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorIngredients('No hay sesión activa. Por favor, inicia sesión.');
        setLoadingIngredients(false);
        return;
      }
      const response = await authFetch(`/pantry/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        setErrorIngredients(data.message || 'No se pudo eliminar el ingrediente');
        setLoadingIngredients(false);
        return;
      }
      fetchPantry();
    } catch (err) {
      setErrorIngredients(err.message || 'Error de conexión al eliminar ingrediente.');
    } finally {
      setLoadingIngredients(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      const response = await authFetch('/ingredients');
      if (!response.ok) throw new Error('Error al cargar ingredientes');
      const data = await response.json();
      setAllIngredients(data);
    } catch (err) {
      setErrorIngredients(err.message);
    }
  };

  const fetchPantry = async () => {
    setLoadingIngredients(true);
    setErrorIngredients('');
    try {
      const response = await authFetch('/pantry');
      if (!response.ok) throw new Error('Error al cargar el inventario');
      const data = await response.json();
      setIngredients(data);
    } catch (err) {
      setErrorIngredients(err.message);
    } finally {
      setLoadingIngredients(false);
    }
  };

  useEffect(() => {
    fetchPantry();
    fetchAllIngredients();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    try {
      if (!selectedIngredient.trim()) {
        setAddError('El nombre del ingrediente no puede estar vacío.');
        setAdding(false);
        return;
      }
      const existsInPantry = ingredients.some(i => i.name.toLowerCase() === selectedIngredient.toLowerCase());
      if (existsInPantry) {
        setAddError('¡ya tienes este ingrediente!');
        setAdding(false);
        return;
      }
      let ingredient = allIngredients.find(i => i.name.toLowerCase() === selectedIngredient.toLowerCase());
      if (!ingredient) {
        const bodyData = { name: selectedIngredient, category: ingredientCategory };
        const createRes = await authFetch('/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        if (!createRes.ok) throw new Error('No se pudo crear el ingrediente');
        ingredient = await createRes.json();
        setAllIngredients([...allIngredients, ingredient]);
      }
      // Ya no se debe enviar category al crear en pantry
      const response = await authFetch('/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientId: ingredient.id })
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setAddError('¡ya tienes este ingrediente!');
        } else {
          setAddError(data.message || 'No se pudo agregar');
        }
        setAdding(false);
        return;
      }
      setSelectedIngredient('');
      setIngredientCategory('frutas_verduras');
      setShowAdd(false);
      fetchPantry();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <div className="pantry-container">
      
      <div className="pantry-header flex flex-col items-center justify-center pt-5 gap-2">
        <img src="/logoB.png" alt="Logo" className="logoA-img mx-auto" />
        <h2 className="pantry-title text-center font-sans text-[2.5rem] tracking-[.03em] mb-9">miDESPENSA</h2>
      </div>
      <div className="pantry-float-actions">
        <button
          className="pantry-float-btn scan"
          title="Escanear"
          onClick={() => setShowScanner(true)}
        >
          <ScanLine size={28} />
        </button>
        <button className="pantry-float-btn add" title="Añadir" onClick={() => setShowAdd(true)}>
          <Plus size={28} />
        </button>
      </div>

      <div className="pantry-search">
        <span className="pantry-search-icon">
          <Search size={18} />
        </span>
        <input
          className="pantry-search-input"
          type="text"
          placeholder="Buscar ingrediente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="pantry-grid">
        <AnimatePresence>
          {filteredIngredients.map(item => {
            // La categoría ahora siempre viene de item.ingredient.category
            const category = item.ingredient && item.ingredient.category ? item.ingredient.category : '';
            const cat = CATEGORY_MAP[category] || {};
            return (
              <motion.div
                key={item.id}
                className={`pantry-item ${cat.class || ''}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <span className="pantry-item-bgicon">
                  {cat.icon && React.cloneElement(cat.icon, { size: 72 })}
                </span>
                <span className="pantry-item-title">
                  {item.name}
                </span>
                <span className="pantry-item-category">
                  {category ? category.replace(/_/g, ' ').toUpperCase() : 'SIN CATEGORÍA'}
                </span>
                <button className="pantry-item-delete" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={18} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {loadingIngredients && <div className="pantry-loading">Cargando inventario...</div>}
      {error && <div className="pantry-error">{error}</div>}
      {filteredIngredients.length === 0 && !loadingIngredients && !errorIngredients && (
        <div className="pantry-empty">No tienes ingredientes en tu inventario.</div>
      )}

      {showScanner && (
        <div className="pantry-modal-bg" onClick={() => setShowScanner(false)}>
          <div className="pantry-modal" onClick={e => e.stopPropagation()}>
            <button className="pantry-modal-close" onClick={() => setShowScanner(false)}>
              ×
            </button>
            <h3 className="pantry-modal-title">Escanear producto</h3>
            <Scanner
              onScan={setScanProduct}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>
      )}
      <AddIngredientPantry
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAdd}
        selectedIngredient={selectedIngredient}
        setSelectedIngredient={setSelectedIngredient}
        ingredientCategory={ingredientCategory}
        setIngredientCategory={setIngredientCategory}
        addError={addError}
        adding={adding}
        allIngredients={allIngredients}
      />
          <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
        </div>
      </div>
    </div>
  );
};

export default Pantry;