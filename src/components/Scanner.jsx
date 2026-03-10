import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

const Scanner = ({ onScan, onClose }) => {
    const handleSwitchCamera = async () => {
      if (isSwitchingCamera) return;
      setIsSwitchingCamera(true);
      setCameraError(null);
      setApiError(null);
      setProduct(null);
      setLoading(false);
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop().catch(() => {});
      }
      setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
      setIsSwitchingCamera(false);
    };
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);



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
};

export default Scanner;
