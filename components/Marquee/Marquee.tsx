// CSS-only loop mechanics. Content and controls can wear the section's own
// markup. The native pause checkbox works with JavaScript disabled: Tab and
// Space are the platform's, with no keys rebound. The repeated row is inert
// and hidden from assistive technology; the original is the only readable copy.

import { cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** An endless horizontal strip of text, logo images, or authored content.
 * No hydration is needed. Reduced motion shows every item in a static row. */
export interface MarqueeProps {
  /** Short text items, in source order. Existing text-only calls remain valid. */
  items?: string[];
  /** Logo artwork and its rendered dimensions, in source order. */
  logos?: {
    /** Original logo asset URL. @kind image */
    src: string;
    /** Brand name, 1–5 words. Used as text if the image is missing. */
    alt: string;
    /** Rendered width in pixels. */
    width: number;
    /** Rendered height in pixels. */
    height: number;
  }[];
  /** Authored items, including inline SVGs; overrides items and logos. Avoid IDs in repeated content. */
  children?: ReactNode;
  /** Scroll speed when the source does not specify a duration. */
  speed?: 'slow' | 'normal' | 'fast';
  /** Measured duration of one complete loop, in seconds. */
  durationSeconds?: number;
  /** Distance between items, including the loop boundary, in pixels. */
  gap?: number;
  /** Pause under the pointer. Focus always pauses the loop. Default true. */
  pauseOnHover?: boolean;
  /** Authored pause control using MarqueePause. Null leaves the strip static. */
  controls?: ReactNode;
  /** Section-owned styling, including edge fades when the design draws them. */
  className?: string;
}

/** A native checkbox controlling the enclosing marquee. Style it directly or
 * use asChild with a checkbox inside the design's own label. */
export interface MarqueePauseProps {
  /** Accessible label, 1–5 words. */
  label?: string;
  /** Begin paused. Default false. */
  defaultPaused?: boolean;
  /** Style the checkbox. Its label can provide the larger touch target. */
  className?: string;
  /** Apply the mechanism to the single child input. */
  asChild?: boolean;
  /** The design's own checkbox when asChild is true. */
  children?: ReactNode;
}

export function MarqueePause({ label = 'Pause animation', defaultPaused = false, className, asChild, children }: MarqueePauseProps) {
  const attributes = { type: 'checkbox', 'data-marquee-pause': '', 'aria-label': label, defaultChecked: defaultPaused, className };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, { ...attributes, className: cn(child.props.className as string | undefined, className) });
  }
  return <input {...attributes} />;
}

const DURATION = { slow: 60, normal: 36, fast: 18 };

export function Marquee({ items = [], logos = [], children, speed = 'normal', durationSeconds, gap = 0,
  pauseOnHover = true, controls = <MarqueePause />, className }: MarqueeProps) {
  const content = children ?? (logos.length ? logos.map((logo, i) => logo.src
    ? <img key={i} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height}
        style={{ width: logo.width, height: logo.height, objectFit: 'contain', flexShrink: 0 }} />
    : <span key={i}>{logo.alt}</span>) : items.map((item, i) => <span key={i}>{item}</span>));
  const duration = durationSeconds && Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : DURATION[speed];
  return (
    <div data-marquee="" data-marquee-hover={pauseOnHover || undefined} className={className}
      style={{ '--kk-marquee-duration': `${duration}s`, '--kk-marquee-gap': `${Math.max(0, gap)}px` } as CSSProperties}>
      <style>{`
        @keyframes kk-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        [data-marquee] > [data-marquee-viewport] { overflow: hidden; }
        [data-marquee-viewport] > [data-marquee-track] { display: flex; width: max-content; min-width: 200%; }
        [data-marquee-track] > [data-marquee-row] { display: flex; align-items: center; flex: 1 0 auto; gap: var(--kk-marquee-gap); padding-inline-end: var(--kk-marquee-gap); }
        [data-marquee-row] > * { flex-shrink: 0; }
        /* A loop without a working pause control must never start. */
        :where([data-marquee]:has(> [data-marquee-controls] [data-marquee-pause])) > [data-marquee-viewport] > [data-marquee-track] { animation: kk-marquee var(--kk-marquee-duration) linear infinite; }
        [data-marquee]:has(> [data-marquee-controls] [data-marquee-pause]:checked) > [data-marquee-viewport] > [data-marquee-track],
        [data-marquee-hover]:hover > [data-marquee-viewport] > [data-marquee-track],
        [data-marquee]:focus-within > [data-marquee-viewport] > [data-marquee-track] { animation-play-state: paused; }
        [data-marquee]:not(:has(> [data-marquee-controls] [data-marquee-pause])) > [data-marquee-viewport] { overflow-x: auto; }
        [data-marquee]:not(:has(> [data-marquee-controls] [data-marquee-pause])) [data-marquee-clone] { display: none; }
        @media (prefers-reduced-motion: reduce) {
          [data-marquee] > [data-marquee-viewport] { overflow: visible; mask-image: none; }
          [data-marquee] > [data-marquee-viewport] > [data-marquee-track] { animation: none !important; width: 100%; min-width: 0; }
          [data-marquee-track] > [data-marquee-row] { flex: 1 1 100%; flex-wrap: wrap; padding-inline-end: 0; }
          [data-marquee-row] > * { max-width: 100%; overflow-wrap: anywhere; }
          [data-marquee] [data-marquee-clone], [data-marquee] > [data-marquee-controls] { display: none; }
        }
      `}</style>
      <div data-marquee-viewport="">
        <div data-marquee-track="">
          <div data-marquee-row="">{content}</div>
          <div data-marquee-row="" data-marquee-clone="" aria-hidden="true" inert>{content}</div>
        </div>
      </div>
      <div data-marquee-controls="">{controls}</div>
    </div>
  );
}

export const MarqueeShowcase = [{ props: { items: ['Acme', 'Northwind'] }, label: 'Text items' }];
export const MarqueePauseShowcase = [{ props: { label: 'Pause animation' }, label: 'Native pause' }];
