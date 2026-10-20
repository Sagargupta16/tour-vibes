import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { MapPin, Sparkles, UserRound } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { BIO_MAX, NAME_MAX, SHORT_MAX, rules } from '@/lib/validators';
import { fadeUp, spring, stagger } from '@/lib/motion';
import FormAlert from '@/components/auth/form-alert';
import FormField, { FieldMessage } from '@/components/auth/form-field';
import SubmitButton from '@/components/auth/submit-button';
import useAuthForm from '@/components/auth/use-auth-form';

const RULES = { name: rules.name, bio: rules.bio };
const FIELDS = ['name', 'location', 'status', 'bio'];

const valuesOf = (user) => Object.fromEntries(FIELDS.map((key) => [key, user[key] || '']));

// Name, home base, status and bio. The avatar saves on its own from the header.
export default function ProfileForm({ user, onUpdate }) {
   const saved = valuesOf(user);
   const shakeRef = useRef(null);
   const form = useAuthForm(saved, RULES, shakeRef);
   const [saving, setSaving] = useState(false);
   const dirty = FIELDS.some((key) => form.values[key] !== saved[key]);
   const bioLength = form.values.bio.length;

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.validateAll()) return;
      setSaving(true);
      try {
         const formData = new FormData();
         for (const key of FIELDS) {
            const value = form.values[key];
            formData.append(key, key === 'bio' ? value : value.trim());
         }
         const data = await api.put('/auth/profile', formData);
         onUpdate(data.user);
         form.reset(valuesOf(data.user));
         toast.success('Profile saved');
      } catch (err) {
         form.fail(err);
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
            <h2 className="text-lg font-semibold tracking-tight">Public details</h2>
            <p className="text-sm text-muted-foreground">
               Shown on your traveler page and next to your journals.
            </p>
         </motion.div>
         <FormAlert message={form.formError} />
         <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            <motion.div variants={fadeUp}>
               <FormField
                  label="Name"
                  icon={UserRound}
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  {...form.field('name')}
               />
            </motion.div>
            <motion.div variants={fadeUp}>
               <FormField
                  label="Home base"
                  icon={MapPin}
                  placeholder="City, Country"
                  autoComplete="address-level2"
                  maxLength={SHORT_MAX}
                  {...form.field('location')}
               />
            </motion.div>
            <motion.div variants={fadeUp} className="sm:col-span-2">
               <FormField
                  label="Status"
                  icon={Sparkles}
                  placeholder="Planning the next trip"
                  maxLength={SHORT_MAX}
                  {...form.field('status')}
               />
            </motion.div>
            <motion.div variants={fadeUp} className="space-y-2 sm:col-span-2">
               <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Bio</Label>
                  <span
                     className={cn(
                        'font-mono text-[11px] tabular-nums transition-colors',
                        BIO_MAX - bioLength <= 30 ? 'text-primary' : 'text-muted-foreground'
                     )}
                     aria-live="polite"
                  >
                     {bioLength}/{BIO_MAX}
                  </span>
               </div>
               <Textarea
                  id="bio"
                  rows={4}
                  maxLength={BIO_MAX}
                  placeholder="Where you have been, where you are going, what you look for in a place"
                  value={form.values.bio}
                  onChange={(e) => form.setValue('bio', e.target.value)}
                  aria-invalid={form.errors.bio ? true : undefined}
                  className="min-h-28 rounded-xl px-3.5 py-3 transition-[border-color,box-shadow] duration-200 focus-visible:border-primary focus-visible:ring-primary/20"
               />
               {/* Fills as the bio grows toward the limit */}
               <span
                  className="block h-0.5 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
               >
                  <motion.span
                     className="block h-full origin-left rounded-full bg-primary"
                     initial={false}
                     animate={{ scaleX: Math.min(bioLength / BIO_MAX, 1) }}
                     transition={spring.snappy}
                  />
               </span>
               <FieldMessage id="bio" error={form.errors.bio} />
            </motion.div>
         </div>
         <motion.div
            variants={fadeUp}
            className="mt-2 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end"
         >
            <AnimatePresence initial={false}>
               {dirty && (
                  <motion.span
                     key="unsaved"
                     initial={{ opacity: 0, x: 8 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 8 }}
                     className="flex items-center gap-2 text-xs text-muted-foreground sm:mr-auto"
                  >
                     <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                     Unsaved changes
                  </motion.span>
               )}
            </AnimatePresence>
            {dirty && (
               <Button
                  type="button"
                  variant="ghost"
                  onClick={() => form.reset(saved)}
                  disabled={saving}
                  className="h-11 rounded-xl px-4"
               >
                  Discard
               </Button>
            )}
            <SubmitButton
               loading={saving}
               disabled={!dirty}
               loadingText="Saving"
               className="sm:w-auto sm:px-6"
            >
               Save changes
            </SubmitButton>
         </motion.div>
      </motion.form>
   );
}
