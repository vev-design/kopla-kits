import { test, expect } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';
import { documentOverflow } from './helpers';

test.use({ javaScriptEnabled: false });
const example = (label: string) => {
  const at = components.find(c => c.name === 'Marquee')?.cases.indexOf(label) ?? -1;
  if (at < 0) throw new Error(`Missing Marquee case: ${label}`);
  return `/component/Marquee?case=${at}&theme=blank`;
};

test('logos keep their artwork and size; the repeated row is inaccessible', async ({ page }) => {
  await page.goto(example('Two logos'));
  await expect(page.getByRole('img')).toHaveCount(2);
  await expect(page.getByRole('img', { name: 'Acme' })).toHaveAttribute('width', '120');
  await expect(page.locator('[data-marquee-clone]')).toHaveAttribute('inert', '');
  await expect(page.locator('[data-marquee-clone]')).toHaveAttribute('aria-hidden', 'true');
  await page.mouse.move(0, 0);
  const track = page.locator('[data-marquee-track]');
  await expect(track).toHaveCSS('animation-name', 'kk-marquee');
  await expect(track).toHaveCSS('animation-play-state', 'running');
  // Native checkbox remains functional with scripts disabled.
  await page.getByRole('checkbox', { name: 'Pause animation' }).check();
  await page.getByRole('checkbox').blur();
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('checkbox').uncheck();
  await page.getByRole('checkbox').blur();
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('checkbox').focus();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('checkbox').blur();
  await page.locator('[data-marquee-viewport]').hover();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS('animation-play-state', 'running');
});

for (const width of [360, 768, 1440]) {
  for (const label of ['Two logos', 'Ten text items', 'Long label', 'Missing logo']) {
    test(`${label}: reduced motion at ${width}px exposes one static copy without overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(example(label));
      await expect(page.locator('[data-marquee-track]')).toHaveCSS('animation-name', 'none');
      await expect(page.locator('[data-marquee-clone]')).toBeHidden();
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
      if (label === 'Missing logo') await expect(page.getByText('Acme — image unavailable').first()).toBeVisible();
    });
  }
}
