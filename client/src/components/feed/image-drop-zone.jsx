import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, RefreshCw, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { duration, ease } from '@/lib/motion';
import { cn } from '@/lib/utils';

// The chosen photo with Replace and Remove (or Keep original on an edit)
function PhotoPreview({
   id,
   preview,
   dragging,
   describedBy,
   isEdit,
   hasNewFile,
   onBrowse,
   onRemove
}) {
   return (
      <div
         className={cn(
            'relative aspect-video overflow-hidden rounded-xl border bg-muted transition-[box-shadow]',
            dragging && 'ring-2 ring-primary'
         )}
      >
         <motion.img
            key={preview}
            src={preview}
            alt="Selected photo"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: duration.entrance, ease: ease.out }}
            className="size-full object-cover"
         />
         <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
            <Button
               id={id}
               type="button"
               variant="secondary"
               className="h-11 rounded-full px-4 sm:h-10"
               aria-describedby={describedBy}
               onClick={onBrowse}
            >
               <RefreshCw />
               Replace
            </Button>
            {hasNewFile && (
               <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-full px-4 sm:h-10"
                  onClick={onRemove}
               >
                  {isEdit ? <Undo2 /> : <X />}
                  {isEdit ? 'Keep original' : 'Remove'}
               </Button>
            )}
         </div>
      </div>
   );
}

// Drop or browse for a photo, with a live preview and Replace / Remove (or, on an
// edit, "Keep original") once one is chosen
export default function ImageDropZone({
   id,
   preview,
   error,
   isEdit,
   hasNewFile,
   onSelect,
   onRemove
}) {
   const inputRef = useRef(null);
   const [dragging, setDragging] = useState(false);
   const browse = () => inputRef.current?.click();

   const dropProps = {
      onDragOver: (e) => {
         e.preventDefault();
         setDragging(true);
      },
      onDragLeave: (e) => {
         if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
      },
      onDrop: (e) => {
         e.preventDefault();
         setDragging(false);
         const file = e.dataTransfer.files?.[0];
         if (file) onSelect(file);
      }
   };
   const describedBy = error ? `${id}-error` : undefined;

   return (
      <div {...dropProps}>
         <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            tabIndex={-1}
            aria-hidden
            className="sr-only"
            onChange={(e) => {
               const file = e.target.files?.[0];
               // Reset so choosing the same file again still fires onChange
               e.target.value = '';
               if (file) onSelect(file);
            }}
         />
         {preview ? (
            <PhotoPreview
               id={id}
               preview={preview}
               dragging={dragging}
               describedBy={describedBy}
               isEdit={isEdit}
               hasNewFile={hasNewFile}
               onBrowse={browse}
               onRemove={onRemove}
            />
         ) : (
            <motion.button
               id={id}
               type="button"
               onClick={browse}
               whileTap={{ scale: 0.99 }}
               aria-invalid={Boolean(error)}
               aria-describedby={describedBy}
               className={cn(
                  'flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  dragging
                     ? 'border-primary bg-primary/5'
                     : 'border-border hover:border-primary/60 hover:bg-muted/50',
                  error && !dragging && 'border-destructive/60'
               )}
            >
               <motion.span
                  animate={{ y: dragging ? -4 : 0, scale: dragging ? 1.08 : 1 }}
                  className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"
               >
                  <ImagePlus className="size-6" />
               </motion.span>
               <span className="text-sm font-medium">
                  {dragging ? 'Drop it here' : 'Drop a photo or '}
                  {!dragging && <span className="text-primary">browse</span>}
               </span>
               <span className="text-xs text-muted-foreground">PNG or JPG, up to 5 MB</span>
            </motion.button>
         )}
      </div>
   );
}
