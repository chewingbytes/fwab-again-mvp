import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, signupUser, getCurrentUser } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string;
  _id?: {
    $oid: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { username?: string; email?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  signup: (user: { username: string; email: string; password: string }) => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user || null);
        setError(null);
      } catch (err) {
        // User is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: { username?: string; email?: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      setUser(response.user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userDetails: { username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signupUser(userDetails);
      setUser(response.user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.roles === 'admin';
  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
