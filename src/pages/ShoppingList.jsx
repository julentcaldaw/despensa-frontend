import React, { useState, useEffect } from "react";
import AddIngredient from "../components/AddIngredient";
import User from "./User";
import { AnimatePresence, motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Coffee, Egg, Leaf, Fish, Cookie, Salad } from 'lucide-react';

const CATEGORY_MAP = {
	lacteos_huevos: { class: 'category-dairy', icon: <Egg /> },
	frutas_verduras: { class: 'category-veg', icon: <Leaf /> },
	carnes_pescados: { class: 'category-meat', icon: <Fish /> },
	despensa_granos: { class: 'category-pantry', icon: <Coffee /> },
	condimentos_aceites: { class: 'category-condiment', icon: <Salad /> },
	snacks_extras: { class: 'category-snack', icon: <Cookie /> }
};

import { authFetch } from '../utils/auth';
function ShoppingList({ currentTab, onTabChange }) {
			const [addIngredientError, setAddIngredientError] = useState("");
		const [selectedShopFilter, setSelectedShopFilter] = useState('Todas');
	const [shoppingList, setShoppingList] = useState([]);
		const fetchShoppingList = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					setAuthError('No hay sesión activa. Por favor, inicia sesión.');
					setShoppingList([]);
					return;
				}
				const response = await authFetch('/shoppinglist');
				if (response.status === 401 || response.status === 403) {
					setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
					setShoppingList([]);
					return;
				}
				if (!response.ok) throw new Error('Error al cargar la lista de compra');
				const data = await response.json();
				// Ahora data es un array de objetos { shop, items }
				setShoppingList(Array.isArray(data) ? data : []);
			} catch (err) {
				setShoppingList([]);
			}
		};

		useEffect(() => {
			fetchShoppingList();
		}, []);
	const [shops, setShops] = useState(["Mercadona", "Frutería", "Deza", "Lidl"]);
	const [showUser, setShowUser] = useState(false);
	const [showAdd, setShowAdd] = useState(false);
	const [selectedIngredient, setSelectedIngredient] = useState('');
	const [ingredientCategory, setIngredientCategory] = useState('frutas_verduras');
	const [selectedShop, setSelectedShop] = useState(shops[0] || '');
	const [allIngredients, setAllIngredients] = useState([]);
	const [authError, setAuthError] = useState('');

	useEffect(() => {
		const fetchAllIngredients = async () => {
			try {
				const response = await authFetch('/ingredients');
				if (response.status === 401 || response.status === 403) {
					setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
					setAllIngredients([]);
					return;
				}
				if (!response.ok) throw new Error('Error al cargar ingredientes');
				const data = await response.json();
				setAllIngredients(data);
			} catch (err) {
				setAllIngredients([]);
			}
		};
		fetchAllIngredients();
	}, []);

	// Comprobar token globalmente
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			setAuthError('No hay sesión activa. Por favor, inicia sesión.');
		}
	}, []);

	const handleAdd = async (newIngredient, newShop, category = ingredientCategory) => {
		try {
			setAddIngredientError("");
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}
			const response = await authFetch('/shoppinglist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					shoppingList: [
						{ ingredient: newIngredient, shop: newShop, category }
					],
					shops: [newShop],
					filters: { category }
				})
			});
			if (response.status === 401 || response.status === 403) {
				setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
				return;
			}
			if (!response.ok) {
				setAuthError('Error al guardar en la lista de compras.');
				return;
			}
			const data = await response.json();
			if (data && Array.isArray(data.results) && data.results.length > 0 && data.results[0].error) {
				setAddIngredientError(data.results[0].error);
				return;
			}
			await fetchShoppingList();
			setShowAdd(false);
			setSelectedIngredient('');
			setIngredientCategory('frutas_verduras');
		} catch (err) {
			setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
		}
	};

	useEffect(() => {
		if (!selectedIngredient) return;
		const found = allIngredients.find(i => i.name.toLowerCase() === selectedIngredient.toLowerCase());
		if (found && found.category) {
			setIngredientCategory(found.category);
		}
	}, [selectedIngredient, allIngredients]);


	async function marcarComoComprado(id, token) {
	  const response = await fetch(`http://localhost:5000/api/shoppinglist/${id}/bought`, {
		method: 'PATCH',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ bought: true })
	  });
	  if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Error al marcar como comprado');
	  }
	  const itemActualizado = await response.json();
	  return itemActualizado;
	}

	const handleBought = async (shopIdx, itemIdx) => {
		const group = shoppingList[shopIdx];
		const item = group.items[itemIdx];
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}
			const ingredientId = item.id || item._id;
			// Actualizar la lista local inmediatamente para feedback visual
			setShoppingList(prev => prev.map((group, gIdx) => {
				if (gIdx !== shopIdx) return group;
				return {
					...group,
					items: group.items.map((it, i) => i === itemIdx ? { ...it, bought: true } : it)
				};
			}));
			// Luego enviar al backend
			const itemActualizado = await marcarComoComprado(ingredientId, token);
			// Opcional: recargar desde backend para sincronizar
			await fetchShoppingList();
		} catch (err) {
			setAuthError(err.message || 'Error de conexión al marcar como comprado.');
		}
	};

	const handleDelete = (shopIdx, itemIdx) => {
		setShoppingList(prev => {
			const newList = prev.map((group, gIdx) => {
				if (gIdx !== shopIdx) return group;
				return {
					...group,
					items: group.items.filter((_, i) => i !== itemIdx)
				};
			});
			return newList.filter(group => group.items.length > 0);
		});
	};

	const [search, setSearch] = useState('');
	const [order, setOrder] = useState('categoria');


	let filteredGroups = shoppingList
		.map(group => ({
			...group,
			items: group.items.filter(item => (
				(item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
				(item.ingredient && item.ingredient.name && item.ingredient.name.toLowerCase().includes(search.toLowerCase()))
			))
		}))
		.filter(group => group.items.length > 0)
		.sort((a, b) => a.shop.localeCompare(b.shop));

	const shopsList = ['Todas', ...filteredGroups.map(g => g.shop).filter((v, i, arr) => arr.indexOf(v) === i)];
	let displayedGroups = selectedShopFilter === 'Todas'
		? filteredGroups
		: filteredGroups.filter(g => g.shop === selectedShopFilter);

	if (order === 'categoria') {
		filteredGroups = filteredGroups.map(group => ({
			...group,
			items: group.items.slice().sort((a, b) => (a.category || '').localeCompare(b.category || ''))
		}));
	} else if (order === 'ultimo') {
		filteredGroups = filteredGroups.map(group => ({
			...group,
			items: group.items.slice().reverse()
		}));
	}


		return (
			<div className="pantry-container">
				{authError && (
					<div className="pantry-error pantry-error-primary" style={{marginBottom:'1rem', textAlign:'center'}}>
						{authError}
						<button className="btn-primary" style={{marginLeft:'1rem'}} onClick={() => window.location.reload()}>Reintentar</button>
						<button className="btn-primary" style={{marginLeft:'1rem'}} onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}>Cerrar sesión</button>
					</div>
				)}
				<button className="btn-primary" style={{marginBottom:'1rem'}} onClick={() => setShowUser(true)}>
					Perfil de usuario
				</button>
				{showUser && (
					<User
						currentTab={currentTab}
						onTabChange={onTabChange}
						shops={shops}
						setShops={setShops}
					/>
				)}
				<div className="pantry-header">
					<h2 className="pantry-title">Lista de compra</h2>
					<div className="pantry-float-actions">
						<button className="pantry-float-btn add" title="Añadir ingrediente" onClick={() => setShowAdd(true)}>
							+
						</button>
					</div>
				</div>
				<div className="pantry-search">
					<span className="pantry-search-icon">
						<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="8" cy="8" r="7"/><line x1="15" y1="15" x2="12" y2="12"/></svg>
					</span>
					<input
						className="pantry-search-input"
						type="text"
						placeholder="Buscar ingrediente..."
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>
				<div className="pantry-filters" style={{marginBottom:'1rem', display:'flex', gap:'1rem'}}>
					<select className="pantry-select" value={order} onChange={e => setOrder(e.target.value)}>
						<option value="categoria">Ordenar por categoría</option>
						<option value="ultimo">Últimos añadidos</option>
					</select>
					<select className="pantry-select" value={selectedShopFilter} onChange={e => setSelectedShopFilter(e.target.value)}>
						{shopsList.map(shop => (
						  <option key={shop} value={shop}>{shop}</option>
						))}
					</select>
				</div>
				<div className="add-ingredient-section" style={{marginBottom:'1.2rem'}}>
					{showAdd && (
						<>
							<AddIngredient
								show={showAdd}
								onClose={() => {
									setShowAdd(false);
									setSelectedIngredient('');
									setIngredientCategory('frutas_verduras');
									setSelectedShop(shops[0] || '');
								}}
								onSubmit={e => {
									e.preventDefault();
									handleAdd(selectedIngredient, selectedShop, ingredientCategory);
								}}
								shops={shops}
								allIngredients={allIngredients}
								selectedIngredient={selectedIngredient}
								setSelectedIngredient={setSelectedIngredient}
								ingredientCategory={ingredientCategory}
								setIngredientCategory={setIngredientCategory}
								selectedShop={selectedShop}
								setSelectedShop={setSelectedShop}
								addError={addIngredientError}
								adding={false}
							/>
							{addIngredientError && (
							  <div style={{ color: 'red', marginTop: 8 }}>{addIngredientError}</div>
							)}
						</>
					)}
				</div>
				{/* Bloques de tienda, cada uno con su propio grid */}
				<AnimatePresence>
					{displayedGroups.length === 0 ? (
						<div className="pantry-empty">No hay ingredientes en la lista.</div>
					) : (
						selectedShopFilter === 'Todas' ? (
							(() => {
								// Agrupar por tienda
								const groupedByShop = {};
								displayedGroups.forEach((group, shopIdx) => {
									groupedByShop[group.shop] = group.items.map((item, itemIdx) => ({
										...item,
										shop: group.shop,
										_shopIdx: shopIdx,
										_itemIdx: itemIdx
									}));
								});
								return Object.entries(groupedByShop).map(([shop, items], idx) => (
									<div key={shop} style={{margin:'0 0 48px 0'}}>
										<div style={{width:'100%', textAlign:'center', fontWeight:'bold', fontSize:'1.1em', margin:'24px 0 16px 0'}}>{shop}</div>
										<div className="pantry-grid" style={{marginBottom:'16px'}}>
											{items.map((item, idxItem) => {
												const cat = CATEGORY_MAP[item.category] || {};
												return (
													<motion.div
														key={item.id || item._id || (item.ingredient && item.ingredient.name ? item.ingredient.name : item.ingredient) + item.shop}
														className={`pantry-item ${cat.class || ''} ${item.bought ? 'pantry-item-bought' : ''}`}
														initial={{ scale: 0.8, opacity: 0 }}
														animate={{ scale: 1, opacity: 1 }}
														exit={{ scale: 0.8, opacity: 0 }}
														transition={{ duration: 0.22 }}
													>
														<span className="pantry-item-bgicon">
															{cat.icon && React.cloneElement(cat.icon, { size: 72 })}
														</span>
														<div className="pantry-item-title">{
															item.name
																? item.name
																: item.ingredient && item.ingredient.name
																	? item.ingredient.name
																	: item.ingredient
														}</div>
														<span className="pantry-item-category">
															{(item.category
																? item.category
																: item.ingredient && item.ingredient.category)
																? (item.category || item.ingredient.category).replace(/_/g, ' ').toUpperCase()
																: 'SIN CATEGORÍA'}
														</span>
														<button className="pantry-item-delete" onClick={() => handleDelete(item._shopIdx, item._itemIdx)}>
															<Trash2 size={18} />
														</button>
														<button className="pantry-item-delete" style={{right: 56}} onClick={() => handleBought(item._shopIdx, item._itemIdx)} title="Comprado">✓</button>
														{item.bought && <span className="pantry-item-bought-indicator">Comprado</span>}
													</motion.div>
												);
											})}
										</div>
									</div>
								));
							})()
						) : (
							displayedGroups.length > 0
								? <div className="pantry-grid">
									{displayedGroups[0].items
										.map((item, itemIdx) => {
											const cat = CATEGORY_MAP[item.category] || {};
											return (
												<motion.div
													key={item.id || item._id || (item.ingredient && item.ingredient.name ? item.ingredient.name : item.ingredient)}
													className={`pantry-item ${cat.class || ''} ${item.bought ? 'pantry-item-bought' : ''}`}
													initial={{ scale: 0.8, opacity: 0 }}
													animate={{ scale: 1, opacity: 1 }}
													exit={{ scale: 0.8, opacity: 0 }}
													transition={{ duration: 0.22 }}
												>
													<span className="pantry-item-bgicon">
														{cat.icon && React.cloneElement(cat.icon, { size: 72 })}
													</span>
													<div className="pantry-item-title">{
														item.name
															? item.name
															: item.ingredient && item.ingredient.name
																? item.ingredient.name
																: item.ingredient
													}</div>
													<span className="pantry-item-category">
														{(item.category
															? item.category
															: item.ingredient && item.ingredient.category)
															? (item.category || item.ingredient.category).replace(/_/g, ' ').toUpperCase()
															: 'SIN CATEGORÍA'}
													</span>
													<button className="pantry-item-delete" onClick={() => handleDelete(0, itemIdx)}>
														<Trash2 size={18} />
													</button>
													<button className="pantry-item-delete" style={{right: 56}} onClick={() => handleBought(0, itemIdx)} title="Comprado">✓</button>
													{item.bought && <span className="pantry-item-bought-indicator">Comprado</span>}
												</motion.div>
											);
										})}
								</div>
								: null
						)
					)}
				</AnimatePresence>
				<BottomNavigation currentTab={currentTab} onTabChange={onTabChange} />
			</div>
	);
}

export default ShoppingList;
