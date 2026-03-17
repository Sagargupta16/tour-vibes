import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ page, lastPage, onPageChange }) {
   if (lastPage <= 1) return null;

   return (
      <div className="flex items-center justify-center gap-4 py-6">
         <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
         >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
         </Button>
         <span className="text-sm text-muted-foreground">
            {page} / {lastPage}
         </span>
         <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => onPageChange(page + 1)}
         >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
         </Button>
      </div>
   );
}
