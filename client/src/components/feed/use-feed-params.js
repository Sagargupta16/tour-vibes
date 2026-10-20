import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const SORTS = ['newest', 'oldest', 'popular'];

const isDefault = (key, value) =>
   value == null ||
   value === '' ||
   (key === 'sort' && value === 'newest') ||
   (key === 'page' && Number(value) <= 1);

// Feed filters live in the URL (?q=&tag=&sort=&page=), so a filtered feed can be
// shared, the back button steps through filters, and tag links land pre-filtered.
export default function useFeedParams() {
   const [params, setParams] = useSearchParams();
   const q = params.get('q')?.trim() ?? '';
   const tag = params.get('tag')?.trim().toLowerCase() ?? '';
   const sortParam = params.get('sort');
   const sort = SORTS.includes(sortParam) ? sortParam : 'newest';
   const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);

   // Merges changes into the URL; defaults drop out so links stay short
   const update = useCallback(
      (changes, options) => {
         setParams((prev) => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(changes)) {
               if (isDefault(key, value)) next.delete(key);
               else next.set(key, String(value));
            }
            return next;
         }, options);
      },
      [setParams]
   );

   return { q, tag, sort, page, update };
}
