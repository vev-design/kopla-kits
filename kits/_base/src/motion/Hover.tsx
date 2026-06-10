import { motion, type HTMLMotionProps } from 'motion/react';
import { DURATIONS, EASES } from './constants';

/**
 * Subtle lift on hover, press scale on tap. Wrap interactive content
 * — cards, links, buttons that need extra polish beyond their base
 * hover. Pure motion, no visual styling of its own.
 *
 *   <Hover><Card>…</Card></Hover>
 */
export function Hover({ children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: DURATIONS.fast, ease: EASES.out } }}
      whileTap={{ scale: 0.98, transition: { duration: DURATIONS.instant, ease: EASES.in } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
