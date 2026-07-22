// A number that counts up from zero when scrolled into view. The server
// renders the FINAL value (real content without JS); hydration replays the
// count once on first view. Inherits color/size from its parent — style it
// like text at the call site (e.g. text-5xl font-semibold text-primary).

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

/**
 * An inline animated number for stat/metric beats. Counts 0 → value the
 * first time it enters the viewport; renders the final value on the server
 * so the number is real without JavaScript.
 * @hydrate
 */
export interface CountUpProps {
  /** The final value. Plain number — put units in prefix/suffix. */
  value: number;
  /** Text before the number, e.g. "$" or "€". */
  prefix?: string | null;
  /** Text after the number, e.g. "%", "+", "k". */
  suffix?: string | null;
  /** Fraction digits to show, e.g. 1 for "99.9". Default 0. */
  decimals?: number;
  /** Count duration in seconds. Default 1.6. */
  duration?: number;
}

// Fixed locale: the same string must render on the server and the client,
// and grouping ("12,800") reads better than a bare digit run.
function format(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CountUp({ value, prefix, suffix, decimals = 0, duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(() => format(value, decimals));
  const played = useRef(false);

  useEffect(() => {
    if (!inView || played.current) return;
    played.current = true;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(format(v, decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals, duration]);

  return (
    <span ref={ref} data-kopla-component="CountUp" className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export const CountUpShowcase = [
  { props: { value: 12800, suffix: '+' }, label: 'Plus' },
  { props: { value: 99.9, suffix: '%', decimals: 1 }, label: 'Percent' },
  { props: { value: 4200000, prefix: '$' }, label: 'Currency' },
];
