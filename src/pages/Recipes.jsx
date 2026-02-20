import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';
import BottomNavigation from '../components/BottomNavigation';

const Recipes = ({ currentTab, onTabChange }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authFetch('/recipes');
      if (!response.ok) throw new Error('Error al buscar recetas');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleCustomSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError('');
    try {
      const ingredientsArr = customIngredients.split(',').map(i => i.trim()).filter(Boolean);
      const response = await authFetch('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: ingredientsArr })
      });
      if (!response.ok) throw new Error('Error al buscar recetas personalizadas');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleFavorite = async (recipe) => {
    try {
      const response = await authFetch('/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipe.id, title: recipe.title, image: recipe.image })
      });
      if (!response.ok) throw new Error('No se pudo agregar a favoritos');
      alert('Receta agregada a favoritos');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTimeChange = (e) => setSelectedTime(e.target.value);
  const handleDifficultyChange = (e) => setSelectedDifficulty(e.target.value);

  return (
    <div className="recipes-bg">
      <div className="recipes-container">
        <h2 className="recipes-title">Recetas sugeridas</h2>
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
        {loading ? (
          <div className="recipes-loading">Cargando recetas...</div>
        ) : error ? (
          <div className="recipes-error">{error}</div>
        ) : recipes.length === 0 ? (
          <p className="recipes-empty">No se encontraron recetas.</p>
        ) : (
          <ul className="recipes-list">
            {recipes.map((r) => (
              <li key={r.id} className="recipes-card">
                <div className="recipes-card-content">
                  <img src={r.image} alt={r.title} className="recipes-card-img" />
                  <div>
                    <strong className="recipes-card-title">{r.title}</strong>
                    <div className="recipes-card-ingredients">
                      Usados: {r.usedIngredients?.map(i => i.name).join(', ') || '-'}<br />
                      Faltan: {r.missedIngredients?.map(i => i.name).join(', ') || '-'}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleFavorite(r)} className="recipes-fav-btn">❤️ Favorito</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Recipes;
