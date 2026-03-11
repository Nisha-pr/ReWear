import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rewear_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('rewear_token'));

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
        localStorage.setItem('rewear_user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);




  const saveAuth = useCallback(async (authToken) => {
    localStorage.setItem('rewear_token', authToken);
    setToken(authToken);
    try {
      const { data } = await authService.getMe();
      setUser(data.user);
      localStorage.setItem('rewear_user', JSON.stringify(data.user));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    await saveAuth(data.token);
    toast.success(`Welcome to ReWear, ${data.user.name}! 🎉`);
    return data;
  }, [saveAuth]);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password });
    await saveAuth(data.token);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('rewear_token');
    localStorage.removeItem('rewear_user');
    setUser(null);
    setToken(null);
    authService.logout().catch(() => {});
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('rewear_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, isAuthenticated,
      login, logout, register, saveAuth, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
