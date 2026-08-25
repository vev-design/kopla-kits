// Carousel's own behaviour. The shared catalog.spec.ts covers what every
// component must do; this covers the split this component is built around — what
// the platform does for free and what JS adds on top — and the four things an
// auto-advancing carousel gets wrong in ways that pass a visual review: an arrow
// that stays enabled at the end of the track, a timer that keeps running while
// someone reads, a timer that runs at all under reduced motion, and a live region
// that narrates the timer to a screen reader every few seconds.
//
// Locators are scoped to the component's subtree: Next's dev overlay shares the
// document and brings both a "Next"-named button and an aria-live region of its
// own, so an unscoped query fails on the tooling rather than on the component.

import { test, expect, type Locator, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';

function caseIndex(componentName: string, label: string): number {
  const found = components.find((c) => c.name === componentName);
  const at = found?.cases.indexOf(label) ?? -1;
  if (at < 0) throw new Error(`${componentName} has no showcase case labelled "${label}"`);
  return at;
}

async function open(page: Page, label: string): Promise<Locator> {
  await page.goto(`/component/Carousel?case=${caseIndex('Carousel', label)}&theme=blank`);
  await page.waitForLoadState('networkidle');
  return page.locator('[data-slot="carousel"]');
}

function track(carousel: Locator) {
  return carousel.locator('[data-slot="carousel-track"]');
}

async function scrollLeft(carousel: Locator): Promise<number> {
  return track(carousel).evaluate((el) => el.scrollLeft);
}

/** The track's resting position — measured only once it has stopped moving.
 *
 *  A smooth scroll takes a few hundred milliseconds, so reading `scrollLeft`
 *  straight after a click samples the animation rather than the result: "did the
 *  timer move it" then compares two mid-flight numbers and fails on 31px of
 *  easing. */
async function settled(carousel: Locator): Promise<number> {
  return track(carousel).evaluate(
    (el) =>
      new Promise<number>((resolve) => {
        let last = Number.NaN;
        const check = () => {
          if (el.scrollLeft === last) {
            resolve(el.scrollLeft);
            return;
          }
          last = el.scrollLeft;
          setTimeout(check, 100);
        };
        check();
      }),
  );
}

const BASIC = 'Three slides, arrows and dots';
const PER_VIEW = 'Three per view';
const AUTO = 'Auto-advancing, no loop, dots only';

test('the track is a scroll-snap container, which is the part that needs no JS', async ({
  page,
}) => {
  const carousel = await open(page, BASIC);
  const style = await track(carousel).evaluate((el) => {
    const s = getComputedStyle(el);
    return { overflowX: s.overflowX, snap: s.scrollSnapType };
  });
  expect(style.overflowX).toBe('auto');
  expect(style.snap).toContain('mandatory');

  // Focusable on purpose: a scroll container a mouse can drag and a keyboard
  // cannot reach is a WCAG failure, and one tab stop buys native arrow-key
  // scrolling with no key handler of the component's own.
  await expect(track(carousel)).toHaveAttribute('tabindex', '0');
});

test('arrows move the track, and stop at both ends', async ({ page }) => {
  const carousel = await open(page, BASIC);
  const next = carousel.getByRole('button', { name: 'Next slide' });
  const previous = carousel.getByRole('button', { name: 'Previous slide' });

  await expect(previous).toBeDisabled();
  await next.click();
  await expect.poll(() => scrollLeft(carousel)).toBeGreaterThan(0);
  await expect(previous).toBeEnabled();

  await next.click();
  await expect(next).toBeDisabled();
});

test('the forward arrow disables from the scroll position, not the slide count', async ({
  page,
}) => {
  // Five slides, three in view: the last reachable index is 2, not 4. An arrow
  // that counts slides stays enabled at the end of the track and then does
  // nothing when pressed — which looks like a broken component and is really a
  // wrong sum.
  await page.setViewportSize({ width: 1440, height: 900 });
  const carousel = await open(page, PER_VIEW);
  const next = carousel.getByRole('button', { name: 'Next slide' });

  await next.click();
  await next.click();
  await expect(next).toBeDisabled();
  // And genuinely at the end, rather than disabled early.
  const atEnd = await track(carousel).evaluate(
    (el) => el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
  );
  expect(atEnd).toBe(true);
});

test('dots mark where the reader is, and jump there', async ({ page }) => {
  const carousel = await open(page, BASIC);
  const dots = carousel.getByRole('button', { name: /Go to slide/ });
  await expect(dots).toHaveCount(3);
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');

  await dots.nth(2).click();
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
  await expect(dots.nth(0)).not.toHaveAttribute('aria-current', 'true');
});

test('announces the position only when the reader moved it', async ({ page }) => {
  const carousel = await open(page, BASIC);
  const live = carousel.locator('[aria-live="polite"]');
  // Empty on arrival: there is nothing to announce until something moves, and a
  // carousel that announces its own timer talks over the rest of the page.
  await expect(live).toHaveText('');
  await carousel.getByRole('button', { name: 'Next slide' }).click();
  await expect(live).toHaveText('Slide 2 of 3');
});

test.describe('auto-advance', () => {
  /** Park the pointer somewhere that is definitely NOT the carousel.
   *
   *  A fresh page's cursor rests at (0,0) — which IS over a carousel rendered
   *  at the page's top-left corner, and since hydration now seeds the hover
   *  hold from `:hover`, a correctly-behaving carousel will refuse to rotate
   *  under it. CI caught exactly that: the runner reported the resting cursor
   *  as hovering, the hold engaged, and the "advances on its own" tests timed
   *  out on a component doing precisely what it promises. A test that expects
   *  rotation must first make "nobody is interacting" actually true. */
  async function parkPointerAway(page: Page) {
    await page.mouse.move(1200, 700);
  }

  test('advances on its own, and ships a control that stops it', async ({ page }) => {
    const carousel = await open(page, AUTO);
    // WCAG 2.2.2: moving content lasting more than five seconds needs a way to
    // stop it, and "hover somewhere" is not a way.
    const pause = carousel.getByRole('button', { name: 'Pause the slideshow' });
    await expect(pause).toBeVisible();

    await parkPointerAway(page);
    await expect.poll(() => scrollLeft(carousel), { timeout: 8000 }).toBeGreaterThan(0);

    await pause.click();
    // Clicking put the pointer over the carousel, which pauses it too. Move away
    // so the assertion is about the control rather than the hover.
    await parkPointerAway(page);
    await expect(carousel.getByRole('button', { name: 'Play the slideshow' })).toBeVisible();
    const parked = await settled(carousel);
    await page.waitForTimeout(4000);
    expect(await scrollLeft(carousel)).toBe(parked);
  });

  test('pauses while the pointer is over it', async ({ page }) => {
    const carousel = await open(page, AUTO);
    // Hydration marker before the hover: on a cold CI server, `networkidle`
    // lands well before React attaches handlers, and a mouse parked over an
    // unhydrated carousel fires no further enter events. The component now
    // also asks `:hover` at hydration for exactly that reader — but the test
    // should exercise the ordinary path, not lean on the recovery.
    await expect(carousel.getByRole('button', { name: 'Pause the slideshow' })).toBeVisible();
    const box = (await carousel.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const parked = await settled(carousel);
    await page.waitForTimeout(4000);
    expect(await scrollLeft(carousel)).toBe(parked);
  });

  test('a pointer already parked over it when hydration lands still pauses it', async ({
    page,
  }) => {
    // The CI failure, kept as a feature test: the cursor arrives BEFORE the
    // handlers exist — the slow reader's first second on any page — and
    // `pointerenter` never re-fires for a stationary cursor, so hydration must
    // read `:hover` itself. Deterministic by construction: every script is
    // HELD at the network layer while the mouse parks over the server-rendered
    // track, then released, so the order is never a race.
    const gated: Array<() => void> = [];
    let gateOpen = false;
    await page.route('**/*.js*', async (route) => {
      if (gateOpen) return route.continue();
      gated.push(() => void route.continue());
    });

    await page.goto(`/component/Carousel?case=${caseIndex('Carousel', AUTO)}&theme=blank`, {
      waitUntil: 'domcontentloaded',
    });
    // The track is server-rendered, so its geometry is real before any script.
    const carousel = page.locator('[data-slot="carousel"]');
    const box = (await carousel.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 40);

    // Pointer parked; NOW let hydration happen underneath it.
    gateOpen = true;
    for (const release of gated) release();
    await expect(carousel.getByRole('button', { name: 'Pause the slideshow' })).toBeVisible();

    const parked = await settled(carousel);
    await page.waitForTimeout(4000);
    expect(await scrollLeft(carousel)).toBe(parked);
  });

  test('does not run at all under prefers-reduced-motion', async ({ page }) => {
    // Emulated at the MEDIA level and with no `motion=reduce` in the URL, so this
    // exercises the component's own matchMedia rather than the lab's override.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const carousel = await open(page, AUTO);
    await page.waitForTimeout(4000);
    expect(await scrollLeft(carousel)).toBe(0);
    // And with nothing rotating there is nothing to pause, so the control is
    // gone rather than present and pointless.
    await expect(carousel.getByRole('button', { name: /the slideshow/ })).toHaveCount(0);
  });

  test('stops at the last slide when loop is off', async ({ page }) => {
    const carousel = await open(page, AUTO);
    await parkPointerAway(page);
    await expect
      .poll(
        async () => {
          const el = track(carousel);
          return el.evaluate((node) => node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
        },
        { timeout: 15000 },
      )
      .toBe(true);
    const parked = await settled(carousel);
    await page.waitForTimeout(4000);
    expect(await scrollLeft(carousel)).toBe(parked);
  });
});

test('with no JavaScript the track still scrolls, and the controls are absent rather than dead', async ({
  browser,
  baseURL,
}) => {
  const at = caseIndex('Carousel', BASIC);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/component/Carousel?case=${at}&theme=blank`);
  const carousel = page.locator('[data-slot="carousel"]');

  // Every slide is real content, in document order — nothing is withheld until a
  // script arrives to reveal it.
  await expect(carousel.locator('[data-slot="carousel-slide"]')).toHaveCount(3);
  const style = await track(carousel).evaluate((el) => {
    const s = getComputedStyle(el);
    return { overflowX: s.overflowX, snap: s.scrollSnapType, scrollable: el.scrollWidth > el.clientWidth };
  });
  expect(style.overflowX).toBe('auto');
  expect(style.snap).toContain('mandatory');
  expect(style.scrollable).toBe(true);

  // An arrow with no handler is worse than no arrow: it looks live, takes a tab
  // stop, and swallows the press. The swipeable track underneath is the whole
  // behaviour a reader still gets.
  await expect(carousel.getByRole('button')).toHaveCount(0);
  await context.close();
});
