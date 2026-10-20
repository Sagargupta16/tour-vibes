import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';
import { PASSWORD_MIN, required, rules } from '@/lib/validators';
import { fadeUp, spring, stagger } from '@/lib/motion';
import FormAlert from '@/components/auth/form-alert';
import PasswordField from '@/components/auth/password-field';
import PasswordStrength from '@/components/auth/password-strength';
import SubmitButton from '@/components/auth/submit-button';
import useAuthForm from '@/components/auth/use-auth-form';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

const RULES = {
   currentPassword: (v) => (required(v) ? '' : 'Enter your current password'),
   newPassword: (v, values) => {
      const tooShort = rules.password(v);
      if (tooShort) return tooShort;
      return v === values.currentPassword ? 'Pick a password different from the current one' : '';
   },
   confirmPassword: (v, values) => {
      if (!required(v)) return 'Type the new password again';
      return v === values.newPassword ? '' : 'Passwords do not match';
   }
};

export default function PasswordForm() {
   const shakeRef = useRef(null);
   const form = useAuthForm(EMPTY, RULES, shakeRef);
   const [saving, setSaving] = useState(false);
   const [changed, setChanged] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setChanged(false);
      if (!form.validateAll()) return;
      setSaving(true);
      try {
         const { currentPassword, newPassword } = form.values;
         await api.put('/auth/password', { currentPassword, newPassword });
         form.reset(EMPTY);
         setChanged(true);
         toast.success('Password changed');
      } catch (err) {
         // A wrong current password is a 422 with no field list; it belongs on that field
         if (err.status === 422 && !Array.isArray(err.data)) {
            form.setErrors((prev) => ({ ...prev, currentPassword: err.message }));
            form.shake();
         } else {
            form.fail(err);
         }
      } finally {
         setSaving(false);
      }
   };

   return (
      <motion.form
         ref={shakeRef}
         variants={stagger(0.05)}
         initial="hidden"
         animate="show"
         onSubmit={handleSubmit}
         noValidate
         className="rounded-2xl border bg-card p-5 sm:p-6"
      >
         <motion.div variants={fadeUp} className="mb-6">
            <h2 className="text-lg font-semibold tracking-tight">Change password</h2>
            <p className="text-sm text-muted-foreground">
               At least {PASSWORD_MIN} characters. You stay signed in on this device.
            </p>
         </motion.div>
         <FormAlert message={form.formError} />
         <div className="max-w-md space-y-1">
            <motion.div variants={fadeUp}>
               <PasswordField
                  label="Current password"
                  autoComplete="current-password"
                  {...form.field('currentPassword')}
               />
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-1">
               <PasswordField
                  label="New password"
                  autoComplete="new-password"
                  placeholder={`At least ${PASSWORD_MIN} characters`}
                  {...form.field('newPassword')}
               />
               <PasswordStrength value={form.values.newPassword} />
            </motion.div>
            <motion.div variants={fadeUp} className="pt-3">
               <PasswordField
                  label="Confirm new password"
                  autoComplete="new-password"
                  {...form.field('confirmPassword')}
               />
            </motion.div>
         </div>
         <motion.div
            variants={fadeUp}
            className="mt-2 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end"
         >
            <AnimatePresence initial={false}>
               {changed && (
                  <motion.span
                     key="changed"
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     transition={spring.bouncy}
                     className="flex items-center gap-2 text-sm text-primary sm:mr-auto"
                  >
                     <Check className="size-4" aria-hidden="true" />
                     Password updated
                  </motion.span>
               )}
            </AnimatePresence>
            <SubmitButton loading={saving} loadingText="Updating" className="sm:w-auto sm:px-6">
               Update password
            </SubmitButton>
         </motion.div>
      </motion.form>
   );
}
