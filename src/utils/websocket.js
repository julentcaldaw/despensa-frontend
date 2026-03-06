// src/utils/websocket.js

// Cambia la URL por la de tu backend en Render
const WS_URL = 'wss://despensa-backend.onrender.com/ws';

export function createWebSocket(onMessage, onOpen, onClose, onError) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    if (onOpen) onOpen(socket);
  };

  socket.onmessage = (event) => {
    if (onMessage) onMessage(event.data);
  };

  socket.onclose = () => {
    if (onClose) onClose();
  };

  socket.onerror = (err) => {
    if (onError) onError(err);
  };

  return socket;
}

// Ejemplo de uso:
// import { createWebSocket } from './utils/websocket';
// const ws = createWebSocket(
//   (msg) => console.log('Mensaje:', msg),
//   () => console.log('Conectado'),
//   () => console.log('Desconectado'),
//   (err) => console.error('Error:', err)
// );
// ws.send('Hola backend!');
