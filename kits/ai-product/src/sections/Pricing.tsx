import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Transparent pricing block with 2–3 tiers, each showing a name, price,
 * period, feature list, and CTA. One tier can be highlighted with the iris
 * ring to steer the choice. Place after the testimonial, once the visitor is
 * convinced.
 */
export interface PricingProps extends SectionBaseProps {
  /** Small monospace label above the heading. 1–2 words, sentence case (e.g. "Pricing"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–7 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 10–22 words. */
  subhead?: string | null;
  /** Pricing tiers. 2–3 items, ordered cheapest to most expensive. */
  tiers: {
    /** Tier name. 1–2 words (e.g. "Hobby", "Pro"). */
    name: string;
    /** Price figure including currency, no period. Max 8 chars (e.g. "$0", "$20", "Custom"). */
    price: string;
    /** Billing period suffix. Short, max 12 chars (e.g. "per month"). Omit for custom plans. */
    period?: string | null;
    /** One-line tier summary. 1 sentence, 6–14 words. */
    description: string;
    /** Included features. 3–6 items. Each: 1 short phrase, max 8 words. */
    features: string[];
    /** Tier CTA button. */
    cta: {
      /** Button label. 1–3 words, sentence case (e.g. "Start free"). */
      label: string;
      /**
       * Destination the button links to.
       * @kind url
       */
      href: string;
    };
    /** Whether this tier is visually emphasized as the recommended plan. */
    highlighted?: boolean;
  }[];
}

export function Pricing({ id, eyebrow, heading, subhead, tiers }: PricingProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-accent-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
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
                  <h3 className="text-lg font-semibold tracking-tight">
                    {tier.name}
                  </h3>
                  {tier.highlighted ? (
                    <Badge variant="solid">Popular</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
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
                      className="mt-0.5 size-4 shrink-0 text-accent-foreground"
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
                className="mt-auto w-full"
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

export const PricingDemo: PricingProps = {
  eyebrow: 'Pricing',
  heading: 'Start free, pay as you scale',
  subhead: 'Usage-based pricing with no GPU minimums. Only pay for the tokens you actually run.',
  tiers: [
    {
      name: 'Hobby',
      price: '$0',
      period: 'forever',
      description: 'For side projects and first experiments.',
      features: [
        '1M tokens / month',
        'Shared inference pool',
        'Community Discord',
        'Basic tracing',
      ],
      cta: { label: 'Start free', href: '#cta' },
    },
    {
      name: 'Pro',
      price: '$20',
      period: 'per month',
      description: 'For teams shipping AI features to real users.',
      features: [
        'Pay-as-you-go tokens',
        'Dedicated low-latency endpoints',
        'Agent runtime & evals',
        'Usage analytics',
        'Priority support',
      ],
      cta: { label: 'Start trial', href: '#cta' },
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: null,
      description: 'For organizations with scale and compliance needs.',
      features: [
        'Volume token discounts',
        'SSO, SCIM & audit logs',
        'Zero data retention',
        'Dedicated solutions engineer',
      ],
      cta: { label: 'Contact sales', href: '#' },
    },
  ],
};
