import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
   const [theme, setTheme] = useState(() => {
      return localStorage.getItem('theme') || 'system';
   });

   useEffect(() => {
      const root = document.documentElement;
      const applyTheme = () => {
         const resolved =
            theme === 'system'
               ? window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
               : theme;
         root.classList.remove('light', 'dark');
         root.classList.add(resolved);
      };

      applyTheme();
      localStorage.setItem('theme', theme);

      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
   }, [theme]);

   const resolvedTheme =
      theme === 'system'
         ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
         : theme;

   return (
      <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
         {children}
      </ThemeContext.Provider>
   );
}

export function useTheme() {
   const ctx = useContext(ThemeContext);
   if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
   return ctx;
}
