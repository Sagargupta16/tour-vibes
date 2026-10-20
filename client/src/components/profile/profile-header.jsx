import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpenText, CalendarDays, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeUp, scaleIn, stagger } from '@/lib/motion';
import AvatarUpload from './avatar-upload';
import { memberSince } from './profile-utils';

// Top card of the profile page: photo (tap to change), name, where they are, when
// they joined, and the way out to the public traveler page
export default function ProfileHeader({ user, onUpdate }) {
   const joined = memberSince(user.createdAt);
   const journals = Array.isArray(user.posts) ? user.posts.length : null;

   return (
      <motion.section
         variants={stagger(0.06)}
         initial="hidden"
         animate="show"
         className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
      >
         <motion.div variants={scaleIn}>
            <AvatarUpload name={user.name} avatar={user.avatar} onUploaded={onUpdate} />
         </motion.div>
         <div className="min-w-0 flex-1">
            <motion.p
               variants={fadeUp}
               className="font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase"
            >
               Your profile
            </motion.p>
            <motion.h1
               variants={fadeUp}
               className="mt-1 text-2xl font-semibold tracking-tight break-words text-balance sm:text-3xl"
            >
               {user.name}
            </motion.h1>
            <motion.div
               variants={fadeUp}
               className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground"
            >
               {user.location && (
                  <span className="flex items-center gap-1.5">
                     <MapPin className="size-3.5" aria-hidden="true" />
                     {user.location}
                  </span>
               )}
               {joined && (
                  <span className="flex items-center gap-1.5">
                     <CalendarDays className="size-3.5" aria-hidden="true" />
                     Joined {joined}
                  </span>
               )}
               {journals !== null && (
                  <span className="flex items-center gap-1.5 tabular-nums">
                     <BookOpenText className="size-3.5" aria-hidden="true" />
                     {journals} {journals === 1 ? 'journal' : 'journals'}
                  </span>
               )}
            </motion.div>
            {user.status && (
               <motion.p
                  variants={fadeUp}
                  className="mt-3 inline-flex max-w-full rounded-full border px-3 py-1 text-xs text-muted-foreground"
               >
                  <span className="truncate">{user.status}</span>
               </motion.p>
            )}
         </div>
         <motion.div variants={fadeUp} className="sm:self-start">
            <Button
               variant="outline"
               nativeButton={false}
               render={<Link to={`/travelers/${user._id}`} />}
               className="group/link h-11 w-full gap-2 rounded-xl px-4 transition-[background-color,scale] active:scale-[0.96] sm:w-auto"
            >
               View public page
               <ArrowUpRight
                  className="size-4 transition-transform duration-200 ease-out group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  aria-hidden="true"
               />
            </Button>
         </motion.div>
      </motion.section>
   );
}
