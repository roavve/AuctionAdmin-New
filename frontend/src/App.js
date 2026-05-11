import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Monitor from './pages/Monitor';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Projects from './pages/Projects';
import Registrations from './pages/Registrations';
import Categories from './pages/Categories';
import Dictionary from './pages/Dictionary';
import Dashboard from './pages/Dashboard';
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
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="auctions" element={<Auctions />} />
              <Route path="auctions/new" element={<AuctionDetail />} />
              <Route path="auctions/:id" element={<AuctionDetail />} />
              <Route path="monitor" element={<Monitor />} />
              <Route path="companies" element={<Companies />} />
              <Route path="companies/new" element={<CompanyDetail />} />
              <Route path="companies/:id" element={<CompanyDetail />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="registrations" element={<Registrations />} />
              <Route path="categories" element={<Categories />} />
              <Route path="dictionary" element={<Dictionary />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;