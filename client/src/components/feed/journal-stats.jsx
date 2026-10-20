import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { BookOpen, Heart, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { fadeUp, spring as springs, stagger } from '@/lib/motion';
import { placeOf } from './format';

function CountUp({ value }) {
   const springValue = useSpring(0, {
      stiffness: springs.soft.stiffness,
      damping: springs.soft.damping
   });
   const rounded = useTransform(springValue, (v) => Math.round(v));
   useEffect(() => {
      springValue.set(value);
   }, [springValue, value]);
   return <motion.span>{rounded}</motion.span>;
}

// Places and likes need every journal, not just the visible page. One page is the
// common case and costs nothing extra; more pages are fetched once per total.
export default function JournalStats({ userId, posts, totalPosts, lastPage }) {
   const allKey = `${userId}|${totalPosts}`;
   const [all, setAll] = useState({ key: null, posts: [] });

   useEffect(() => {
      if (!userId || lastPage <= 1) return undefined;
      const controller = new AbortController();
      const load = async () => {
         try {
            const pages = await Promise.all(
               Array.from({ length: lastPage }, (_, i) =>
                  api.get(`/feed/posts/${userId}?page=${i + 1}`, { signal: controller.signal })
               )
            );
            if (!controller.signal.aborted) {
               setAll({ key: allKey, posts: pages.flatMap((page) => page.posts || []) });
            }
         } catch {
            // Falls back to counting the visible page
         }
      };
      void load();
      return () => controller.abort();
   }, [userId, lastPage, allKey]);

   // The visible page wins, so an edit or like shows up before any refetch
   const byId = new Map();
   if (lastPage > 1 && all.key === allKey) all.posts.forEach((p) => byId.set(p._id, p));
   posts.forEach((p) => byId.set(p._id, p));
   const list = [...byId.values()];
   const places = new Set(list.map((p) => placeOf(p.location).toLowerCase()).filter(Boolean));
   const likes = list.reduce((sum, p) => sum + (p.likes?.length ?? 0), 0);

   const stats = [
      { label: 'Journals', value: totalPosts, icon: BookOpen },
      { label: 'Places', value: places.size, icon: MapPin },
      { label: 'Likes', value: likes, icon: Heart }
   ];

   return (
      <motion.dl
         variants={stagger(0.08, 0.1)}
         initial="hidden"
         animate="show"
         className="grid grid-cols-3 divide-x overflow-hidden rounded-xl border bg-card"
      >
         {stats.map(({ label, value, icon: Icon }) => (
            <motion.div
               key={label}
               variants={fadeUp}
               className="flex min-w-0 flex-col gap-1 p-3.5 sm:p-5"
            >
               <dt className="tv-eyebrow flex items-center gap-1.5">
                  <Icon className="hidden size-3.5 sm:block" />
                  {label}
               </dt>
               <dd className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  <CountUp value={value} />
               </dd>
            </motion.div>
         ))}
      </motion.dl>
   );
}
