import { NavLink } from 'react-router-dom';
import { SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function MobileNav() {
   const { isAuth, userName, logout } = useAuth();

   const linkClass =
      'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent';

   return (
      <nav className="mt-4 flex flex-col gap-1">
         {isAuth ? (
            <>
               <p className="mb-2 px-3 text-xs text-muted-foreground">Hi, {userName}</p>
               <SheetClose asChild>
                  <NavLink to="/journals" className={linkClass}>
                     Journals
                  </NavLink>
               </SheetClose>
               <SheetClose asChild>
                  <NavLink to="/myjournals" className={linkClass}>
                     My Journals
                  </NavLink>
               </SheetClose>
               <SheetClose asChild>
                  <NavLink to="/profile" className={linkClass}>
                     Profile
                  </NavLink>
               </SheetClose>
               <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" onClick={logout}>
                     Logout
                  </Button>
               </SheetClose>
            </>
         ) : (
            <>
               <SheetClose asChild>
                  <NavLink to="/login" className={linkClass}>
                     Login
                  </NavLink>
               </SheetClose>
               <SheetClose asChild>
                  <NavLink to="/signup" className={linkClass}>
                     Sign Up
                  </NavLink>
               </SheetClose>
            </>
         )}
      </nav>
   );
}
