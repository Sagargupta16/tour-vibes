import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, LoaderCircle } from 'lucide-react';
import { api, imageUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { duration, ease } from '@/lib/motion';
import { initials } from './profile-utils';

// The server's multer filter: PNG or JPG, 5 MB at most (server/middleware/upload.js)
const TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg']);
const MAX_BYTES = 5 * 1024 * 1024;

// Uploads the moment a photo is picked: live preview straight away, a spinner
// while it saves, and back to the old photo if the server says no
export default function AvatarUpload({ name, avatar, onUploaded }) {
   const inputRef = useRef(null);
   // Object URL of the picked file; kept after the save so the photo never flickers
   const [preview, setPreview] = useState(null);
   const [uploading, setUploading] = useState(false);

   useEffect(
      () => () => {
         if (preview) URL.revokeObjectURL(preview);
      },
      [preview]
   );

   const pickFile = async (e) => {
      const file = e.target.files?.[0];
      // Cleared so picking the same file again still fires change
      if (inputRef.current) inputRef.current.value = '';
      if (!file) return;
      if (!TYPES.has(file.type)) {
         toast.error('Choose a PNG or JPG image');
         return;
      }
      if (file.size > MAX_BYTES) {
         toast.error('That photo is over 5 MB. Pick a smaller one.');
         return;
      }
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
         const formData = new FormData();
         formData.append('image', file);
         const data = await api.put('/auth/profile', formData);
         onUploaded(data.user);
         toast.success('Profile photo updated');
      } catch (err) {
         setPreview(null);
         toast.error(err.message);
      } finally {
         setUploading(false);
      }
   };

   const src = preview || imageUrl(avatar);

   return (
      <div className="relative w-fit shrink-0">
         <motion.button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            whileTap={{ scale: 0.96 }}
            aria-label="Change profile photo"
            className="group relative block size-24 overflow-hidden rounded-full border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-primary/40 sm:size-28"
         >
            <AnimatePresence initial={false}>
               {src ? (
                  <motion.img
                     key={src}
                     src={src}
                     alt=""
                     className="absolute inset-0 size-full object-cover"
                     initial={{ opacity: 0, scale: 1.08 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: duration.entrance, ease: ease.out }}
                  />
               ) : (
                  <motion.span
                     key="initials"
                     className="absolute inset-0 grid place-items-center text-2xl font-semibold text-muted-foreground"
                     exit={{ opacity: 0 }}
                  >
                     {initials(name)}
                  </motion.span>
               )}
            </AnimatePresence>
            <span
               className={cn(
                  'absolute inset-0 grid place-items-center bg-black/45 text-white transition-opacity duration-200',
                  uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
               )}
            >
               {uploading ? (
                  <LoaderCircle className="size-6 animate-spin" aria-hidden="true" />
               ) : (
                  <Camera className="size-5" aria-hidden="true" />
               )}
            </span>
         </motion.button>
         {/* Touch screens have no hover, so the camera badge always shows */}
         <span
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground"
         >
            <Camera className="size-4" />
         </span>
         <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            tabIndex={-1}
            className="sr-only"
            onChange={pickFile}
         />
      </div>
   );
}
