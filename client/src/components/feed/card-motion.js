import { duration, ease, fadeUp, stagger } from '@/lib/motion';

// Same gap as the shared stagger() default, applied per card so cards that mount
// later (a new page, a new filter) still cascade in
const GAP = stagger().show.transition.staggerChildren;

export const cardMotion = {
   hidden: fadeUp.hidden,
   show: (index = 0) => ({
      ...fadeUp.show,
      transition: { ...fadeUp.show.transition, delay: Math.min(index, 9) * GAP }
   }),
   exit: { opacity: 0, scale: 0.96, transition: { duration: duration.micro, ease: ease.out } }
};
