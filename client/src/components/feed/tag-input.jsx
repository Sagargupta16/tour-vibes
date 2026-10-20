import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { scaleIn } from '@/lib/motion';

const MAX_TAGS = 8;
// The server stores tags lowercased; a leading # is a habit, not part of the tag
const clean = (raw) => raw.trim().replace(/^#+/, '').toLowerCase().slice(0, 30);

// Tags as removable chips. Enter, comma or leaving the field adds; Backspace on an
// empty field removes the last one; pasting "a, b, c" adds all three.
export default function TagInput({ id, value, onChange }) {
   const [draft, setDraft] = useState('');
   const full = value.length >= MAX_TAGS;

   const add = (raw) => {
      const next = raw.split(',').map(clean).filter(Boolean);
      const merged = [...new Set([...value, ...next])].slice(0, MAX_TAGS);
      if (merged.length !== value.length) onChange(merged);
      setDraft('');
   };
   const remove = (tag) => onChange(value.filter((t) => t !== tag));

   return (
      // A label, so a click anywhere in the box focuses the text field like a native
      // input; the field keeps its own label as its name through aria-labelledby
      <label
         htmlFor={id}
         className="relative flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
      >
         <AnimatePresence initial={false} mode="popLayout">
            {value.map((tag) => (
               <motion.span
                  key={tag}
                  layout
                  variants={scaleIn}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="inline-flex h-8 items-center gap-0.5 rounded-full bg-primary/10 pr-0.5 pl-3 text-sm font-medium text-primary"
               >
                  #{tag}
                  <button
                     type="button"
                     aria-label={`Remove tag ${tag}`}
                     onClick={(e) => {
                        e.stopPropagation();
                        remove(tag);
                     }}
                     className="tv-hit grid size-7 place-items-center rounded-full hover:bg-primary/15"
                  >
                     <X className="size-3.5" />
                  </button>
               </motion.span>
            ))}
         </AnimatePresence>
         {full ? (
            <span className="px-1 text-xs text-muted-foreground">Up to {MAX_TAGS} tags</span>
         ) : (
            <input
               id={id}
               aria-labelledby={`${id}-label`}
               value={draft}
               enterKeyHint="done"
               autoComplete="off"
               placeholder={value.length ? 'Add another' : 'beach, street food, hiking'}
               onChange={(e) => {
                  const text = e.target.value;
                  if (text.includes(',')) add(text);
                  else setDraft(text);
               }}
               onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                     // Enter adds a tag instead of submitting the whole form
                     e.preventDefault();
                     if (draft.trim()) add(draft);
                  } else if (e.key === 'Backspace' && !draft && value.length) {
                     remove(value.at(-1));
                  }
               }}
               onBlur={() => draft.trim() && add(draft)}
               className="h-8 min-w-28 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
         )}
      </label>
   );
}
