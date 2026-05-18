import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('goalsync_token');
    const cachedUser = localStorage.getItem('goalsync_user');
    
    if (!token) { 
      setLoading(false); 
      return; 
    }
    
    // Use cached user while fetching fresh data (faster initial load)
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid cached data, ignore
      }
    }
    
    // Fetch fresh user data in background
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('goalsync_user', JSON.stringify(data.user));
    } catch (error) {
      localStorage.removeItem('goalsync_token');
      localStorage.removeItem('goalsync_user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadUser(); 
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({
      email: String(email).trim().toLowerCase(),
      password: String(password).trim(),
    });
    if (!data?.token || !data?.user) {
      throw new Error('Invalid login response');
    }
    localStorage.setItem('goalsync_token', data.token);
    localStorage.setItem('goalsync_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('goalsync_token');
    localStorage.removeItem('goalsync_user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('goalsync_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
