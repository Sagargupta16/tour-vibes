import {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
   useRef,
   useMemo
} from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

// Read synchronously so the first render already knows the session. Restoring it
// in an effect let ProtectedRoute redirect first, so reloading or opening a link
// to any signed-in page (/map, /journals/:id) bounced to /journals.
const readStoredSession = () => {
   const token = localStorage.getItem('token');
   const expiryDate = localStorage.getItem('expiryDate');
   if (!token || !expiryDate) return null;
   const remaining = new Date(expiryDate).getTime() - Date.now();
   if (!(remaining > 0)) return null;
   return {
      token,
      remaining,
      userId: localStorage.getItem('userId'),
      name: localStorage.getItem('name') || ''
   };
};

export function AuthProvider({ children }) {
   const [stored] = useState(readStoredSession);
   const [isAuth, setIsAuth] = useState(Boolean(stored));
   const [token, setToken] = useState(stored?.token ?? null);
   const [userId, setUserId] = useState(stored?.userId ?? null);
   const [userName, setUserName] = useState(stored?.name ?? '');
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
      if (stored) {
         setAutoLogout(stored.remaining);
      } else if (localStorage.getItem('token')) {
         // Expired session left in storage
         logout();
      }
   }, [stored, logout, setAutoLogout]);

   useEffect(() => {
      globalThis.addEventListener('auth:expired', logout);
      return () => globalThis.removeEventListener('auth:expired', logout);
   }, [logout]);

   const login = useCallback(
      async (email, password) => {
         setLoading(true);
         try {
            const data = await api.post('/auth/login', { email, password });
            setSession(data);
            return data;
         } finally {
            setLoading(false);
         }
      },
      [setSession]
   );

   const signup = useCallback(async (name, email, password) => {
      setLoading(true);
      try {
         return await api.put('/auth/signup', { name, email, password });
      } finally {
         setLoading(false);
      }
   }, []);

   const value = useMemo(
      () => ({ isAuth, token, userId, userName, loading, login, signup, logout }),
      [isAuth, token, userId, userName, loading, login, signup, logout]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
   const ctx = useContext(AuthContext);
   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
   return ctx;
}
