import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const badgeStyles = cva('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]', { variants: { variant: { dark: 'bg-primary text-primary-foreground', subtle: 'bg-card text-foreground' } }, defaultVariants: { variant: 'subtle' } });
/** A compact label for new releases, categories, and contextual signals. */
export interface BadgeProps { /** Visible label. 1–2 uppercase words. */ label: string; /** Contrast treatment. */ variant?: 'dark' | 'subtle'; /** Optional extra classes. */ className?: string; }
export function Badge({ label, variant = 'subtle', className }: BadgeProps) { return <span className={cn(badgeStyles({ variant }), className)}>{label}</span>; }
export const BadgeShowcase = [{ props: { label: 'New', variant: 'dark' } }, { props: { label: 'Guide', variant: 'subtle' } }];
