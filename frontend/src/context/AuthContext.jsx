import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("vinacoteca_token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/perfil`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          // Token expired or invalid
          logout();
        } else if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setError("No s'ha pogut carregar el perfil");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Error de connexió amb el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem("vinacoteca_token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("vinacoteca_token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, logout, updateProfile, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth s'ha de fer servir dins d'un AuthProvider");
  }
  return context;
};
