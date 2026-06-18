import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const ticketCard = cva('flex flex-col gap-5 rounded-2xl border bg-card p-6', {
  variants: {
    /**
     * Visual emphasis. `highlighted` is the recommended tier — primary border,
     * shadow, and ring; `plain` is a quiet bordered card.
     */
    emphasis: {
      plain: 'border-border',
      highlighted: 'border-primary shadow-lg ring-1 ring-primary',
    },
  },
  defaultVariants: { emphasis: 'plain' },
});

/**
 * A ticket / pricing tier card — the token-themed shell for a tier's name,
 * price, perks, and CTA. One tier per page may be promoted via `emphasis`; the
 * axis is an explicit string union the catalog surfaces. Pass the tier's
 * contents as children.
 */
export interface TicketCardProps extends React.ComponentProps<'div'> {
  /** Visual emphasis of the card. */
  emphasis?: 'plain' | 'highlighted';
  /** Card contents — name, price, perks, and CTA. */
  children?: React.ReactNode;
}

export function TicketCard({ emphasis, className, children, ...props }: TicketCardProps) {
  return (
    <div className={cn(ticketCard({ emphasis }), className)} {...props}>
      {children}
    </div>
  );
}

// Contents are a children slot, so the showcase previews the two card shells
// (empty) — static data only.
export const TicketCardShowcase: { props: TicketCardProps; label?: string }[] = [
  { props: { emphasis: 'plain' }, label: 'Plain' },
  { props: { emphasis: 'highlighted' }, label: 'Highlighted' },
];
