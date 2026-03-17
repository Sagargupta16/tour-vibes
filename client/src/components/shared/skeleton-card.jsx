import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCard() {
   return (
      <Card className="overflow-hidden">
         <Skeleton className="h-48 w-full rounded-none" />
         <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-1 h-3 w-1/2" />
         </CardHeader>
         <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
         </CardContent>
      </Card>
   );
}
