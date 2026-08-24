// The invariants EVERY catalog component must hold, at every showcase case and
// every breakpoint. Data-driven from the catalog, so adding a component gets it
// tested without editing this file — per-component behaviour goes in its own
// spec beside this one.
//
// Each check earns its place by being something you cannot answer from source:
//
//   overflow       — does it fit at 360? A className can't tell you.
//   no-JS content  — is all the content still there before hydration? That is
//                    what a published Kopla page ships when the section using
//                    the component forgot `@hydrate`, and it is the one failure
//                    that looks perfect in every preview.
//   console        — did it throw or warn on any case, including the adversarial
//                    ones (10 items, a long label, a missing image)?
//   reduced motion — is animation actually suppressed, or merely "supported"?
//
// It imports ONLY `manifests.ts` — plain generated data. Importing the lab's
// registry would drag the component graph, `@/…` aliases and React into the test
// process, and the no-JS check is stronger without it anyway: it compares the
// page with scripts off against the same page with scripts on, so it needs no
// knowledge of props and cannot drift from what the component actually renders.

import { test, expect, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';
import { documentOverflow, smallTargets } from './helpers';

const WIDTHS = [360, 768, 1440] as const;

/** The frame URL the lab points its iframe at. Tests drive the frame directly:
 *  the lab chrome is a convenience for humans, and going through it would make
 *  every failure ambiguous between the component and the chrome. */
function frameUrl(dir: string, caseIndex: number, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams({ case: String(caseIndex), theme: 'blank', ...extra });
  return `/component/${dir}?${params.toString()}`;
}

/** Visible text, whitespace-normalized — the form both halves of the no-JS
 *  comparison are made in. */
async function bodyText(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

/** The words of `expected` that `actual` does not contain.
 *
 *  Compared as WORDS rather than as one blob because a component may legitimately
 *  reorder or re-wrap content between the two renders; what must not happen is
 *  content going missing. */
function missingWords(expected: string, actual: string): string[] {
  const have = new Set(actual.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  const want = expected.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3);
  return [...new Set(want.filter((w) => !have.has(w)))];
}

for (const component of components) {
  test.describe(component.name, () => {
    test('exports showcase cases', () => {
      // A component with no cases cannot be previewed, stressed or tested, and
      // the contract requires the export. Failing loudly beats skipping every
      // check below, which would read as "tested".
      expect(
        component.cases.length,
        `${component.name} exports no ${component.name}Showcase cases`,
      ).toBeGreaterThan(0);
    });

    test('the manifest and the registry agree on its cases', async ({ page }) => {
      // These specs enumerate cases from `manifests.ts`, which is SCANNED from
      // the component's source; the frame renders from `registry.tsx`, which
      // imports the real module. Nothing else makes those two agree, and when
      // they don't the failure is invisible: the spec asks for a `?case=` past
      // the end, the frame clamps to the last one, and the run passes having
      // tested one case repeatedly. So: same count, same labels, same order.
      for (const [i, label] of component.cases.entries()) {
        await page.goto(frameUrl(component.dir, i));
        const stage = page.locator('[data-case-count]');
        await expect(stage).toHaveAttribute('data-case-count', String(component.cases.length));
        await expect(
          stage,
          `${component.name} case ${i} is "${label}" in the manifest but not in the registry`,
        ).toHaveAttribute('data-case-label', label);
      }
    });

    component.cases.forEach((label, i) => {
      for (const width of WIDTHS) {
        test(`${label} @ ${width} — fits, hits 44px, and says nothing to the console`, async ({ page }) => {
          const problems: string[] = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
              problems.push(`${msg.type()}: ${msg.text()}`);
            }
          });
          page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

          await page.setViewportSize({ width, height: 900 });
          await page.goto(frameUrl(component.dir, i));
          await page.waitForLoadState('networkidle');

          const overflow = await documentOverflow(page);
          expect(
            overflow,
            `${component.name} overflows the viewport by ${overflow}px at ${width}`,
          ).toBeLessThanOrEqual(1);

          const small = await smallTargets(page);
          expect(
            small,
            `${component.name} has controls under 44px at ${width}: ${small.map((s) => `"${s.text}" ${Math.round(s.w)}×${Math.round(s.h)}`).join(', ')}`,
          ).toEqual([]);

          // A showcase image that 404s is a broken showcase, not a broken
          // component — still worth fixing, so it is named in the message rather
          // than folded into the assertion.
          const nonNetwork = problems.filter((p) => !/Failed to load resource|net::ERR/i.test(p));
          expect(nonNetwork, `${component.name} logged: ${nonNetwork.join(' | ')}`).toEqual([]);
        });
      }

      test(`${label} — keeps its content with no JavaScript`, async ({ browser, baseURL }) => {
        const url = frameUrl(component.dir, i);

        const withJs = await browser.newContext();
        const a = await withJs.newPage();
        await a.goto(`${baseURL}${url}`);
        await a.waitForLoadState('networkidle');
        const hydrated = await bodyText(a);
        await withJs.close();

        // JS disabled at the CONTEXT level, so nothing in the page runs at all —
        // exactly the server-rendered HTML an unhydrated Kopla page ships.
        const noJs = await browser.newContext({ javaScriptEnabled: false });
        const b = await noJs.newPage();
        await b.goto(`${baseURL}${url}`);
        const flat = await bodyText(b);
        await noJs.close();

        expect(hydrated.length, `${component.name} rendered nothing even WITH JS`).toBeGreaterThan(0);
        const missing = missingWords(hydrated, flat);
        expect(
          missing,
          `${component.name} hides content without JS — missing: ${missing.slice(0, 6).join(', ')}`,
        ).toEqual([]);
      });
    });

    test('suppresses animation under prefers-reduced-motion', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(frameUrl(component.dir, 0, { motion: 'reduce' }));
      await page.waitForLoadState('networkidle');

      // Asserted on COMPUTED style across every element, not on the presence of a
      // `motion-safe:` class: a component can honour the query in several ways and
      // all of them should count.
      const moving = await page.evaluate(() =>
        [...document.querySelectorAll('*')].filter((el) => {
          const s = getComputedStyle(el);
          const positive = (v: string) => v.split(',').some((x) => Number.parseFloat(x) > 0);
          return positive(s.animationDuration) || positive(s.transitionDuration);
        }).length,
      );
      expect(moving, `${component.name} still animates under reduced motion`).toBe(0);
    });
  });
}
