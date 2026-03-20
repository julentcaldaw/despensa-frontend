import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/auth';

const PurchaseHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No se encontró el usuario.');
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/miscompras/history/${userId}?include=shop,ingredient`);
        if (!res.ok) throw new Error('Error al cargar el historial');
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el historial');
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Historial de Ingredientes Comprados</h2>
      <ul className="divide-y divide-gray-200">
        {history.length === 0 ? (
          <li className="py-4 text-gray-500 text-center">No hay compras registradas.</li>
        ) : (
          history.map((item, idx) => (
            <li key={idx} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-semibold text-gray-700">{item.ingredient?.name || item.ingredientName}</span>
                <span className="ml-2 text-gray-500">x{item.quantity}</span>
              </div>
              <div className="text-gray-400 text-sm mt-1 md:mt-0">
                {new Date(item.purchaseDate).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
              <div className="text-blue-600 font-medium mt-1 md:mt-0">
                {item.shop?.name || item.supermarket}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PurchaseHistory;
