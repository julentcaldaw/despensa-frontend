
import React from 'react';
import { X } from 'lucide-react';
import { authFetch } from '../utils/auth';

const AddIngredientShop = ({
  show,
  onClose,
  onSubmit,
  selectedIngredient,
  setSelectedIngredient,
  ingredientCategory,
  setIngredientCategory,
  selectedShop,
  setSelectedShop,
  addError,
  adding,
  allIngredients,
  shops
}) => {
  if (!show) return null;
  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="pantry-modal-title">Añadir Ingrediente</h3>
        <form onSubmit={onSubmit} className="pantry-modal-form">
          <input
            list="ingredients-list"
            placeholder="Nombre del ingrediente"
            value={selectedIngredient}
            onChange={async e => {
              setSelectedIngredient(e.target.value);
              if (e.target.value.trim().length > 1) {
                try {
                  const res = await authFetch(`/ingredients/category?name=${encodeURIComponent(e.target.value)}`);
                  if (res.ok) {
                    const data = await res.json();
                    if (data && data.category) {
                      setIngredientCategory(data.category);
                    }
                  }
                } catch (err) {}
              }
            }}
            required
            className="pantry-input"
            autoFocus
          />
          <datalist id="ingredients-list">
            {allIngredients.map(i => (
              <option key={i.id} value={i.name} />
            ))}
          </datalist>
          <select
            value={ingredientCategory}
            onChange={e => setIngredientCategory(e.target.value)}
            className="pantry-input"
            required
          >
            <option value="frutas_verduras">Frutas y Verduras</option>
            <option value="carnes_pescados">Carnes y Pescados</option>
            <option value="lacteos_huevos">Lácteos y Huevos</option>
            <option value="despensa_granos">Despensa y Granos</option>
            <option value="condimentos_aceites">Condimentos y Aceites</option>
            <option value="snacks_extras">Snacks y Extras</option>
          </select>
          <select
            value={selectedShop}
            onChange={e => setSelectedShop(e.target.value)}
            className="pantry-input"
            required
          >
            <option value="">Selecciona una tienda</option>
            {shops && shops.map(shop => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          {selectedIngredient && ingredientCategory === '' && (
            <div className="pantry-error pantry-error-primary">No se encontró la categoría, selecciónala manualmente.</div>
          )}
          {addError && (
            <div className="pantry-error pantry-error-primary">{addError}</div>
          )}
          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientShop;
