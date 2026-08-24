import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps extends ComponentPropsWithoutRef<'div'> {
  /** Seconds this element holds back behind its siblings — shifts where in
   *  the scroll its fade lands, staggering grouped reveals. */
  delay?: number;
}

/**
 * Fade-and-rise on viewport entry. Wrap any block-level content; the
 * wrapper is a plain div, so layout works as expected. Driven entirely
 * by CSS scroll-driven animations (`motion.css`) — no JavaScript, so a
 * wrapped section still publishes as static HTML. Browsers without
 * support, and reduced-motion users, simply see the content in place.
 *
 *   <Reveal><Card>…</Card></Reveal>
 */
export function Reveal({ delay, className, style, children, ...rest }: RevealProps) {
  return (
    <div
      className={cn('kit-reveal', className)}
      style={delay ? ({ '--kit-enter-delay': delay, ...style } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </div>
  );
}
