import { SectionKicker } from '@/components';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Full-bleed chapter transition for changing the story’s emotional register. Use between editorial spreads to give a new argument its own, oversized visual pause.
 */
export interface ChapterDividerProps extends SectionBaseProps {
  /** Chapter index. Two digits, such as “01”. */
  number: string;
  /** Chapter label. 1–3 title-case words. */
  label: string;
  /** Oversized chapter statement. 3–8 words, title case, no period. */
  headline: string;
  /** Controls which side carries the statement. */
  variant?: 'right' | 'left';
}

export function ChapterDivider({ id, number, label, headline, variant = 'right' }: ChapterDividerProps) {
  const isRight = variant === 'right';
  return <section id={id ?? undefined} className="relative min-h-screen overflow-clip bg-[var(--lavender)] px-5 py-14 text-background md:px-10">
    <div aria-hidden className="pointer-events-none absolute -left-24 bottom-12 grid size-[28rem] place-items-center rounded-full bg-chart-5/30 md:size-[42rem]"><div className="size-[72%] rounded-full border-[4rem] border-chart-5/30" /></div>
    <div className="relative grid min-h-[calc(100vh-7rem)] grid-rows-[auto_1fr] border-y border-background/60">
      <div className="border-b border-background/60 py-7"><SectionKicker tone="light" align="center">{`Section ${number}`}</SectionKicker></div>
      <div className="grid md:grid-cols-2">
        <div className={`hidden border-background/60 md:block ${isRight ? 'border-r' : 'order-2 border-l'}`} />
        <Reveal><div className={`flex items-center py-14 md:px-12 ${isRight ? 'md:col-start-2' : 'md:row-start-1'}`}><div><p className="mb-10 text-xs font-bold uppercase tracking-[0.1em]">{label}</p><h2 className="font-display text-[19vw] leading-[.84] tracking-[-.075em] md:text-[9vw]">{headline}</h2></div></div></Reveal>
      </div>
    </div>
  </section>;
}

export const ChapterDividerDemo: ChapterDividerProps = { number: '01', label: 'The challenge', headline: 'The problem with carbon', variant: 'right' };
