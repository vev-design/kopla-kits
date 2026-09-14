import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const editorialButtonVariants = cva('inline-flex items-center gap-3 border-b pb-1 text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4', {
  variants: { variant: { ink: 'border-primary text-primary', light: 'border-background text-background' }, size: { sm: 'text-[0.65rem]', md: 'text-xs' } },
  defaultVariants: { variant: 'ink', size: 'md' },
});

/** A quiet editorial text link for story progressions, used wherever a section offers a next read. */
export interface EditorialButtonProps {
  /** Visible action label. 1–4 words, uppercase-friendly sentence case. */
  label?: string;
  /** Destination for the reading action. @kind url */
  href?: string;
  /** Contrast treatment against the surrounding surface. */
  variant?: 'ink' | 'light';
  /** Compactness of the text action. */
  size?: 'sm' | 'md';
}
export function EditorialButton({ label = 'Continue reading', href = '#', variant = 'ink', size = 'md' }: EditorialButtonProps) {
  return <a href={href} className={cn(editorialButtonVariants({ variant, size }))}>{label}<span aria-hidden>→</span></a>;
}
export const EditorialButtonShowcase: { props: EditorialButtonProps; label?: string }[] = [
  { props: { label: 'Read the report', variant: 'ink' }, label: 'Ink' },
  { props: { label: 'Explore more', variant: 'light' }, label: 'Light' },
];
