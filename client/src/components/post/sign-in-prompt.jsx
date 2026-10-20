import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Stands in for a form anonymous visitors cannot use; sign-in returns to this page
export default function SignInPrompt({ title, description }) {
   const location = useLocation();
   return (
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
         <div className="space-y-1">
            <p className="font-medium">{title}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
         </div>
         <Link
            to="/login"
            state={{ from: location }}
            className={cn(buttonVariants(), 'h-11 shrink-0 rounded-full px-5 sm:h-10')}
         >
            <LogIn />
            Sign in
         </Link>
      </div>
   );
}
