// The engine layer, driven by design-authored markup — the compositions in
// demo/app/(frame)/fixture/fixtures.tsx. Each fixture is a regression from a
// real project; the doc comment there tells both stories. What these specs pin
// is the layer no showcase can express: the author's own markup wearing the
// mechanics, with the structural rules (a mirror arrow that appears when it can
// act, answer-advances-when-no-Next) doing their job in foreign markup.

import { test, expect, type Locator } from '@playwright/test';

/** The track's resting position — sampled until it stops moving, bounded so a
 *  broken smooth-scroll fails the test instead of hanging it. */
async function settledScrollLeft(track: Locator): Promise<number> {
  let last = await track.evaluate((el) => el.scrollLeft);
  for (let i = 0; i < 40; i += 1) {
    await track.page().waitForTimeout(120);
    const now = await track.evaluate((el) => el.scrollLeft);
    if (Math.abs(now - last) < 1) return now;
    last = now;
  }
  throw new Error('track never settled');
}

test.describe('peek carousel — authored markup on useCarousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fixture/peek-carousel?theme=blank');
    await page.waitForLoadState('networkidle');
  });

  test('the lone drawn arrow gains its mirror exactly when a slide is behind', async ({ page }) => {
    const prev = page.locator('[data-slot="carousel-prev"]');
    const next = page.locator('[data-slot="carousel-next"]');
    await expect(next).toBeVisible();
    await expect(prev).toBeHidden(); // slide 1: nothing behind
    await next.click();
    await settledScrollLeft(page.locator('[data-slot="carousel-track"]'));
    await expect(prev).toBeVisible(); // now there is
  });

  test('dot 5 from slide 4 advances one slide forward — never backwards past the deck', async ({
    page,
  }) => {
    // The regression: a hand-built track computed the last dot's target against
    // the wrong reference and scrolled backwards past every slide.
    const track = page.locator('[data-slot="carousel-track"]');
    await page.getByRole('button', { name: '4', exact: true }).click();
    const atFour = await settledScrollLeft(track);
    expect(atFour).toBeGreaterThan(0);
    await page.getByRole('button', { name: '5', exact: true }).click();
    const atFive = await settledScrollLeft(track);
    expect(atFive).toBeGreaterThan(atFour); // forward, one slide — not a rewind
    await expect(page.getByRole('button', { name: '5', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('the dots reflect a position the reader reached by any means', async ({ page }) => {
    const track = page.locator('[data-slot="carousel-track"]');
    await page.getByRole('button', { name: '3', exact: true }).click();
    await settledScrollLeft(track);
    await expect(page.getByRole('button', { name: '3', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

test.describe('card quiz — authored markup on useStepFlow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fixture/card-quiz?theme=blank');
    await page.waitForLoadState('networkidle');
  });

  test('no Next exists, so picking a card IS the advance — after the verdict beat', async ({
    page,
  }) => {
    // Scoped to the flow: Next's dev overlay contributes its own 'Next' button.
    await expect(
      page.locator('[data-slot="step-flow"]').getByRole('button', { name: 'Next' }),
    ).toHaveCount(0);
    const panels = page.locator('[data-slot="step-flow-panel"]');
    await expect(panels.nth(0)).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();
    await page.getByText('Brand new').click();
    // The verdict shows BEFORE the panel leaves (the beat), then the flow moves.
    await expect(page.locator('[data-state="correct"]').first()).toBeVisible();
    await expect(panels.nth(1)).toBeVisible();
    await expect(panels.nth(0)).toBeHidden();
    await expect(page.getByText('Question 2 / 2')).toBeVisible();
  });

  test('the ending is a capture form carrying the answers as fields', async ({ page }) => {
    await page.getByText('Brand new').click();
    await expect(page.getByText('What are you after?')).toBeVisible();
    await page.getByText('Adventure').click();
    await expect(page.getByText(/You scored 2 \/ 2/)).toBeVisible();
    const form = page.locator('form[action="/__kopla/forms/belong-quiz"]');
    await expect(form).toBeVisible();
    await expect(form.locator('input[name="q1"]')).toHaveValue('0');
    await expect(form.locator('input[name="q2"]')).toHaveValue('1');
    await expect(form.locator('input[name="email"]')).toBeVisible();
    // Start over returns to the first question with the answers cleared.
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByText('Where are you starting from?')).toBeVisible();
    await expect(page.getByText('Question 1 / 2')).toBeVisible();
  });

  test('Back walks to an answered step without unlocking it', async ({ page }) => {
    await page.getByText('Brand new').click();
    await expect(page.getByText('What are you after?')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Where are you starting from?')).toBeVisible();
    // Locked: the platform refuses the change, so the pick stands.
    await expect(page.locator('input[type="radio"]').first()).toBeDisabled();
  });
});

test.describe('card quiz — scripts off', () => {
  test.use({ javaScriptEnabled: false });

  test('every question survives as a readable outline', async ({ page }) => {
    await page.goto('/fixture/card-quiz?theme=blank');
    const panels = page.locator('[data-slot="step-flow-panel"]');
    await expect(panels).toHaveCount(2);
    await expect(panels.nth(0)).toBeVisible();
    await expect(panels.nth(1)).toBeVisible(); // the outline, not a collapse
    await expect(page.getByText('Brand new')).toBeVisible();
    await expect(page.getByText('Adventure')).toBeVisible();
  });
});
