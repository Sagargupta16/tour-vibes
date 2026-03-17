import { FileText } from 'lucide-react';

export default function EmptyState({ title = 'No posts found', description = '' }) {
   return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
         <FileText className="mb-4 h-16 w-16 opacity-30" />
         <p className="text-lg font-medium">{title}</p>
         {description && <p className="mt-1 text-sm">{description}</p>}
      </div>
   );
}
