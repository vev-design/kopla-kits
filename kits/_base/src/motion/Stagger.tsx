import { Children, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { DURATIONS, EASES } from './constants';

interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Delay between each child's entrance (seconds). */
  step?: number;
}

/**
 * Sequentially reveal children — same fade-rise as Reveal but applied
 * one child at a time. Wrap a list of cards, items, etc.
 *
 *   <Stagger>
 *     <Card />
 *     <Card />
 *   </Stagger>
 */
export function Stagger({ children, step = 0.08, ...rest }: StaggerProps) {
  const items = Children.toArray(children);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: step } },
      }}
      {...rest}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: DURATIONS.enter, ease: EASES.default },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
