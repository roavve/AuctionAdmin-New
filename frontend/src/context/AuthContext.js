import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        return token ? { token, email, role } : null;
    });

    const login = async (email, password) => {
        const response = await axios.post('http://localhost:8080/auth/login', { email, password });

        const { token, role, firstName, lastName } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        localStorage.setItem('role', role);
        setUser({ token, email, role, firstName, lastName });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);