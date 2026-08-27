// The components whose whole claim is that they need no JavaScript —
// Accordion, Tabs, Modal and ScrollStack — driven with JavaScript DISABLED.
//
// This file is deliberately one file rather than three, because they share a
// subject: `kits/_base/AGENTS.md` says reach for the platform before React state,
// these are the written-down versions of doing that, and the only way to hold them
// to it is to exercise them in a page where no script can run. `hydrate: false` in
// a manifest is a promise; a click with scripts off is the proof.
//
// Every test here runs in a context with `javaScriptEnabled: false`, so nothing
// on the page executes — no hydration, no handlers, no framework. What still works
// is the browser.

import { test, expect, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';

test.use({ javaScriptEnabled: false });

function caseIndex(componentName: string, label: string): number {
  const found = components.find((c) => c.name === componentName);
  const at = found?.cases.indexOf(label) ?? -1;
  if (at < 0) throw new Error(`${componentName} has no showcase case labelled "${label}"`);
  return at;
}

async function open(page: Page, dir: string, label: string, hash = '') {
  await page.goto(`/component/${dir}?case=${caseIndex(dir, label)}&theme=blank${hash}`);
}

test('every one of them declares hydrate: false, which is the promise this file checks', () => {
  for (const name of ['Accordion', 'Tabs', 'Modal', 'ScrollStack', 'Drawer']) {
    const found = components.find((c) => c.name === name);
    expect(found, `${name} is missing from the catalog`).toBeTruthy();
    expect(found?.hydrate, `${name} declares hydrate: true`).toBe(false);
  }
});

test.describe('Accordion', () => {
  test('opens a row, and the shared name closes the others', async ({ page }) => {
    await open(page, 'Accordion', 'Exclusive — three rows');
    const rows = page.locator('[data-slot="accordion-row"]');

    // The showcase opens the first row, so the starting state is one open.
    await expect(page.locator('[data-slot="accordion-row"][open]')).toHaveCount(1);
    await expect(rows.nth(0)).toHaveAttribute('open', '');

    await rows.nth(2).locator('summary').click();
    // Exclusivity is `<details name>` doing the work: one attribute in place of
    // an open-index state, a click handler and an effect closing the rest.
    await expect(page.locator('[data-slot="accordion-row"][open]')).toHaveCount(1);
    await expect(rows.nth(2)).toHaveAttribute('open', '');
    await expect(page.getByText('To your own domain, as static HTML')).toBeVisible();
  });

  test('without the shared name, rows open independently', async ({ page }) => {
    await open(page, 'Accordion', 'Independent — a FAQ you can open all of');
    const rows = page.locator('[data-slot="accordion-row"]');
    await rows.nth(0).locator('summary').click();
    await rows.nth(1).locator('summary').click();
    await expect(page.locator('[data-slot="accordion-row"][open]')).toHaveCount(2);
  });

  test('adds no aria-expanded, because <summary> reports its own state', async ({ page }) => {
    await open(page, 'Accordion', 'Exclusive — three rows');
    // A hand-written aria-expanded here would have to be kept truthful, and
    // keeping it truthful means tracking `open` in state — which is how a static
    // section becomes one that ships a runtime.
    await expect(page.locator('summary[aria-expanded]')).toHaveCount(0);
  });
});

test.describe('Tabs', () => {
  test('switches the panel on a click, with nothing running', async ({ page }) => {
    await open(page, 'Tabs', 'Underline — three tabs');
    const panels = page.locator('[data-slot="tabs-panel"]');
    await expect(panels.nth(0)).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();

    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(panels.nth(1)).toBeVisible();
    await expect(panels.nth(0)).toBeHidden();
  });

  test('a tab is a URL, so a deep link opens the page on it', async ({ page }) => {
    // The reason to use `:target` at all: another page can link straight to the
    // third tab and no script has to run to honour it.
    await open(page, 'Tabs', 'Underline — three tabs');
    const third = await page.locator('[data-slot="tabs-panel"]').nth(2).getAttribute('id');
    await open(page, 'Tabs', 'Underline — three tabs', `#${third}`);

    const panels = page.locator('[data-slot="tabs-panel"]');
    await expect(panels.nth(2)).toBeVisible();
    await expect(panels.nth(0)).toBeHidden();
  });

  test('claims no tablist it cannot honour', async ({ page }) => {
    await open(page, 'Tabs', 'Underline — three tabs');
    // These are links to sections, and they say so. `role="tab"` would promise
    // arrow-key navigation between tabs and a tab/tabpanel relationship, neither
    // of which anchors give you — a lie that reads fine and fails under a screen
    // reader.
    await expect(page.locator('[role="tablist"], [role="tab"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  });
});

test.describe('Modal', () => {
  test('opens on its trigger and closes on Escape, with focus returned', async ({ page }) => {
    await open(page, 'Modal', 'Primary trigger');
    const trigger = page.getByRole('button', { name: 'See the details' });
    const dialog = page.locator('[data-slot="modal"]');

    await expect(dialog).toBeHidden();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Every plan includes');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    // Focus return is the browser's, and it is the part a hand-rolled modal
    // forgets: without it, dismissing the dialog drops a keyboard user back at
    // the top of the document.
    await expect(trigger).toBeFocused();
  });

  test('renders in the top layer, which is the thing that cannot be reproduced without a portal', async ({
    page,
  }) => {
    await open(page, 'Modal', 'Primary trigger');
    await page.getByRole('button', { name: 'See the details' }).click();
    const open_ = await page
      .locator('[data-slot="modal"]')
      .evaluate((el) => el.matches(':popover-open'));
    expect(open_).toBe(true);
  });

  test('the close control hides rather than toggles', async ({ page }) => {
    await open(page, 'Modal', 'Primary trigger');
    await page.getByRole('button', { name: 'See the details' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('[data-slot="modal"]')).toBeHidden();
  });
});

test.describe('Drawer', () => {
  test('opens from its trigger, closes on Escape with focus returned', async ({ page }) => {
    await open(page, 'Drawer', 'Mobile navigation');
    const trigger = page.getByRole('button', { name: 'Menu' });
    const panel = page.locator('[data-slot="drawer"]');

    await expect(panel).toBeHidden();
    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Journal' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    // Focus return is the browser's — the part every hand-rolled drawer forgets.
    await expect(trigger).toBeFocused();
  });

  /** The entry slide is a 200ms CSS transition; measuring or clicking inside
   *  the panel mid-slide races it (one failure sampled `left: -10` — a third
   *  of the way through the 32px translate). The computed `translate` going
   *  back to `none` is the deterministic "the slide is over" signal. */
  async function slideSettled(page: Page) {
    await expect
      .poll(() =>
        page.locator('[data-slot="drawer"]').evaluate((el) => getComputedStyle(el).translate),
      )
      .toBe('none');
  }

  test('pins to the requested edge, full height, in the top layer', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 700 });
    await open(page, 'Drawer', 'Filters from the left, no title');
    await page.getByRole('button', { name: 'Filters' }).click();
    await slideSettled(page);
    const box = await page.locator('[data-slot="drawer"]').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top), height: Math.round(r.height), open: el.matches(':popover-open') };
    });
    expect(box.open).toBe(true);
    expect(box.left).toBe(0);
    expect(box.top).toBe(0);
    expect(box.height).toBe(700);
  });

  test('the close control hides rather than toggles', async ({ page }) => {
    await open(page, 'Drawer', 'Mobile navigation');
    await page.getByRole('button', { name: 'Menu' }).click();
    await slideSettled(page);
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('[data-slot="drawer"]')).toBeHidden();
  });
});

