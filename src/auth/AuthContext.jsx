import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check local storage for token
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.auth.me()
        .then(u => {
          setUser(u);
        })
        .catch(err => {
          console.error("Auth check failed", err);
          localStorage.removeItem('auth_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [])

  const signIn = async (email, password) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const signUp = async (email, password, fullName) => {
    const res = await api.auth.signup({ email, password, full_name: fullName });
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}