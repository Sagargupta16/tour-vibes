import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog';

// Confirms a destructive action. `onConfirm` may be async; it closes on success and
// toasts the error otherwise. It cannot be dismissed while the action runs.
export default function ConfirmDialog({
   open,
   onOpenChange,
   title,
   description,
   confirmLabel = 'Delete',
   pendingLabel = 'Deleting...',
   onConfirm
}) {
   const [pending, setPending] = useState(false);

   const confirm = async () => {
      setPending(true);
      try {
         await onConfirm();
         onOpenChange(false);
      } catch (err) {
         toast.error(err.message || 'Something went wrong');
      } finally {
         setPending(false);
      }
   };

   return (
      <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
         <DialogContent showCloseButton={false} className="sm:max-w-sm">
            <DialogHeader>
               <span className="mb-1 grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
                  <Trash2 className="size-5" />
               </span>
               <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
               {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <DialogFooter>
               <Button
                  variant="outline"
                  className="h-11 sm:h-9"
                  disabled={pending}
                  onClick={() => onOpenChange(false)}
               >
                  Cancel
               </Button>
               <Button
                  variant="destructive"
                  className="h-11 sm:h-9"
                  disabled={pending}
                  onClick={confirm}
               >
                  {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  {pending ? pendingLabel : confirmLabel}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
