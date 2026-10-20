import { useState, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion, useIsPresent } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { rules } from '@/lib/validators';
import { fadeUp, stagger } from '@/lib/motion';
import AuthShell from '@/components/auth/auth-shell';
import DemoLoginButton from '@/components/auth/demo-login-button';
import FormAlert from '@/components/auth/form-alert';
import FormField from '@/components/auth/form-field';
import PasswordField from '@/components/auth/password-field';
import SubmitButton from '@/components/auth/submit-button';
import useAuthForm from '@/components/auth/use-auth-form';
import useReturnTo from '@/components/auth/use-return-to';

// Set at build time (see the README) to show a one-click demo login, for a
// deployment seeded with `npm run seed` whose API has DEMO_EMAIL set
const DEMO_LOGIN = import.meta.env.VITE_DEMO_LOGIN === 'true';

const RULES = { email: rules.email, password: rules.loginPassword };

const firstName = (name) => String(name || '').split(' ')[0] || 'traveler';

export default function Login() {
   const { isAuth, login, demoLogin } = useAuth();
   const location = useLocation();
   const returnTo = useReturnTo();
   // A page animating out already sees the next location; redirecting from there
   // would drop state.from and send the user to the fallback instead
   const isPresent = useIsPresent();
   const shakeRef = useRef(null);
   const form = useAuthForm({ email: '', password: '' }, RULES, shakeRef);
   // Which button started the request, so only that one spins
   const [pending, setPending] = useState(null);

   // Also the success path: signing in flips isAuth and this sends the user on
   if (isAuth && isPresent) return <Navigate to={returnTo} replace />;

   const run = async (kind, start) => {
      setPending(kind);
      try {
         const data = await start();
         toast.success(`Welcome back, ${firstName(data?.name)}`);
      } catch (err) {
         form.fail(err);
         setPending(null);
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.validateAll()) return;
      void run('form', () => login(form.values.email.trim(), form.values.password));
   };

   return (
      <AuthShell
         eyebrow="Welcome back"
         title="Sign in to your journal"
         subtitle="Pick up where you left off: your trips, your pins and the stories behind them."
         footer={
            <>
               New to Tour Vibes?{' '}
               <Link
                  to="/signup"
                  state={location.state}
                  className="font-medium text-primary underline-offset-4 hover:underline"
               >
                  Create an account
               </Link>
            </>
         }
      >
         <title>Sign in | Tour Vibes</title>
         {DEMO_LOGIN && (
            <>
               <DemoLoginButton
                  loading={pending === 'demo'}
                  disabled={pending !== null}
                  onClick={() => void run('demo', demoLogin)}
               />
               <motion.div
                  variants={fadeUp}
                  className="my-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
               >
                  <span className="h-px flex-1 bg-border" />
                  or use your email
                  <span className="h-px flex-1 bg-border" />
               </motion.div>
            </>
         )}
         <motion.form
            ref={shakeRef}
            variants={stagger(0.06)}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-1"
         >
            <FormAlert message={form.formError} />
            <motion.div variants={fadeUp}>
               <FormField
                  label="Email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  {...form.field('email')}
               />
            </motion.div>
            <motion.div variants={fadeUp}>
               <PasswordField
                  label="Password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  {...form.field('password')}
               />
            </motion.div>
            <motion.div variants={fadeUp} className="pt-2">
               <SubmitButton
                  loading={pending === 'form'}
                  disabled={pending !== null}
                  loadingText="Signing in"
                  variant={DEMO_LOGIN ? 'outline' : undefined}
               >
                  Sign in
                  <ArrowRight className="size-4" aria-hidden="true" />
               </SubmitButton>
            </motion.div>
         </motion.form>
      </AuthShell>
   );
}
