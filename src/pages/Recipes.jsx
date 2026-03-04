import React, { useEffect, useState } from 'react';
import { translateText } from '../utils/translate';
import { useAuth } from '../utils/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import RecipeDetail from '../components/RecipeDetail';

const Recipes = ({ currentTab, onTabChange }) => {
  const { user, loading, error } = useAuth();
  if (!user && !loading) {
    return <div className="user-profile">Inicia sesión para ver tus recetas.</div>;
  }

  const [recipes, setRecipes] = useState([]);
  const [translatedRecipes, setTranslatedRecipes] = useState([]);
  const [translatingIngredients, setTranslatingIngredients] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [translating, setTranslating] = useState(false);
    const [loadingRecipes, setLoadingRecipes] = useState(true);
    const [errorRecipes, setErrorRecipes] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;

  const fetchRecipes = async () => {
    setLoadingRecipes(true);
    setErrorRecipes('');
    setTranslating(true);
    setTranslatingIngredients(true);
    try {
      const response = await fetch(`https://api.spoonacular.com/recipes/random?number=3&apiKey=${SPOONACULAR_API_KEY}&language=es`);
      if (response.status === 402) {
        setErrorRecipes('Has consumido el límite de búsquedas');
        setLoadingRecipes(false);
        setTranslating(false);
        setTranslatingIngredients(false);
        return;
      }
      if (!response.ok) throw new Error('Error al buscar recetas');
      const data = await response.json();
      if (Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        const traducciones = await Promise.all(data.recipes.map(async (r) => {
          const title = await translateText(r.title || r.name || '');
          let translatedIngredients = [];
          if (r.usedIngredients && r.usedIngredients.length > 0) {
            translatedIngredients = await Promise.all(r.usedIngredients.map(async (i) => {
              const nameEs = await translateText(i.name);
              return { ...i, name: nameEs };
            }));
          } else if (r.extendedIngredients && r.extendedIngredients.length > 0) {
            translatedIngredients = await Promise.all(r.extendedIngredients.map(async (i) => {
              const nameEs = await translateText(i.name);
              return { ...i, name: nameEs };
            }));
          }
          return { ...r, title, translatedIngredients };
        }));
        setTranslatedRecipes(traducciones);
      } else {
        setRecipes([]);
        setTranslatedRecipes([]);
        setErrorRecipes('La respuesta del servidor no es válida.');
      }
    } catch (err) {
      setErrorRecipes(err.message);
    } finally {
      setLoadingRecipes(false);
      setTranslating(false);
      setTranslatingIngredients(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleCustomSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setErrorRecipes('');
    setTranslating(true);
    setTranslatingIngredients(true);
    try {
      const ingredientsArr = customIngredients.split(',').map(i => i.trim()).filter(Boolean);
      const ingredientsParam = ingredientsArr.join(',');
      let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsParam)}&number=3&apiKey=${SPOONACULAR_API_KEY}&language=es`;

      const response = await fetch(url);
      if (response.status === 402) {
        setErrorRecipes('Has consumido el límite de búsquedas');
        setSearching(false);
        setTranslating(false);
        setTranslatingIngredients(false);
        return;
      }
      if (!response.ok) throw new Error('Error al buscar recetas personalizadas');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecipes(data);
        const traducciones = await Promise.all(data.map(async (r) => {
          const title = await translateText(r.title || r.name || '');
          let translatedIngredients = [];
          if (r.usedIngredients && r.usedIngredients.length > 0) {
            translatedIngredients = await Promise.all(r.usedIngredients.map(async (i) => {
              const nameEs = await translateText(i.name);
              return { ...i, name: nameEs };
            }));
          } else if (r.extendedIngredients && r.extendedIngredients.length > 0) {
            translatedIngredients = await Promise.all(r.extendedIngredients.map(async (i) => {
              const nameEs = await translateText(i.name);
              return { ...i, name: nameEs };
            }));
          }
          return { ...r, title, translatedIngredients };
        }));
        setTranslatedRecipes(traducciones);
      } else {
        setRecipes([]);
        setTranslatedRecipes([]);
        setErrorRecipes('La respuesta del servidor no es válida.');
      }
    } catch (err) {
      setErrorRecipes(err.message);
    } finally {
      setSearching(false);
      setTranslating(false);
      setTranslatingIngredients(false);
    }
  };

  const handleFavorite = async (recipe) => {
    alert('Funcionalidad de favoritos solo disponible con backend propio.');
  };

  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleDifficultyChange = (e) => setSelectedDifficulty(e.target.value);

  return (
    <div className="pantry-bg-main">
      <div className="pantry-main-card">
        <div className="pantry-container">
          <div className="pantry-header flex flex-col items-center justify-center pt-5">
            <img src="/logoB.png" alt="Logo" className="logoA-img mx-auto mb-2" />
            <h2 className="pantry-title text-center font-sans text-[2.5rem] tracking-[.03em] mb-9">misRECETAS</h2>
          </div>
          <div className="recipes-filters">
            <select className="recipes-select" value={selectedTime} onChange={handleTimeChange}>
              <option value="">Tiempo</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hora</option>
            </select>
            <select className="recipes-select" value={selectedDifficulty} onChange={handleDifficultyChange}>
              <option value="">Dificultad</option>
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <form onSubmit={handleCustomSearch} className="recipes-form">
            <input
              type="text"
              placeholder="Añade los ingredientes"
              value={customIngredients}
              onChange={e => setCustomIngredients(e.target.value)}
              className="recipes-input"
            />
            <button type="submit" disabled={searching} className="recipes-btn">
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {loadingRecipes ? (
            <div className="recipes-loading">Cargando recetas...</div>
          ) : errorRecipes ? (
            <div className="recipes-error">{errorRecipes}</div>
          ) : (translating || translatingIngredients) ? (
            <div className="recipes-loading">Traduciendo recetas e ingredientes...</div>
          ) : translatedRecipes.length === 0 ? (
            <p className="recipes-empty">No se encontraron recetas.</p>
          ) : (
            <ul className="recipes-list">
              {translatedRecipes
                .filter((r) => {
                  const cookTime = r.readyInMinutes || r.cookingMinutes || r.preparationMinutes || null;
                  if (selectedTime && cookTime) {
                    if (parseInt(selectedTime) !== cookTime && !(selectedTime === '60' && cookTime >= 60)) {
                      return false;
                    }
                  }
                  if (selectedDifficulty) {
                    let numIngredients = r.translatedIngredients ? r.translatedIngredients.length : 0;
                    if (numIngredients === 0 && r.extendedIngredients) numIngredients = r.extendedIngredients.length;
                    if (selectedDifficulty === 'facil' && numIngredients > 5) return false;
                    if (selectedDifficulty === 'media' && (numIngredients <= 5 || numIngredients > 10)) return false;
                    if (selectedDifficulty === 'dificil' && numIngredients <= 10) return false;
                  }
                  return true;
                })
                .map((r) => {
                  const title = r.title || r.name || 'Sin título';
                  const image = r.image || r.imageUrl || '';
                  let ingredientsList = '';
                  if (r.translatedIngredients && r.translatedIngredients.length > 0) {
                    ingredientsList = r.translatedIngredients.map(i => {
                      let info = i.name;
                      if (i.amount) info = `${i.amount} ${i.unit || ''} ${info}`;
                      return info;
                    }).join(', ');
                  }
                  const cookTime = r.readyInMinutes || r.cookingMinutes || r.preparationMinutes || null;
                  let dificultad = '';
                  let numIngredients = r.translatedIngredients ? r.translatedIngredients.length : 0;
                  if (numIngredients === 0 && r.extendedIngredients) numIngredients = r.extendedIngredients.length;
                  if (numIngredients > 10) dificultad = 'Difícil';
                  else if (numIngredients > 5) dificultad = 'Media';
                  else dificultad = 'Fácil';
                  return (
                    <li key={r.id || r.recipeId} className="recipes-card" onClick={() => setSelectedRecipe(r)} style={{ cursor: 'pointer' }}>
                      <div className="recipes-card-content">
                        <img src={image} alt={title} className="recipes-card-img" />
                        <div>
                          <strong className="recipes-card-title">{title}</strong>
                          <div className="recipes-card-ingredients">
                            Ingredientes: {ingredientsList ? ingredientsList : 'No disponible'}
                          </div>
                          {cookTime && (
                            <div className="recipes-card-time">
                              Tiempo: {cookTime} min
                            </div>
                          )}
                          <div className="recipes-card-difficulty">
                            Dificultad: {dificultad}
                          </div>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleFavorite(r); }} className="recipes-fav-btn">❤️ Favorito</button>
                    </li>
                  );
                })}
            </ul>
          )}
          {selectedRecipe && (
            <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
          )}
          <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
        </div>
      </div>
    </div>
  );
};

export default Recipes;
