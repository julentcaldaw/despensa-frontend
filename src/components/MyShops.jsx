import React, { useState, useEffect } from "react";

const MyShops = ({ shops, setShops }) => {
  const [newShop, setNewShop] = useState("");

  // Obtener token JWT desde localStorage (ajusta si lo guardas en otro sitio)
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Obtener tiendas del backend al montar
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/myshops`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setShops(data);
      })
      .catch(err => console.error('Error al obtener tiendas:', err));
    // eslint-disable-next-line
  }, [token, API_URL]);

  const handleAddShop = () => {
    if (newShop.trim() && !shops.includes(newShop.trim())) {
      fetch(`${API_URL}/myshops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shop: newShop.trim() })
      })
        .then(res => res.json())
        .then(data => {
          // Si el backend responde con la lista actualizada:
          if (Array.isArray(data)) {
            setShops(data);
          } else {
            setShops([...shops, newShop.trim()]);
          }
          setNewShop("");
        })
        .catch(err => console.error('Error al añadir tienda:', err));
    }
  };

  const handleDeleteShop = (shop) => {
    fetch(`${API_URL}/myshops/${encodeURIComponent(shop)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Si el backend responde con la lista actualizada:
        if (Array.isArray(data)) {
          setShops(data);
        } else {
          setShops(shops.filter((s) => s !== shop));
        }
      })
      .catch(err => console.error('Error al eliminar tienda:', err));
  };

  return (
    <div className="shops-section">
      <h3>Mis tiendas</h3>
      <input
        type="text"
        value={newShop}
        onChange={(e) => setNewShop(e.target.value)}
        placeholder="Añadir nueva tienda"
      />
      <button onClick={handleAddShop}>Añadir</button>
      <ul>
        {shops && shops.length > 0 ? (
          shops.map((shop) => (
            <li key={shop}>
              {shop}
              <button onClick={() => handleDeleteShop(shop)} title="Eliminar">🗑</button>
            </li>
          ))
        ) : (
          <li>No tienes tiendas guardadas.</li>
        )}
      </ul>
    </div>
  );
};

export default MyShops;
