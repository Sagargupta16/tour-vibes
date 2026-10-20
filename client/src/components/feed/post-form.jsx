import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog';
import PostFormBody from './post-form-body';

// Create or edit a journal. `onSubmit(formData)` does the request and may throw; the
// form shows field errors from a 422 and toasts the rest.
export default function PostForm({ open, onOpenChange, editPost, onSubmit }) {
   const close = () => onOpenChange(false);

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
            <DialogHeader className="gap-1 border-b px-5 py-4 pr-12">
               <DialogTitle className="text-lg font-semibold tracking-tight">
                  {editPost ? 'Edit journal' : 'New journal'}
               </DialogTitle>
               <DialogDescription>
                  {editPost
                     ? 'Update the story, photo or place.'
                     : 'A photo, a title and a few lines about the trip.'}
               </DialogDescription>
            </DialogHeader>
            <PostFormBody
               key={editPost?._id ?? 'new'}
               editPost={editPost}
               onSubmit={onSubmit}
               onDone={close}
               onCancel={close}
            />
         </DialogContent>
      </Dialog>
   );
}
