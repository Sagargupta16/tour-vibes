import { motion } from 'framer-motion';
import { passwordStrength } from '@/lib/validators';
import { spring } from '@/lib/motion';

const LABELS = ['Too short', 'Fair', 'Good', 'Strong', 'Excellent'];
const STEPS = [1, 2, 3, 4];

// Four bars that fill left to right as the password gets longer and more mixed.
// Only the 8-character minimum is enforced; the rest is advice.
export default function PasswordStrength({ value }) {
   const score = passwordStrength(value);
   const label = value ? LABELS[score] : '';

   return (
      <div className="flex items-center gap-3">
         <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
            {STEPS.map((step) => (
               <span key={step} className="h-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                     className="block h-full origin-left rounded-full bg-primary"
                     initial={false}
                     animate={{ scaleX: score >= step ? 1 : 0 }}
                     transition={{ ...spring.snappy, delay: (step - 1) * 0.04 }}
                  />
               </span>
            ))}
         </div>
         <span
            aria-live="polite"
            className="w-20 text-right font-mono text-[11px] tracking-wide text-muted-foreground uppercase"
         >
            {label && <span className="sr-only">Password strength: </span>}
            {label}
         </span>
      </div>
   );
}