test.describe('ScrollStack', () => {
  test('pins each card at a stepped offset, and is not a control', async ({ page }) => {
    await open(page, 'ScrollStack', 'Pinned narrative');

    // Nothing interactive: this is a scroll effect, so announcing a group or
    // offering a tab stop would be a lie to a screen reader and a dead stop for a
    // keyboard. Scoped to the component's own subtree — Next's dev overlay injects
    // an aria-live region of its own, so a document-wide assertion here would fail
    // on the tooling rather than on the component.
    const stack = page.locator('[data-slot="scroll-stack"]');
    await expect(stack).toHaveCount(1);
    await expect(stack.getByRole('group')).toHaveCount(0);
    await expect(stack.locator('[aria-live]')).toHaveCount(0);
    await expect(stack.locator('[inert]')).toHaveCount(0);
    await expect(stack.getByRole('button')).toHaveCount(0);

    // Sticky at stepped tops is the entire mechanism, and it works here with no
    // script running at all. Asserted on computed style so the check survives any
    // refactor of how the offset is applied.
    const pinned = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="scroll-stack"] > [data-slot="scroll-stack-item"]')].map(
        (el) => {
          const s = getComputedStyle(el);
          return { position: s.position, top: Number.parseFloat(s.top) };
        },
      ),
    );
    expect(pinned.length).toBe(3);
    expect(pinned.every((p) => p.position === 'sticky')).toBe(true);
    expect(pinned.map((p) => p.top)).toEqual([0, 56, 112]);
  });

  test('every card is readable at once', async ({ page }) => {
    // The point of the layout, and what a deck legitimately does NOT do: all
    // three sections are real content in document order, not one visible card
    // with the rest withheld.
    await open(page, 'ScrollStack', 'Pinned narrative');
    const text = await page.locator('[data-slot="scroll-stack"]').innerText();
    for (const heading of ['How it works', 'Why Kopla', 'What it makes']) {
      expect(text).toContain(heading);
    }
  });

  test('finishes forming with its own scroll room, even with nothing below it', async ({ page }) => {
    // Sticky travel ends with the root's own content, so before the tail
    // spacer existed the pile could only complete if the page happened to
    // continue below the section — as the final section (or alone in this
    // frame) the scroll ran out before the last card reached its slot.
    await page.setViewportSize({ width: 800, height: 800 });
    await open(page, 'ScrollStack', 'Pinned narrative');
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    const tops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="scroll-stack-item"]')].map((el) =>
        Math.round(el.getBoundingClientRect().top),
      ),
    );
    // The finished pile: every card pinned at its stepped slot, LAST one
    // included — that card is the one that could never arrive before.
    expect(tops).toEqual([0, 56, 112]);
  });

  test('honours a flush pile', async ({ page }) => {
    await open(page, 'ScrollStack', 'Flush, six cards');
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="scroll-stack-item"]')].map((el) => {
        const s = getComputedStyle(el);
        return { top: Number.parseFloat(s.top), inline: s.marginInlineStart };
      }),
    );
    expect(boxes.length).toBe(6);
    // `peek: 40` steps the pins, `inset: 0` means no card is drawn narrower than
    // the one in front of it.
    expect(boxes.map((b) => b.top)).toEqual([0, 40, 80, 120, 160, 200]);
    expect(boxes.every((b) => Number.parseFloat(b.inline) === 0)).toBe(true);
  });
});

