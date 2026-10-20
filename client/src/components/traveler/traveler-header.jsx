import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, PenLine } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { imageUrl } from '@/lib/api';
import { fadeUp, scaleIn, stagger } from '@/lib/motion';
import { initials, memberSince } from '@/components/profile/profile-utils';

// Who this traveler is: photo, name, home base, join date, status and bio. Your
// own page gets a shortcut to the profile editor.
export default function TravelerHeader({ user, isSelf }) {
   const joined = memberSince(user.createdAt);

   return (
      <motion.section
         variants={stagger(0.06)}
         initial="hidden"
         animate="show"
         className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7"
      >
         <motion.div variants={scaleIn} className="w-fit">
            <Avatar className="size-24 border bg-muted sm:size-32">
               <AvatarImage src={imageUrl(user.avatar) || undefined} alt="" />
               <AvatarFallback className="text-2xl font-semibold sm:text-3xl">
                  {initials(user.name)}
               </AvatarFallback>
            </Avatar>
         </motion.div>

         <div className="min-w-0 flex-1">
            <motion.p
               variants={fadeUp}
               className="font-mono text-[11px] font-medium tracking-[0.14em] text-primary uppercase"
            >
               Traveler
            </motion.p>
            <motion.h1
               variants={fadeUp}
               className="mt-1 text-3xl leading-tight font-semibold tracking-tight break-words text-balance sm:text-4xl"
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
                     Member since {joined}
                  </span>
               )}
               {user.status && (
                  <span className="max-w-full truncate rounded-full border px-3 py-0.5 text-xs">
                     {user.status}
                  </span>
               )}
            </motion.div>
            {user.bio && (
               <motion.p
                  variants={fadeUp}
                  className="mt-4 max-w-2xl leading-relaxed text-pretty whitespace-pre-line text-foreground/80"
               >
                  {user.bio}
               </motion.p>
            )}
         </div>

         {isSelf && (
            <motion.div variants={fadeUp} className="sm:self-start">
               <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/profile" />}
                  className="h-11 w-full gap-2 rounded-xl px-4 transition-[background-color,scale] active:scale-[0.96] sm:w-auto"
               >
                  <PenLine className="size-4" aria-hidden="true" />
                  Edit profile
               </Button>
            </motion.div>
         )}
      </motion.section>
   );
}
