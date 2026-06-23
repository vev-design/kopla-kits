import { Reveal, Stagger } from '@/motion';
import { Badge } from '@/components/Badge';
import type { SectionBaseProps } from '@/types';

/**
 * A letter from leadership — the CEO's or chair's address to stakeholders. A
 * quiet, editorial beat: a heading, several short serif paragraphs set in a
 * comfortable reading measure, and a signature block. Use early, after the
 * cover, to set the year's tone in a human voice.
 */
export interface LetterFromLeadershipProps extends SectionBaseProps {
  /** Small label above the heading. 1–4 words, no punctuation (e.g. "From the CEO"). */
  eyebrow?: string | null;
  /** Heading for the letter. 1 sentence, 3–9 words, no trailing period. */
  heading: string;
  /** Body paragraphs of the letter. 2–4 items. Each: 2–4 sentences, 35–70 words. */
  paragraphs: string[];
  /** Name of the signatory. 2–3 words (e.g. "Elena Vasquez"). */
  signatureName: string;
  /** Role / title of the signatory. 2–5 words (e.g. "Chief Executive Officer"). */
  signatureRole: string;
  /**
   * Optional portrait of the signatory shown beside the signature.
   * @kind image
   */
  portrait?: string | null;
  /** Layout variant. `letter` is a single reading column; `split` floats the heading left of the body. */
  variant?: 'letter' | 'split';
}

export function LetterFromLeadership({
  id,
  eyebrow,
  heading,
  paragraphs,
  signatureName,
  signatureRole,
  portrait,
  variant = 'letter',
}: LetterFromLeadershipProps) {
  const isSplit = variant === 'split';

  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-12 md:py-32">
        <div
          className={
            isSplit
              ? 'grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16'
              : 'mx-auto max-w-3xl'
          }
        >
          <Reveal>
            <div className={isSplit ? 'md:sticky md:top-24' : 'mb-12'}>
              {eyebrow ? <Badge variant="rule">{eyebrow}</Badge> : null}
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
                {heading}
              </h2>
            </div>
          </Reveal>

          <div>
            <Stagger className="flex flex-col gap-6" step={0.1}>
              {paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="font-serif text-lg leading-relaxed text-foreground/85 text-pretty md:text-xl"
                >
                  {paragraph}
                </p>
              ))}
            </Stagger>

            <Reveal>
              <div className="mt-12 flex items-center gap-5 border-t border-border pt-8">
                {portrait ? (
                  <img
                    src={portrait}
                    alt=""
                    className="size-16 shrink-0 rounded-full object-cover grayscale"
                  />
                ) : null}
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-semibold tracking-tight text-primary">
                    {signatureName}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {signatureRole}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export const LetterFromLeadershipDemo: LetterFromLeadershipProps = {
  eyebrow: 'From the CEO',
  heading: 'A foundation built for the decade ahead',
  paragraphs: [
    'This was a year of deliberate progress. We entered it focused on the fundamentals — operational discipline, customer trust, and a balance sheet that lets us invest through any cycle — and we leave it stronger on every measure that matters to long-term owners of this company.',
    'Revenue grew across all three of our segments, and we converted that growth into expanding margins rather than spending it away. Free cash flow reached a record, giving us the room to fund the next generation of products while returning capital to shareholders through a higher dividend.',
    'None of this happens without our people. To the teams who shipped, served, and showed up for one another through a demanding year: thank you. The pages that follow are, in the end, a record of your work.',
  ],
  signatureName: 'Elena Vasquez',
  signatureRole: 'Chief Executive Officer',
  portrait:
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
  variant: 'split',
};
