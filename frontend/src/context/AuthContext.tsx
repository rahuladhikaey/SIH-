import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: 'patient' | 'doctor') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('medmitra_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('medmitra_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const userData = {
            id: res.data.data.user._id,
            email: res.data.data.user.email,
            role: res.data.data.user.role,
            fullName: res.data.data.user.fullName,
          };
          setUser(userData);
          localStorage.setItem('medmitra_user', JSON.stringify(userData));
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email: string, password: string, role?: 'patient' | 'doctor') => {
    const cleanEmail = email.trim();
    const res = await api.post('/auth/login', { email: cleanEmail, password, role });
    if (res.data.success) {
      const { token: authToken, user: userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('medmitra_token', authToken);
      localStorage.setItem('medmitra_user', JSON.stringify(userData));
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      const { token: authToken, user: userData } = res.data.data;
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('medmitra_token', authToken);
      localStorage.setItem('medmitra_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medmitra_token');
    localStorage.removeItem('medmitra_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
