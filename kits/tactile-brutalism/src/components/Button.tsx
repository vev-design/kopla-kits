import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border text-sm font-semibold tracking-wide uppercase transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        solid: 'border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary',
        outline: 'border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background',
        ghost: 'border-transparent bg-transparent text-foreground hover:border-border',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'default',
    },
  },
);

/**
 * The system's hard-edged call-to-action: square corners, a full 1px border,
 * and an uppercase mono-weight label — no rounding, no shadow, no gradient.
 * `solid` fills with the acid-lime primary and inverts to outline on hover;
 * `outline` is a bordered ghost that fills solid on hover; `ghost` is
 * borderless until hovered, for low-emphasis inline actions. The variant is
 * an explicit string union so the kit extractor surfaces it on the canvas.
 */
export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Visual weight of the button. `solid` is the primary acid-lime fill, `outline` is bordered, `ghost` is borderless until hover. */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Control height/padding. */
  size?: 'default' | 'sm' | 'lg';
  /** Render as the passed child element (Radix `Slot`) instead of a `<button>`. */
  asChild?: boolean;
  /** Button label / content. */
  children?: React.ReactNode;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export const ButtonShowcase: { props: ButtonProps; label?: string }[] = [
  { props: { variant: 'solid', children: 'Start building' }, label: 'Solid' },
  { props: { variant: 'outline', children: 'View archive' }, label: 'Outline' },
  { props: { variant: 'ghost', children: 'Learn more' }, label: 'Ghost' },
];

export { Button, buttonVariants };
