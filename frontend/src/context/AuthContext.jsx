import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = [
  {
    role: 'CREDIT_MANAGER',
    roleLabel: 'Credit Operations Manager',
    username: 'safriya@kaartech.com',
    aliases: ['credit.manager@kaartech.com', 'safriya'],
    password: 'Credit@123',
    name: 'Safriya',
    department: 'Global Credit Operations',
    authorityLimit: '₹10,00,000'
  },
  {
    role: 'SENIOR_MANAGER',
    roleLabel: 'Senior Finance Manager / CFO',
    username: 'jaris.cfo@kaartech.com',
    aliases: ['cfo@kaartech.com', 'jaris', 'senior.manager@kaartech.com'],
    password: 'Executive@123',
    name: 'Jaris',
    department: 'Executive Finance Committee',
    authorityLimit: 'Unlimited (Executive Waiver)'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('credit_cockpit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    const cleanUser = (username || '').trim().toLowerCase();

    try {
      // Call backend auth API
      const res = await api.login({ username: cleanUser, password });
      if (res?.success && res.data?.user) {
        const loggedUser = res.data.user;
        setUser(loggedUser);
        localStorage.setItem('credit_cockpit_user', JSON.stringify(loggedUser));
        return { success: true, user: loggedUser };
      }
      throw new Error('Authentication failed.');
    } catch (err) {
      // Client-side fallback check against DEMO_CREDENTIALS
      const matched = DEMO_CREDENTIALS.find(
        (c) =>
          (c.username.toLowerCase() === cleanUser || c.aliases?.some((a) => a.toLowerCase() === cleanUser)) &&
          c.password === password
      );
      if (matched) {
        const { password: _, aliases: __, ...safeUser } = matched;
        setUser(safeUser);
        localStorage.setItem('credit_cockpit_user', JSON.stringify(safeUser));
        return { success: true, user: safeUser };
      }
      return { success: false, error: err.message || 'Invalid username or password.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('credit_cockpit_user');
  };

  const isCreditManager = user?.role === 'CREDIT_MANAGER';
  const isSeniorManager = user?.role === 'SENIOR_MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isCreditManager,
        isSeniorManager
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
