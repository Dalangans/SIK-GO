import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  const login = async (email, password) => {
    // Simulasi login; ganti dengan panggilan API nyata
    if (!email || !password) throw new Error('Email dan password diperlukan');
    // contoh token sederhana
    const fakeToken = btoa(`${email}:token`);
    const fakeUser = { email, name: email.split('@')[0] || 'User' };
    setUser(fakeUser);
    setToken(fakeToken);
    return { user: fakeUser, token: fakeToken };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
