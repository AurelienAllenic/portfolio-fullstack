import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL de l'API backend
  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  // Vérifier la session au chargement
  const checkSession = async () => {
    try {
      const apiUrl = getApiUrl().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/auth/check`, {
        method: 'GET',
        credentials: 'include', // Important pour les cookies de session
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion email/password
  const login = async (email: string, password: string) => {
    try {
      const apiUrl = getApiUrl().replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies de session
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      const apiUrl = getApiUrl().replace(/\/$/, '');
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Vérifier la session au montage du composant
  useEffect(() => {
    checkSession();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
