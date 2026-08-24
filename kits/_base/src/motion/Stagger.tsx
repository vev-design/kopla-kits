import { Children, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';

interface StaggerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode;
  /** Delay between each child's entrance (seconds). */
  step?: number;
}

/**
 * Sequentially reveal children — same fade-rise as Reveal but applied
 * one child at a time, each resolving a beat further into the scroll.
 * Wrap a list of cards, items, etc. Pure CSS (`motion.css`); the
 * container and per-child wrappers are plain divs.
 *
 *   <Stagger>
 *     <Card />
 *     <Card />
 *   </Stagger>
 */
export function Stagger({ children, step = 0.08, ...rest }: StaggerProps) {
  const items = Children.toArray(children);
  return (
    <div {...rest}>
      {items.map((child, i) => (
        <div
          key={i}
          className="kit-reveal"
          style={i ? ({ '--kit-enter-delay': i * step } as CSSProperties) : undefined}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
