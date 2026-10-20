import { Link } from 'react-router-dom';
import { ArrowUpRight, Github } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Brand from './brand';
import { REPO_URL, navLinksFor, profileLink } from './nav-items';

const linkClass =
   'tv-link inline-flex items-center gap-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground pointer-coarse:min-h-11';

function Column({ title, children }) {
   return (
      <div>
         <p className="tv-eyebrow mb-3">{title}</p>
         <ul className="flex flex-col gap-1.5">{children}</ul>
      </div>
   );
}

export default function SiteFooter() {
   const { isAuth } = useAuth();
   const year = new Date().getFullYear();
   const account = isAuth
      ? [{ to: '/myjournals', label: 'My Journals' }, profileLink]
      : [
           { to: '/login', label: 'Sign in' },
           { to: '/signup', label: 'Create an account' }
        ];

   return (
      <footer className="border-t bg-card/40">
         <div className="tv-container grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="col-span-2 sm:col-span-1">
               <Brand />
               <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                  Write the trip, pin the place, share the story. Journals from travelers, on a map
                  anyone can wander.
               </p>
            </div>

            <Column title="Explore">
               {navLinksFor(false).map(({ to, label }) => (
                  <li key={to}>
                     <Link to={to} className={linkClass}>
                        {label}
                     </Link>
                  </li>
               ))}
            </Column>

            <Column title="Account">
               {account.map(({ to, label }) => (
                  <li key={to}>
                     <Link to={to} className={linkClass}>
                        {label}
                     </Link>
                  </li>
               ))}
            </Column>

            <Column title="Project">
               <li>
                  <a href={REPO_URL} target="_blank" rel="noreferrer" className={linkClass}>
                     <Github className="size-3.5" />
                     GitHub
                     <ArrowUpRight className="size-3 opacity-60" />
                  </a>
               </li>
               <li>
                  <a
                     href={`${REPO_URL}/issues`}
                     target="_blank"
                     rel="noreferrer"
                     className={linkClass}
                  >
                     Report an issue
                  </a>
               </li>
            </Column>
         </div>

         <div className="border-t">
            <div className="tv-container flex flex-col gap-2 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
               <p>Tour Vibes &middot; Share your travel stories</p>
               <p className="font-mono text-xs tabular-nums">
                  &copy; {year} Tour Vibes. MIT licensed.
               </p>
            </div>
         </div>
      </footer>
   );
}
