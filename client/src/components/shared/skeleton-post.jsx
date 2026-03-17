import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonPost() {
   return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
         <Skeleton className="h-8 w-2/3" />
         <Skeleton className="h-4 w-1/3" />
         <Skeleton className="h-80 w-full rounded-lg" />
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-5/6" />
         <Skeleton className="h-4 w-4/6" />
      </div>
   );
}