test.describe('ScrollStack shuffle', () => {
  // The scrubbed variant: the stack is formed, every header a rim, and SCROLL
  // sends the front card to the back — a CSS scroll-driven animation, which is
  // why these tests run in this file: the whole claim is that no script is
  // involved, and every page here has JavaScript disabled.
  const CASE = () => caseIndex('ScrollStack', 'Shuffle — three cards');

  /** Computed z/opacity/position per card, front-detection material. */
  async function cards(page: Page) {
    return page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="scroll-stack-item"]')].map((el) => {
        const s = getComputedStyle(el);
        return { z: Number(s.zIndex), op: Number(s.opacity), pos: s.position };
      }),
    );
  }

  test('pins tall, shows every header at rest, and scrubs the front card back as the page scrolls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto(`/component/ScrollStack?case=${CASE()}&theme=blank`);

    // The scroll budget is real layout: 100svh of pin plus perCard-viewports per
    // shuffle, so a 3-card stack at the 0.75 default is ~2.5 viewports tall.
    const rootHeight = await page.evaluate(
      () => document.querySelector('[data-mode="shuffle"]')!.getBoundingClientRect().height,
    );
    expect(rootHeight).toBeGreaterThan(1600);

    // At rest the whole stack is drawn: card 1 on top, everything opaque, all
    // absolute in the pinned box.
    const rest = await cards(page);
    expect(rest.map((c) => c.z)).toEqual([3, 2, 1]);
    expect(rest.every((c) => c.op > 0.99 && c.pos === 'absolute')).toBe(true);

    // One segment of scroll sends card 1 to the back — z-order is the truth of
    // who is front, and it is driven by the scrubbed keyframes alone.
    await page.mouse.wheel(0, 700);
    await expect
      .poll(async () => (await cards(page)).map((c) => c.z).join())
      .toBe('1,3,2');

    // A scrubbed animation is bidirectional by nature: scroll back, and the
    // shuffle reverses without a line of code making it so.
    await page.mouse.wheel(0, -700);
    await expect
      .poll(async () => (await cards(page)).map((c) => c.z).join())
      .toBe('3,2,1');
  });

  test('mid-segment, the front card is visibly mid-pull', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto(`/component/ScrollStack?case=${CASE()}&theme=blank`);
    // Partway into the first segment the front card has been dragged DOWN —
    // the same direction the reader is scrolling, which is what makes the
    // scroll read as the hand doing the pulling. It stays fully opaque the
    // whole way: a pulled card is a real card, not a fade.
    await page.mouse.wheel(0, 150);
    await expect
      .poll(async () => {
        const t = await page
          .locator('[data-slot="scroll-stack-item"]')
          .first()
          .evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).f);
        return t;
      })
      .toBeGreaterThan(60);
    const front = (await cards(page))[0]!;
    // Still the front, still fully visible: the z handoff to the back happens
    // only once the card has cleared the pinned box's bottom edge, where the
    // clip has already taken it off-screen.
    expect(front.z).toBe(3);
    expect(front.op).toBe(1);
  });

  test('clicking a header rim scrolls to that card, and the scrub follows', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto(`/component/ScrollStack?case=${CASE()}&theme=blank`);

    // The rim of the deepest card is a real fragment link; clicking it scrolls
    // the page to that card's segment boundary — and because the scrub is
    // DERIVED from scroll position, the shuffle plays itself on the way and
    // cannot land out of sync: the position and the animation are one number.
    await page.locator('[data-shuffle-link]').nth(2).click();
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(1200);
    await expect
      .poll(async () => (await cards(page)).map((c) => c.z).join())
      .toBe('2,1,3');

    // And back: the first card's rim returns the page to the top boundary.
    await page.locator('[data-shuffle-link]').nth(0).click();
    await expect.poll(() => page.evaluate(() => Math.round(scrollY))).toBe(0);
    await expect
      .poll(async () => (await cards(page)).map((c) => c.z).join())
      .toBe('3,2,1');
  });

  test('falls back to the pile under reduced motion, with every card reachable', async ({
    browser,
    baseURL,
  }) => {
    // The degrade is the sibling behaviour, not a stack whose buried cards can
    // never be reached: reduced-motion readers (and browsers without
    // scroll-driven animations, which share the same rules) get the pinned pile.
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.setViewportSize({ width: 800, height: 800 });
    await page.goto(`${baseURL}/component/ScrollStack?case=${CASE()}&theme=blank`);

    const state = await page.evaluate(() => {
      const root = document.querySelector('[data-mode="shuffle"]')!;
      return {
        rootHeight: root.getBoundingClientRect().height,
        positions: [...document.querySelectorAll('[data-slot="scroll-stack-item"]')].map(
          (el) => getComputedStyle(el).position,
        ),
        text: (root as HTMLElement).innerText,
      };
    });
    // Pile layout: sticky cards — and the pile COMPLETES, which is the claim
    // that matters. (This used to assert a height ceiling as a proxy for "not
    // the pinned shuffle"; the pile's own scroll tail legitimately outgrew it.)
    expect(state.positions).toEqual(['sticky', 'sticky', 'sticky']);
    for (const heading of ['Discover', 'Design', 'Deliver']) {
      expect(state.text).toContain(heading);
    }
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    const tops = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="scroll-stack-item"]')].map((el) =>
        Math.round(el.getBoundingClientRect().top),
      ),
    );
    expect(tops).toEqual([0, 56, 112]);

    // The jump links are a shuffle affordance and the pile has no segments to
    // jump to — in the fallback they must be gone, not dangling dead anchors.
    const linksVisible = await page.evaluate(() =>
      [...document.querySelectorAll('[data-shuffle-link]')].filter(
        (el) => getComputedStyle(el).display !== 'none',
      ).length,
    );
    expect(linksVisible).toBe(0);
    await context.close();
  });
});
