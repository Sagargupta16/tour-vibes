import { cn } from '@/lib/utils';

// A light band sweeps across instead of a whole-block pulse, so loading reads as motion
function Skeleton({ className, ...props }) {
   return (
      <div
         data-slot="skeleton"
         className={cn(
            'relative overflow-hidden rounded-md bg-muted after:absolute after:inset-0 after:animate-shimmer after:bg-linear-to-r after:from-transparent after:via-foreground/[0.06] after:to-transparent',
            className
         )}
         {...props}
      />
   );
}

export { Skeleton };
