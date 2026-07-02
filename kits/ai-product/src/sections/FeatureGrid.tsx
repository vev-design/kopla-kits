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
import { Card } from '@/components/Card';
import { Reveal } from '@/motion';
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
 * Bento capability grid that breaks the AI product into cells of varying
 * weight: the first feature anchors a large 2×2 cell (with an optional
 * visual), the next four fill single cells beside it, and any further items
 * render as wide half-row cells below. Each cell pairs an iris-tinted icon
 * with a monospace micro-label, title, and body. Use after social proof to do
 * the explaining.
 */
export interface FeatureGridProps extends SectionBaseProps {
  /** Small monospace label above the heading. 1–3 words, sentence case (e.g. "The platform"). */
  eyebrow?: string | null;
  /** Section heading. 1 sentence, 3–8 words, no trailing period. */
  heading: string;
  /** Supporting line under the heading. 1 sentence, 12–24 words. */
  subhead?: string | null;
  /** Feature cells. 5 or 7 items fill the bento exactly; the FIRST item is the large anchor cell. */
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
    /** Monospace micro-label in the cell corner. 1 word, max 14 characters (e.g. "Inference"). */
    label?: string | null;
    /** Feature title. 1–3 words, sentence case. */
    title: string;
    /** Feature body. 1–2 sentences, 12–28 words. */
    body: string;
    /**
     * Optional visual for the cell, framed at the bottom. Wide aspect (≈16:9); best on the first (anchor) cell.
     * @kind image
     */
    image?: string | null;
  }[];
}

export function FeatureGrid({ id, eyebrow, heading, subhead, features }: FeatureGridProps) {
  return (
    <section id={id ?? undefined} className="w-full bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="mb-12 flex max-w-2xl flex-col items-start gap-4">
          {eyebrow ? (
            <p className="font-mono text-xs tracking-[0.18em] text-accent-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {heading}
          </h2>
          {subhead ? (
            <p className="text-lg text-muted-foreground text-pretty">{subhead}</p>
          ) : null}
        </Reveal>
        {/* Span classes must sit on the grid's direct children — Stagger wraps
            each child in its own div, which would swallow them. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            const isAnchor = index === 0;
            const isWide = index >= 5;
            return (
              <Reveal
                key={feature.title}
                className={cn(
                  isAnchor && 'sm:col-span-2 sm:row-span-2',
                  isWide && 'lg:col-span-2',
                )}
              >
                <Card
                  variant="feature"
                  className={cn('h-full', isAnchor && 'lg:p-8')}
                >
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-ring/30 bg-accent/40 text-accent-foreground">
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  {feature.label ? (
                    <span className="font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
                      {feature.label}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <h3
                    className={cn(
                      'font-semibold tracking-tight',
                      isAnchor ? 'text-2xl' : 'text-lg',
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      'text-muted-foreground text-pretty',
                      isAnchor ? 'text-base' : 'text-sm',
                    )}
                  >
                    {feature.body}
                  </p>
                </div>
                {feature.image ? (
                  <div
                    className={cn(
                      'mt-auto overflow-hidden rounded-lg border border-border',
                      isAnchor && 'min-h-40 flex-1',
                    )}
                  >
                    <img
                      src={feature.image}
                      alt=""
                      className={cn(
                        'w-full object-cover',
                        isAnchor ? 'h-full' : 'aspect-video',
                      )}
                    />
                  </div>
                ) : null}
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FeatureGridDemo: FeatureGridProps = {
  eyebrow: 'The platform',
  heading: 'Everything you need to ship AI',
  subhead:
    'One SDK, one dashboard, one bill — from your first prompt to billions of tokens in production.',
  features: [
    {
      icon: 'zap',
      label: 'Inference',
      title: 'Fast inference',
      body: 'Serve open and frontier models from a global edge network with sub-second cold starts and automatic batching.',
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      icon: 'workflow',
      label: 'Agents',
      title: 'Agent runtime',
      body: 'Compose tools, memory, and multi-step reasoning into agents that run reliably with built-in retries.',
    },
    {
      icon: 'chart',
      label: 'Quality',
      title: 'Evals & tracing',
      body: 'Score every response against your own test sets and watch quality, latency, and cost live.',
    },
    {
      icon: 'plug',
      label: 'DX',
      title: 'Drop-in SDK',
      body: 'An OpenAI-compatible API means you switch by changing one base URL — no rewrites, no lock-in.',
    },
    {
      icon: 'lock',
      label: 'Security',
      title: 'Private by default',
      body: 'SOC 2 Type II, zero data retention, and bring-your-own-key keep your prompts yours alone.',
    },
    {
      icon: 'gauge',
      label: 'Scale',
      title: 'Scales with you',
      body: 'Autoscale from a weekend prototype to production peak traffic without provisioning a single GPU yourself.',
    },
    {
      icon: 'bell',
      label: 'Ops',
      title: 'Alerts that matter',
      body: 'Set budgets and latency thresholds once and get paged the moment production drifts outside them.',
    },
  ],
};
