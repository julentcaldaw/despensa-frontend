import React from 'react';
import { Sprout } from 'lucide-react';

const PantryIngredientSelector = ({ ingredients, selected, onSelect }) => {
  if (!ingredients || ingredients.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      {ingredients.map((ingredient, idx) => {
        const isActive = selected.includes(ingredient);
        return (
          <button
            key={ingredient + idx}
            type="button"
            className={`pantry-list-item flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer group transition border-2 ${isActive ? 'bg-primary-soft border-primary font-semibold text-primary' : 'bg-white border-primary-soft text-gray-800'}`}
            style={{ minWidth: '90px', maxWidth: '140px', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            onClick={() => onSelect(ingredient)}
            aria-pressed={isActive}
          >
            <span className="mr-2">
              <Sprout size={22} className={isActive ? 'text-primary' : 'text-gray-400'} />
            </span>
            <span className="truncate">{ingredient}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PantryIngredientSelector;
