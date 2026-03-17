import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, PenLine, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import PageTransition from '@/components/shared/page-transition';

const features = [
   {
      icon: PenLine,
      title: 'Share Stories',
      description: 'Document your travel experiences with photos, tags, and location details.'
   },
   {
      icon: Compass,
      title: 'Explore Destinations',
      description: 'Discover new places through journals from travelers around the world.'
   },
   {
      icon: Users,
      title: 'Connect',
      description: 'Like, comment, and engage with a community of fellow travelers.'
   }
];

export default function Home() {
   const { isAuth } = useAuth();

   return (
      <PageTransition>
         <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
            >
               <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
                  Your Travel
                  <span className="block bg-gradient-to-r from-neutral-600 to-neutral-400 bg-clip-text text-transparent dark:from-neutral-300 dark:to-neutral-500">
                     Journal Awaits
                  </span>
               </h1>
               <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                  Capture moments, share adventures, and relive your journeys. A beautiful space for
                  your travel stories.
               </p>
               <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {isAuth ? (
                     <Button size="lg" asChild>
                        <Link to="/journals">Browse Journals</Link>
                     </Button>
                  ) : (
                     <>
                        <Button size="lg" asChild>
                           <Link to="/signup">Start Journaling</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                           <Link to="/login">Sign In</Link>
                        </Button>
                     </>
                  )}
               </div>
            </motion.div>
         </section>

         <section className="border-t py-16">
            <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
               {features.map((feature, i) => (
                  <motion.div
                     key={feature.title}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.15 }}
                     className="rounded-lg border bg-card p-6 text-center"
                  >
                     <feature.icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                     <h3 className="font-semibold">{feature.title}</h3>
                     <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
               ))}
            </div>
         </section>
      </PageTransition>
   );
}
