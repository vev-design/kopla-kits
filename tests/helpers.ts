// Measurement helpers shared by the shared catalog spec and the cross-theme
// sweep. Not a spec file — Playwright only collects `*.spec.ts`.

import type { Page } from '@playwright/test';

/** How far the document overflows its viewport horizontally, in px. Zero on a
 *  page that fits. */
export async function documentOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const d = document.documentElement;
    return Math.max(0, d.scrollWidth - d.clientWidth);
  });
}

/** Controls whose smaller side is under 44px — the contract's touch target.
 *
 *  Measured on the element that actually RECEIVES the tap: for a label-wrapped
 *  input that is the label, not the 16px box inside it. A zero-size box is a
 *  control in a `hidden` panel or one that isn't painted, which is not a target
 *  anybody is missing. */
export async function smallTargets(
  page: Page,
): Promise<{ text: string; w: number; h: number }[]> {
  return page.evaluate(() => {
    const selector =
      'a[href], button, summary, [role="button"], input[type="checkbox"], input[type="radio"]';
    return [...document.querySelectorAll(selector)]
      .map((el) => {
        const target = el.closest('label') ?? el;
        const box = target.getBoundingClientRect();
        return { text: (target.textContent ?? '').trim().slice(0, 32), w: box.width, h: box.height };
      })
      .filter((m) => m.w > 0 && m.h > 0 && Math.min(m.w, m.h) < 44);
  });
}
