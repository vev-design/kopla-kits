import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const quoteVariants = cva('border-t pt-7', { variants: { tone: { ink: 'border-primary text-primary', light: 'border-background text-background' }, scale: { regular: 'text-3xl leading-[1.06] md:text-5xl', large: 'text-4xl leading-[1.02] md:text-7xl' } }, defaultVariants: { tone: 'ink', scale: 'regular' } });
/** A sourced statement used to punctuate a long-form evidence section. */
export interface PullQuoteProps {
  /** Quoted statement. 8–22 words, one sentence. */
  quote?: string;
  /** Attribution name and role. 2 lines maximum. */
  attribution?: string;
  /** Contrast treatment. */
  tone?: 'ink' | 'light';
  /** Display scale for the quote. */
  scale?: 'regular' | 'large';
}
export function PullQuote({ quote = 'The work is to keep carbon in circulation.', attribution = 'Research partner', tone = 'ink', scale = 'regular' }: PullQuoteProps) { return <figure className={cn(quoteVariants({ tone, scale }))}><blockquote>“{quote}”</blockquote><figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.08em]">{attribution}</figcaption></figure>; }
export const PullQuoteShowcase: { props: PullQuoteProps; label?: string }[] = [{ props: { quote: 'The work is to keep carbon in circulation.', attribution: 'Research partner' }, label: 'Report quote' }];
