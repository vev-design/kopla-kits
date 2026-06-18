import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const avatarFrame = cva('aspect-square w-full overflow-hidden bg-secondary', {
  variants: {
    /** Corner rounding of the frame. `rounded` is the soft-square headshot. */
    radius: {
      rounded: 'rounded-xl',
      circle: 'rounded-full',
    },
  },
  defaultVariants: { radius: 'rounded' },
});

/**
 * A square headshot frame — the event system's speaker portrait well. Wraps an
 * `<img>` (passed as children) in a token-themed, aspect-locked frame so every
 * speaker reads at the same size. The `radius` axis is an explicit string union
 * the catalog surfaces as a variant axis.
 */
export interface AvatarProps extends React.ComponentProps<'div'> {
  /** Corner rounding of the frame. */
  radius?: 'rounded' | 'circle';
  /** The portrait — typically an `<img>`. */
  children?: React.ReactNode;
}

export function Avatar({ radius, className, children, ...props }: AvatarProps) {
  return (
    <div className={cn(avatarFrame({ radius }), className)} {...props}>
      {children}
    </div>
  );
}

// The portrait is a children slot, so the showcase previews the empty framed
// shapes (no embedded image) — static data only.
export const AvatarShowcase: { props: AvatarProps; label?: string }[] = [
  { props: { radius: 'rounded' }, label: 'Soft square' },
  { props: { radius: 'circle' }, label: 'Circle' },
];
