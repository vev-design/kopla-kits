import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import { Eyebrow, Rule } from '@/components';
import type { SectionBaseProps } from '@/types';

/**
 * The face at full size, and nothing else. A viewport-filling all-caps
 * headline set in the inscriptional display face, whose letterspacing opens
 * and whose scale lifts as the viewer scrolls through it — the one place in
 * the system where motion is spent, because tracking is the property a
 * Roman-capital setting is most sensitive to. Deliberately spare: no image,
 * no button, no color on the type. Place directly after the Lockup.
 *
 * @hydrate
 */
export interface SpecimenHeroProps extends SectionBaseProps {
  /** Tracked caps label above the headline. 1–3 words. */
  eyebrow?: string | null;
  /** The specimen line. 1–4 words, no punctuation — it is set at 120px and up, so length matters more than usual. */
  headline: string;
  /** Supporting line under the rule. 1 sentence, 10–24 words, no trailing period. */
  standfirst?: string | null;
  /** Small metadata pairs shown at the foot, e.g. release and format. 2–4 items. */
  meta?: {
    /** Field name. 1–2 words. */
    label: string;
    /** Field value. 1–4 words or a figure. */
    value: string;
  }[];
}

export function SpecimenHero({
  id,
  eyebrow,
  headline,
  standfirst,
  meta = [],
}: SpecimenHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Tracking opens from tight to airy; scale lifts a touch behind it.
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ['-0.02em', '0.09em']);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1.03]);

  return (
    <section
      ref={ref}
      id={id ?? undefined}
      className="flex min-h-screen w-full flex-col justify-center overflow-hidden bg-background py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        {eyebrow ? <Eyebrow className="mb-10">{eyebrow}</Eyebrow> : null}
        <motion.h1
          style={{ letterSpacing, scale }}
          className="origin-left font-display text-[clamp(3.25rem,13vw,11rem)] leading-[0.86] font-black text-foreground uppercase"
        >
          {headline}
        </motion.h1>
        <Rule weight="stem" className="mt-12" />
        {standfirst ? (
          <p className="measure mt-8 font-sans text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
            {standfirst}
          </p>
        ) : null}
        {meta.length > 0 ? (
          <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            {meta.map((item) => (
              <div key={item.label} className="border-t border-border pt-3">
                <dt className="font-sans text-[0.625rem] font-semibold uppercase [letter-spacing:var(--tracking-label)] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="nums-table mt-2 font-wedge text-xl font-semibold text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

export const SpecimenHeroDemo: SpecimenHeroProps = {
  eyebrow: 'New release',
  headline: 'Meridian',
  standfirst:
    'A contemporary flare serif cut on Roman square-capital proportions, with the serifs re-drawn so they hold at text sizes',
  meta: [
    { label: 'Weights', value: '7 + variable' },
    { label: 'Scripts', value: 'Latin, Cyrillic' },
    { label: 'Languages', value: '214' },
    { label: 'Units per em', value: '2048' },
  ],
};
