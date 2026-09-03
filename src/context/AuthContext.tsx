import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  loginWithGoogle: (data: { email: string; fullName: string; avatarUrl?: string; googleId?: string; idToken?: string }) => Promise<AuthResponse>;
  setPassword: (newPassword: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<AuthResponse>;
  verify2FA: (tempToken: string, code?: string, backup?: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const res = await api.login(email, pass);
    if (res.success && res.data) {
      if (!res.data.require2FA && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken);
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          await fetchUser();
        }
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const loginWithGoogle = async (data: { email: string; fullName: string; avatarUrl?: string; googleId?: string; idToken?: string }): Promise<AuthResponse> => {
    const res = await api.loginWithGoogle(data);
    if (res.success && res.data) {
      if (!res.data.require2FA && res.data.accessToken) {
        localStorage.setItem('token', res.data.accessToken);
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          await fetchUser();
        }
      }
      return res.data;
    }
    throw new Error(res.message || 'Google login failed');
  };

  const setPassword = async (newPassword: string): Promise<void> => {
    const res = await api.setPassword(newPassword);
    if (res.success && res.data) {
      setUser(res.data);
      return;
    }
    throw new Error(res.message || 'Failed to set password');
  };

  const register = async (email: string, pass: string, name: string): Promise<AuthResponse> => {
    const res = await api.register(email, pass, name);
    if (res.success && res.data && res.data.accessToken) {
      localStorage.setItem('token', res.data.accessToken);
      if (res.data.user) {
        setUser(res.data.user);
      } else {
        await fetchUser();
      }
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const verify2FA = async (tempToken: string, code?: string, backup?: string): Promise<AuthResponse> => {
    const res = await api.verify2FA(tempToken, code, backup);
    if (res.success && res.data && res.data.accessToken) {
      localStorage.setItem('token', res.data.accessToken);
      if (res.data.user) {
        setUser(res.data.user);
      } else {
        await fetchUser();
      }
      return res.data;
    }
    throw new Error(res.message || '2FA Verification failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isAdmin = user ? (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN') : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        loginWithGoogle,
        setPassword,
        register,
        verify2FA,
        logout,
        refreshUser,
        setUser,
      }}
    >
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
