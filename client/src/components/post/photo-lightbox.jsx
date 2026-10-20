import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

// Full-screen photo viewer. Base UI handles focus, Escape and scroll lock; the
// starting/ending style attributes drive the fade and zoom in CSS.
export default function PhotoLightbox({ open, onOpenChange, src, alt, caption }) {
   return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
         <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-black/90 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <DialogPrimitive.Popup
               className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 p-4 outline-none transition-[opacity,scale] duration-300 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
               onClick={(e) => {
                  // A tap on the dark area closes; a tap on the photo does not
                  if (e.target === e.currentTarget) onOpenChange(false);
               }}
            >
               <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>
               <img
                  src={src}
                  alt={alt}
                  className="max-h-[82svh] max-w-full rounded-lg object-contain"
               />
               {caption && (
                  <p className="max-w-prose text-center text-sm text-white/75">{caption}</p>
               )}
               <DialogPrimitive.Close
                  aria-label="Close photo"
                  className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
               >
                  <X className="size-5" />
               </DialogPrimitive.Close>
            </DialogPrimitive.Popup>
         </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
   );
}
