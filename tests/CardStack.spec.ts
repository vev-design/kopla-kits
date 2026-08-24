// CardStack's own behaviour. The shared catalog.spec.ts covers what every
// component must do (fit, hit 44px, survive no JS, honour reduced motion, stay
// quiet); this covers what only a deck does — cycling with a throw, the drag
// threshold, the keyboard map — and the ways a deck goes wrong that look fine:
// burying a card's links where they are still focusable, swallowing a click
// meant for a CTA, selecting text while dragging, and reading a browser-
// cancelled gesture as a tap (which made scrolling past the deck shuffle it).
//
// The throw is asynchronous — a card flies for ~200ms before the deck cycles —
// so every advance is asserted with a poll, never immediately.

import { test, expect, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';

const DECK = '/component/CardStack?case=0&theme=blank';
const CARDS = ['Sunrise ridge', 'Cold lake swim', 'Night under pines'];

/** A showcase case by LABEL, not by index.
 *
 *  `?case=` is positional, and hardcoding a number here broke the moment three
 *  cases were inserted above it — the test then silently exercised a different
 *  configuration and failed for the wrong reason. The label is the stable name. */
function caseIndex(componentName: string, label: string): number {
  const found = components.find((c) => c.name === componentName);
  const at = found?.cases.indexOf(label) ?? -1;
  if (at < 0) throw new Error(`${componentName} has no showcase case labelled "${label}"`);
  return at;
}

/** The card currently on top — the one card NOT marked inert. */
async function topCard(page: Page): Promise<string> {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll('[id*="-card-"]')];
    const top = cards.find((c) => !c.hasAttribute('inert'));
    return top?.textContent?.trim() ?? '';
  });
}

async function deck(page: Page) {
  await page.goto(DECK);
  await page.waitForLoadState('networkidle');
  return page.getByRole('group');
}

test('starts on the first card, with every other card inert', async ({ page }) => {
  await deck(page);
  expect(await topCard(page)).toContain(CARDS[0]!);
  // Not aria-hidden: a buried card's own links must be out of the TAB ORDER too,
  // and `inert` is the one attribute that does both.
  await expect(page.locator('[id*="-card-"][inert]')).toHaveCount(CARDS.length - 1);
});

test('sizes itself from its content — no height class required', async ({ page }) => {
  // The old version rendered 0px tall unless the call site remembered a height
  // utility, and dead space when it guessed one too big. Now the top card IS the
  // height: the deck must be about as tall as one card plus the rim above it.
  const group = await deck(page);
  const box = (await group.boundingBox())!;
  expect(box.height).toBeGreaterThan(120); // a real card, not a collapsed strip
  expect(box.height).toBeLessThan(420); // one card + rim, not a hardcoded slab
});

test('clicking the top card throws it and cycles forward, wrapping at the end', async ({ page }) => {
  const group = await deck(page);
  for (const expected of [CARDS[1]!, CARDS[2]!, CARDS[0]!]) {
    await group.click({ position: { x: 40, y: 60 } });
    // The card flies before the deck cycles, so the new top arrives ~200ms after
    // the click — polled, not asserted immediately.
    await expect.poll(() => topCard(page)).toContain(expected);
  }
});

test('arrow keys move both ways from one tab stop', async ({ page }) => {
  const group = await deck(page);
  // One stop for the whole deck: focusing every buried card would make a
  // three-card deck three tab stops of hidden content.
  await page.keyboard.press('Tab');
  await expect(group).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect.poll(() => topCard(page)).toContain(CARDS[1]!);
  // Backwards is instant — there is no gesture to continue, and the card
  // arriving from behind has nothing to fly out of.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => topCard(page)).toContain(CARDS[0]!);
  // Backwards from the first card wraps to the last rather than dead-ending.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => topCard(page)).toContain(CARDS[2]!);
});

test('announces the position for a screen reader', async ({ page }) => {
  const group = await deck(page);
  await expect(page.locator('[aria-live="polite"]')).toContainText('Card 1 of 3');
  await group.click({ position: { x: 40, y: 60 } });
  await expect(page.locator('[aria-live="polite"]')).toContainText('Card 2 of 3');
});

test('a browser-cancelled gesture is not a tap', async ({ page }) => {
  // `pointercancel` is the browser reclaiming the gesture — on a phone, almost
  // always because the touch became a page scroll, which travels ~0px
  // horizontally. Routed to the release handler, that reads as a TAP and the
  // deck shuffles under the reader's scrolling finger. This dispatches the exact
  // event sequence a scroll produces and expects nothing to happen.
  const group = await deck(page);
  const before = await topCard(page);
  await group.evaluate((el) => {
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 300, pointerId: 7, isPrimary: true }));
    el.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, clientX: 202, clientY: 420, pointerId: 7, isPrimary: true }));
  });
  await page.waitForTimeout(400); // long enough for any wrongful throw to land
  expect(await topCard(page)).toBe(before);
});

test.describe('drag', () => {
  // The touch PROPERTIES of a phone, not the whole `devices['Pixel 7']` preset —
  // that one carries `defaultBrowserType`, which Playwright refuses inside a
  // describe because it would force a new worker. Touch input and a phone-sized
  // viewport are the parts that matter for a gesture threshold.
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 412, height: 915 } });

  test('a fling past the threshold advances; a nudge springs back', async ({ page }) => {
    const group = await deck(page);
    const box = (await group.boundingBox())!;
    const midY = box.y + box.height / 3;

    // Short drag — under 25% of the width and under the 64px floor, so it must
    // NOT advance. This is the assertion that stops a stray tap-slide on a phone
    // from shuffling the deck.
    await page.mouse.move(box.x + box.width / 2, midY);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 24, midY, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    expect(await topCard(page)).toContain(CARDS[0]!);

    // Long drag — past the threshold, so it advances.
    await page.mouse.move(box.x + box.width / 2, midY);
    await page.mouse.down();
    await page.mouse.move(box.x + 8, midY, { steps: 12 });
    await page.mouse.up();
    await expect.poll(() => topCard(page)).toContain(CARDS[1]!);
  });

  test('reserves the horizontal axis and leaves vertical to the page', async ({ page }) => {
    // `touch-action: pan-y` is the contract with the browser: without it the
    // browser cancels horizontal drags whenever it decides they were scrolls.
    const group = await deck(page);
    const touchAction = await group.evaluate((el) => getComputedStyle(el).touchAction);
    expect(touchAction).toBe('pan-y');
  });
});

test('dragging does not select the card text', async ({ page }) => {
  const group = await deck(page);
  const box = (await group.boundingBox())!;
  // Drag straight across the copy, where a mouse drag normally paints a
  // selection — the screenshot that prompted this had half a sentence
  // highlighted blue mid-gesture.
  await page.mouse.move(box.x + 20, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 20, box.y + 90, { steps: 10 });
  await page.mouse.up();
  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? '');
  expect(selected).toBe('');
});

test('drag-only mode ignores clicks', async ({ page }) => {
  // A design that wants the deck driven only by a gesture must not also advance
  // when someone clicks a card to read it.
  const at = caseIndex('CardStack', 'Drag only, no tilt');
  await page.goto(`/component/CardStack?case=${at}&theme=blank`);
  await page.waitForLoadState('networkidle');
  const before = await topCard(page);
  await page.getByRole('group').click({ position: { x: 40, y: 40 } });
  await page.waitForTimeout(400);
  expect(await topCard(page)).toBe(before);
});
