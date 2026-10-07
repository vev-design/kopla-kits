import { test, expect } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';
import { documentOverflow } from './helpers';

async function openCharts(page: import('@playwright/test').Page) {
  await page.goto('/components');
  await page.locator('.lab__list button').filter({ has: page.getByText('Charts', { exact: true }) }).click();
  await expect(page.getByRole('region', { name: 'Chart browser' })).toBeVisible();
}

test('chart browser makes every example reachable through type and treatment', async ({ page }) => {
  await openCharts(page);
  const seen = new Set<string>();
  for (const type of ['Bars', 'Lines', 'Pie', 'Donut', 'Scatter', 'Bubble']) {
    await page.getByRole('group', { name: 'Chart type', exact: true }).getByRole('button', { name: type, exact: true }).click();
    const treatments = page.getByRole('group', { name: 'Treatment', exact: true });
    if (type === 'Donut') {
      await treatments.getByRole('button', { name: 'Outside labels', exact: true }).click();
      await expect(page.getByLabel('Example', { exact: true }).locator('option')).toContainText(['Survey agreement — outside names']);
    }
    for (const treatment of await treatments.getByRole('button').allTextContents()) {
      await treatments.getByRole('button', { name: treatment, exact: true }).click();
      const options = await page.getByLabel('Example', { exact: true }).locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(0);
      expect(options.length).toBeLessThanOrEqual(10);
      options.forEach((label) => seen.add(label));
      // A filtered index must still refer to the original registry entry.
      const last = options.at(-1)!;
      await page.getByLabel('Example', { exact: true }).selectOption({ label: last });
      await expect(page.frameLocator('iframe').locator('[data-case-label]')).toHaveAttribute('data-case-label', last);
      await expect(page.getByRole('button', { name: 'Next example', exact: true })).toBeDisabled();
      if (options.length > 1) {
        await page.getByRole('button', { name: 'Previous example', exact: true }).click();
        await expect(page.frameLocator('iframe').locator('[data-case-label]')).toHaveAttribute('data-case-label', options.at(-2)!);
      }
    }
  }
  expect([...seen].sort()).toEqual([...components.find((c) => c.name === 'Charts')!.cases].sort());
});

test('play and replay override a static chart and respect both motion settings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openCharts(page);
  await page.getByRole('group', { name: 'Chart type', exact: true }).getByRole('button', { name: 'Donut', exact: true }).click();
  await page.getByRole('group', { name: 'Treatment', exact: true }).getByRole('button', { name: 'Callouts', exact: true }).click();
  const frame = page.frameLocator('iframe');
  const chart = frame.locator('[data-kk-chart]');
  await expect(chart).not.toHaveAttribute('data-animate');
  await page.getByRole('button', { name: 'Play animation', exact: true }).click();
  await expect(chart).toHaveAttribute('data-animate');
  const mark = frame.locator('[data-chart-plot]:visible [data-slice]').first();
  await expect(mark).toHaveCSS('animation-name', 'kk-chart-reveal');
  await chart.evaluate((element) => element.setAttribute('data-replay-probe', 'old-document'));
  await page.getByRole('button', { name: 'Replay animation', exact: true }).click();
  await expect(chart).not.toHaveAttribute('data-replay-probe');
  await expect(mark).toHaveCSS('animation-name', 'kk-chart-reveal');
  await page.getByLabel('Reduced motion', { exact: true }).check();
  await expect(page.getByRole('button', { name: 'Replay animation' })).toBeDisabled();
  await expect(mark).toHaveCSS('animation-duration', '0s');
  await page.getByLabel('Reduced motion', { exact: true }).uncheck();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByLabel('Animate', { exact: true })).toBeDisabled();
  await expect(mark).toHaveCSS('animation-name', 'none');
});

