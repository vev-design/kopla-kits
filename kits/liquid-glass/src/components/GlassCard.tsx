import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'relative flex flex-col overflow-hidden rounded-[var(--radius)] border backdrop-blur-xl transition-colors',
  {
    variants: {
      /** Glass intensity/tint. */
      variant: {
        light:
          'border-border/50 bg-muted shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_22%,transparent)]',
        frosted:
          'border-border bg-card shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_38%,transparent),0_24px_60px_-28px_color-mix(in_oklch,var(--background)_80%,transparent)]',
        tinted:
          'border-primary/40 bg-gradient-to-b from-primary/20 via-card to-card shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_45%,transparent),0_0_70px_-16px_var(--primary)]',
      },
    },
    defaultVariants: { variant: 'frosted' },
  },
);

/**
 * The system's core surface: a translucent, blurred glass panel that only
 * reads correctly over the kit's vivid gradient canvas. Every panel gets a
 * `backdrop-blur` fill from a token (never raw white) and a bright inset
 * line along the top edge — the "light hitting glass" specular highlight —
 * so the panel reads as a refractive surface, not a flat tinted box.
 * `light` is a faint, minimal-emphasis surface for nested or dense tiles;
 * `frosted` is the standard panel most sections reach for; `tinted` washes
 * the fill with the primary accent and adds a soft colored glow, reserved
 * for the one emphasized surface on a section (a highlighted pricing tier,
 * a hero stat panel, a closing CTA). The role is an explicit string union so
 * the kit extractor surfaces it as a variant axis.
 */
export interface GlassCardProps extends React.ComponentProps<'div'> {
  /** Glass intensity/tint: `light` (faint, minimal emphasis), `frosted` (standard panel), or `tinted` (primary-washed, glowing, for the one emphasized surface). */
  variant?: 'light' | 'frosted' | 'tinted';
  /** Panel contents. */
  children?: React.ReactNode;
}

export function GlassCard({ className, variant, children, ...props }: GlassCardProps) {
  return (
    <div className={cn(glassCardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export const GlassCardShowcase: { props: GlassCardProps; label?: string }[] = [
  { props: { variant: 'light' }, label: 'Light' },
  { props: { variant: 'frosted' }, label: 'Frosted' },
  { props: { variant: 'tinted' }, label: 'Tinted' },
];
