import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudOff, RotateCw, ShieldCheck, UserRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { duration, ease } from '@/lib/motion';
import { useAuth } from '@/contexts/auth-context';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileForm from '@/components/profile/profile-form';
import PasswordForm from '@/components/profile/password-form';
import PageTransition from '@/components/shared/page-transition';

const triggerClass = 'h-9 gap-2 rounded-lg px-4 sm:flex-none';

// Each tab's content rises in when it mounts (inactive panels are unmounted)
function TabPanel({ children }) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: duration.base, ease: ease.out }}
      >
         {children}
      </motion.div>
   );
}

function ProfileSkeleton() {
   return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12" aria-busy="true">
         <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:p-6">
            <Skeleton className="size-24 rounded-full sm:size-28" />
            <div className="flex-1 space-y-3">
               <Skeleton className="h-3 w-24" />
               <Skeleton className="h-7 w-48" />
               <Skeleton className="h-4 w-64 max-w-full" />
            </div>
         </div>
         <Skeleton className="mt-8 h-11 w-60 rounded-xl" />
         <Skeleton className="mt-4 h-96 w-full rounded-2xl" />
      </div>
   );
}

export default function Profile() {
   const { updateUser } = useAuth();
   const [user, setUser] = useState(null);
   const [status, setStatus] = useState('loading');
   const [attempt, setAttempt] = useState(0);

   useEffect(() => {
      const controller = new AbortController();
      const { signal } = controller;
      const load = async () => {
         try {
            const data = await api.get('/auth/profile', { signal });
            setUser(data.user);
            setStatus('ready');
            // A name changed on another device shows in the header from here on
            updateUser({ name: data.user.name, avatar: data.user.avatar || '' });
         } catch (err) {
            if (!signal.aborted && err.name !== 'AbortError') setStatus('error');
         }
      };
      load();
      return () => controller.abort();
   }, [updateUser, attempt]);

   // Every save (details or photo) also updates the session, so the header's name
   // and avatar change with it instead of after the next sign-in
   const handleUpdate = useCallback(
      (next) => {
         setUser(next);
         updateUser({ name: next.name, avatar: next.avatar || '' });
      },
      [updateUser]
   );

   const retry = () => {
      setStatus('loading');
      setAttempt((n) => n + 1);
   };

   if (status === 'loading') return <ProfileSkeleton />;

   if (status === 'error' || !user) {
      return (
         <PageTransition>
            <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
               <span className="grid size-12 place-items-center rounded-xl border bg-card text-muted-foreground">
                  <CloudOff className="size-5" aria-hidden="true" />
               </span>
               <h1 className="mt-4 text-xl font-semibold">Could not load your profile</h1>
               <p className="mt-1 text-sm text-muted-foreground">
                  Check your connection and try again.
               </p>
               <Button onClick={retry} className="mt-6 h-11 gap-2 rounded-xl px-5">
                  <RotateCw className="size-4" aria-hidden="true" />
                  Try again
               </Button>
            </div>
         </PageTransition>
      );
   }

   return (
      <PageTransition>
         <title>Your profile | Tour Vibes</title>
         <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <ProfileHeader user={user} onUpdate={handleUpdate} />
            {/* flex-col here: the shared Tabs root's horizontal variant never matches
                Base UI's data-orientation attribute, so it would lay out as a row */}
            <Tabs defaultValue="profile" className="mt-8 flex-col gap-4">
               <TabsList className="h-11 w-full rounded-xl p-1 sm:w-fit">
                  <TabsTrigger value="profile" className={triggerClass}>
                     <UserRound aria-hidden="true" />
                     Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className={triggerClass}>
                     <ShieldCheck aria-hidden="true" />
                     Security
                  </TabsTrigger>
               </TabsList>
               <TabsContent value="profile">
                  <TabPanel>
                     <ProfileForm user={user} onUpdate={handleUpdate} />
                  </TabPanel>
               </TabsContent>
               <TabsContent value="security">
                  <TabPanel>
                     <PasswordForm />
                  </TabPanel>
               </TabsContent>
            </Tabs>
         </div>
      </PageTransition>
   );
}
