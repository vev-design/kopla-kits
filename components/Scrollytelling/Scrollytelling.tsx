// Scroll-driven story. Steps scroll past a pinned visual panel that
// switches as each step crosses the middle of the viewport. Token-themed
// (bg-muted, text-primary, border) so it re-skins with the system; needs
// nothing beyond _base (react + motion).

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

/** One story step. */
export interface ScrollStep {
  /** Step heading. 2–6 words. */
  title: string;
  /** Step body copy. 1–3 sentences. */
  body: string;
  /** Image shown in the pinned panel while this step is active. @kind image */
  image?: string | null;
  /** Big stat/kicker shown in the panel when there is no image. 1–8 characters, e.g. "3×" or "98%". */
  stat?: string | null;
}

/**
 * A scroll-driven story: steps scroll on one side while a pinned panel on
 * the other switches to the active step's visual. Best with 3–6 steps. On
 * small screens the panel hides and each step shows its visual inline.
 * @hydrate
 */
export interface ScrollytellingProps {
  /** Which side the pinned visual panel sits on (desktop only). */
  variant?: 'panel-right' | 'panel-left';
  /** The story steps, in scroll order. 3–6 entries. */
  steps: ScrollStep[];
}

export function Scrollytelling({ variant = 'panel-right', steps }: ScrollytellingProps) {
  const [active, setActive] = useState(0);
  const current = steps[active] ?? steps[0];

  return (
    <div
      data-kopla-component="Scrollytelling"
      className={cn(
        'grid items-start gap-12 lg:grid-cols-2',
        variant === 'panel-left' && 'lg:[&>*:first-child]:order-2',
      )}
    >
      <div className="flex flex-col gap-24 py-12 lg:gap-[40vh] lg:py-[30vh]">
        {steps.map((step, i) => (
          <Step key={i} index={i} active={active === i} onEnter={setActive} step={step} />
        ))}
      </div>

      <div className="sticky top-[20vh] hidden h-[60vh] lg:block">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-full"
        >
          <StepVisual step={current} index={active} total={steps.length} />
        </motion.div>
      </div>
    </div>
  );
}

function Step({
  index,
  active,
  onEnter,
  step,
}: {
  index: number;
  active: boolean;
  onEnter: (index: number) => void;
  step: ScrollStep;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // A narrow band around the viewport's middle: the step whose content sits
  // in that band is the active one.
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  return (
    <div
      ref={ref}
      data-slot="item"
      className={cn(
        'flex flex-col gap-4 transition-opacity duration-300',
        active ? 'opacity-100' : 'lg:opacity-40',
      )}
    >
      <span className="font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3 data-slot="item-heading" className="text-2xl font-semibold tracking-tight text-foreground">{step.title}</h3>
      <p data-slot="item-body" className="max-w-prose text-base leading-relaxed text-muted-foreground">{step.body}</p>
      <div className="mt-4 aspect-[4/3] lg:hidden">
        <StepVisual step={step} index={index} total={0} />
      </div>
    </div>
  );
}

function StepVisual({ step, index, total }: { step: ScrollStep; index: number; total: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border bg-muted">
      {step.image ? (
        <img src={step.image} alt={step.title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-8">
          <span className="text-6xl font-semibold tracking-tight text-primary lg:text-8xl">
            {step.stat ?? String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}
      {total > 0 ? (
        <span className="absolute bottom-4 right-4 rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
          {index + 1} / {total}
        </span>
      ) : null}
    </div>
  );
}

export const ScrollytellingShowcase = [
  {
    props: {
      steps: [
        {
          title: 'Connect your sources',
          body: 'Point the workspace at the tools your team already uses. Everything stays in sync from the first import.',
          stat: '01',
        },
        {
          title: 'Shape the story',
          body: 'Drag the beats into order and let the system carry your brand through every step.',
          stat: '3×',
        },
        {
          title: 'Publish everywhere',
          body: 'One click renders the same story to web, PDF, and slides — always from the latest data.',
          stat: '98%',
        },
      ],
    },
    label: 'Stat panel',
  },
];
