import React, { useState } from 'react';
import { translateText } from '../utils/translate';

const RecipeDetail = ({ recipe, onClose }) => {
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [translatedIngredients, setTranslatedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchAndTranslate = async () => {
      setLoading(true);
      try {
        let summary = recipe.summary;
        let ingredients = recipe.extendedIngredients || recipe.ingredients || [];
        if ((!summary || ingredients.length === 0) && recipe.id) {
          const apiKey = process.env.REACT_APP_SPOONACULAR_API_KEY;
          const res = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}&language=es`);
          if (res.ok) {
            const data = await res.json();
            summary = data.summary;
            ingredients = data.extendedIngredients || [];
          }
        }
        if (summary) {
          const translated = await translateText(summary);
          setTranslatedSummary(translated);
        } else {
          setTranslatedSummary('No hay resumen disponible.');
        }
        if (ingredients.length > 0) {
          const translatedIngs = await Promise.all(
            ingredients.map(async (ing) => {
              const nameEs = await translateText(ing.name);
              return { ...ing, name: nameEs };
            })
          );
          setTranslatedIngredients(translatedIngs);
        } else {
          setTranslatedIngredients([]);
        }
      } catch {
        setTranslatedSummary('No se pudo traducir el resumen.');
        setTranslatedIngredients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTranslate();
  }, [recipe]);

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>×</button>
        <h3 className="pantry-modal-title">{recipe.title}</h3>
        <img src={recipe.image} alt={recipe.title} className="recipe-detail-img mx-auto mb-4 rounded-xl" style={{ maxWidth: '320px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }} />
        {loading ? (
          <div className="recipes-loading">Traduciendo resumen e ingredientes...</div>
        ) : (
          <>
            <div className="recipe-detail-summary mb-4" dangerouslySetInnerHTML={{ __html: translatedSummary || recipe.summary }} />
            <h4 className="font-semibold mb-2">Ingredientes:</h4>
            <ul className="pantry-list mb-4">
              {translatedIngredients.length > 0
                ? translatedIngredients.map((ing, idx) => (
                    <li key={ing.id || idx} className="pantry-list-item">
                      {ing.amount ? `${ing.amount} ` : ''}
                      {ing.unit ? `${ing.unit} ` : ''}
                      {ing.name}
                    </li>
                  ))
                : <li>No hay ingredientes disponibles.</li>
              }
            </ul>
            <div className="flex flex-col gap-2 mb-2">
              <div><strong>Tiempo de cocinado:</strong> {recipe.readyInMinutes || recipe.cookingMinutes || recipe.preparationMinutes ? `${recipe.readyInMinutes || recipe.cookingMinutes || recipe.preparationMinutes} min` : 'No disponible'}</div>
              <div><strong>Dificultad estimada:</strong> {(() => {
                let numIngredients = translatedIngredients.length;
                if (numIngredients > 10) return 'Difícil';
                if (numIngredients > 5) return 'Media';
                return 'Fácil';
              })()}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
