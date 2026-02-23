import React, { useState, useEffect } from "react";
import AddIngredient from "../components/AddIngredient";
import User from "./User";

function ShoppingList() {
	const [shoppingList, setShoppingList] = useState([]);
	const [shops, setShops] = useState(["Mercadona", "Frutería", "Deza", "Lidl"]);
	const [showUser, setShowUser] = useState(false);

	useEffect(() => {

	}, []);

	const handleAdd = (newIngredient, newShop) => {
		setShoppingList(prev => [...prev, { ingredient: newIngredient, shop: newShop }]);
	};

	const handleBought = (index) => {
		const item = shoppingList[index];
		setShoppingList(prev => prev.filter((_, i) => i !== index));
	};

	const handleDelete = (index) => {
		setShoppingList(prev => prev.filter((_, i) => i !== index));
	};

	const grouped = shoppingList.reduce((acc, item, idx) => {
		acc[item.shop] = acc[item.shop] || [];
		acc[item.shop].push({ ...item, idx });
		return acc;
	}, {});

	return (
		<div className="shopping-list-page">
			<h1>Lista de la Compra</h1>
			<button onClick={() => setShowUser(!showUser)}>
				{showUser ? "Volver a la lista" : "Editar mis tiendas"}
			</button>
			{showUser ? (
				<User shops={shops} setShops={setShops} />
			) : (
				<>
					<div className="add-ingredient-section">
						<AddIngredient
							onAdd={handleAdd}
							shops={shops}
						/>
					</div>
					<div className="shopping-list-section">
						{Object.keys(grouped).length === 0 ? (
							<p>No hay ingredientes en la lista.</p>
						) : (
							Object.keys(grouped).map(shopName => (
								<div key={shopName} className="shop-group">
									<h2>{shopName}</h2>
									<ul>
										{grouped[shopName].map((item) => (
											<li key={item.idx} className="shopping-list-item">
												<span>{item.ingredient}</span>
												<button onClick={() => handleBought(item.idx)} title="Comprado">✓</button>
												<button onClick={() => handleDelete(item.idx)} title="Eliminar">🗑</button>
											</li>
										))}
									</ul>
								</div>
							))
						)}
					</div>
				</>
			)}
		</div>
	);
}

export default ShoppingList;
