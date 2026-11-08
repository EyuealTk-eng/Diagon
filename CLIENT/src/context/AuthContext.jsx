import { createContext, useContext, useEffect, useState } from 'react';
import { api, refreshQ, setAccessToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true); // checking the cookie on first load

  // Still logged in from last time?
  useEffect(() => {
    refreshQ()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setBooting(false));
  }, []);

  const startSession = (data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, user_password) =>
    startSession(await api('/auth/login', { method: 'POST', body: { email, user_password } }));

  const signup = async (form) =>
    startSession(await api('/auth/signup', { method: 'POST', body: form }));

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
