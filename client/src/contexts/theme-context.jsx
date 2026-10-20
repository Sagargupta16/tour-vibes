import { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo } from 'react';

const ThemeContext = createContext();

// Prefixed like the session keys: other apps on the same origin keep their own `theme`
const STORAGE_KEY = 'tour-vibes:theme';

const darkQuery = () => globalThis.matchMedia('(prefers-color-scheme: dark)');

function getSystemTheme() {
   return darkQuery().matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
   const [theme, setTheme] = useState(() => {
      return localStorage.getItem(STORAGE_KEY) || 'system';
   });
   // Tracked in state so resolvedTheme (and the toaster) follow an OS switch live
   const [systemTheme, setSystemTheme] = useState(getSystemTheme);
   const resolvedTheme = theme === 'system' ? systemTheme : theme;

   useEffect(() => {
      const mq = darkQuery();
      const onChange = () => setSystemTheme(getSystemTheme());
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
   }, []);

   // Layout effect: the class lands before paint, so a view-transition snapshot
   // taken right after setTheme already shows the new theme
   useLayoutEffect(() => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      localStorage.setItem(STORAGE_KEY, theme);
   }, [theme, resolvedTheme]);

   const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, resolvedTheme]);

   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
   const ctx = useContext(ThemeContext);
   if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
   return ctx;
}
