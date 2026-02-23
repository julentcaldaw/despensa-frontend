import React, { useState, useEffect } from "react";

const MyShops = ({ shops, setShops }) => {
  const [newShop, setNewShop] = useState("");
  const [addError, setAddError] = useState("");

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  }, [token, API_URL]);

  const handleAddShop = () => {
    const safeShops = Array.isArray(shops) ? shops : [];
    const trimmedShop = newShop.trim();
    setAddError("");
    console.log('Valor enviado al backend:', trimmedShop);
    if (!trimmedShop) {
      setAddError("El nombre de la tienda no puede estar vacío.");
      return;
    }
    if (safeShops.includes(trimmedShop)) {
      setAddError("Esa tienda ya existe en tu lista.");
      return;
    }
    fetch(`${API_URL}/myshops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ shop: trimmedShop })
    })
      .then(async res => {
        if (res.status === 409) {
          setAddError("Esa tienda ya existe en tu lista.");
          return null;
        }
        const data = await res.json();
        return data;
      })
      .then(data => {
        if (!data) return;
        if (data && data.error) {
          setAddError(data.error);
          return;
        }
        if (Array.isArray(data)) {
          setShops(data);
        } else {
          setShops([...safeShops, trimmedShop]);
        }
        setNewShop("");
      })
      .catch(err => {
        setAddError("Error al añadir tienda.");
        console.error('Error al añadir tienda:', err);
      });
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
        onChange={(e) => {
          setNewShop(e.target.value);
          setAddError("");
        }}
        placeholder="Añadir nueva tienda"
      />
      <button onClick={handleAddShop}>Añadir</button>
      {addError && <div style={{ color: 'red', marginTop: 8 }}>{addError}</div>}
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
