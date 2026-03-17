import { Link, NavLink } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import MobileNav from './mobile-nav';

const navLinkClass = ({ isActive }) =>
   `text-sm font-medium transition-colors hover:text-foreground ${
      isActive ? 'text-foreground' : 'text-muted-foreground'
   }`;

export default function Header() {
   const { isAuth, userName, logout } = useAuth();
   const { resolvedTheme, setTheme } = useTheme();

   const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

   return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
         <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
               <Compass className="h-5 w-5" />
               Tour Vibes
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
               {isAuth ? (
                  <>
                     <NavLink to="/journals" className={navLinkClass}>
                        Journals
                     </NavLink>
                     <NavLink to="/myjournals" className={navLinkClass}>
                        My Journals
                     </NavLink>
                  </>
               ) : (
                  <>
                     <NavLink to="/login" className={navLinkClass}>
                        Login
                     </NavLink>
                     <NavLink to="/signup" className={navLinkClass}>
                        Sign Up
                     </NavLink>
                  </>
               )}
            </nav>

            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {resolvedTheme === 'dark' ? (
                     <Sun className="h-4 w-4" />
                  ) : (
                     <Moon className="h-4 w-4" />
                  )}
               </Button>

               {isAuth && (
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                           <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                 {userName?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                           </Avatar>
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-sm font-medium">{userName}</div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                           <Link to="/profile">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                           <LogOut className="mr-2 h-4 w-4" />
                           Logout
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               )}

               <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                     <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                     </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                     <SheetHeader>
                        <SheetTitle>Tour Vibes</SheetTitle>
                     </SheetHeader>
                     <MobileNav />
                  </SheetContent>
               </Sheet>
            </div>
         </div>
      </header>
   );
}
