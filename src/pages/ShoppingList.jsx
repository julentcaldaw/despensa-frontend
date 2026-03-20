// Normaliza nombres eliminando espacios extra y poniendo en minúsculas la primera letra
function normalizeName(name) {
	if (!name) return '';
	return name.trim().replace(/\s+/g, ' ').replace(/^./, c => c.toUpperCase()).toLowerCase();
}
import React, { useState, useEffect } from "react";
import AddIngredientShop from "../components/AddIngredientShop";
import User from "./User";
import { AnimatePresence, motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';
import { Trash2, Coffee, Egg, Leaf, Fish, Cookie, Salad } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import { authFetch } from '../utils/auth';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import '../shoppingListGrid.css';

const CATEGORY_MAP = {
	lacteos_huevos: { class: 'category-dairy', icon: <Egg /> },
	frutas_verduras: { class: 'category-veg', icon: <Leaf /> },
	carnes_pescados: { class: 'category-meat', icon: <Fish /> },
	despensa_granos: { class: 'category-pantry', icon: <Coffee /> },
	condimentos_aceites: { class: 'category-condiment', icon: <Salad /> },
	snacks_extras: { class: 'category-snack', icon: <Cookie /> }
};

function ShoppingList({ currentTab, onTabChange }) {
	const [showAdd, setShowAdd] = useState(false);
	const location = useLocation();
	const { user, loading, error } = useAuth();
	const [addIngredientError, setAddIngredientError] = useState("");
	const [selectedShopFilter, setSelectedShopFilter] = useState('Todas');
	const [shops, setShops] = useState([]);
	const [shoppingList, setShoppingList] = useState([]);
	const [allIngredients, setAllIngredients] = useState([]); 
	const [showUser, setShowUser] = useState(false); 
	const [selectedIngredient, setSelectedIngredient] = useState(""); 

	const [ingredientCategory, setIngredientCategory] = useState('frutas_verduras'); 
	const [selectedShop, setSelectedShop] = useState(''); 
	const [authError, setAuthError] = useState(""); 

	if (!user && !loading) {
		return <div className="user-profile">Inicia sesión para ver tu lista de la compra</div>;
	}

	const handleDeleteBought = async () => {
		const boughtItems = shoppingList.flatMap(group =>
			group.items.filter(item => item.bought && item.id)
		);
		if (boughtItems.length === 0) {
			setAuthError('No hay ingredientes comprados para eliminar.');
			return;
		}
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}
			for (const item of boughtItems) {
				await authFetch(`/listacompra/${item.id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				});
			}
			await fetchShoppingList();
		} catch (err) {
			setAuthError('Error al eliminar ingredientes comprados.');
		}
	};

		const fetchShoppingList = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					setAuthError('No hay sesión activa. Por favor, inicia sesión.');
					setShoppingList([]);
					return;
				}
				const response = await authFetch('/listacompra?include=shop,ingredient');
				if (response.status === 401 || response.status === 403) {
					setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
					setShoppingList([]);
					return;
				}
				if (!response.ok) throw new Error('Error al cargar la lista de compra');
				const data = await response.json();
				setShoppingList(Array.isArray(data) ? data : []);
			} catch (err) {
				setShoppingList([]);
			}
		};

		const fetchShops = async () => {
			try {
				const token = localStorage.getItem('token');
				if (!token) return;
				const response = await authFetch('/myshops');
				if (response.ok) {
					const data = await response.json();
					setShops(Array.isArray(data) ? data : []);
				}
			} catch (err) {}
		};

		useEffect(() => {
			fetchShoppingList();
			fetchShops();
			const handleFocus = () => {
				fetchShoppingList();
				fetchShops();
			};
			window.addEventListener('focus', handleFocus);
			return () => {
				window.removeEventListener('focus', handleFocus);
			};
		}, [location.pathname, currentTab]);

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

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			setAuthError('No hay sesión activa. Por favor, inicia sesión.');
		}
	}, []);



	const handleAdd = async (newIngredient, newShopId, category = ingredientCategory) => {
		try {
			setAddIngredientError("");
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}

			const normalizedIngredient = normalizeName(newIngredient);
			const normalizedShop = normalizeName(newShopId);

			let ingredientObj = allIngredients.find(i => {
				if (typeof newIngredient === 'object' && newIngredient.id) {
					return i.id === newIngredient.id;
				}
				return i.name && normalizeName(i.name) === normalizedIngredient;
			});
			let ingredientId = ingredientObj ? ingredientObj.id : null;

			if (!ingredientId) {
				const res = await authFetch('/ingredients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
					body: JSON.stringify({ name: normalizedIngredient, category })
				});
				if (!res.ok) {
					setAddIngredientError('No se pudo crear el ingrediente.');
					return;
				}
				const data = await res.json();
				ingredientId = data.id;
			}

			let shopObj = shops.find(s => String(s.id) === String(newShopId));
			let shopId = shopObj ? shopObj.id : null;

			if (!shopId && normalizedShop && normalizedShop !== '') {
				const res = await authFetch('/myshops', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
					body: JSON.stringify({ name: normalizedShop })
				});
				if (!res.ok) {
					setAddIngredientError('No se pudo crear la tienda.');
					return;
				}
				const data = await res.json();
				shopId = data.id;
			}

			let ingredientName = '';
			let shopName = '';
			if (ingredientObj && ingredientObj.name) {
				ingredientName = ingredientObj.name;
			} else if (typeof newIngredient === 'string') {
				ingredientName = newIngredient;
			}
			if (shopObj && shopObj.name) {
				shopName = shopObj.name;
			} else if (typeof newShopId === 'string') {
				shopName = newShopId;
			}
			if (!ingredientId || !shopId || !ingredientName.trim() || !shopName.trim()) {
				setAddIngredientError('Debes seleccionar un ingrediente y una tienda válidos.');
				return;
			}

			const response = await authFetch('/listacompra', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
				body: JSON.stringify({
					shoppingList: [
						{
							ingredient: ingredientName,
							shop: shopName,
							category
						}
					],
					shops: [shopName],
					filters: {}
				})
			});
			if (response.status === 401 || response.status === 403) {
				setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
				return;
			}
			if (!response.ok) {
				if (response.status === 400) {
					try {
						const errData = await response.json();
						setAuthError(errData.message || 'Error 400: Datos inválidos.');
					} catch {
						setAuthError('Error 400: Datos inválidos.');
					}
				} else {
					setAuthError('Error al guardar en la lista de compras.');
				}
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


	async function markAsBought(id, token, shopId) {
		const purchaseDate = new Date().toISOString();
		// No enviar category, solo los campos requeridos
		const response = await authFetch(`/listacompra/${id}/bought`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ bought: true, purchaseDate, shopId, quantity: 1 })
		});
		if (!response.ok) {
			throw new Error('Error al marcar como comprado');
		}
		const itemActualizado = await response.json();
		return itemActualizado;
	}

	const handleBought = async (itemId) => {
		let foundGroupIdx = -1;
		let foundItemIdx = -1;
		for (let gIdx = 0; gIdx < shoppingList.length; gIdx++) {
			const group = shoppingList[gIdx];
			const itemIdx = group.items.findIndex(it => it.id === itemId);
			if (itemIdx !== -1) {
				foundGroupIdx = gIdx;
				foundItemIdx = itemIdx;
				break;
			}
		}
		if (foundGroupIdx === -1 || foundItemIdx === -1) {
			setAuthError('No se encontró el ingrediente para marcar como comprado.');
			return;
		}
		const group = shoppingList[foundGroupIdx];
		const item = group.items[foundItemIdx];
		if (!item || !item.id) {
			setAuthError('No se puede marcar este ingrediente como comprado porque no tiene id.');
			return;
		}
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}
			const itemActualizado = await markAsBought(item.id, token, group.shopId || (group.shop && group.shop.id));
			await fetchShoppingList();
		} catch (err) {
			setAuthError(err.message || 'Error de conexión al marcar como comprado.');
		}
	};



	const handleDelete = async (shopIdx, itemIdx) => {
		const group = shoppingList[shopIdx];
		if (!group || !group.items || !group.items[itemIdx]) {
			setAuthError('No se puede eliminar: item no definido.');
			return;
		}
		const item = group.items[itemIdx];
		const itemId = item.id;
		console.log('Intentando eliminar:', { itemId, item });
		if (!itemId) {
			console.error('No se puede eliminar: ingrediente sin id. Objeto:', item);
			setAuthError('No se puede eliminar este ingrediente porque no tiene id. Si el ingrediente fue creado manualmente o no se sincronizó, revisa la base de datos.');
			return;
		}
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setAuthError('No hay sesión activa. Por favor, inicia sesión.');
				return;
			}
			const response = await authFetch(`/listacompra/${itemId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
			if (response.status === 401 || response.status === 403) {
				setAuthError('Sesión expirada o token inválido. Reintenta o cierra sesión.');
				return;
			}
			if (!response.ok) {
				setAuthError('Error al eliminar el ingrediente. Puede que ya esté eliminado o no exista en la base de datos.');
				return;
			}
			await fetchShoppingList();
		} catch (err) {
			setAuthError('Error de conexión al eliminar ingrediente.');
		}
	};

	const [search, setSearch] = useState('');
	const [order, setOrder] = useState('categoria');


	let filteredGroups = shoppingList
		.map(group => ({
			...group,
			items: group.items
				.map(item => {
					let id = item.id || item._id || (item.ingredient && item.ingredient.id);
					return { ...item, id };
				})
				.filter(item => (
					(item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
					(item.ingredient && item.ingredient.name && item.ingredient.name.toLowerCase().includes(search.toLowerCase()))
				))
		}))
		.filter(group => group.items.length > 0)
		.sort((a, b) => a.shop.localeCompare(b.shop));



	const shopsList = ['Todas', ...shops.map(s => s.id)];
	let displayedGroups = selectedShopFilter === 'Todas'
		? filteredGroups
		: filteredGroups.filter(g => (g.shopId || (g.shop && g.shop.id)) === selectedShopFilter);

	if (order === 'categoria') {
		filteredGroups = filteredGroups.map(group => ({
			...group,
			items: group.items.slice().sort((a, b) => ((a.ingredient && a.ingredient.category) || '').localeCompare((b.ingredient && b.ingredient.category) || ''))
		}));
	} else if (order === 'ultimo') {
		filteredGroups = filteredGroups.map(group => ({
			...group,
			items: group.items.slice().reverse()
		}));
	}

		const hayComprados = shoppingList.some(group => group.items.some(item => item.bought));
		return (
			<div className="pantry-bg-main">
				<div className="pantry-main-card">
					<div className="pantry-container">
				
				{showUser && (
					<User
						currentTab={currentTab}
						onTabChange={onTabChange}
						shops={shops}
						setShops={setShops}
					/>
				)}
      					<div className="pantry-header flex flex-col items-center justify-center pt-5 gap-2">
							 <img src="/logoB.png" alt="Logo" className="logoA-img mx-auto" />
        					<h2 className="pantry-title text-center font-sans text-[2.5rem] tracking-[.03em] mb-9">miDESPENSA</h2>
      					</div>
     						 <div className="pantry-float-actions">
						<button className="pantry-float-btn add" title="Añadir ingrediente" onClick={() => setShowAdd(true)}>
							+
						</button>
						{hayComprados && (
							<button
								className="pantry-float-btn delete-bought bg-white text-red-500 border-2 border-red-500 ml-2 flex items-center justify-center px-2 py-1 rounded-full shadow-md" onClick={handleDeleteBought}>
								<ShoppingCart size={24} color="#e74c3c" />
							</button>
						)}
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
				<div className="pantry-filters mb-4 flex gap-4">
					<select className="pantry-select" value={order} onChange={e => setOrder(e.target.value)}>
						<option value="categoria">Ordenar por categoría</option>
						<option value="ultimo">Últimos añadidos</option>
					</select>
					<select className="pantry-select" value={selectedShopFilter} onChange={e => setSelectedShopFilter(e.target.value)}>
							<option key="Todas" value="Todas">Todas</option>
							{shops.map(shop => (
								<option key={shop.id} value={shop.id}>{shop.name}</option>
							))}
					</select>
				</div>
				<div className="add-ingredient-section mb-5">
					{showAdd && (
						<>
							<AddIngredientShop
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
							{addIngredientError && (<div className="text-red-600 mt-2">{addIngredientError}</div>)}
						</>
					)}
				</div>
				<AnimatePresence>
					{displayedGroups.length === 0 ? (
						<div className="pantry-empty">No hay ingredientes en la lista.</div>
					) : (
						selectedShopFilter === 'Todas' ? (
							(() => {
								const groupedByShop = {};
								displayedGroups.forEach((group, shopIdx) => {
									groupedByShop[group.shop] = group.items.map((item, itemIdx) => ({
										...item,
										shop: group.shop,
										_shopIdx: shopIdx,
										_itemIdx: itemIdx
									}));
								});
								return Object.entries(groupedByShop).map(([shop, items], shopIdx) => (
									<div key={shop} className="mb-12">
										<div className="shop-list -mb-2">{shop}</div>
										<div className="shopping-list-grid mb-4 mt-2">
											{items.map((item, itemIdx) => {
												const category = item.category || (item.ingredient && item.ingredient.category) || '';
												const cat = CATEGORY_MAP[category] || {};
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
															{(item.category || (item.ingredient && item.ingredient.category))
																? (item.category || item.ingredient.category).replace(/_/g, ' ').toUpperCase()
																: 'SIN CATEGORÍA'}
														</span>
														{!item.id && (<div className="text-red-600 font-bold text-[0.9em] my-2">¡Este ingrediente no tiene id! No se puede eliminar ni marcar como comprado.</div>)}
														<button
															className="pantry-item-delete"
															onClick={() => handleDelete(shopIdx, itemIdx)}
															disabled={!item.id}
															title={!item.id ? 'No se puede eliminar: ingrediente sin id' : 'Eliminar'}
														>
															<Trash2 size={18} />
														</button>
														<button
															className="pantry-item-delete absolute right-14"
															onClick={() => handleBought(item.id)}
															title="Comprado"
														>
															<ShoppingCart size={18} color="#e74c3c" />
														</button>
													</motion.div>
												);
											})}
										</div>
									</div>
								));
							})()
						) : (
							displayedGroups.length > 0
								? <div className="shopping-list-grid">
									{displayedGroups[0].items
										.map((item, itemIdx) => {
											const cat = CATEGORY_MAP[item.ingredient && item.ingredient.category] || {};
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
														{(item.category || (item.ingredient && item.ingredient.category))
															? (item.category || item.ingredient.category).replace(/_/g, ' ').toUpperCase()
															: 'SIN CATEGORÍA'}
													</span>
													<button className="pantry-item-delete" onClick={() => handleDelete(0, itemIdx)}>
														<Trash2 size={18} />
													</button>
													<button
														className="pantry-item-delete absolute right-14"
														onClick={() => handleBought(item.id)}
														title="Comprado"
													>
														<ShoppingCart size={18} color="#e74c3c" />
													</button>
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
				</div>
			</div>
		);
}

export default ShoppingList;
