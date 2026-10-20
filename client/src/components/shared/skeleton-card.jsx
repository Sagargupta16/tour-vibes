import { Skeleton } from '@/components/ui/skeleton';

// Mirrors PostCard: 4:3 photo, title, two-line excerpt, tags, author row
export default function SkeletonCard() {
   return (
      <div aria-hidden className="flex flex-col overflow-hidden rounded-xl border bg-card">
         <Skeleton className="aspect-[4/3] w-full rounded-none" />
         <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-2">
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-3.5 w-full" />
               <Skeleton className="h-3.5 w-2/3" />
            </div>
            <div className="flex gap-1.5">
               <Skeleton className="h-7 w-16 rounded-full" />
               <Skeleton className="h-7 w-12 rounded-full" />
            </div>
            <div className="mt-auto flex items-center gap-2 pt-1">
               <Skeleton className="size-6 rounded-full" />
               <Skeleton className="h-3 w-28" />
               <Skeleton className="ml-auto h-3 w-8" />
            </div>
         </div>
      </div>
   );
}
