import React from 'react';

const PantryIngredientSelector = ({ ingredients, selected, onSelect, onSearch, onClose }) => {
  if (!ingredients || ingredients.length === 0) return null;
  return (
    <div className="pantry-modal-bg">
      <div className="pantry-modal" style={{ maxWidth: '600px', minWidth: '380px', width: '100%', margin: '2.5rem auto', position: 'relative', background: '#fff', padding: '2.5rem 2.5rem' }}>
        {onClose && (
          <button className="pantry-modal-close" onClick={onClose}>×</button>
        )}
        <h3 className="pantry-modal-title">Selecciona ingredientes de tu despensa</h3>
        <div
          className="w-full mb-8"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
            justifyItems: 'center',
            alignItems: 'center',
            padding: '0.5rem 0',
          }}
        >
          {ingredients.map((ingredient, idx) => {
            const isActive = selected.includes(ingredient);
            return (
              <button
                key={ingredient + idx}
                type="button"
                className={`pantry-list-item flex items-center justify-center py-6 px-2.5 rounded-3xl cursor-pointer group transition`}
                style={{
                  flex: '1 1 140px',
                  minWidth: '120px',
                  maxWidth: '180px',
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  background: isActive ? 'var(--primary-soft)' : '#fff',
                  border: '1px solid var(--primary)',
                  color: isActive ? 'var(--primary-dark)' : 'var(--text-main)',
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: '1rem',
                  paddingTop: '0.75rem', 
                  paddingBottom: '0.75rem',
                }}
                onClick={() => onSelect(ingredient)}
                aria-pressed={isActive}
              >
                <span className="truncate" style={{ color: 'var(--primary-dark)' }}>{ingredient}</span>
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: '0.5rem' }}
          onClick={onSearch}
          disabled={selected.length === 0}
        >Buscar</button>
      </div>
    </div>
  );
};

export default PantryIngredientSelector;
