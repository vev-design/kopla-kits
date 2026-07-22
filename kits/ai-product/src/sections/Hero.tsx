import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/Badge';
import { Reveal } from '@/motion';
import type { SectionBaseProps } from '@/types';

/**
 * Above-the-fold hero for an AI product. Left-aligned copy — monospace eyebrow
 * chip, benefit headline, subhead, primary + secondary CTAs — sits beside a
 * styled terminal window whose title and lines are prop-driven, over a faint
 * grid and an iris glow. Swap the terminal for a framed screenshot via `image`
 * when the product is visual rather than CLI-first. Use as the first content
 * section after the navbar.
 */
export interface HeroProps extends SectionBaseProps {
  /** Short monospace label above the headline. 1–4 words, no punctuation (e.g. "Agents now GA"). */
  eyebrow?: string | null;
  /** Primary benefit statement. 1 sentence, 5–11 words, no trailing period. */
  headline: string;
  /** Supporting subhead under the headline. 1–2 sentences, 14–32 words. */
  subhead?: string | null;
  /** Primary call-to-action button (filled white). */
  primaryCta: {
    /** Button label. 1–3 words, sentence case (e.g. "Start building"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  };
  /** Secondary call-to-action button (outline). Omit for a single-CTA hero. */
  secondaryCta?: {
    /** Button label. 1–3 words, sentence case (e.g. "Read the docs"). */
    label: string;
    /**
     * Destination the button links to.
     * @kind url
     */
    href: string;
  } | null;
  /**
   * Terminal window rendered beside the copy. Takes precedence over `image`
   * when both are set. Omit both for a copy-only hero.
   */
  terminal?: {
    /** Title-bar text, monospace. 1–4 words or a path, max 24 characters (e.g. "forge — zsh"). Omit to hide. */
    title?: string | null;
    /** Terminal lines, top to bottom. 4–8 items, each max 48 characters. Lines starting with "$ " render as commands with an accent prompt; lines starting with "#" render as dim comments; everything else renders as output. */
    lines: string[];
  } | null;
  /**
   * Product screenshot shown beside the copy when no terminal is set. Wide aspect (≈16:10).
   * @kind image
   */
  image?: string | null;
}

function TerminalLine({ line }: { line: string }) {
  if (line.startsWith('$')) {
    return (
      <span className="text-foreground">
        <span className="text-accent-foreground">$</span>
        {line.slice(1)}
      </span>
    );
  }
  if (line.startsWith('#')) {
    return <span className="text-muted-foreground/60">{line}</span>;
  }
  return <span className="text-muted-foreground">{line}</span>;
}

export function Hero({
  id,
  eyebrow,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  terminal,
  image,
}: HeroProps) {
  const hasVisual = Boolean(terminal || image);
  return (
    <section id={id ?? undefined} className="relative w-full overflow-hidden bg-background">
      {/* Faint grid, masked to fade at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
      />
      {/* Iris glow behind the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[36rem] w-[56rem] -translate-x-1/4 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,var(--chart-1),transparent)] opacity-25 blur-3xl"
      />
      <div
        className={
          hasVisual
            ? 'relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-24 pb-20 md:pt-32 lg:grid-cols-2 lg:gap-16'
            : 'relative mx-auto w-full max-w-6xl px-6 pt-24 pb-20 md:pt-32'
        }
      >
        <Reveal className="flex max-w-2xl flex-col items-start gap-6">
          {eyebrow ? (
            <Badge data-slot="eyebrow" variant="accent">
              {eyebrow}
            </Badge>
          ) : null}
          <h1
            data-slot="heading"
            className="text-5xl font-semibold tracking-tight text-balance md:text-6xl"
          >
            {headline}
          </h1>
          {subhead ? (
            <p
              data-slot="subhead"
              className="text-lg text-muted-foreground text-pretty md:text-xl"
            >
              {subhead}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight />
              </a>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            ) : null}
          </div>
        </Reveal>
        {terminal ? (
          <Reveal>
            <div
              data-slot="media"
              className="rounded-xl bg-gradient-to-b from-ring/40 to-border p-px shadow-[0_0_80px_-20px_var(--ring)]"
            >
              <div className="overflow-hidden rounded-xl bg-card">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" aria-hidden />
                  {terminal.title ? (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {terminal.title}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5 px-4 py-5 font-mono text-sm leading-relaxed">
                  {terminal.lines.map((line, index) => (
                    <TerminalLine key={index} line={line} />
                  ))}
                  <span
                    className="mt-1 inline-block h-4 w-2 animate-pulse bg-accent-foreground/70"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </Reveal>
        ) : image ? (
          <Reveal>
            <div className="rounded-xl bg-gradient-to-b from-ring/40 to-border p-px shadow-[0_0_80px_-20px_var(--ring)]">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
                <img data-slot="media" src={image} alt="" className="aspect-[16/10] w-full object-cover" />
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export const HeroDemo: HeroProps = {
  eyebrow: 'Agents now GA',
  headline: 'The AI platform built for production',
  subhead:
    'Forge gives engineering teams one platform for inference, agents, and evals — from prototype to production traffic without rewriting a line.',
  primaryCta: { label: 'Start building', href: '#cta' },
  secondaryCta: { label: 'Read the docs', href: '#' },
  terminal: {
    title: 'forge — zsh',
    lines: [
      '$ forge init my-agent',
      'Created my-agent from template agent-chat',
      '$ forge deploy',
      '# bundling and pushing to 14 edge regions',
      'Deployed in 1.8s',
      'Live at https://my-agent.forge.run',
    ],
  },
  image: null,
};
