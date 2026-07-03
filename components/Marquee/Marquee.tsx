// An endless horizontal ticker. Pure CSS animation — no client JS, so a
// section hosting it stays static — with faded edges and a reduced-motion
// fallback (the strip simply stands still). The item list is rendered
// twice (clone aria-hidden) so the loop is seamless.

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * An endless horizontal ticker of short text items. CSS-only: animates
 * without JavaScript and stands still under prefers-reduced-motion. Best
 * with 4–10 items of 1–4 words each.
 */
export interface MarqueeProps {
  /** The items to scroll. 4–10 short strings. */
  items: string[];
  /** Scroll speed. */
  speed?: 'slow' | 'normal' | 'fast';
  /** Pause the scroll while hovered. Default true. */
  pauseOnHover?: boolean;
}

const DURATION: Record<NonNullable<MarqueeProps['speed']>, string> = {
  slow: '60s',
  normal: '36s',
  fast: '18s',
};

export function Marquee({ items, speed = 'normal', pauseOnHover = true }: MarqueeProps) {
  return (
    <div
      className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      role="marquee"
      aria-label={items.join(', ')}
    >
      <style>{`
        @keyframes kk-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .kk-marquee-track { animation: kk-marquee var(--kk-marquee-duration) linear infinite; }
        .kk-marquee-pausable:hover .kk-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .kk-marquee-track { animation: none; } }
      `}</style>
      <div className={cn(pauseOnHover && 'kk-marquee-pausable')}>
        <div
          className="kk-marquee-track flex w-max items-center"
          style={{ '--kk-marquee-duration': DURATION[speed] } as CSSProperties}
        >
          <MarqueeRow items={items} />
          <MarqueeRow items={items} ariaHidden />
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, ariaHidden }: { items: string[]; ariaHidden?: boolean }) {
  return (
    <div className="flex items-center" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-lg font-medium text-muted-foreground">{item}</span>
          <span className="size-1.5 rounded-full bg-border" />
        </span>
      ))}
    </div>
  );
}

export const MarqueeShowcase = [
  {
    props: {
      items: ['Acme Corp', 'Northwind', 'Globex', 'Initech', 'Umbrella', 'Stark Industries'],
    },
    label: 'Client strip',
  },
  {
    props: {
      items: ['Design once', 'Publish everywhere', 'Always on brand', 'Live data'],
      speed: 'fast',
    },
    label: 'Keywords, fast',
  },
];
