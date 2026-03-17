import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [isAuth, setIsAuth] = useState(false);
   const [token, setToken] = useState(null);
   const [userId, setUserId] = useState(null);
   const [userName, setUserName] = useState('');
   const [loading, setLoading] = useState(false);
   const timerRef = useRef(null);

   const logout = useCallback(() => {
      setIsAuth(false);
      setToken(null);
      setUserId(null);
      setUserName('');
      localStorage.removeItem('token');
      localStorage.removeItem('expiryDate');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      if (timerRef.current) clearTimeout(timerRef.current);
   }, []);

   const setAutoLogout = useCallback(
      (ms) => {
         if (timerRef.current) clearTimeout(timerRef.current);
         timerRef.current = setTimeout(logout, ms);
      },
      [logout]
   );

   const setSession = useCallback(
      (data) => {
         const expiry = new Date(Date.now() + 60 * 60 * 1000);
         localStorage.setItem('token', data.token);
         localStorage.setItem('userId', data.userId);
         localStorage.setItem('name', data.name);
         localStorage.setItem('expiryDate', expiry.toISOString());
         setToken(data.token);
         setUserId(data.userId);
         setUserName(data.name);
         setIsAuth(true);
         setAutoLogout(60 * 60 * 1000);
      },
      [setAutoLogout]
   );

   useEffect(() => {
      const storedToken = localStorage.getItem('token');
      const expiryDate = localStorage.getItem('expiryDate');
      if (!storedToken || !expiryDate) return;
      const remaining = new Date(expiryDate).getTime() - Date.now();
      if (remaining <= 0) {
         logout();
         return;
      }
      setToken(storedToken);
      setUserId(localStorage.getItem('userId'));
      setUserName(localStorage.getItem('name') || '');
      setIsAuth(true);
      setAutoLogout(remaining);
   }, [logout, setAutoLogout]);

   useEffect(() => {
      window.addEventListener('auth:expired', logout);
      return () => window.removeEventListener('auth:expired', logout);
   }, [logout]);

   const login = async (email, password) => {
      setLoading(true);
      try {
         const data = await api.post('/auth/login', { email, password });
         setSession(data);
         return data;
      } finally {
         setLoading(false);
      }
   };

   const signup = async (name, email, password) => {
      setLoading(true);
      try {
         return await api.put('/auth/signup', { name, email, password });
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthContext.Provider
         value={{ isAuth, token, userId, userName, loading, login, signup, logout }}
      >
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const ctx = useContext(AuthContext);
   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
   return ctx;
}
