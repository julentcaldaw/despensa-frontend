import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import ShoppingList from './pages/ShoppingList';
import User from './pages/User';
import Layout from './components/Layout';
import PrivateRoute from './utils/PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/despensa"
        element={
          <PrivateRoute>
            <Layout>
              <Pantry />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/recetas"
        element={
          <PrivateRoute>
            <Layout>
              <Recipes />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/listacompra"
        element={
          <PrivateRoute>
            <Layout>
              <ShoppingList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Layout>
              <User />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