test('animation preview works with iframe scripts off, and other galleries keep their content selector', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openCharts(page);
  await page.getByLabel('Scripts off', { exact: true }).check();
  await page.getByRole('button', { name: 'Play animation', exact: true }).click();
  await expect(page.locator('iframe')).toHaveAttribute('sandbox', 'allow-same-origin');
  await expect(page.frameLocator('iframe').locator('[data-chart-plot]:visible [data-bar]').first()).toHaveCSS('animation-name', 'kk-chart-bar');
  await page.locator('.lab__list button').filter({ has: page.getByText('Accordion', { exact: true }) }).click();
  await expect(page.getByRole('region', { name: 'Chart browser' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Content', exact: true })).toBeVisible();
  await expect(page.locator('iframe')).not.toHaveAttribute('src', /animation=/);
});

for (const width of [360, 768, 1440]) {
  test(`chart controls fit and stay keyboard accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openCharts(page);
    const browser = page.getByRole('region', { name: 'Chart browser' });
    for (const button of await browser.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
    const pie = page.getByRole('group', { name: 'Chart type', exact: true }).getByRole('button', { name: 'Pie', exact: true });
    await pie.focus();
    await page.keyboard.press('Enter');
    await expect(pie).toHaveAttribute('aria-pressed', 'true');
    await expect(page.frameLocator('iframe').locator('[data-kk-chart="pie"]')).toBeVisible();
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

test('brand switching recolors every chart family without changing its data', async ({ page }) => {
  await openCharts(page);
  await expect(page.getByLabel('Reference colors')).toHaveCount(0);
  const frame = page.frameLocator('iframe');
  const cases = [
    ['Bars', 'Stacked', 'Editorial stacked bars', '[data-bar]'],
    ['Lines', 'End labels', 'Editorial line', '[data-line]'],
    ['Pie', 'Inside labels', 'Survey sentiment — emphasized majority', '[data-slice]'],
    ['Donut', 'Outside labels', 'Survey agreement — outside names', '[data-slice]'],
    ['Scatter', 'Trend line', 'Scatter with trend', '[data-scatter-point]'],
    ['Bubble', 'Filled', 'Bubble area comparison', '[data-bubble]'],
  ];
  for (const [type, treatment, label, selector] of cases) {
    await page.getByRole('group', { name: 'Chart type', exact: true }).getByRole('button', { name: type, exact: true }).click();
    await page.getByRole('group', { name: 'Treatment', exact: true }).getByRole('button', { name: treatment, exact: true }).click();
    await page.getByLabel('Example', { exact: true }).selectOption({ label });
    const colors: string[] = [], data: string[] = [];
    for (const brand of ['finance', 'agency']) {
      await page.getByRole('combobox', { name: 'Brand', exact: true }).selectOption(brand);
      await expect(frame.locator(`link[href="/lab-themes/${brand}.css"]`)).toHaveCount(1);
      await expect.poll(() => frame.locator(`link[href="/lab-themes/${brand}.css"]`).evaluate((element) => {
        const sheet = (element as HTMLLinkElement).sheet;
        return Boolean(sheet && sheet.cssRules.length);
      })).toBe(true);
      const mark = frame.locator(`[data-chart-plot]:visible ${selector}`).first();
      const result = await mark.evaluate((element, isLine) => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--chart-1)';
        document.body.append(probe);
        const expected = getComputedStyle(probe).color;
        const actual = isLine ? getComputedStyle(element).stroke : getComputedStyle(element).fill;
        probe.remove();
        return { actual, expected };
      }, type === 'Lines');
      expect(result.actual).toBe(result.expected);
      colors.push(result.actual);
      data.push(await frame.locator('[data-chart-table]').innerText());
    }
    expect(colors[0]).not.toBe(colors[1]);
    expect(data[0]).toBe(data[1]);
  }
  await page.getByLabel('Scripts off', { exact: true }).check();
  await page.getByRole('combobox', { name: 'Brand', exact: true }).selectOption('finance');
  await expect(frame.locator('[data-chart-plot]:visible [data-bubble]').first()).toHaveAttribute('fill', /var\(--chart-1/);
  await expect(frame.locator('[data-chart-table]')).toHaveCount(1);
});
