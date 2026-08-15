import { Check } from 'lucide-react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { GlassCard } from '@/components/GlassCard';
import { Reveal, Stagger } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Transparent pricing block with 2–3 glass tiers, each showing a name,
 * price, period, feature list, and CTA. One tier is lifted with the
 * `tinted` glass treatment — a soft primary-accent glow — to steer the
 * choice. Place after the testimonial, once the visitor is convinced.
 */
export interface PricingProps extends SectionBaseProps {
  /** Small label above the heading. 1–2 words, sentence case (e.g. "Pricing"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–7 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 10–22 words. */
  subhead?: string | null;
  /** Pricing tiers. 2–3 items, ordered cheapest to most expensive. */
  tiers: {
    /** Tier name. 1–2 words (e.g. "Starter", "Studio"). */
    name: string;
    /** Price figure including currency, no period. Max 8 chars (e.g. "$29", "Custom"). */
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
    <section id={id ?? undefined} className="w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? (
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        <Stagger className="grid items-start gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <GlassCard
              key={tier.name}
              variant={tier.highlighted ? 'tinted' : 'light'}
              className="h-full gap-6 p-8"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">{tier.name}</h3>
                  {tier.highlighted ? <Badge variant="solid">Popular</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                {tier.period ? (
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                ) : null}
              </div>
              <ul className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
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
            </GlassCard>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export const PricingDemo: PricingProps = {
  eyebrow: 'Pricing',
  heading: 'Plans that scale with your product',
  subhead: 'Start free, upgrade when your surfaces do. No seat minimums, cancel anytime.',
  tiers: [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'For solo builders prototyping their first glass UI.',
      features: [
        'Up to 3 glass surfaces',
        'Real-time blur preview',
        'Community support',
        'Halo watermark',
      ],
      cta: { label: 'Start free', href: '#cta' },
    },
    {
      name: 'Studio',
      price: '$39',
      period: 'per seat / mo',
      description: 'For product teams shipping glass across a full app.',
      features: [
        'Unlimited glass surfaces',
        'Adaptive blur & contrast guard',
        'Custom canvas gradients',
        'Priority support',
      ],
      cta: { label: 'Start trial', href: '#cta' },
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: null,
      description: 'For organizations with brand and performance requirements.',
      features: [
        'Dedicated rendering budget',
        'SSO & audit logs',
        'Custom SLAs',
        'Dedicated success manager',
      ],
      cta: { label: 'Contact sales', href: '#' },
    },
  ],
};
