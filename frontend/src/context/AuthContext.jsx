import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, signup as signupApi, login as loginApi, logout as logoutApi } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const signup = async (formData) => {
    const { data } = await signupApi(formData);
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user);
    showToast('Account created successfully!');
    return data;
  };

  const login = async (formData) => {
    const { data } = await loginApi(formData);
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user);
    showToast('Logged in successfully!');
    return data;
  };

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, showToast, toast }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;