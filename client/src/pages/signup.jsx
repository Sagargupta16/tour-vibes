import { useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, useIsPresent } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { NAME_MAX, PASSWORD_MIN, rules } from '@/lib/validators';
import { fadeUp, stagger } from '@/lib/motion';
import AuthShell from '@/components/auth/auth-shell';
import FormAlert from '@/components/auth/form-alert';
import FormField from '@/components/auth/form-field';
import PasswordField from '@/components/auth/password-field';
import PasswordStrength from '@/components/auth/password-strength';
import SubmitButton from '@/components/auth/submit-button';
import useAuthForm from '@/components/auth/use-auth-form';
import useReturnTo from '@/components/auth/use-return-to';

const DEMO_LOGIN = import.meta.env.VITE_DEMO_LOGIN === 'true';

const RULES = { name: rules.name, email: rules.email, password: rules.password };

export default function Signup() {
   const { isAuth, signup, loading } = useAuth();
   const location = useLocation();
   const navigate = useNavigate();
   const returnTo = useReturnTo();
   // A page animating out already sees the next location; redirecting from there
   // would drop state.from and send the user to the fallback instead
   const isPresent = useIsPresent();
   const shakeRef = useRef(null);
   const form = useAuthForm({ name: '', email: '', password: '' }, RULES, shakeRef);

   // Also the success path: signup signs straight in, which flips isAuth
   if (isAuth && isPresent) return <Navigate to={returnTo} replace />;

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.validateAll()) return;
      const { name, email, password } = form.values;
      try {
         const data = await signup(name.trim(), email.trim(), password);
         toast.success(`Welcome to Tour Vibes, ${String(data?.name || name).split(' ')[0]}`);
      } catch (err) {
         if (err.accountCreated) {
            toast.success('Account created. Sign in to continue.');
            navigate('/login', { replace: true, state: location.state });
            return;
         }
         form.fail(err);
      }
   };

   return (
      <AuthShell
         eyebrow="Start your journal"
         title="Every trip deserves a story"
         subtitle="Create a free account to post journals, pin them on the map and follow other travelers."
         footer={
            <>
               Already have an account?{' '}
               <Link
                  to="/login"
                  state={location.state}
                  className="font-medium text-primary underline-offset-4 hover:underline"
               >
                  Sign in
               </Link>
               {DEMO_LOGIN && (
                  <span className="mt-2 block">
                     Just looking?{' '}
                     <Link
                        to="/login"
                        state={location.state}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                     >
                        Try the demo account
                     </Link>
                  </span>
               )}
            </>
         }
      >
         <title>Create account | Tour Vibes</title>
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
                  label="Name"
                  icon={UserRound}
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  placeholder="How other travelers see you"
                  {...form.field('name')}
               />
            </motion.div>
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
            <motion.div variants={fadeUp} className="space-y-1">
               <PasswordField
                  label="Password"
                  autoComplete="new-password"
                  placeholder={`At least ${PASSWORD_MIN} characters`}
                  hint="Longer with mixed case, digits and symbols is stronger"
                  {...form.field('password')}
               />
               <PasswordStrength value={form.values.password} />
            </motion.div>
            <motion.div variants={fadeUp} className="pt-4">
               <SubmitButton loading={loading} loadingText="Creating your account">
                  Create account
                  <ArrowRight className="size-4" aria-hidden="true" />
               </SubmitButton>
            </motion.div>
         </motion.form>
      </AuthShell>
   );
}
