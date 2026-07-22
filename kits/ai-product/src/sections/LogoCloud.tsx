import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Dense monospace "used by" strip: a small mono uppercase lead-in over a tight
 * hairline-ruled table of customer wordmarks — more terminal readout than
 * marketing band. Place directly under the hero to reassure the skeptic before
 * they read the feature copy. Wordmarks render as plain mono text.
 */
export interface LogoCloudProps extends SectionBaseProps {
  /** Small mono lead-in above the strip. 2–5 words, sentence case (e.g. "In production at"). */
  eyebrow?: string | null;
  /** Customer/partner wordmarks. 4–8 items (6 fills one desktop row). Each: plain brand name, 1–2 words. */
  logos: string[];
}

export function LogoCloud({ id, eyebrow, logos }: LogoCloudProps) {
  return (
    <section id={id ?? undefined} className="w-full border-y border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Reveal className="flex flex-col gap-5">
          {eyebrow ? (
            <p
              data-slot="eyebrow"
              className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase"
            >
              {eyebrow}
            </p>
          ) : null}
          <ul className="grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <li
                key={logo}
                data-slot="item"
                className="flex items-center justify-center border-r border-b border-border px-4 py-5 text-center font-mono text-sm tracking-wide text-muted-foreground/80 uppercase transition-colors hover:text-foreground"
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
  eyebrow: 'In production at',
  logos: ['Vector', 'Nimbus', 'Axon', 'Relay', 'Quanta', 'Basalt'],
};
