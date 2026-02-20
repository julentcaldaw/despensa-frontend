import React from 'react';
import { X } from 'lucide-react';

const AddIngredientModal = ({
  show,
  onClose,
  onSubmit,
  selectedIngredient,
  setSelectedIngredient,
  ingredientCategory,
  setIngredientCategory,
  addError,
  adding,
  allIngredients
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
            onChange={e => setSelectedIngredient(e.target.value)}
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

export default AddIngredientModal;
