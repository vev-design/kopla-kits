import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_8px_28px_-10px_var(--primary)] hover:brightness-110',
        outline:
          'border border-border bg-card text-foreground backdrop-blur-xl shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_30%,transparent)] hover:border-primary/50 hover:bg-secondary',
        ghost: 'text-foreground hover:bg-muted',
      },
      size: {
        default: 'h-10 px-5 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-4 text-xs has-[>svg]:px-3',
        lg: 'h-12 px-7 text-base has-[>svg]:px-5',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * The system's pill-shaped call-to-action button. Rounded full, and on
 * hover a bright diagonal sheen sweeps across the fill — a pure-CSS
 * specular highlight (no JS) that reads as light glancing off a curved
 * glass surface. `default` is the solid primary-accent pill for the page's
 * main action; `outline` is a translucent glass pill for secondary actions;
 * `ghost` is bare text for the lowest-emphasis links. The visual axes
 * (`variant`, `size`) are explicit string unions so the kit extractor
 * surfaces them as variant axes. Shadows `_base`'s `Button` — this kit's
 * catalog uses this one instead.
 */
export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Visual style of the button. */
  variant?: 'default' | 'outline' | 'ghost';
  /** Control height/padding. `icon` is a square button for a lone glyph. */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Render as the passed child element (Radix `Slot`) instead of a `<button>`. */
  asChild?: boolean;
  /** Button label / content. */
  children?: React.ReactNode;
}

function Button({ className, variant, size, asChild = false, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {/* Specular sheen: a diagonal highlight band parked off-screen left,
          swept across on hover via a pure CSS transform transition. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-foreground/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
      />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </Comp>
  );
}

export const ButtonShowcase: { props: ButtonProps; label?: string }[] = [
  { props: { variant: 'default', children: 'Get started' }, label: 'Default' },
  { props: { variant: 'outline', children: 'Learn more' }, label: 'Outline' },
  { props: { variant: 'ghost', children: 'Cancel' }, label: 'Ghost' },
];

export { Button, buttonVariants };
