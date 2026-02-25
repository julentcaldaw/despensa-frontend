import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import './app.css';
import { AuthProvider } from './utils/AuthContext';


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
	<AuthProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</AuthProvider>
);
