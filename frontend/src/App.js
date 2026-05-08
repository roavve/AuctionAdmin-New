import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Auctions from './pages/Auctions';
import Monitor from './pages/Monitor';
import Companies from './pages/Companies';
import Users from './pages/Users';
import Projects from './pages/Projects';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute><Layout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/auctions" />} />
              <Route path="auctions" element={<Auctions />} />
              <Route path="monitor" element={<Monitor />} />
              <Route path="companies" element={<Companies />} />
              <Route path="users" element={<Users />} />
              <Route path="projects" element={<Projects />} />
              <Route path="registrations" element={<div>Registrations coming soon</div>} />
              <Route path="categories" element={<div>Categories coming soon</div>} />
              <Route path="dictionary" element={<div>Dictionary coming soon</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;