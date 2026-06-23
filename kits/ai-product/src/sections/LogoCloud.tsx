import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Thin social-proof strip showing a row of customer/partner wordmarks under a
 * small monospace eyebrow. Place directly under the hero to reassure the
 * skeptic before they read the feature copy. Wordmarks render as plain text.
 */
export interface LogoCloudProps extends SectionBaseProps {
  /** Small lead-in above the logos. 2–5 words, sentence case (e.g. "Powering AI teams at"). */
  eyebrow?: string | null;
  /** Customer/partner wordmarks. 4–7 items. Each: plain brand name, 1–2 words. */
  logos: string[];
}

export function LogoCloud({ id, eyebrow, logos }: LogoCloudProps) {
  return (
    <section id={id ?? undefined} className="w-full border-y border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Reveal className="flex flex-col items-center gap-8">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <li
                key={logo}
                className="text-lg font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {logo}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export const LogoCloudDemo: LogoCloudProps = {
  eyebrow: 'Powering AI teams at',
  logos: ['Vector', 'Cohere Labs', 'Nimbus', 'Axon', 'Relay', 'Quanta'],
};
