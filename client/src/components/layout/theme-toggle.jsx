import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { ease, spring } from '@/lib/motion';

const iconSwap = {
   initial: { scale: 0.25, opacity: 0, rotate: -90, filter: 'blur(4px)' },
   animate: { scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' },
   exit: { scale: 0.25, opacity: 0, rotate: 90, filter: 'blur(4px)' }
};

// Grows the new theme out of the clicked control as a circle. Browsers without
// view transitions simply switch.
async function revealTheme(origin, apply) {
   if (!document.startViewTransition) {
      apply();
      return;
   }
   const rect = origin.getBoundingClientRect();
   const x = rect.left + rect.width / 2;
   const y = rect.top + rect.height / 2;
   const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
   const transition = document.startViewTransition(() => flushSync(apply));
   await transition.ready;
   document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
         duration: 550,
         easing: `cubic-bezier(${ease.out.join(',')})`,
         pseudoElement: '::view-transition-new(root)'
      }
   );
}

export default function ThemeToggle({ className }) {
   const { resolvedTheme, setTheme } = useTheme();
   const isDark = resolvedTheme === 'dark';

   const toggle = (event) => {
      revealTheme(event.currentTarget, () => setTheme(isDark ? 'light' : 'dark'));
   };

   return (
      <Button
         variant="ghost"
         size="icon"
         onClick={toggle}
         aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
         className={cn('overflow-hidden', className)}
      >
         <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
               key={isDark ? 'moon' : 'sun'}
               {...iconSwap}
               transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
               className="inline-flex"
            >
               {isDark ? <Moon /> : <Sun />}
            </motion.span>
         </AnimatePresence>
      </Button>
   );
}

const options = [
   { value: 'light', label: 'Light', icon: Sun },
   { value: 'dark', label: 'Dark', icon: Moon },
   { value: 'system', label: 'System', icon: Monitor }
];

// Three-way switch for the mobile sheet; the pill slides to the chosen option
export function ThemeSwitcher({ className }) {
   const { theme, setTheme } = useTheme();

   return (
      <div
         role="radiogroup"
         aria-label="Theme"
         className={cn('grid grid-cols-3 gap-1 rounded-xl border bg-muted/60 p-1', className)}
      >
         {options.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
               <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={(event) => revealTheme(event.currentTarget, () => setTheme(value))}
                  className={cn(
                     'tv-press relative flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
                     active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
               >
                  {active && (
                     <motion.span
                        layoutId="theme-switcher-pill"
                        transition={spring.snappy}
                        className="absolute inset-0 rounded-lg border bg-background"
                     />
                  )}
                  <Icon className="relative size-4" />
                  <span className="relative">{label}</span>
               </button>
            );
         })}
      </div>
   );
}
