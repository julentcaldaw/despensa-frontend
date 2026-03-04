import React, { useState, useEffect } from "react";

const MyShops = ({ show, onClose, shops = [], setShops }) => {
  const [newShop, setNewShop] = useState("");
  const [addError, setAddError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!show) return;
    if (!token) return;
    fetch(`${API_URL}/myshops`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setShops(data);
      })
      .catch(err => console.error('Error al obtener tiendas:', err));
  }, [token, API_URL, show]);

  if (!show) return null;

  const handleAddShop = () => {
    const safeShops = Array.isArray(shops) ? shops : [];
    const trimmedShop = newShop.trim().toLowerCase();
    setAddError("");
    console.log('Valor enviado al backend:', trimmedShop);
    if (!trimmedShop) {
      setAddError("El nombre de la tienda no puede estar vacío.");
      return;
    }
    if (safeShops.map(s => s.name.toLowerCase()).includes(trimmedShop)) {
      setAddError("Esa tienda ya existe en tu lista.");
      return;
    }
    fetch(`${API_URL}/myshops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ shop: trimmedShop }),
      credentials: 'include'
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

  const handleDeleteShop = (shopName) => {
    const shopNameLower = shopName.toLowerCase();
    fetch(`${API_URL}/myshops/${encodeURIComponent(shopNameLower)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setShops(data);
        } else {
          setShops(shops.filter((s) => s.name.toLowerCase() !== shopNameLower));
        }
      })
      .catch(err => console.error('Error al eliminar tienda:', err));
  };

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="pantry-modal-title">Mis tiendas</h3>
        <form className="pantry-modal-form" onSubmit={e => { e.preventDefault(); handleAddShop(); }}>
          <input
            className="pantry-input"
            type="text"
            value={newShop}
            onChange={e => { setNewShop(e.target.value); setAddError(""); }}
            placeholder="Añadir nueva tienda"
            autoFocus
          />
          {addError && <div className="pantry-error pantry-error-primary">{addError}</div>}
          <button className="btn-primary" type="submit">Añadir</button>
        </form>
        <ul className="pantry-list flex justify-center items-center" style={{ paddingLeft: 0, marginLeft: 'auto', marginRight: 'auto' }}>
          {shops && shops.length > 0 ? (
            <div className="bg-white rounded-xl border-2" style={{ borderColor: 'var(--primary)', margin: '0 auto', maxWidth: '320px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', position: 'relative' }}>
              {shops.map((shop) => (
                <li key={shop.id || shop.name} className="pantry-list-item flex items-center justify-center py-3 px-5 mb-2 rounded-lg w-full cursor-pointer group hover:bg-primary-soft transition"
                  style={{ border: 'none', paddingLeft: 0 }}
                  onClick={() => setConfirmDeleteId(shop.id)}
                >
                  <span className="font-semibold text-gray-800 mx-auto transition group-hover:text-red-600 group-hover:line-through">
                    {shop.name}
                  </span>
                  
                </li>
              ))}
            </div>
          ) : (
            <li className="pantry-list-item">No tienes tiendas guardadas.</li>
          )}
        </ul>
        {confirmDeleteId && (
          <div className="w-full mb-2 flex flex-col items-center max-w-xs mx-auto">
            <span className="mb-2 text-red-600 font-semibold">¿Eliminar esta tienda?</span>
            <div className="flex gap-3">
              <button className="font-semibold px-3 py-1 text-lg text-primary bg-transparent border-none" onClick={e => { e.stopPropagation(); handleDeleteShop(shops.find(s => s.id === confirmDeleteId).name); setConfirmDeleteId(null); }}>Sí, eliminar</button>
              <button className="font-semibold px-3 py-1 text-lg text-primary bg-transparent border-none" onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShops;
