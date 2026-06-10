import { motion, type HTMLMotionProps } from 'motion/react';
import { DURATIONS, EASES } from './constants';

/**
 * Fade-and-rise on viewport entry. Wrap any block-level content; the
 * wrapper itself is a plain motion.div, so layout works as expected.
 *
 *   <Reveal><Card>…</Card></Reveal>
 */
export function Reveal({
  children,
  ...rest
}: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: DURATIONS.enter, ease: EASES.default }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
