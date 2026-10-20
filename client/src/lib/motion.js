// Shared motion tokens, so every page moves with the same feel. Import these
// instead of writing one-off durations or easings in a component.

export const ease = {
   out: [0.22, 1, 0.36, 1],
   inOut: [0.65, 0, 0.35, 1]
};

export const spring = {
   snappy: { type: 'spring', stiffness: 420, damping: 32 },
   soft: { type: 'spring', stiffness: 220, damping: 26 },
   bouncy: { type: 'spring', stiffness: 520, damping: 18 }
};

export const duration = {
   micro: 0.15,
   base: 0.25,
   entrance: 0.45
};

// Parent: <motion.div variants={stagger()} initial="hidden" animate="show">
// Children: <motion.div variants={fadeUp}>
export const stagger = (gap = 0.06, delay = 0) => ({
   hidden: {},
   show: { transition: { staggerChildren: gap, delayChildren: delay } }
});

export const fadeUp = {
   hidden: { opacity: 0, y: 16 },
   show: { opacity: 1, y: 0, transition: { duration: duration.entrance, ease: ease.out } }
};

export const fadeIn = {
   hidden: { opacity: 0 },
   show: { opacity: 1, transition: { duration: duration.entrance, ease: ease.out } }
};

export const scaleIn = {
   hidden: { opacity: 0, scale: 0.94 },
   show: { opacity: 1, scale: 1, transition: spring.soft }
};

// whileInView props for a section that reveals once as it scrolls in
export const reveal = {
   initial: 'hidden',
   whileInView: 'show',
   viewport: { once: true, margin: '-80px' }
};

// Hover and press feedback for cards and buttons
export const lift = {
   whileHover: { y: -4, transition: spring.snappy },
   whileTap: { scale: 0.98 }
};
