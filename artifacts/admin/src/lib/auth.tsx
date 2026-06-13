import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './axiosConfig';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'teacher';
  createdAt?: string;
  nameKh?: string;
  nameEn?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password?: string, providedToken?: string, providedUser?: User) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameOrToken: string, password?: string, providedToken?: string, providedUser?: User) => {
    if (providedToken && providedUser) {
      // Direct login support (used in Login.tsx directly receiving token)
      localStorage.setItem('admin_user', JSON.stringify(providedUser));
      localStorage.setItem('token', providedToken);
      setUser(providedUser);
      setToken(providedToken);
      return;
    }

    const response = await api.post('/auth/login', { username: usernameOrToken, password });
    const { user: userData, accessToken } = response.data;
    
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);
    
    setUser(userData);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
