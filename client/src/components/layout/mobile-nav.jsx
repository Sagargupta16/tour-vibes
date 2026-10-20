import { startTransition } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { ease, spring, stagger } from '@/lib/motion';
import { ThemeSwitcher } from './theme-toggle';
import { UserAvatar } from './user-menu';
import { profileLink } from './nav-items';

const item = {
   hidden: { opacity: 0, x: 24 },
   show: {
      opacity: 1,
      x: 0,
      transition: { ...spring.soft, opacity: { duration: 0.2, ease: ease.out } }
   }
};

const linkClass = ({ isActive }) =>
   cn(
      'tv-press flex h-12 items-center gap-3 rounded-xl px-3 text-base font-medium transition-colors',
      isActive ? 'bg-primary/10 text-primary dark:bg-primary/15' : 'text-foreground hover:bg-muted'
   );

// Sheet body: the same links as the header, staggered in each time the sheet opens
export default function MobileNav({ links, onNavigate }) {
   const { isAuth, userName, logout } = useAuth();
   const navigate = useNavigate();
   const pageLinks = isAuth ? [...links, profileLink] : links;

   const signOut = () => {
      onNavigate();
      // One transition for both: React Router navigates in a transition, so a plain
      // logout() would first render the signed-in page signed out at its own URL, and
      // its guard would redirect to /login instead of home
      startTransition(() => {
         logout();
         navigate('/');
      });
      toast.success('Signed out. Safe travels!');
   };

   return (
      <motion.div
         variants={stagger(0.05, 0.08)}
         initial="hidden"
         animate="show"
         className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
      >
         {isAuth && (
            <motion.div variants={item} className="flex items-center gap-3 px-3">
               <UserAvatar name={userName} className="size-10" />
               <div className="min-w-0">
                  <p className="tv-eyebrow">Signed in as</p>
                  <p className="truncate font-semibold">{userName || 'Traveler'}</p>
               </div>
            </motion.div>
         )}

         <nav aria-label="Mobile" className="flex flex-col gap-1">
            {pageLinks.map(({ to, label, icon: Icon }) => (
               <motion.div key={to} variants={item}>
                  <NavLink to={to} onClick={onNavigate} className={linkClass}>
                     <Icon className="size-5 opacity-80" />
                     {label}
                     <ChevronRight className="ml-auto size-4 opacity-40" />
                  </NavLink>
               </motion.div>
            ))}
         </nav>

         <motion.div variants={item} className="mt-auto space-y-2 px-1">
            <p className="tv-eyebrow px-2">Theme</p>
            <ThemeSwitcher />
         </motion.div>

         <motion.div variants={item} className="grid gap-2 px-1">
            {isAuth ? (
               <Button variant="outline" size="lg" onClick={signOut}>
                  <LogOut />
                  Logout
               </Button>
            ) : (
               <>
                  <Button size="lg" asChild>
                     <Link to="/signup" onClick={onNavigate}>
                        Get started
                     </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                     <Link to="/login" onClick={onNavigate}>
                        Sign in
                     </Link>
                  </Button>
               </>
            )}
         </motion.div>
      </motion.div>
   );
}
