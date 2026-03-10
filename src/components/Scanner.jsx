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
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }
    const scannerElement = document.getElementById('scanner');
    if (!scannerElement) {
      setCameraError('No se encontró el elemento del escáner en el DOM.');
      return;
    }
    try {
      html5QrCodeRef.current = new Html5Qrcode('scanner');
      html5QrCodeRef.current
        .start(
          { facingMode: cameraFacing },
          config,
          async (decodedText, decodedResult) => {
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
            // Detectar error específico de QR parse
            if (errorMessage && errorMessage.includes('NotFoundException')) {
              setCameraError('No se detectó ningún código QR. Apunta la cámara a un código válido.');
            } else {
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
      useEffect(() => {
        const config = { fps: 10, qrbox: 250 };
        setCameraError(null);
        setApiError(null);
        setProduct(null);
        setLoading(false);
        let qrTimeout = null;
        // Limpiar el div 'scanner' antes de iniciar
        if (scannerRef.current) {
          scannerRef.current.innerHTML = '';
        }
        // Verificar que el elemento existe
        const scannerElement = document.getElementById('scanner');
        if (!scannerElement) {
          setCameraError('No se encontró el elemento del escáner en el DOM.');
          return;
        }
        try {
          html5QrCodeRef.current = new Html5Qrcode('scanner');
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
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
        };
      }, [cameraFacing]);
