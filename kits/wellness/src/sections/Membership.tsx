import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Soft membership tiers, each showing a name, price, period, a list of
 * inclusions, and a CTA. One tier can be highlighted as the most loved option.
 * Place after the schedule, once a visitor is considering joining.
 */
export interface MembershipProps extends SectionBaseProps {
  /** Small label above the heading. 1–2 words, sentence case (e.g. "Membership"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–7 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 10–24 words. */
  subhead?: string | null;
  /** Membership tiers. 2–3 items, ordered from lightest to most committed. */
  tiers: {
    /** Tier name. 1–2 words (e.g. "Drop-in", "Unlimited"). */
    name: string;
    /** Price figure including currency, no period. Max 8 chars (e.g. "$22", "$120"). */
    price: string;
    /** Billing period suffix. Short, max 14 chars (e.g. "per month"). Omit for single visits. */
    period?: string | null;
    /** One-line tier summary. 1 sentence, 6–14 words. */
    description: string;
    /** What's included. 3–6 items. Each: 1 short phrase, max 9 words. */
    features: string[];
    /** Tier CTA button. */
    cta: {
      /** Button label. 1–3 words, sentence case (e.g. "Join now"). */
      label: string;
      /**
       * Destination the button links to.
       * @kind url
       */
      href: string;
    };
    /** Whether this tier is visually emphasized as the most loved option. */
    highlighted?: boolean;
  }[];
}

export function Membership({ id, eyebrow, heading, subhead, tiers }: MembershipProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? <Badge variant="soft">{eyebrow}</Badge> : null}
          <h2 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-xl text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
        </Reveal>
        <Stagger className="grid items-start gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              variant={tier.highlighted ? 'tier-highlighted' : 'tier'}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold tracking-tight">
                    {tier.name}
                  </h3>
                  {tier.highlighted ? (
                    <Badge variant="solid">Most loved</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold tracking-tight">
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                ) : null}
              </div>
              <ul className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      strokeWidth={2.5}
                    />
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? 'default' : 'outline'}
                className="mt-auto w-full rounded-full"
              >
                <a href={tier.cta.href}>{tier.cta.label}</a>
              </Button>
            </Card>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const MembershipDemo: MembershipProps = {
  eyebrow: 'Membership',
  heading: 'Find a rhythm that fits',
  subhead:
    'No lock-ins and no pressure. Pause or change your membership whenever life asks you to.',
  tiers: [
    {
      name: 'Drop-in',
      price: '$22',
      period: 'per class',
      description: 'For when you simply need a single quiet hour.',
      features: [
        'One class of your choice',
        'Mats and props provided',
        'Book up to two weeks ahead',
      ],
      cta: { label: 'Book a class', href: '#cta' },
    },
    {
      name: 'Monthly',
      price: '$120',
      period: 'per month',
      description: 'For a steady, settling weekly practice.',
      features: [
        'Unlimited studio classes',
        'Two guest passes each month',
        'Early access to workshops',
        'Members-only tea lounge',
      ],
      cta: { label: 'Join now', href: '#cta' },
      highlighted: true,
    },
    {
      name: 'Annual',
      price: '$1,080',
      period: 'per year',
      description: 'For the deeply committed, at our gentlest rate.',
      features: [
        'Everything in Monthly',
        'Two months free each year',
        'One private session a quarter',
        'A welcome wellness kit',
      ],
      cta: { label: 'Join now', href: '#cta' },
    },
  ],
};
