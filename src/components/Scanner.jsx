import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const Scanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  useEffect(() => {
    const config = { fps: 10, qrbox: 250 };
    setCameraError(null);
    setApiError(null);
    setProduct(null);
    setLoading(false);
    let qrTimeout = null;
    // Esperar a que el div esté montado
    if (!scannerRef.current) return;
    scannerRef.current.innerHTML = '';
    try {
      html5QrCodeRef.current = new Html5Qrcode(scannerRef.current.id);
      // Temporizador para mostrar error de QR tras 10 segundos
      qrTimeout = setTimeout(() => {
        setCameraError('No se detectó ningún código QR. Apunta la cámara a un código válido.');
      }, 10000);
      html5QrCodeRef.current
        .start(
          { facingMode: cameraFacing },
          config,
          async (decodedText, decodedResult) => {
            if (qrTimeout) clearTimeout(qrTimeout);
            if (onScan) onScan(decodedText);
            setLoading(true);
            setApiError(null);
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
                setApiError(data.error || 'Producto no encontrado');
              }
            } catch (err) {
              setApiError('Error al consultar el backend.');
              console.error('Error al consultar el backend:', err);
            }
            setLoading(false);
            html5QrCodeRef.current.stop();
          },
          (errorMessage) => {
            // Solo mostrar error de permisos, no de QR parse
            if (errorMessage && !errorMessage.includes('NotFoundException')) {
              setCameraError('No se pudo acceder a la cámara. Por favor, concede permisos o revisa la configuración del dispositivo.');
            }
            console.error('Error de cámara:', errorMessage);
          }
        )
        .catch((err) => {
          setCameraError('No se pudo iniciar el escáner. Es posible que la cámara no esté disponible o los permisos hayan sido denegados.');
          console.error('Error al iniciar el escáner:', err);
        });
    } catch (err) {
      setCameraError('Error inesperado al inicializar el escáner.');
      console.error('Error inesperado:', err);
    }
    return () => {
      if (qrTimeout) clearTimeout(qrTimeout);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [cameraFacing]);

  const handleSwitchCamera = async () => {
    if (isSwitchingCamera) return;
    setIsSwitchingCamera(true);
    setCameraError(null);
    setApiError(null);
    setProduct(null);
    setLoading(false);
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop().catch(() => {});
    }
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setIsSwitchingCamera(false);
  };

  return (
    <div className="pantry-modal-bg" onClick={onClose}>
      <div className="pantry-modal" onClick={e => e.stopPropagation()}>
        <button className="pantry-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="pantry-modal-title">Escanear producto</h3>
        {cameraError && (
          <p className="text-red-600 text-center font-semibold"><strong>Error de cámara:</strong> {cameraError}</p>
        )}
        {apiError && !cameraError && (
          <p className="text-red-600 text-center font-semibold"><strong>Error de API:</strong> {apiError}</p>
        )}
        {!product && !loading && !apiError && !cameraError && (
          <>
            <div className="flex justify-center items-center w-full"><div id="scanner" ref={scannerRef} className="w-[300px] h-[300px] pt-24 mx-auto"></div></div>
            <div className="text-center mt-4"><button className="btn-secondary" onClick={handleSwitchCamera} disabled={isSwitchingCamera}>Cambiar cámara ({cameraFacing === 'environment' ? 'Frontal' : 'Trasera'})</button></div>
          </>
        )}
        {loading && <p>Buscando producto...</p>}
        {product && (
          <div className="product-info">
            <h4>{product.name || 'Sin nombre'}</h4>
            {product.image && <img src={product.image} alt={product.name} className="w-[150px]" />}
            <p>Marca: {product.brand || 'Desconocida'}</p>
            <p>Categoría: {product.category || 'Desconocida'}</p>
          </div>
        )}
        <button className="btn-primary mt-4" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default Scanner;
