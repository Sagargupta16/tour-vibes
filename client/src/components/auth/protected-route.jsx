import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export default function ProtectedRoute() {
   const { isAuth } = useAuth();

   if (!isAuth) {
      return <Navigate to="/login" replace />;
   }

   return <Outlet />;
}
