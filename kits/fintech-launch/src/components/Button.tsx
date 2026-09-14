import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonStyles = cva('inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50', { variants: { variant: { solid: 'bg-primary text-primary-foreground hover:bg-[oklch(from_#1d1d1b_l_c_h_/_92%)]', outline: 'border border-current bg-transparent text-current hover:bg-[oklch(from_#1d1d1b_l_c_h_/_8%)]', light: 'bg-background text-foreground hover:bg-card' }, size: { sm: 'min-h-9 px-3 py-2 text-xs', md: 'min-h-11', lg: 'min-h-13 px-6 text-base' } }, defaultVariants: { variant: 'solid', size: 'md' } });

/** A low-decoration action link for primary, secondary, and reversed page actions. */
export interface ButtonProps {
  /** Visible action label. 1–4 words, sentence case. */ label: string;
  /** Destination for the action. @kind url */ href: string;
  /** Contrast and emphasis treatment. */ variant?: 'solid' | 'outline' | 'light';
  /** Overall control scale. */ size?: 'sm' | 'md' | 'lg';
  /** Optional extra classes for the outer link. */ className?: string;
}
export function Button({ label, href, variant = 'solid', size = 'md', className }: ButtonProps) { return <a href={href} className={cn(buttonStyles({ variant, size }), className)}>{label}</a>; }
export const ButtonShowcase = [{ props: { label: 'Open an account', href: '#', variant: 'solid', size: 'md' } }, { props: { label: 'Find the right plan', href: '#', variant: 'outline', size: 'md' } }, { props: { label: 'Learn more', href: '#', variant: 'light', size: 'sm' } }];
