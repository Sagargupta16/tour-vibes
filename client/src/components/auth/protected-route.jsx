import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsPresent } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';

// Signed-in pages only. The bounced location rides along in state.from so login
// and signup can send the user back to it.
export default function ProtectedRoute() {
   const { isAuth } = useAuth();
   const location = useLocation();
   // While a page animates out it already sees the next location. Signing out from
   // /profile navigates home; without this check the leaving page would redirect
   // to /login on top of that.
   const isPresent = useIsPresent();

   if (!isAuth) {
      return isPresent ? <Navigate to="/login" replace state={{ from: location }} /> : null;
   }

   return <Outlet />;
}
