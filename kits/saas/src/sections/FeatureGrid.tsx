import {
  BarChart3,
  Bell,
  Boxes,
  Gauge,
  Globe,
  Layers,
  Lock,
  Plug,
  Sparkles,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, Stagger } from '@/motion';
import { cn } from '@/lib/utils';
import type { SectionBaseProps } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  gauge: Gauge,
  lock: Lock,
  globe: Globe,
  layers: Layers,
  workflow: Workflow,
  chart: BarChart3,
  bell: Bell,
  plug: Plug,
  boxes: Boxes,
  sparkles: Sparkles,
};

/**
 * Icon-led feature grid that breaks the product into scannable benefits. Each
 * feature pairs an icon with a short title and body. Use after social proof to
 * do the explaining; pick the column count with `variant`.
 */
export interface FeatureGridProps extends SectionBaseProps {
  /** Small label above the heading. 1–3 words, sentence case (e.g. "Why teams switch"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Feature cards. 3–6 items (multiples of the column count read best). */
  features: {
    /** Icon name. One of: zap, gauge, lock, globe, layers, workflow, chart, bell, plug, boxes, sparkles. */
    icon:
      | 'zap'
      | 'gauge'
      | 'lock'
      | 'globe'
      | 'layers'
      | 'workflow'
      | 'chart'
      | 'bell'
      | 'plug'
      | 'boxes'
      | 'sparkles';
    /** Feature title. 1–3 words, sentence case. */
    title: string;
    /** Feature body. 1–2 sentences, 12–28 words. */
    body: string;
  }[];
  /** Number of columns on desktop. */
  variant?: 'two-col' | 'three-col';
}

export function FeatureGrid({
  id,
  eyebrow,
  heading,
  subhead,
  features,
  variant = 'three-col',
}: FeatureGridProps) {
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
              <div
                key={feature.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

export const FeatureGridDemo: FeatureGridProps = {
  eyebrow: 'Why teams switch',
  heading: 'Everything your data needs, in one place',
  subhead:
    'Connect a source once and every dashboard, alert, and report stays in sync automatically.',
  features: [
    {
      icon: 'plug',
      title: 'Instant connectors',
      body: 'Plug into Postgres, Stripe, and your warehouse in minutes — no pipeline engineering required.',
    },
    {
      icon: 'gauge',
      title: 'Real-time metrics',
      body: 'Live dashboards update the moment events land, so you never debate stale numbers in a meeting.',
    },
    {
      icon: 'lock',
      title: 'Governed access',
      body: 'Row-level permissions and SSO keep sensitive metrics in front of the right people only.',
    },
    {
      icon: 'workflow',
      title: 'Automated reports',
      body: 'Schedule a digest to Slack or email and let the workspace assemble it for you each morning.',
    },
    {
      icon: 'bell',
      title: 'Smart alerts',
      body: 'Set a threshold once and get pinged the instant a metric drifts outside its expected band.',
    },
    {
      icon: 'sparkles',
      title: 'AI summaries',
      body: 'Ask a question in plain language and get a charted answer with the query behind it.',
    },
  ],
  variant: 'three-col',
};
