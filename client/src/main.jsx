import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import App from '@/App';
import '@fontsource-variable/inter';
import '@fontsource-variable/schibsted-grotesk';
import './index.css';

// The GitHub Pages demo is served from /tour-vibes/; every other build from /
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

// Only the static demo build has the banner; every other build drops this import
const DemoBanner =
   import.meta.env.VITE_STATIC_DEMO === 'true'
      ? lazy(() => import('@/components/demo/demo-banner'))
      : null;

createRoot(document.getElementById('root')).render(
   <BrowserRouter basename={basename}>
      <ThemeProvider>
         <AuthProvider>
            <TooltipProvider>
               {DemoBanner && (
                  <Suspense fallback={null}>
                     <DemoBanner />
                  </Suspense>
               )}
               <App />
               <Toaster richColors position="bottom-right" />
            </TooltipProvider>
         </AuthProvider>
      </ThemeProvider>
   </BrowserRouter>
);
