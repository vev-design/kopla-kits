import { useEffect, useRef, useState } from 'react';

/**
 * Count from 0 to `target` over `duration` seconds, starting the moment
 * the attached element scrolls into view (once). Returns the raw
 * in-flight number — format it at the call site. Reduced-motion users
 * get the target immediately.
 *
 * Plain rAF + IntersectionObserver, no animation library — but it IS
 * client JS: a section using this hook must keep `@hydrate` on its
 * Props (the extractor also infers it from the hooks here).
 */
export function useCountUp<T extends HTMLElement>(target: number, duration = 1.4) {
  // Server-real content: SSR (and any client without JS) shows the real
  // figure. Only once the effect runs — JS is definitely alive — does the
  // value drop to 0 to be counted back up on viewport entry.
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    setValue(0);
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          // easeOutQuint — visually matches the enter ease the reveals use.
          setValue(target * (1 - (1 - t) ** 5));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: '-10% 0px' },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}
