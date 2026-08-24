import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Subtle lift on hover, press scale on tap. Wrap interactive content
 * — cards, links, buttons that need extra polish beyond their base
 * hover. Pure CSS (`motion.css`), no visual styling of its own.
 *
 *   <Hover><Card>…</Card></Hover>
 */
export function Hover({ className, children, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('kit-hover', className)} {...rest}>
      {children}
    </div>
  );
}
