import { PullQuote, SectionKicker } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Spacious opening context for a scientific narrative. Use after the hero to introduce a complex subject, then land the reading on a single source-backed thought.
 */
export interface IntroductionProps extends SectionBaseProps {
  /** Small chapter label. 1–3 words or a two-digit section number. */
  kicker: string;
  /** Opening heading. 3–8 words, no trailing period. */
  headline: string;
  /** Main context paragraphs. 2–4 paragraphs, each 25–55 words. @kind richtext bold italic link */
  body: string;
  /** Featured sourced statement. 10–25 words, one or two sentences. */
  quote: string;
  /** Person or institution behind the quote. 2–8 words. */
  attribution: string;
  /** Side decoration density. */
  variant?: 'stars' | 'rings';
}

export function Introduction({ id, kicker, headline, body, quote, attribution, variant = 'stars' }: IntroductionProps) {
  return <section id={id ?? undefined} className="paper-grain relative overflow-clip px-5 py-28 md:px-10 md:py-40">
    <div aria-hidden className="pointer-events-none absolute right-[8%] top-24 text-5xl text-muted-foreground/70 md:text-8xl">{variant === 'stars' ? '✦ · ✦\n✦ · ✦' : '◯\n ◯'}</div>
    <div className="relative mx-auto max-w-[90rem]">
      <Reveal><SectionKicker>{kicker}</SectionKicker></Reveal>
      <div className="mt-12 grid gap-16 md:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.85fr)] md:gap-x-14">
        <Reveal><div><h2 className="font-display text-5xl leading-[.94] tracking-[-0.055em] md:text-8xl">{headline}</h2><div className="prose prose-lg mt-12 max-w-none leading-relaxed text-primary prose-p:mb-7" dangerouslySetInnerHTML={{ __html: body }} /></div></Reveal>
        <Reveal><div className="md:pt-3"><PullQuote quote={quote} attribution={attribution} /></div></Reveal>
      </div>
    </div>
  </section>;
}

export const IntroductionDemo: IntroductionProps = {
  id: 'introduction',
  kicker: 'Introduction',
  headline: 'Carbon has a longer story',
  body: '<p>Deep inside the pressurised core of dying stars, the building blocks of life are forged. Carbon is part of almost everything we touch, from material to medicine.</p><p>But when fossil fuels are burnt, that carbon becomes carbon dioxide — and the problem is its quantity.</p>',
  quote: 'The problem is the quantity of CO2: this level has not been seen for 800,000 years.',
  attribution: 'WWF',
  variant: 'stars',
};
