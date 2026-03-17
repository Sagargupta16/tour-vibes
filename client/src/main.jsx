import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import App from '@/App';
import './index.css';

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
      <ThemeProvider>
         <AuthProvider>
            <TooltipProvider>
               <App />
               <Toaster richColors position="bottom-right" />
            </TooltipProvider>
         </AuthProvider>
      </ThemeProvider>
   </BrowserRouter>
);
