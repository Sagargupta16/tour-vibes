import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Share2 } from 'lucide-react';
import { spring } from '@/lib/motion';

// The native share sheet where there is one (phones), else copy the link
export default function ShareButton({ title, text }) {
   const [copied, setCopied] = useState(false);

   const copy = async (url) => {
      try {
         await navigator.clipboard.writeText(url);
         setCopied(true);
         toast.success('Link copied', { description: 'Paste it anywhere to share this journal.' });
         setTimeout(() => setCopied(false), 2000);
      } catch {
         toast.error('Could not copy the link');
      }
   };

   const share = async () => {
      const url = globalThis.location.href;
      if (navigator.share) {
         try {
            await navigator.share({ title, text, url });
            return;
         } catch (err) {
            // Closing the share sheet is not a failure
            if (err.name === 'AbortError') return;
         }
      }
      await copy(url);
   };

   const Icon = copied ? Check : Share2;

   return (
      <motion.button
         type="button"
         onClick={share}
         whileTap={{ scale: 0.94 }}
         className="inline-flex h-11 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
         <motion.span
            key={copied ? 'copied' : 'share'}
            initial={{ scale: 0.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring.snappy}
            className="grid place-items-center"
         >
            <Icon className="size-4" />
         </motion.span>
         {copied ? 'Copied' : 'Share'}
      </motion.button>
   );
}
