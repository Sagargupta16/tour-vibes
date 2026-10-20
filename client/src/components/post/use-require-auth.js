import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

// Guards a write for anonymous visitors: returns true when signed in, otherwise shows a
// toast whose action goes to /login and comes back here afterwards
export default function useRequireAuth() {
   const { isAuth } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();

   return useCallback(
      (message) => {
         if (isAuth) return true;
         toast(message, {
            action: {
               label: 'Sign in',
               onClick: () => navigate('/login', { state: { from: location } })
            }
         });
         return false;
      },
      [isAuth, navigate, location]
   );
}
