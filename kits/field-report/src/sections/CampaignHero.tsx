import { EditorialButton } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-viewport opening statement for an investigative science story. Use first to establish a campaign title through expressive, overlapping display type.
 */
export interface CampaignHeroProps extends SectionBaseProps {
  /** Campaign title words. 1–3 short words, each 3–9 lowercase characters. */
  title: { text: string; color: 'violet' | 'cyan' | 'green' | 'blue' }[];
  /** One-line report descriptor. 6–12 words, sentence case. */
  subtitle: string;
  /** Partner or byline lockup. 2–7 words, title case. */
  byline: string;
  /** Optional reader action at the lower edge. */
  cta?: { /** Visible label. 1–3 words. */ label: string; /** Destination. @kind url */ href: string } | null;
  /** Aligns the opening information block. */
  variant?: 'centered' | 'left';
}

const titleColors = { violet: 'text-chart-1', cyan: 'text-chart-2', green: 'text-chart-3', blue: 'text-chart-5' } as const;

export function CampaignHero({ id, title, subtitle, byline, cta = null, variant = 'centered' }: CampaignHeroProps) {
  const isCentered = variant === 'centered';
  return <section id={id ?? undefined} className="paper-grain relative flex min-h-screen overflow-clip px-5 py-8 md:px-10">
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-clip">
      <div className="absolute -left-[12vw] top-[8%] size-[42vw] rounded-full border border-dotted border-foreground/15" />
      <div className="absolute left-[38%] top-[19%] size-[29vw] rounded-full border border-dotted border-chart-1/20" />
      <div className="absolute -right-[11vw] bottom-[-12vw] size-[48vw] rounded-full border border-dotted border-chart-3/25" />
    </div>
    <div aria-hidden className="pointer-events-none absolute left-[8%] top-[10%] size-10 rounded-full bg-chart-2 md:size-24" />
    <div className="relative z-10 flex w-full flex-col justify-between">
      <Reveal>
        <div className={isCentered ? 'mx-auto mt-[7vh] w-full max-w-6xl' : 'mt-[7vh] w-full max-w-6xl'}>
          <h1 className="font-display text-[22vw] leading-[.7] tracking-[-0.1em] md:text-[15vw]" aria-label={title.map((word) => word.text).join(' ')}>
            {title.map((word, index) => <span key={`${word.text}-${index}`} className={`relative inline-block ${titleColors[word.color]} ${index > 0 ? '-ml-[0.09em]' : ''}`}><span className="mix-blend-multiply">{word.text}</span></span>)}
          </h1>
        </div>
      </Reveal>
      <Reveal>
        <div className={`grid w-full gap-5 md:grid-cols-12 ${isCentered ? 'mx-auto max-w-6xl' : 'max-w-6xl'}`}>
          <div className={isCentered ? 'md:col-span-9 md:col-start-2' : 'md:col-span-9'}>
            <p className="text-2xl leading-tight md:text-4xl">{subtitle}</p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.08em]">{byline}</p>
            {cta ? <div className="mt-8"><EditorialButton label={cta.label} href={cta.href} /></div> : null}
          </div>
        </div>
      </Reveal>
    </div>
  </section>;
}

export const CampaignHeroDemo: CampaignHeroProps = {
  title: [{ text: 'clean', color: 'violet' }, { text: 'carbon', color: 'green' }],
  subtitle: 'The untold story of carbon’s circularity',
  byline: 'The Beautiful Truth × Unilever',
  cta: { label: 'Begin the story', href: '#introduction' },
  variant: 'centered',
};
