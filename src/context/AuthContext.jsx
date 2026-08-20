import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);
const STORAGE_KEY = 'store-rating-user';

const parseStoredUser = () => {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return null;

  try {
    const storedUser = JSON.parse(value);
    const payload = storedUser?.token ? jwtDecode(storedUser.token) : null;
    if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return storedUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => parseStoredUser());

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (userData) => {
    const tokenPayload = decodeToken(userData?.token);
    const normalizedUser = {
      token: userData?.token || '',
      id: userData?.id || tokenPayload?.sub || userData?.email || 'guest',
      name: userData?.name || tokenPayload?.name || 'Store User',
      email: userData?.email || tokenPayload?.email || '',
      role: String(userData?.role || tokenPayload?.role || 'USER').toUpperCase(),
    };

    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
