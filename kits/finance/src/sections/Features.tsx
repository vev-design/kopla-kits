import {
  Banknote,
  CandlestickChart,
  Coins,
  CreditCard,
  LineChart,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/Card';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  chart: LineChart,
  candlestick: CandlestickChart,
  wallet: Wallet,
  card: CreditCard,
  coins: Coins,
  banknote: Banknote,
  piggybank: PiggyBank,
  repeat: Repeat,
  target: Target,
  shield: ShieldCheck,
  sparkles: Sparkles,
};

/**
 * Icon-led capability grid that breaks the product into scannable benefits —
 * automated investing, fractional shares, recurring deposits, and so on. Use
 * after the metrics row to do the explaining; pick the column count with
 * `variant`.
 */
export interface FeaturesProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "What you get"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Capability cards. 3–6 items (multiples of the column count read best). */
  features: {
    /** Icon name. One of: chart, candlestick, wallet, card, coins, banknote, piggybank, repeat, target, shield, sparkles. */
    icon:
      | 'chart'
      | 'candlestick'
      | 'wallet'
      | 'card'
      | 'coins'
      | 'banknote'
      | 'piggybank'
      | 'repeat'
      | 'target'
      | 'shield'
      | 'sparkles';
    /** Capability title. 1–3 words, sentence case. */
    title: string;
    /** Capability body. 1–2 sentences, 12–28 words. */
    body: string;
  }[];
  /** Number of columns on desktop. */
  variant?: 'two-col' | 'three-col';
}

export function Features({
  id,
  eyebrow,
  heading,
  subhead,
  features,
  variant = 'three-col',
}: FeaturesProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-14 flex flex-col items-center gap-4 text-center">
          {eyebrow ? (
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              {subhead}
            </p>
          ) : null}
        </Reveal>
        <Stagger
          className={cn(
            'grid gap-6',
            variant === 'two-col'
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {features.map((feature) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            return (
              <Card key={feature.title} variant="feature">
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  {feature.body}
                </p>
              </Card>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export const FeaturesDemo: FeaturesProps = {
  eyebrow: 'What you get',
  heading: 'A complete platform for your money',
  subhead:
    'Open one account and get the building blocks of a modern portfolio, all working together automatically.',
  features: [
    {
      icon: 'repeat',
      title: 'Automated investing',
      body: 'Set a recurring deposit and we invest it across a diversified portfolio matched to your goals and risk.',
    },
    {
      icon: 'coins',
      title: 'Fractional shares',
      body: 'Put every dollar to work. Buy slices of hundreds of funds and stocks with no minimum and no commission.',
    },
    {
      icon: 'target',
      title: 'Goal tracking',
      body: 'Name a goal, set a target date, and watch progress update as your balance and contributions grow.',
    },
    {
      icon: 'card',
      title: 'Spend & save',
      body: 'A linked cash account with instant transfers, so saving and investing live side by side.',
    },
    {
      icon: 'chart',
      title: 'Live performance',
      body: 'Track returns, allocation, and fees in clear charts that update the moment markets move.',
    },
    {
      icon: 'piggybank',
      title: 'Tax-smart moves',
      body: 'Automatic rebalancing and loss harvesting work quietly to keep more of your gains in your account.',
    },
  ],
  variant: 'three-col',
};
