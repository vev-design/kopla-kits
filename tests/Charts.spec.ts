import { test, expect, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';
import { documentOverflow } from './helpers';

const catalog = components.find((component) => component.name === 'Charts')!;
function url(label: string, theme = 'blank') {
  const index = catalog.cases.indexOf(label);
  if (index < 0) throw new Error(`Missing chart case: ${label}`);
  return `/component/Charts?case=${index}&theme=${theme}`;
}
async function open(page: Page, label: string) {
  await page.goto(url(label));
  await expect(page.locator('[data-kk-chart]')).toBeVisible();
}

test('Charts: the surface selects approved colors and font roles', async ({ page }) => {
  await open(page, 'Donut on dark');
  const chart = page.locator('[data-kk-chart]');
  await expect(chart).toHaveCSS('background-color', 'rgb(71, 12, 55)');
  await expect(page.locator('[data-slice][data-category="agree"]')).toHaveCSS('fill', 'rgb(255, 40, 84)');
  const focal = page.locator('svg text').filter({ hasText: /^78%$/ }).last();
  await expect(focal).toHaveCSS('font-family', 'Georgia, serif');
  await expect(focal).toHaveCSS('fill', 'rgb(255, 255, 255)');
});

test('Charts: prohibited combinations retain the data in a visible table', async ({ page }) => {
  await open(page, 'Forbidden background');
  await expect(page.locator('[data-kk-chart] svg')).toHaveCount(0);
  await expect(page.locator('[data-chart-unavailable]')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('cell', { name: '24', exact: true })).toBeVisible();
});

test('Charts: negative stacks meet the zero baseline without overlapping', async ({ page }) => {
  await open(page, 'Horizontal negative stacks');
  const marks = await page.locator('[data-bar][data-category="a"]').evaluateAll((elements) => elements.map((el) => ({
    id: el.getAttribute('data-series'), x: Number(el.getAttribute('x')), width: Number(el.getAttribute('width')),
  })));
  const positive = marks.find((m) => m.id === 'revenue')!;
  const negative = marks.find((m) => m.id === 'cost')!;
  const next = marks.find((m) => m.id === 'profit')!;
  expect(negative.x + negative.width).toBeCloseTo(positive.x);
  expect(next.x + next.width).toBeCloseTo(negative.x);
});

test('Charts: full-circle SVG actually paints and missing observations are not connected', async ({ page }) => {
  await open(page, 'Full circle');
  await expect(page.locator('[data-slice]')).toHaveCount(1);
  const bounds = await page.locator('[data-slice]').evaluate((el) => {
    const box = (el as SVGGraphicsElement).getBBox();
    return { width: box.width, height: box.height };
  });
  expect(bounds.width).toBeGreaterThan(100);
  expect(bounds.height).toBeGreaterThan(100);
  await open(page, 'Missing observations');
  await expect(page.locator('[data-line]')).toHaveCount(3);
  const radii = await page.locator('[data-point]').evaluateAll((els) => els.map((el) => Number(el.getAttribute('r'))));
  expect(radii.some((r) => r > 0)).toBe(true);
});

for (const label of ['Ten categories and long label', 'Large outside labels', 'Maximum size outside labels']) {
  test(`Charts: ${label} avoids collisions and stays within its SVG`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await open(page, label);
    const plot = await page.locator('[data-kk-chart] svg').evaluate((el) => {
      const box = (el as SVGSVGElement).viewBox.baseVal;
      return { width: box.width, height: box.height };
    });
    const boxes = await page.locator('[data-pie-label]').evaluateAll((els) => els.map((el) => {
      const box = (el as SVGGraphicsElement).getBBox();
      return { x: box.x, y: box.y, width: box.width, height: box.height, side: el.getAttribute('text-anchor') };
    }));
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(plot.width);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(plot.height);
    }
    for (const side of ['start', 'end']) {
      const sameSide = boxes.filter((box) => box.side === side).sort((a, b) => a.y - b.y);
      for (let i = 1; i < sameSide.length; i++) expect(sameSide[i]!.y).toBeGreaterThanOrEqual(sameSide[i - 1]!.y + sameSide[i - 1]!.height);
    }
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

for (const label of ['Grouped bars', 'Semantic pie', 'Editorial line', 'Scatter with trend', 'Bubble area comparison', 'Bubble concentric rings']) {
  test(`Charts: ${label} animates once and responds to reduced motion live`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await open(page, label);
    const selector = '[data-bar], [data-line], [data-slice], [data-point]';
    await expect.poll(() => page.locator(selector).first().evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
    await expect(page.locator(selector).first()).toHaveCSS('animation-iteration-count', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator(selector).first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator(selector).first()).toBeVisible();
  });
}

test('Charts: dash patterns keep SVG length units', async ({ page }) => {
  await open(page, 'Rounded line');
  const dashed = page.locator('[data-series="cost"] [data-line]');
  await expect(dashed).toHaveAttribute('stroke-dasharray', '5 3');
  await expect(dashed).not.toHaveAttribute('pathLength');
});

test('Charts: narrow plots scroll internally and retain keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page, 'Ten bar categories');
  expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  const region = page.getByRole('region', { name: 'Monthly performance plot' });
  await region.focus();
  await expect(region).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

test('Charts: kit defaults change with kit tokens', async ({ page }) => {
  const fills: string[] = [];
  for (const theme of ['blank', 'finance', 'editorial']) {
    await page.goto(url('Grouped bars', theme));
    await expect(page.locator('[data-bar]').first()).toBeVisible();
    fills.push(await page.locator('[data-bar]').first().evaluate((el) => getComputedStyle(el).fill));
  }
  expect(new Set(fills).size).toBeGreaterThan(1);
});

for (const label of ['Scatter direct labels', 'Bubble concentric rings', 'Bubble large labels']) {
  test(`Charts: ${label} keeps markers, label rails and size references inside the SVG`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await open(page, label);
    const measurements = await page.locator('[data-kk-chart] svg').evaluate((el) => {
      const svg = el as SVGSVGElement;
      return { width: svg.viewBox.baseVal.width, height: svg.viewBox.baseVal.height,
        elements: [...svg.querySelectorAll('[data-bubble], [data-scatter-point], [data-observation-label], [data-size-legend] text, [data-size-reference]')].map((mark) => {
          const box = (mark as SVGGraphicsElement).getBBox();
          return { x: box.x, y: box.y, width: box.width, height: box.height, label: mark.hasAttribute('data-observation-label') };
        }),
      };
    });
    for (const box of measurements.elements) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(measurements.width);
      expect(box.y + box.height).toBeLessThanOrEqual(measurements.height);
    }
    const labels = measurements.elements.filter((box) => box.label).sort((a, b) => a.y - b.y);
    for (let i = 1; i < labels.length; i++) expect(labels[i]!.y).toBeGreaterThanOrEqual(labels[i - 1]!.y + labels[i - 1]!.height);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

test('Charts: scatter points use continuous X positions and the branded trend line', async ({ page }) => {
  await open(page, 'Scatter with trend');
  const points = page.locator('[data-scatter-point]');
  const positions = await points.evaluateAll((els) => els.map((el) => Number(el.getAttribute('cx'))));
  // Input gaps 6 then 12 must not become equal category spacing.
  const earlyGap = positions[1]! - positions[0]!;
  const laterGap = positions[9]! - positions[8]!;
  expect(laterGap / earlyGap).toBeCloseTo(2, 3);
  await expect(page.locator('[data-trend-line]')).toHaveCSS('stroke', 'rgb(139, 125, 224)');
  await expect(points.first()).toHaveCSS('fill', 'rgb(204, 0, 51)');
});

test('Charts: bubbles and their size legend share the same area scale', async ({ page }) => {
  await open(page, 'Bubble area comparison');
  const small = Number(await page.locator('[data-observation="a"] [data-bubble]').getAttribute('r'));
  const large = Number(await page.locator('[data-observation="b"] [data-bubble]').getAttribute('r'));
  expect((large * large) / (small * small)).toBeCloseTo(4, 8);
  await expect(page.locator('[data-size-reference][data-size="100"]')).toHaveAttribute('r', String(large));
  await expect(page.locator('[data-observation="a"] [data-bubble-label]')).toHaveCSS('font-family', 'Georgia, serif');
  await open(page, 'Bubble concentric rings');
  await expect(page.locator('[data-bubble-ring]')).toHaveCount(32);
  await expect(page.locator('[data-bubble]').first()).toHaveAttribute('fill', 'none');
  await expect(page.locator('[data-kk-chart]')).toHaveCSS('background-color', 'rgb(71, 12, 55)');
});

test('Charts: scatter restrictions and missing coordinates retain accessible values', async ({ page }) => {
  await open(page, 'Scatter forbidden background');
  await expect(page.locator('[data-kk-chart] svg')).toHaveCount(0);
  await expect(page.getByRole('table')).toBeVisible();
  await open(page, 'Scatter missing observations');
  await expect(page.locator('[data-scatter-point]')).toHaveCount(1);
  await expect(page.getByRole('rowheader', { name: 'Missing X', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'No data', exact: true })).toHaveCount(2);
});
