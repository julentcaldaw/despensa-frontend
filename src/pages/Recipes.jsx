import React, { useEffect, useState } from 'react';
import PantryIngredientSelector from '../components/PantryIngredientSelector';
import { Coffee } from 'lucide-react';
import { authFetch } from '../utils/auth';
import { translateText } from '../utils/translate';
import { useAuth } from '../utils/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import RecipeDetail from '../components/RecipeDetail';
import { Heart } from 'lucide-react';


const Recipes = ({ currentTab, onTabChange }) => {
    const [pantryIngredients, setPantryIngredients] = useState([]);
    const [showPantrySelector, setShowPantrySelector] = useState(false);
    const [selectedPantryIngredients, setSelectedPantryIngredients] = useState([]);
    const { user, loading, error } = useAuth();
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

    // Edamam API credentials desde .env
    const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
    const EDAMAM_API_KEY = process.env.REACT_APP_EDAMAM_API_KEY;

    if (!user && !loading) {
      return <div className="user-profile">Inicia sesión para ver tus recetas.</div>;
    }

  const fetchRecipes = async () => {
    setLoadingRecipes(true);
    setErrorRecipes('');
    setTranslating(true);
    setTranslatingIngredients(true);
    try {
      // Consultar recetas al backend (por defecto: "pollo")
      const ingredients = ['pollo'];
      console.log('Enviando ingredientes:', ingredients);
      const response = await authFetch('/recipes/desde-lista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      if (!response.ok) throw new Error('Error al buscar recetas');
      if (Array.isArray(data)) {
        setRecipes(data);
        const traducciones = await Promise.all(data.map(async (r) => {
          const title = await translateText(r.title || r.name || r.label || '');
          let translatedIngredients = [];
          if (r.ingredients && r.ingredients.length > 0) {
            translatedIngredients = await Promise.all(r.ingredients.map(async (i) => {
              const nameEs = await translateText(i.name || i);
              return { name: nameEs };
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
    // Obtener ingredientes de la despensa al cargar la página
    const fetchPantryIngredients = async () => {
      try {
        const response = await authFetch('/pantry');
        if (!response.ok) throw new Error('Error al cargar la despensa');
        const data = await response.json();
        // Extraer solo los nombres
        setPantryIngredients(data.map(i => i.name));
      } catch (err) {
        setPantryIngredients([]);
      }
    };
    fetchPantryIngredients();
  }, []);

  const handleCustomSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setErrorRecipes('');
    setTranslating(true);
    setTranslatingIngredients(true);
    try {
      const ingredientsArr = customIngredients.split(',').map(i => i.trim()).filter(Boolean);
      console.log('Enviando ingredientes:', ingredientsArr);
      const response = await authFetch('/recipes/desde-lista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientsArr }),
      });
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      if (!response.ok) throw new Error('Error al buscar recetas personalizadas');
      if (Array.isArray(data)) {
        setRecipes(data);
        const traducciones = await Promise.all(data.map(async (r) => {
          const title = await translateText(r.title || r.name || r.label || '');
          let translatedIngredients = [];
          if (r.ingredients && r.ingredients.length > 0) {
            translatedIngredients = await Promise.all(r.ingredients.map(async (i) => {
              const nameEs = await translateText(i.name || i);
              return { name: nameEs };
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
      {/* Overlay para selección de ingredientes */}
      {showPantrySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
            <h3 className="text-xl font-bold mb-4 text-center">Selecciona ingredientes de tu despensa</h3>
            <PantryIngredientSelector
              ingredients={pantryIngredients}
              selected={selectedPantryIngredients}
              onSelect={ingredient => {
                setSelectedPantryIngredients(prev =>
                  prev.includes(ingredient)
                    ? prev.filter(i => i !== ingredient)
                    : [...prev, ingredient]
                );
              }}
            />
            <div className="flex flex-col items-center gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 font-bold w-full"
                onClick={() => {
                  setShowPantrySelector(false);
                  setCustomIngredients(selectedPantryIngredients.join(", "));
                }}
                disabled={selectedPantryIngredients.length === 0}
              >Buscar</button>
              <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 w-full" onClick={() => setShowPantrySelector(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <div className="pantry-main-card">
        <div className="pantry-container">
          <div className="pantry-header flex flex-col items-center justify-center pt-5">
            <img src="/logoB.png" alt="Logo" className="logoA-img mx-auto mb-2" />
            <h2 className="pantry-title text-center font-sans text-[2.5rem] tracking-[.03em] mb-9">misRECETAS</h2>
          </div>
          {/* ...eliminada la lista de ingredientes del pantry fuera del overlay... */}
          <div className="recipes-filters flex items-center gap-2">
            <button
              type="button"
              className="recipes-select flex items-center gap-1"
              onClick={() => {
                setShowPantrySelector(true);
              }}
            >
              Ingredientes despensa
            </button>
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
              placeholder="Añade lo que necesites"
              value={customIngredients}
              onChange={e => setCustomIngredients(e.target.value)}
              className="recipes-input"
            />
            <button type="submit" disabled={searching} className="recipes-btn">
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {/* Mostrar ingredientes usados si se ha hecho búsqueda por despensa */}
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
                      <button onClick={(e) => { e.stopPropagation(); handleFavorite(r); }} className="recipes-fav-btn"><Heart size={20} /></button>
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