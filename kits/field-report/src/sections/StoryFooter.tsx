import { EditorialButton, SectionKicker } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * Minimal campaign footer that gives long-form stories a quiet, accountable ending. Use after the closing call-to-action for partner credit and a return path.
 */
export interface StoryFooterProps extends SectionBaseProps {
  /** Campaign or organization wordmark. 1–4 words, title case. */
  wordmark: string;
  /** Small closing label. 1–4 words. */
  kicker: string;
  /** Credit or rights line. 4–14 words. */
  legal: string;
  /** Return action. */
  link: { /** Visible label. 1–4 words. */ label: string; /** Destination. @kind url */ href: string };
  /** Footer contrast treatment. */
  variant?: 'ink' | 'paper';
}

export function StoryFooter({ id, wordmark, kicker, legal, link, variant = 'ink' }: StoryFooterProps) {
  const ink = variant === 'ink';
  return <footer id={id ?? undefined} className={`${ink ? 'bg-primary text-background' : 'paper-grain text-primary'} px-5 py-12 md:px-10`}>
    <div className="mx-auto grid max-w-[90rem] gap-14 border-t border-current/40 pt-8 md:grid-cols-12"><div className="md:col-span-6"><p className="font-display text-4xl tracking-[-.06em]">{wordmark}</p><p className="mt-6 text-sm text-current/75">{legal}</p></div><div className="md:col-span-3"><SectionKicker tone={ink ? 'light' : 'ink'}>{kicker}</SectionKicker></div><div className="md:col-span-3 md:text-right"><EditorialButton variant={ink ? 'light' : 'ink'} label={link.label} href={link.href} /></div></div>
  </footer>;
}

export const StoryFooterDemo: StoryFooterProps = { wordmark: 'Clean Carbon', kicker: 'A circular story', legal: 'A long-form investigation into carbon’s next chapter.', link: { label: 'Back to top', href: '#top' }, variant: 'ink' };
