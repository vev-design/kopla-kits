import { Reveal } from '@/motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

/**
 * Ticket tiers — a row of pricing cards, each with perks and a buy CTA, one
 * optionally highlighted as the recommended pass.
 */
export interface TicketsProps extends SectionBaseProps {
  /** Section heading. 1–3 words, e.g. "Tickets". */
  heading: string;
  /** Tiers. 2–4 items. */
  tiers: {
    /** Tier name. 1–3 words, e.g. "Conference pass". */
    name: string;
    /** Price. Number + symbol, max 6 chars, e.g. "€349". */
    price: string;
    /** Billing/availability note. 2–5 words, e.g. "Early bird". */
    note?: string | null;
    /** What's included. 3–6 items, 1 short sentence each. */
    perks: string[];
    /** Buy CTA. */
    cta: {
      /** Label. 1–3 words, e.g. "Buy ticket". */
      label: string;
      /**
       * Destination.
       * @kind url
       */
      href: string;
    };
    /** Highlight as the recommended tier. */
    highlighted?: boolean;
  }[];
}

export function Tickets({ id, heading, tiers }: TicketsProps) {
  return (
    <section id={id ?? undefined} className="mx-auto w-full max-w-5xl px-6 py-20 md:py-28">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
      <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col gap-5 rounded-2xl border bg-card p-6',
              tier.highlighted ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border',
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{tier.name}</span>
                {tier.highlighted ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-primary-foreground">
                    Popular
                  </span>
                ) : null}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                {tier.note ? (
                  <span className="text-sm text-muted-foreground">{tier.note}</span>
                ) : null}
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-2.5">
              {tier.perks.map((perk, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant={tier.highlighted ? 'default' : 'outline'} className="w-full">
              <a href={tier.cta.href}>{tier.cta.label}</a>
            </Button>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export const TicketsDemo: TicketsProps = {
  heading: 'Tickets',
  tiers: [
    {
      name: 'Online',
      price: '€99',
      note: 'Stream',
      perks: ['Live-streamed talks', 'Session recordings', 'Community Discord'],
      cta: { label: 'Buy ticket', href: '#' },
    },
    {
      name: 'Conference',
      price: '€349',
      note: 'Early bird',
      perks: ['Both days, in person', 'All talks + workshops', 'Lunch & socials', 'Session recordings'],
      cta: { label: 'Buy ticket', href: '#' },
      highlighted: true,
    },
    {
      name: 'Team',
      price: '€1,490',
      note: '5 seats',
      perks: ['Five conference passes', 'Reserved seating', 'Invoice billing'],
      cta: { label: 'Get in touch', href: '#' },
    },
  ],
};
