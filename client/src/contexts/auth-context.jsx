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
import { SESSION_KEYS, clearStored, getStored, removeStored, setStored } from '@/lib/session';

const AuthContext = createContext();

const SESSION_MS = 60 * 60 * 1000;

// Read synchronously so the first render already knows the session. Restoring it
// in an effect let ProtectedRoute redirect first, so reloading or opening a link
// to any signed-in page (/profile, /myjournals) bounced to /login.
const readStoredSession = () => {
   const token = getStored('token');
   const expiryDate = getStored('expiryDate');
   if (!token || !expiryDate) return null;
   const remaining = new Date(expiryDate).getTime() - Date.now();
   // An unparseable expiry gives NaN, which counts as expired
   if (Number.isNaN(remaining) || remaining <= 0) return null;
   return {
      token,
      remaining,
      userId: getStored('userId'),
      name: getStored('name') || '',
      avatar: getStored('avatar') || ''
   };
};

export function AuthProvider({ children }) {
   const [stored] = useState(readStoredSession);
   const [isAuth, setIsAuth] = useState(Boolean(stored));
   const [token, setToken] = useState(stored?.token ?? null);
   const [userId, setUserId] = useState(stored?.userId ?? null);
   const [userName, setUserName] = useState(stored?.name ?? '');
   const [avatar, setAvatar] = useState(stored?.avatar ?? '');
   const [loading, setLoading] = useState(false);
   const timerRef = useRef(null);

   const clearState = useCallback(() => {
      setIsAuth(false);
      setToken(null);
      setUserId(null);
      setUserName('');
      setAvatar('');
      if (timerRef.current) clearTimeout(timerRef.current);
   }, []);

   const logout = useCallback(() => {
      clearState();
      clearStored();
   }, [clearState]);

   const setAutoLogout = useCallback(
      (ms) => {
         if (timerRef.current) clearTimeout(timerRef.current);
         timerRef.current = setTimeout(logout, ms);
      },
      [logout]
   );

   const applySession = useCallback(
      (session) => {
         setToken(session.token);
         setUserId(session.userId);
         setUserName(session.name);
         setAvatar(session.avatar);
         setIsAuth(true);
         setAutoLogout(session.remaining);
      },
      [setAutoLogout]
   );

   // The profile page calls this after a save so the header shows the new name and
   // photo straight away, and a reload keeps them
   const updateUser = useCallback(({ name, avatar: nextAvatar } = {}) => {
      if (typeof name === 'string' && name.trim()) {
         setStored('name', name);
         setUserName(name);
      }
      if (typeof nextAvatar === 'string') {
         setStored('avatar', nextAvatar);
         setAvatar(nextAvatar);
      }
   }, []);

   // The login response has no avatar, and a name changed on another device stays
   // stale in storage; one profile read fixes both
   const refreshUser = useCallback(async () => {
      const current = getStored('token');
      if (!current) return;
      try {
         const { user } = await api.get('/auth/profile');
         // Signed out (or in as someone else) while the request ran
         if (user && getStored('token') === current) {
            updateUser({ name: user.name, avatar: user.avatar || '' });
         }
      } catch {
         // A 401 already signs out through auth:expired; anything else keeps the cache
      }
   }, [updateUser]);

   const setSession = useCallback(
      (data) => {
         const expiry = new Date(Date.now() + SESSION_MS);
         setStored('userId', data.userId);
         setStored('name', data.name);
         removeStored('avatar');
         setStored('expiryDate', expiry.toISOString());
         // Written last: other tabs react to the token key and read the rest with it
         setStored('token', data.token);
         applySession({ ...data, avatar: '', remaining: SESSION_MS });
         void refreshUser();
      },
      [applySession, refreshUser]
   );

   useEffect(() => {
      if (stored) {
         setAutoLogout(stored.remaining);
         void refreshUser();
      } else if (getStored('token')) {
         // Expired session left in storage
         logout();
      }
   }, [stored, logout, setAutoLogout, refreshUser]);

   useEffect(() => {
      globalThis.addEventListener('auth:expired', logout);
      return () => globalThis.removeEventListener('auth:expired', logout);
   }, [logout]);

   // Signing in or out in another tab follows here too, instead of this tab sending
   // a dead token until its own timer fires
   useEffect(() => {
      const onStorage = (e) => {
         if (e.key !== null && !SESSION_KEYS.includes(e.key)) return;
         const next = readStoredSession();
         if (next) applySession(next);
         else clearState();
      };
      globalThis.addEventListener('storage', onStorage);
      return () => globalThis.removeEventListener('storage', onStorage);
   }, [applySession, clearState]);

   const startSession = useCallback(
      async (path, body) => {
         setLoading(true);
         try {
            const data = await api.post(path, body);
            setSession(data);
            return data;
         } finally {
            setLoading(false);
         }
      },
      [setSession]
   );

   const login = useCallback(
      (email, password) => startSession('/auth/login', { email, password }),
      [startSession]
   );

   // Signs in as the server's DEMO_EMAIL account, no password involved
   const demoLogin = useCallback(() => startSession('/auth/demo', {}), [startSession]);

   // Creates the account and signs straight in. If only the sign-in step fails (a
   // rate limit, say) the error carries accountCreated so the page can send the
   // user to /login instead of letting a retry hit "Email already registered".
   const signup = useCallback(
      async (name, email, password) => {
         setLoading(true);
         try {
            await api.put('/auth/signup', { name, email, password });
            try {
               const data = await api.post('/auth/login', { email, password });
               setSession(data);
               return data;
            } catch (err) {
               err.accountCreated = true;
               throw err;
            }
         } finally {
            setLoading(false);
         }
      },
      [setSession]
   );

   const value = useMemo(
      () => ({
         isAuth,
         token,
         userId,
         userName,
         avatar,
         loading,
         login,
         demoLogin,
         signup,
         logout,
         updateUser,
         refreshUser
      }),
      [
         isAuth,
         token,
         userId,
         userName,
         avatar,
         loading,
         login,
         demoLogin,
         signup,
         logout,
         updateUser,
         refreshUser
      ]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
   const ctx = useContext(AuthContext);
   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
   return ctx;
}
