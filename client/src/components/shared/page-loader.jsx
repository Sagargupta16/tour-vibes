import { Compass } from 'lucide-react';

// Shown while a lazily loaded page chunk downloads
export default function PageLoader() {
   return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
         <Compass className="h-8 w-8 animate-spin" aria-label="Loading page" />
      </div>
   );
}
