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
  for (const name of ['Accordion', 'Tabs', 'Modal', 'ScrollStack']) {
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
