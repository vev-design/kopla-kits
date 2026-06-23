import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * The studio's working steps, laid out as labelled columns with hairline top
 * rules. Each step pairs a short phase label, a title, and a paragraph of
 * detail. Use to demystify the engagement and lower the risk of reaching out.
 */
export interface ProcessProps extends SectionBaseProps {
  /** Monospace label above the heading. 1–3 words, sentence case, no punctuation (e.g. "How we work"). */
  eyebrow?: string | null;
  /** Section heading. 1 phrase, 2–6 words, no trailing period. */
  heading: string;
  /** Process steps. 3–4 items. */
  steps: {
    /** Short phase label. 1–2 words, sentence case (e.g. "Discover"). */
    label: string;
    /** Step title. 1 phrase, 2–5 words, no trailing period. */
    title: string;
    /** What happens in this step. 1–2 sentences, 14–30 words. */
    body: string;
  }[];
}

export function Process({ id, eyebrow, heading, steps }: ProcessProps) {
  return (
    <section id={id ?? undefined} className="w-full border-b border-foreground bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:py-28">
        <Reveal className="mb-14 flex flex-col gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.02em] text-balance uppercase md:text-6xl">
            {heading}
          </h2>
        </Reveal>
        <Stagger className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-4 border-t border-foreground pt-5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                  {step.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{step.body}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const ProcessDemo: ProcessProps = {
  eyebrow: 'How we work',
  heading: 'The process',
  steps: [
    {
      label: 'Discover',
      title: 'Find the angle',
      body: 'We dig into the brief, the market, and the audience until we know the one true thing the work has to say.',
    },
    {
      label: 'Define',
      title: 'Set the system',
      body: 'We shape the strategy and the design language — the rules that make every later decision faster and sharper.',
    },
    {
      label: 'Design',
      title: 'Make it real',
      body: 'We design in high fidelity and pressure-test against the real world, iterating in tight loops with you.',
    },
    {
      label: 'Deliver',
      title: 'Ship and support',
      body: 'We hand off production-ready files and stay close through launch so the work lands the way it should.',
    },
  ],
};
