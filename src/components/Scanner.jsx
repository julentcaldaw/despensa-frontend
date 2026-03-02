import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const Scanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const config = { fps: 10, qrbox: 250 };
    html5QrCodeRef.current = new Html5Qrcode('scanner');
    html5QrCodeRef.current.start(
      { facingMode: 'environment' },
      config,
      async (decodedText, decodedResult) => {
        if (onScan) onScan(decodedText);
        setLoading(true);
        setError(null);
        try {
          const apiUrl = process.env.REACT_APP_API_URL;
          const res = await fetch(`${apiUrl}/barcode`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ barcode: decodedText }),
            credentials: 'include'
          });
          const data = await res.json();
          if (res.ok && data.name) {
            setProduct(data);
          } else {
            setError(data.error || 'Producto no encontrado');
          }
        } catch (err) {
          setError('Error al consultar el backend');
        }
        setLoading(false);
        html5QrCodeRef.current.stop();
      },
      (errorMessage) => {
      }
    );
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="pantry-modal-title">Escanear producto</h3>
        {!product && !loading && !error && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <div id="scanner" ref={scannerRef} style={{ width: '300px', height: '300px', paddingTop: '6rem', margin: '0 auto' }}></div>
          </div>
        )}
        {loading && <p>Buscando producto...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {product && (
          <div className="product-info">
            <h4>{product.name || 'Sin nombre'}</h4>
            {product.image && <img src={product.image} alt={product.name} style={{ width: '150px' }} />}
            <p>Marca: {product.brand || 'Desconocida'}</p>
            <p>Categoría: {product.category || 'Desconocida'}</p>
          </div>
        )}
        <button className="btn-primary" onClick={onClose} style={{marginTop:'1rem'}}>Cerrar</button>
      </div>
    </div>
  );
};

export default Scanner;
