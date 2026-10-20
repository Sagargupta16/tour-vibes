import { CloudOff, Compass, Plus, RotateCw, SearchX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/shared/empty-state';

const action = 'h-11 rounded-full px-5';

// The three ways the feed can come back empty, each with the one useful next step
export default function FeedEmpty({ error, q, tag, onRetry, onClear, onNew }) {
   if (error) {
      return (
         <EmptyState
            icon={CloudOff}
            title="Journals could not be loaded"
            description={error}
            action={
               <Button variant="outline" className={action} onClick={onRetry}>
                  <RotateCw />
                  Try again
               </Button>
            }
         />
      );
   }

   if (q || tag) {
      return (
         <EmptyState
            icon={SearchX}
            title={q ? `Nothing matches "${q}"` : `No journals tagged #${tag}`}
            description="Try another place or word, or browse every journal."
            action={
               <Button variant="outline" className={action} onClick={onClear}>
                  <X />
                  Clear filters
               </Button>
            }
         />
      );
   }

   return (
      <EmptyState
         icon={Compass}
         title="No journals yet"
         description="Be the first to share a trip with the community."
         action={
            <Button className={action} onClick={onNew}>
               <Plus />
               Write the first journal
            </Button>
         }
      />
   );
}
