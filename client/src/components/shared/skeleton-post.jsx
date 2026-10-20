import { Skeleton } from '@/components/ui/skeleton';

// Mirrors the single journal: full-bleed hero, meta row, actions, story, comments
export default function SkeletonPost() {
   return (
      <div aria-busy="true" aria-label="Loading journal">
         <Skeleton className="h-[62svh] max-h-[42rem] min-h-[22rem] w-full rounded-none" />
         <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
            <div className="flex items-center gap-3">
               <Skeleton className="size-11 rounded-full" />
               <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
               </div>
            </div>
            <div className="flex gap-2">
               <Skeleton className="h-11 w-20 rounded-full" />
               <Skeleton className="h-11 w-24 rounded-full" />
            </div>
            <div className="space-y-3">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-11/12" />
               <Skeleton className="h-4 w-5/6" />
               <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-56 w-full rounded-xl" />
         </div>
      </div>
   );
}
