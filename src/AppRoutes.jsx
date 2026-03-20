import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DietRestrictions from './pages/DietRestrictions';
import DietPreferences from './pages/DietPreferences';
import Register from './pages/Register';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import User from './pages/User';
import { useAuth } from './utils/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import MyOrders from './components/MyOrders';

function AppRoutes() {
  const { user, loading } = useAuth ? useAuth() : { user: null, loading: false };
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/despensa"
        element={
          <PrivateRoute>
            <Pantry />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/recetas"
        element={
          <PrivateRoute>
            <Recipes />
          </PrivateRoute>
        }
      />
      <Route
        path="/listacompra"
        element={
          <PrivateRoute>
            <ShoppingList />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuario"
        element={
          <PrivateRoute>
            <User />
          </PrivateRoute>
        }
      />
      <Route
        path="/restricciones"
        element={
          <PrivateRoute>
            <DietRestrictions />
          </PrivateRoute>
        }
      />
      <Route
        path="/preferencias"
        element={
          <PrivateRoute>
            <DietPreferences />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuario/miscompras"
        element={
          <PrivateRoute>
            {loading ? (
              <div>Cargando...</div>
            ) : user && user.id ? (
              <MyOrders userId={user.id} />
            ) : (
              <div>No se encontró el usuario.</div>
            )}
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
