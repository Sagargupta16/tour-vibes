import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudOff, Compass, PenLine, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeUp, stagger } from '@/lib/motion';
import SkeletonCard from '@/components/shared/skeleton-card';
import PageTransition from '@/components/shared/page-transition';

export function TravelerSkeleton() {
   return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12" aria-busy="true">
         <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7">
            <Skeleton className="size-24 rounded-full sm:size-32" />
            <div className="flex-1 space-y-3">
               <Skeleton className="h-3 w-20" />
               <Skeleton className="h-9 w-64 max-w-full" />
               <Skeleton className="h-4 w-80 max-w-full" />
            </div>
         </div>
         <div className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
            {[0, 1, 2].map((i) => (
               <Skeleton key={i} className="h-20 rounded-xl sm:h-28" />
            ))}
         </div>
         <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
               <SkeletonCard key={i} />
            ))}
         </div>
      </div>
   );
}

// Centered message card shared by the not-found and error states
function StateCard({ icon: Icon, title, body, children }) {
   return (
      <PageTransition>
         <motion.div
            variants={stagger(0.07)}
            initial="hidden"
            animate="show"
            className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center"
         >
            <motion.span
               variants={fadeUp}
               className="grid size-14 place-items-center rounded-2xl border bg-card text-primary"
            >
               <Icon className="size-6" aria-hidden="true" />
            </motion.span>
            <motion.h1 variants={fadeUp} className="mt-5 text-2xl font-semibold tracking-tight">
               {title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-pretty text-muted-foreground">
               {body}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-7 flex flex-wrap justify-center gap-3">
               {children}
            </motion.div>
         </motion.div>
      </PageTransition>
   );
}

export function TravelerMissing() {
   return (
      <StateCard
         icon={Compass}
         title="Traveler not found"
         body="This traveler may have left, or the link is off by a character or two."
      >
         <Button
            nativeButton={false}
            render={<Link to="/journals" />}
            className="h-11 rounded-xl px-5"
         >
            Browse journals
         </Button>
         <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/map" />}
            className="h-11 rounded-xl px-5"
         >
            Open the map
         </Button>
      </StateCard>
   );
}

export function TravelerError({ onRetry }) {
   return (
      <StateCard
         icon={CloudOff}
         title="Could not load this traveler"
         body="Check your connection and try again."
      >
         <Button onClick={onRetry} className="h-11 gap-2 rounded-xl px-5">
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
         </Button>
      </StateCard>
   );
}

export function TravelerEmpty({ isSelf, name }) {
   return (
      <motion.div
         variants={fadeUp}
         initial="hidden"
         animate="show"
         className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center"
      >
         <Compass className="size-8 text-muted-foreground" aria-hidden="true" />
         <p className="mt-4 font-medium">
            {isSelf ? 'Your first journal goes here' : `${name} has not posted a journal yet`}
         </p>
         <p className="mt-1 max-w-sm text-sm text-pretty text-muted-foreground">
            {isSelf
               ? 'Write about a trip, add a photo and drop a pin. It shows up here and on the map.'
               : 'Check back after their next trip.'}
         </p>
         {isSelf && (
            <Button
               nativeButton={false}
               render={<Link to="/myjournals" />}
               className="mt-6 h-11 gap-2 rounded-xl px-5"
            >
               <PenLine className="size-4" aria-hidden="true" />
               Write a journal
            </Button>
         )}
      </motion.div>
   );
}
