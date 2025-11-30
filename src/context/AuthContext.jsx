// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Buat Context
const AuthContext = createContext();

// Provider untuk membungkus seluruh app
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);

  // Load token & role dari localStorage saat refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token");
    const savedRole = localStorage.getItem("user_role");

    if (savedToken) setToken(savedToken);
    if (savedRole) setUserRole(savedRole);
  }, []);

  const login = (role, accessToken) => {
    setUserRole(role);
    setToken(accessToken);

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_role", role);
  };

  const logout = () => {
    setUserRole(null);
    setToken(null);

    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
  };

  return (
    <AuthContext.Provider value={{ userRole, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom untuk akses context dengan mudah
export const useAuth = () => useContext(AuthContext);
