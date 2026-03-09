import React, { useState } from 'react';
import { translateText } from '../utils/translate';

const RecipeDetail = ({ recipe, onClose }) => {
    console.log('RecipeDetail - recipe:', recipe);
  const summary = recipe.description || recipe.summary || 'No hay descripción disponible.';
  const ingredients = Array.isArray(recipe.translatedIngredients) && recipe.translatedIngredients.length > 0
    ? recipe.translatedIngredients
    : Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const prepTime = recipe.prepTime || recipe.readyInMinutes || recipe.cookingMinutes || recipe.preparationMinutes || null;
  const dietRestrictions = Array.isArray(recipe.dietRestrictions) ? recipe.dietRestrictions : [];
  const dietPreferences = Array.isArray(recipe.dietPreferences) ? recipe.dietPreferences : [];
  const nutrition = recipe.nutrition || null;
  const title = recipe.title || recipe.name || 'Sin título';

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>×</button>
        <h3 className="pantry-modal-title">{title}</h3>
        {recipe.image && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <img src={recipe.image} alt={title} className="recipe-detail-img mb-4 rounded-xl" style={{ maxWidth: '320px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }} />
          </div>
        )}
        {summary && summary !== 'No hay descripción disponible.' && (
          <div className="recipe-detail-summary mb-4">{summary}</div>
        )}
        <h4 className="font-semibold mb-2">Ingredientes:</h4>
        <ul className="pantry-list mb-4">
          {ingredients.length > 0
            ? ingredients.map((ing, idx) => (
                <li key={ing.id || idx} className="pantry-list-item">
                  {ing.amount ? `${ing.amount} ` : ing.quantity ? `${ing.quantity} ` : ''}
                  {ing.unit ? `${ing.unit} ` : ''}
                  {ing.name}
                </li>
              ))
            : <li>No hay ingredientes disponibles.</li>
          }
        </ul>
        {prepTime && (
          <div className="mb-2"><strong>Tiempo de preparación:</strong> {prepTime} minutos</div>
        )}
        {steps && Array.isArray(steps) && steps.length > 0 && (
          <div className="mb-2">
            <strong>Paso a paso de la receta:</strong>
            <ol className="list-decimal ml-6">
              {steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        {dietRestrictions && Array.isArray(dietRestrictions) && dietRestrictions.length > 0 && (
          <div className="mb-2">
            <strong>Restricciones dietéticas:</strong> {dietRestrictions.join(', ')}
          </div>
        )}
        {dietPreferences && Array.isArray(dietPreferences) && dietPreferences.length > 0 && (
          <div className="mb-2">
            <strong>Preferencias dietéticas:</strong> {dietPreferences.join(', ')}
          </div>
        )}
        {nutrition && Object.keys(nutrition).length > 0 && (
          <div className="mb-2">
            <strong>Información nutricional:</strong>
            <ul className="ml-6">
              {Object.entries(nutrition).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-2 mb-2">
          <div><strong>Dificultad:</strong> {(() => {
            let numIngredients = ingredients.length;
            if (numIngredients > 10) return 'Difícil';
            if (numIngredients > 5) return 'Media';
            return 'Fácil';
          })()}</div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
