import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, NotebookPen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { profileLink } from './nav-items';

export function UserAvatar({ name, className }) {
   return (
      <Avatar className={cn('size-8', className)}>
         <AvatarFallback className="bg-primary/12 font-display text-sm font-bold text-primary">
            {name?.trim().charAt(0).toUpperCase() || 'U'}
         </AvatarFallback>
      </Avatar>
   );
}

// Signed-in avatar menu: Profile, My Journals, Logout
export default function UserMenu() {
   const { userName, logout } = useAuth();
   const navigate = useNavigate();

   const signOut = () => {
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
      <DropdownMenu>
         <DropdownMenuTrigger
            render={
               <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full aria-expanded:bg-muted"
                  aria-label="Account menu"
               />
            }
         >
            <UserAvatar name={userName} />
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end" sideOffset={8} className="w-60">
            <div className="flex items-center gap-3 px-2 py-2.5">
               <UserAvatar name={userName} className="size-9" />
               <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{userName || 'Traveler'}</p>
                  <p className="tv-eyebrow">Signed in</p>
               </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(profileLink.to)}>
               <profileLink.icon />
               {profileLink.label}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/myjournals')}>
               <NotebookPen />
               My Journals
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={signOut}>
               <LogOut />
               Logout
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
