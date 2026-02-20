import { Plus, Search, Trash2, Leaf, Drumstick, Egg, Soup, Cookie, ScanLine, Salad, Fish, Coffee } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import AddIngredient from '../components/AddIngredient';
import Scanner from '../components/Scanner';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';

const CATEGORY_MAP = {
  lacteos_huevos: { class: 'category-dairy', icon: <Egg /> },
  frutas_verduras: { class: 'category-veg', icon: <Leaf /> },
  carnes_pescados: { class: 'category-meat', icon: <Fish /> },
  despensa_granos: { class: 'category-pantry', icon: <Coffee /> },
  condimentos_aceites: { class: 'category-condiment', icon: <Salad /> },
  snacks_extras: { class: 'category-snack', icon: <Cookie /> }
};

const Pantry = ({ currentTab, onTabChange }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const fetchAllIngredients = async () => {
    try {
      const response = await authFetch('/ingredients');
      if (!response.ok) throw new Error('Error al cargar ingredientes');
      const data = await response.json();
      setAllIngredients(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPantry = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch('/pantry');
      if (!response.ok) throw new Error('Error al cargar el inventario');
      const data = await response.json();
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      const response = await authFetch('/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientId: ingredient.id, category: ingredientCategory })
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
    <div className="pantry-container">
      {showScanner && (
        <Scanner
          show={showScanner}
          onClose={() => setShowScanner(false)}
          setScanProduct={setScanProduct}
          scanCategory={scanCategory}
        />
      )}

      <div className="pantry-header">
        <h2 className="pantry-title">miDESPENSA</h2>
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
            const cat = CATEGORY_MAP[item.category] || {};
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
                <div className="pantry-item-title">{item.name}</div>
                <span className="pantry-item-category">
                  {item.category ? item.category.replace(/_/g, ' ').toUpperCase() : 'SIN CATEGORÍA'}
                </span>
                <button className="pantry-item-delete" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={18} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {loading && <div className="pantry-loading">Cargando inventario...</div>}
      {error && <div className="pantry-error">{error}</div>}
      {filteredIngredients.length === 0 && !loading && !error && (
        <div className="pantry-empty">No tienes ingredientes en tu inventario.</div>
      )}

      <AddIngredient
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
  );
};

export default Pantry;