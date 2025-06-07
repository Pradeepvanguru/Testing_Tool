
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile as fetchUserProfileAPI } from '@/services/api';

const AuthContext = createContext(null);

// Move useAuth hook definition before the AuthProvider component
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profile = await fetchUserProfileAPI();
          setUser(profile.user || profile); 
        } catch (error) {
          console.error('Failed to fetch user profile:', error.message);
          setAuthToken(null); 
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken, userData) => {
    setAuthToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setAuthToken, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export both the hook and provider
export { AuthProvider, useAuth };
