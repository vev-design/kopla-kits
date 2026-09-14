import { PullQuote, SectionKicker } from '@/components';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Two-column evidence spread for substantial report copy and an oversized proof point. Use after a chapter divider when the viewer needs both context and a fact they can retain.
 */
export interface EvidenceSpreadProps extends SectionBaseProps {
  /** Small story label. 1–3 words or a two-digit section number. */
  kicker: string;
  /** Report heading. 3–9 words, no trailing period. */
  headline: string;
  /** Editorial paragraphs. 3–6 paragraphs, each 30–70 words. @kind richtext bold italic link */
  body: string;
  /** Oversized evidence figure. Number plus unit, maximum 12 characters. */
  statistic: string;
  /** Explanation of the statistic. 12–24 words, one sentence. */
  statisticCaption: string;
  /** Closing sourced statement. 8–20 words, one sentence. */
  quote: string;
  /** Attribution name and role. 2–8 words. */
  attribution: string;
  /** Chooses the placement of the circular data graphic. */
  variant?: 'stat-right' | 'stat-left';
}

export function EvidenceSpread({ id, kicker, headline, body, statistic, statisticCaption, quote, attribution, variant = 'stat-right' }: EvidenceSpreadProps) {
  const statLeft = variant === 'stat-left';
  return <section id={id ?? undefined} className="paper-grain overflow-clip px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto max-w-6xl"><Reveal><SectionKicker>{kicker}</SectionKicker></Reveal>
      <div className="mt-12 grid gap-16 md:grid-cols-12 md:gap-x-12">
        <Stagger className={`md:col-span-6 ${statLeft ? 'md:order-2 md:col-start-7' : ''}`}><h2 className="font-display text-5xl leading-[.95] tracking-[-.06em] md:text-7xl">{headline}</h2><div className="prose prose-lg mt-12 max-w-xl leading-relaxed text-primary prose-p:mb-7" dangerouslySetInnerHTML={{ __html: body }} /><PullQuote quote={quote} attribution={attribution} /></Stagger>
        <Reveal><aside className={`relative min-h-[28rem] self-start md:col-span-5 ${statLeft ? 'md:order-1' : 'md:col-span-4 md:col-start-9'}`}>
          <div aria-hidden className="pointer-events-none orbit-mark absolute inset-0 rounded-full border-[3.5rem] border-chart-4/70" />
          <div aria-hidden className="pointer-events-none absolute inset-[13%] rounded-full border-[2.4rem] border-chart-1/75 border-r-transparent" />
          <div className="relative z-10 grid min-h-[28rem] place-items-center px-12 text-center"><div><p className="font-display text-7xl leading-none tracking-[-.08em] md:text-9xl">{statistic}</p><p className="mx-auto mt-8 max-w-xs text-xl leading-tight">{statisticCaption}</p></div></div>
        </aside></Reveal>
      </div>
    </div>
  </section>;
}

export const EvidenceSpreadDemo: EvidenceSpreadProps = {
  kicker: 'Section 01', headline: 'Carbon under pressure',
  body: '<p>Many industries rely heavily on carbon, typically derived from fossil fuels, to produce the products and packaging that make everyday life possible.</p><p>The carbon is not just used to create the product. It is embedded within the product, and that puts a significant footprint into ordinary supply chains.</p><p>New renewable inputs offer an opportunity to keep valuable material in use rather than returning it to the atmosphere.</p>',
  statistic: '85%', statisticCaption: 'of the carbon embedded in chemicals and their derived products comes from fossil fuels.', quote: 'Many chemical products cannot be decarbonized.', attribution: 'Martin Scheringer · ETH Zurich University', variant: 'stat-right',
};
