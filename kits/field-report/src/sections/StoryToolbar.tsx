import { SectionKicker } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * Compact report navigation for a scroll-driven editorial story. Use first when a reader needs a persistent way to orient themselves without turning the presentation into an app header.
 */
export interface StoryToolbarProps extends SectionBaseProps {
  /** Text-only campaign wordmark. 1–3 words, title case. */
  wordmark: string;
  /** Short report descriptor shown beside the wordmark. 2–6 words. */
  descriptor: string;
  /** In-page story links. 2–5 items; labels 1–3 words and hrefs point to #section ids. */
  links: { /** Visible link text. 1–3 words. */ label: string; /** In-page anchor destination. @kind url */ href: string }[];
  /** Marks the overall contrast treatment. */
  variant?: 'paper' | 'ink';
}

export function StoryToolbar({ id, wordmark, descriptor, links, variant = 'paper' }: StoryToolbarProps) {
  const ink = variant === 'ink';
  return <section id={id ?? undefined} className={`sticky top-0 z-30 border-b ${ink ? 'border-background/50 bg-primary text-background' : 'paper-grain border-primary/40 text-primary'}`}>
    <div className="mx-auto flex min-h-16 max-w-[90rem] items-center justify-between gap-5 px-5 py-3 md:px-10">
      <a href="#top" className="min-w-0 shrink-0 font-bold uppercase tracking-[-.05em]">{wordmark}</a>
      <div className="hidden items-center gap-6 lg:flex"><SectionKicker tone={ink ? 'light' : 'ink'}>{descriptor}</SectionKicker><nav aria-label="Story sections" className="flex items-center gap-5">{links.map((link) => <a key={link.href} href={link.href} className="text-xs font-bold uppercase tracking-[.08em] transition-opacity hover:opacity-65">{link.label}</a>)}</nav></div>
      <nav aria-label="Story sections" className="flex max-w-[60%] gap-4 overflow-x-auto whitespace-nowrap lg:hidden">{links.slice(0, 2).map((link) => <a key={link.href} href={link.href} className="text-[0.65rem] font-bold uppercase tracking-[.08em]">{link.label}</a>)}</nav>
    </div>
  </section>;
}

export const StoryToolbarDemo: StoryToolbarProps = { wordmark: 'Clean Carbon', descriptor: 'A field report', links: [{ label: 'Introduction', href: '#introduction' }, { label: 'The challenge', href: '#challenge' }, { label: 'The outlook', href: '#outlook' }], variant: 'paper' };
