import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
   return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme) {
   return theme === 'system' ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }) {
   const [theme, setTheme] = useState(() => {
      return localStorage.getItem('theme') || 'system';
   });

   useEffect(() => {
      const root = document.documentElement;
      const applyTheme = () => {
         const resolved = resolveTheme(theme);
         root.classList.remove('light', 'dark');
         root.classList.add(resolved);
      };

      applyTheme();
      localStorage.setItem('theme', theme);

      const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
   }, [theme]);

   const value = useMemo(
      () => ({ theme, setTheme, resolvedTheme: resolveTheme(theme) }),
      [theme]
   );

   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
   const ctx = useContext(ThemeContext);
   if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
   return ctx;
}
