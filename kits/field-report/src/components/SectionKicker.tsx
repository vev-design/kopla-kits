import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const kickerVariants = cva('font-sans text-xs font-bold uppercase tracking-[0.1em]', { variants: { tone: { ink: 'text-primary', light: 'text-background', violet: 'text-chart-4' }, align: { left: 'text-left', center: 'text-center' } }, defaultVariants: { tone: 'ink', align: 'left' } });
/** Small chapter marker that creates the report’s measured editorial rhythm. */
export interface SectionKickerProps {
  /** Chapter or eyebrow content. 1–3 words or a two-digit section number. */
  children?: string;
  /** Foreground contrast treatment. */
  tone?: 'ink' | 'light' | 'violet';
  /** Text alignment inside its available column. */
  align?: 'left' | 'center';
}
export function SectionKicker({ children = 'Section 01', tone = 'ink', align = 'left' }: SectionKickerProps) { return <p className={cn(kickerVariants({ tone, align }))}>{children}</p>; }
export const SectionKickerShowcase: { props: SectionKickerProps; label?: string }[] = [
  { props: { children: 'Section 01' }, label: 'Ink' }, { props: { children: 'Evidence', tone: 'violet', align: 'center' }, label: 'Violet' },
];
