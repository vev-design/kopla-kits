// Every kit theme, one pass per component: does it still FIT and still hit 44px
// under someone else's tokens?
//
// The rest of the suite runs on `blank` alone, which leaves the catalog's core
// claim — token-themed, reskins with every system — otherwise untested: a
// hardcoded width or a display font half again the size of blank's only shows up
// under the theme that has one. This spec is the mechanical half of that check
// (overflow, touch targets, console noise); "looks right" stays a human
// judgement, made in the lab's theme switcher.
//
// 360 only, deliberately: it is where a wider font breaks a layout first, and
// the full width × case matrix already runs on the default theme in
// catalog.spec.ts. Two cases per component — the representative first one, and
// the self-declared worst one (the case whose label says "long"), because an
// overlong label under a display font is exactly the combination neither
// dimension finds alone.

import { test, expect } from '@playwright/test';
import { components, themes, defaultTheme } from '../demo/components.gen/manifests';
import { documentOverflow, smallTargets } from './helpers';

// The default theme is the one every other spec already exercises.
const SWEEP = themes.filter((theme) => theme !== defaultTheme);

for (const component of components) {
  const stress = component.cases.findIndex((label) => /long/i.test(label));
  const caseIndexes = [...new Set([0, stress])].filter((i) => i >= 0);

  test.describe(`${component.name} across themes`, () => {
    for (const theme of SWEEP) {
      for (const i of caseIndexes) {
        test(`${theme} — "${component.cases[i]}" @ 360`, async ({ page }) => {
          const problems: string[] = [];
          page.on('console', (msg) => {
            if (msg.type() === 'error' || msg.type() === 'warning') {
              problems.push(`${msg.type()}: ${msg.text()}`);
            }
          });
          page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

          await page.setViewportSize({ width: 360, height: 900 });
          await page.goto(`/component/${component.dir}?case=${i}&theme=${theme}`);
          await page.waitForLoadState('networkidle');

          // The premise, asserted rather than assumed: the stylesheet for THIS
          // theme is in the document and non-empty. The first version of this
          // spec waited on a readiness gate instead — the gate opened without
          // the CSS ever arriving, and 204 tests went green measuring the
          // default theme thirteen times. A sweep that cannot tell whether its
          // dimension applied is not a sweep.
          await page.waitForFunction((slug) => {
            const link = document.querySelector<HTMLLinkElement>(
              `link[href="/lab-themes/${slug}.css"]`,
            );
            try {
              return Boolean(link?.sheet && link.sheet.cssRules.length > 0);
            } catch {
              return false;
            }
          }, theme);
          // A theme's own webfont changes every width measured below.
          await page.evaluate(() => document.fonts.ready.then(() => undefined));

          const overflow = await documentOverflow(page);
          expect(
            overflow,
            `${component.name} overflows by ${overflow}px at 360 under ${theme}`,
          ).toBeLessThanOrEqual(1);

          const small = await smallTargets(page);
          expect(
            small,
            `${component.name} under ${theme} has controls below 44px: ${small.map((s) => `"${s.text}" ${Math.round(s.w)}×${Math.round(s.h)}`).join(', ')}`,
          ).toEqual([]);

          const nonNetwork = problems.filter((p) => !/Failed to load resource|net::ERR/i.test(p));
          expect(nonNetwork, `${component.name} logged under ${theme}: ${nonNetwork.join(' | ')}`).toEqual([]);
        });
      }
    }
  });
}
