
import React, { useEffect, useState } from "react";
import { authFetch } from '../utils/auth';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const MyOrders = ({ show = true, onClose }) => {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!show) return;
		const fetchOrders = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					setError('No hay sesión activa. Por favor, inicia sesión.');
					setOrders([]);
					setLoading(false);
					return;
				}
				const response = await authFetch('/historial');
				if (!response.ok) throw new Error('Error al cargar el historial de compras');
				const data = await response.json();
				setOrders(Array.isArray(data) ? data : []);
			} catch (err) {
				setError('Error al cargar el historial de compras.');
				setOrders([]);
			} finally {
				setLoading(false);
			}
		};
		fetchOrders();
	}, [show]);

	if (!show) return null;

	return (
		<div className="pantry-modal-bg" onClick={onClose}>
			<div className="pantry-modal" onClick={e => e.stopPropagation()}>
				<button className="pantry-modal-close" onClick={() => navigate('/usuario')}>×</button>
				<h3 className="pantry-modal-title">Historial de compras</h3>
				{loading ? (
					<div className="orders-loading">Cargando historial...</div>
				) : error ? (
					<div className="orders-error pantry-error pantry-error-primary text-red-600">{error}</div>
				) : orders.length === 0 ? (
					<div className="orders-empty pantry-list-item">No hay compras registradas.</div>
				) : (
					<ul className="pantry-list flex justify-center items-center" style={{ paddingLeft: 0, marginLeft: 'auto', marginRight: 'auto' }}>
						<div className="bg-white rounded-xl border-2" style={{ borderColor: 'var(--primary)', margin: '0 auto', maxWidth: '320px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', position: 'relative' }}>
							{orders.map((order, idx) => {
								// Unificación de datos
								const name = order.name || (order.ingredient && order.ingredient.name) || 'Ingrediente';
								const shop = order.shop || (order.ingredient && order.ingredient.shop) || 'Desconocido';
								const date = order.boughtDate ? new Date(order.boughtDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha';
								return (
									<motion.li
										key={order.id || idx}
										className="pantry-list-item flex flex-col items-center justify-center py-3 px-5 mb-2 rounded-lg w-full group hover:bg-primary-soft transition"
										style={{ border: 'none', paddingLeft: 0 }}
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.22 }}
									>
									<span className="font-semibold text-gray-800 mx-auto mb-1">{name}</span>
									<span className="text-sm text-gray-700 mb-1">Supermercado: <b>{shop}</b></span>
									<span className="text-sm text-gray-700">Fecha de compra: <b>{date}</b></span>
									</motion.li>
								);
							})}
						</div>
					</ul>
				)}
			</div>
		</div>
	);
};

export default MyOrders;
