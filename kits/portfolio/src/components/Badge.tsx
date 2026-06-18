import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva('rounded-full border border-border px-3 py-1 text-muted-foreground', {
  variants: {
    /** Type scale of the pill. `sm` for standalone tags, `xs` for status notes. */
    size: {
      sm: 'text-sm',
      xs: 'text-xs',
    },
    /**
     * Show a small filled status dot before the label. When on, the pill
     * becomes an inline flex row so the dot and text sit on one line.
     */
    dot: {
      true: 'inline-flex w-fit items-center gap-2',
      false: '',
    },
  },
  defaultVariants: { size: 'sm', dot: false },
});

/**
 * A rounded pill for portfolio metadata — a capability tag, a discipline
 * label, or an availability note. Token-themed (`border-border`,
 * `text-muted-foreground`, `rounded-full`); toggle `dot` for a leading
 * status indicator that picks up `--primary`.
 */
export interface BadgeProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Type scale of the pill. `sm` for standalone tags, `xs` for status notes. */
  size?: 'sm' | 'xs';
  /** Show a small filled status dot before the label. */
  dot?: boolean;
  /** Render as the passed child element (Radix `Slot`) instead of a `<span>`. */
  asChild?: boolean;
  /** Pill label. 1–4 words. */
  children?: React.ReactNode;
}

export function Badge({ className, size, dot, asChild = false, children, ...props }: BadgeProps) {
  if (asChild) {
    // The child element owns its own markup; only the pill classes are merged
    // onto it (Radix `Slot` requires a single child, so no dot is injected).
    return (
      <Slot className={cn(badgeVariants({ size, dot }), className)} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <span className={cn(badgeVariants({ size, dot }), className)} {...props}>
      {dot ? <span className="size-1.5 rounded-full bg-primary" /> : null}
      {children}
    </span>
  );
}

// Static literals only — the canvas renders the size × dot matrix. The
// children slot supplies the label per instance.
export const BadgeShowcase: { props: BadgeProps; label?: string }[] = [
  { props: { size: 'sm', dot: false, children: 'Design systems' }, label: 'Tag' },
  { props: { size: 'xs', dot: true, children: 'Available for select projects' }, label: 'Status' },
];
