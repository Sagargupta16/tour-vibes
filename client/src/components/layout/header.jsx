import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { duration, spring } from '@/lib/motion';
import Brand from './brand';
import ThemeToggle from './theme-toggle';
import UserMenu from './user-menu';
import MobileNav from './mobile-nav';
import { navLinksFor } from './nav-items';

function useScrolled(offset = 8) {
   const [scrolled, setScrolled] = useState(() => globalThis.scrollY > offset);
   useEffect(() => {
      const onScroll = () => setScrolled(globalThis.scrollY > offset);
      globalThis.addEventListener('scroll', onScroll, { passive: true });
      return () => globalThis.removeEventListener('scroll', onScroll);
   }, [offset]);
   return scrolled;
}

// Desktop links: a pill follows the pointer and a second one marks the current page
function DesktopNav({ links }) {
   const [hovered, setHovered] = useState(null);

   return (
      <nav
         aria-label="Main"
         className="ml-4 hidden items-center gap-0.5 md:flex"
         onMouseLeave={() => setHovered(null)}
      >
         {links.map(({ to, label }) => (
            <NavLink
               key={to}
               to={to}
               onMouseEnter={() => setHovered(to)}
               className={({ isActive }) =>
                  cn(
                     'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-150',
                     isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )
               }
            >
               {({ isActive }) => (
                  <>
                     <AnimatePresence>
                        {hovered === to && !isActive && (
                           <motion.span
                              layoutId="nav-hover"
                              className="absolute inset-0 rounded-full bg-muted"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, transition: { duration: duration.micro } }}
                              transition={spring.snappy}
                           />
                        )}
                     </AnimatePresence>
                     {isActive && (
                        <motion.span
                           layoutId="nav-active"
                           className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/15"
                           transition={spring.snappy}
                        />
                     )}
                     <span className="relative">{label}</span>
                  </>
               )}
            </NavLink>
         ))}
      </nav>
   );
}

export default function Header() {
   const { isAuth } = useAuth();
   const { pathname } = useLocation();
   const scrolled = useScrolled();
   const links = navLinksFor(isAuth);
   // The sheet remembers the page it was opened on, so any navigation (links,
   // back/forward) closes it without an effect
   const [openOn, setOpenOn] = useState(null);
   const menuOpen = openOn === pathname;
   const setMenuOpen = (open) => setOpenOn(open ? pathname : null);

   return (
      <header
         className={cn(
            'sticky top-0 z-50 w-full border-b bg-background transition-[border-color,box-shadow] duration-300',
            scrolled
               ? 'border-border shadow-[0_8px_24px_-20px_rgb(0_0_0/0.35)]'
               : 'border-transparent'
         )}
      >
         <div className="tv-container flex h-16 items-center gap-2">
            <Brand />
            <DesktopNav links={links} />

            <div className="ml-auto flex items-center gap-1.5">
               <ThemeToggle className="hidden md:inline-flex" />
               {isAuth ? (
                  <UserMenu />
               ) : (
                  <>
                     <Button variant="ghost" asChild className="hidden sm:inline-flex">
                        <Link to="/login">Sign in</Link>
                     </Button>
                     <Button asChild>
                        <Link to="/signup">Get started</Link>
                     </Button>
                  </>
               )}

               <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger
                     render={
                        <Button
                           variant="ghost"
                           size="icon"
                           className="md:hidden"
                           aria-label="Open menu"
                        />
                     }
                  >
                     <Menu className="size-5" />
                  </SheetTrigger>
                  <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-[88%]">
                     <SheetHeader className="border-b px-4 py-2.5">
                        <SheetTitle render={<div />}>
                           <Brand onClick={() => setMenuOpen(false)} />
                        </SheetTitle>
                     </SheetHeader>
                     <MobileNav links={links} onNavigate={() => setMenuOpen(false)} />
                  </SheetContent>
               </Sheet>
            </div>
         </div>
      </header>
   );
}
