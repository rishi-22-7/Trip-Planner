/*
  AuthContext.jsx – Global authentication state for the entire application.
  Stores the logged-in user object and JWT token. Provides login, register,
  and logout actions so any component can access auth data without prop-drilling.
  Token is persisted in localStorage so session survives page refresh.
*/
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  // loading = true while we restore the session from localStorage on first render
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    handleLoginSuccess(data.data.token, data.data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    handleLoginSuccess(data.data.token, data.data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook – throws a clear error if used outside AuthProvider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};

export default AuthContext;
