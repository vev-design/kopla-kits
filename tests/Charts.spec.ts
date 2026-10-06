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
  await expect(page.locator('[data-chart-plot]:visible [data-slice][data-category="agree"]')).toHaveCSS('fill', 'rgb(255, 40, 84)');
  const focal = page.locator('[data-chart-plot]:visible [data-center-value]');
  await expect(focal).toHaveCSS('font-family', 'Georgia, serif');
  await expect(focal).toHaveCSS('fill', 'rgb(255, 255, 255)');
});

test('Charts: prohibited combinations retain the data in a visible table', async ({ page }) => {
  await open(page, 'Forbidden background');
  await expect(page.locator('[data-chart-plot]:visible')).toHaveCount(0);
  await expect(page.locator('[data-chart-unavailable]')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('cell', { name: '24', exact: true })).toBeVisible();
});

test('Charts: negative stacks meet the zero baseline without overlapping', async ({ page }) => {
  await open(page, 'Horizontal negative stacks');
  const marks = await page.locator('[data-chart-plot]:visible [data-bar][data-category="a"]').evaluateAll((elements) => elements.map((el) => ({
    id: el.getAttribute('data-series'), x: parseFloat(el.getAttribute('x')!), width: parseFloat(el.getAttribute('width')!),
  })));
  const positive = marks.find((m) => m.id === 'revenue')!;
  const negative = marks.find((m) => m.id === 'cost')!;
  const next = marks.find((m) => m.id === 'profit')!;
  expect(negative.x + negative.width).toBeCloseTo(positive.x);
  expect(next.x + next.width).toBeCloseTo(negative.x);
});

test('Charts: full-circle SVG actually paints and missing observations are not connected', async ({ page }) => {
  await open(page, 'Full circle');
  await expect(page.locator('[data-chart-plot]:visible [data-slice]')).toHaveCount(1);
  const bounds = await page.locator('[data-chart-plot]:visible [data-slice]').evaluate((el) => {
    const box = (el as SVGGraphicsElement).getBBox();
    return { width: box.width, height: box.height };
  });
  expect(bounds.width).toBeGreaterThan(100);
  expect(bounds.height).toBeGreaterThan(100);
  await open(page, 'Missing observations');
  await expect(page.locator('[data-chart-plot]:visible [data-line]')).toHaveCount(3);
  const radii = await page.locator('[data-chart-plot]:visible [data-point]').evaluateAll((els) => els.map((el) => Number(el.getAttribute('r'))));
  expect(radii.some((r) => r > 0)).toBe(true);
});

for (const label of ['Ten categories and long label', 'Large outside labels', 'Maximum size outside labels']) {
  test(`Charts: ${label} avoids collisions and stays within its SVG`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await open(page, label);
    const plot = await page.locator('[data-chart-plot]:visible').evaluate((el) => {
      const box = el.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    });
    const boxes = await page.locator('[data-chart-plot]:visible [data-pie-label]').evaluateAll((els) => els.map((el) => {
      const box = el.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, side: el.getAttribute('text-anchor') };
    }));
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(plot.x);
      expect(box.x + box.width).toBeLessThanOrEqual(plot.x + plot.width);
      expect(box.y).toBeGreaterThanOrEqual(plot.y);
      expect(box.y + box.height).toBeLessThanOrEqual(plot.y + plot.height);
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
    await expect.poll(() => page.locator('[data-chart-plot]:visible').locator(selector).first().evaluate((el) => getComputedStyle(el).animationName)).not.toBe('none');
    await expect(page.locator('[data-chart-plot]:visible').locator(selector).first()).toHaveCSS('animation-iteration-count', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-chart-plot]:visible').locator(selector).first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator('[data-chart-plot]:visible').locator(selector).first()).toBeVisible();
  });
}

test('Charts: dash patterns keep SVG length units', async ({ page }) => {
  await open(page, 'Rounded line');
  const dashed = page.locator('[data-chart-plot]:visible [data-series="cost"] [data-line]');
  await expect(dashed).toHaveAttribute('stroke-dasharray', '5 3');
  await expect(dashed).not.toHaveAttribute('pathLength');
});

test('Charts: narrow plots scroll internally and retain keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page, 'Deliberately scrollable bars');
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
    await expect(page.locator('[data-chart-plot]:visible [data-bar]').first()).toBeVisible();
    fills.push(await page.locator('[data-chart-plot]:visible [data-bar]').first().evaluate((el) => getComputedStyle(el).fill));
  }
  expect(new Set(fills).size).toBeGreaterThan(1);
});

for (const label of ['Scatter direct labels', 'Bubble concentric rings', 'Bubble large labels']) {
  test(`Charts: ${label} keeps markers, label rails and size references inside the SVG`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await open(page, label);
    const measurements = await page.locator('[data-chart-plot]:visible').evaluate((el) => {
      const svg = el as SVGSVGElement;
      const bounds = svg.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
        elements: [...svg.querySelectorAll('[data-bubble], [data-scatter-point], [data-observation-label], [data-size-legend] text, [data-size-reference]')].map((mark) => {
          const box = mark.getBoundingClientRect();
          return { x: box.x, y: box.y, width: box.width, height: box.height, label: mark.hasAttribute('data-observation-label') };
        }),
      };
    });
    for (const box of measurements.elements) {
      expect(box.x).toBeGreaterThanOrEqual(measurements.x);
      expect(box.y).toBeGreaterThanOrEqual(measurements.y);
      expect(box.x + box.width).toBeLessThanOrEqual(measurements.x + measurements.width);
      expect(box.y + box.height).toBeLessThanOrEqual(measurements.y + measurements.height);
    }
    const labels = measurements.elements.filter((box) => box.label).sort((a, b) => a.y - b.y);
    for (let i = 1; i < labels.length; i++) expect(labels[i]!.y).toBeGreaterThanOrEqual(labels[i - 1]!.y + labels[i - 1]!.height);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

test('Charts: scatter points use continuous X positions and the branded trend line', async ({ page }) => {
  await open(page, 'Scatter with trend');
  const points = page.locator('[data-chart-plot]:visible [data-scatter-point]');
  const positions = await points.evaluateAll((els) => els.map((el) => parseFloat(el.getAttribute('cx')!)));
  // Input gaps 6 then 12 must not become equal category spacing.
  const earlyGap = positions[1]! - positions[0]!;
  const laterGap = positions[9]! - positions[8]!;
  expect(laterGap / earlyGap).toBeCloseTo(2, 3);
  await expect(page.locator('[data-chart-plot]:visible [data-trend-line]')).toHaveCSS('stroke', 'rgb(139, 125, 224)');
  await expect(points.first()).toHaveCSS('fill', 'rgb(204, 0, 51)');
});

test('Charts: bubbles and their size legend share the same area scale', async ({ page }) => {
  await open(page, 'Bubble area comparison');
  const small = Number(await page.locator('[data-chart-plot]:visible [data-observation="a"] [data-bubble]').getAttribute('r'));
  const large = Number(await page.locator('[data-chart-plot]:visible [data-observation="b"] [data-bubble]').getAttribute('r'));
  expect((large * large) / (small * small)).toBeCloseTo(4, 8);
  await expect(page.locator('[data-chart-plot]:visible [data-size-reference][data-size="100"]')).toHaveAttribute('r', String(large));
  await expect(page.locator('[data-chart-plot]:visible [data-observation="a"] [data-bubble-label]')).toHaveCSS('font-family', 'Georgia, serif');
  await open(page, 'Bubble concentric rings');
  await expect(page.locator('[data-chart-plot]:visible [data-bubble-ring]')).toHaveCount(32);
  await expect(page.locator('[data-chart-plot]:visible [data-bubble]').first()).toHaveAttribute('fill', 'none');
  await expect(page.locator('[data-kk-chart]')).toHaveCSS('background-color', 'rgb(71, 12, 55)');
});

test('Charts: scatter restrictions and missing coordinates retain accessible values', async ({ page }) => {
  await open(page, 'Scatter forbidden background');
  await expect(page.locator('[data-chart-plot]:visible')).toHaveCount(0);
  await expect(page.getByRole('table')).toBeVisible();
  await open(page, 'Scatter missing observations');
  await expect(page.locator('[data-chart-plot]:visible [data-scatter-point]')).toHaveCount(1);
  await expect(page.getByRole('rowheader', { name: 'Missing X', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'No data', exact: true })).toHaveCount(2);
});

const responsiveCases = ['Responsive financial bars', 'Responsive financial line', 'Responsive donut center',
  'Responsive scatter labels', 'Responsive bubble labels'];
for (const width of [360, 768, 1440]) {
  for (const label of responsiveCases) {
    test(`Charts: ${label} fits a ${width}px container with readable, separated text`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, label);
      // The regression is the component's container size, independent of lab padding.
      await page.addStyleTag({ content: '.p-6:has(> [data-kk-chart]) { padding: 0 !important; }' });
      const plot = page.locator('[data-chart-plot]:visible');
      await expect(plot).toHaveCount(1);
      const result = await plot.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        const region = el.closest('[data-chart-scroll]')!;
        const texts = [...el.querySelectorAll('text')].map((text) => {
          const box = text.getBoundingClientRect();
          const matrix = text.getScreenCTM()!;
          return { text: text.childNodes[0]?.textContent, x: box.x, y: box.y, right: box.right, bottom: box.bottom,
            width: box.width, height: box.height, fontSize: parseFloat(getComputedStyle(text).fontSize), scale: Math.hypot(matrix.a, matrix.b) };
        }).filter((text) => text.width > 0 && text.height > 0);
        return { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom,
          overflow: region.scrollWidth - region.clientWidth, texts };
      });
      expect(result.overflow).toBeLessThanOrEqual(1);
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
      for (const text of result.texts) {
        expect(text.x, text.text ?? '').toBeGreaterThanOrEqual(result.x - 1);
        expect(text.right, text.text ?? '').toBeLessThanOrEqual(result.right + 1);
        expect(text.y, text.text ?? '').toBeGreaterThanOrEqual(result.y - 1);
        expect(text.bottom, text.text ?? '').toBeLessThanOrEqual(result.bottom + 1);
        expect(text.fontSize * text.scale, text.text ?? '').toBeGreaterThanOrEqual(12);
        expect(text.scale, text.text ?? '').toBeCloseTo(1, 3);
      }
      for (let i = 0; i < result.texts.length; i++) for (let j = i + 1; j < result.texts.length; j++) {
        const a = result.texts[i]!, b = result.texts[j]!;
        const overlapX = Math.min(a.right, b.right) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
        expect(overlapX > 1 && overlapY > 1, `${a.text} overlaps ${b.text}`).toBe(false);
      }
      await expect(page.getByRole('table')).toHaveCount(1);
      if (label === 'Responsive scatter labels' || label === 'Responsive bubble labels') {
        expect(await plot.locator('[data-x-tick]').count()).toBeGreaterThanOrEqual(2);
      }
      if (label === 'Responsive financial bars') {
        await expect(page.getByRole('cell', { name: '€420,000', exact: true })).toBeVisible();
        expect(result.texts.some((t) => /€.*[KM]/.test(t.text ?? ''))).toBe(true);
        await expect(plot.locator('[data-category-label]').first()).toContainText('2025');
      }
      if (width === 360 && label === 'Responsive financial bars') {
        const legend = page.locator('[data-chart-legend]');
        expect((await legend.boundingBox())!.height).toBeGreaterThan(38);
      }
    });
  }
}

test('Charts: responsive layouts resize without JavaScript and preserve exact accessible data', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 360, height: 900 } });
  const page = await context.newPage();
  try {
    await open(page, 'Responsive financial line');
    await expect(page.locator('[data-chart-layout="280"]')).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: '€420,000', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('[data-chart-layout="1000"]')).toBeVisible();
    await expect(page.locator('[data-chart-layout="280"]')).toBeHidden();
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  } finally { await context.close(); }
});

test('Charts: dense data deliberately scrolls while ordinary categories fit', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await open(page, 'Dense responsive categories');
  const region = page.getByRole('region', { name: 'Detailed monthly performance plot' });
  expect(await region.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0);
  await region.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await open(page, 'Ten bar categories');
  expect(await page.locator('[data-chart-scroll]').first().evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
});

for (const width of [360, 768, 1440]) {
  test(`Charts: right-side legend adapts at ${width}px without squeezing the plot`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, 'Right-side brand legend');
    const plot = (await page.locator('[data-chart-plot]:visible').boundingBox())!;
    const legend = (await page.locator('[data-chart-legend]').boundingBox())!;
    if (width === 360) expect(legend.y).toBeGreaterThanOrEqual(plot.y + plot.height);
    else expect(legend.x).toBeGreaterThanOrEqual(plot.x + plot.width);
    expect(await page.locator('[data-chart-plot-region]').evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

for (const width of [360, 768, 1440]) {
  test(`Charts: brand pie label roles avoid redundant legends at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, 'Donut with split label roles');
    const plot = page.locator('[data-chart-plot]:visible');
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveCount(3);
    const outside = await plot.locator('[data-pie-label]').evaluateAll((els) => els.map((el) => el.childNodes[0]?.textContent?.trim()));
    expect(outside.sort()).toEqual(['Agree', 'Disagree', 'Neutral']);
    await open(page, 'Pie with inside labels only');
    await expect(plot.locator('[data-pie-label]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveCount(2);
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]').first()).toContainText('78%Positive');
  });
}

test('Charts: simple bar values use the approved inside ink', async ({ page }) => {
  await open(page, 'Simple bars with inside values');
  const plot = page.locator('[data-chart-plot]:visible');
  const label = plot.locator('text').filter({ hasText: /^24/ });
  await expect(label).toHaveCSS('fill', 'rgb(255, 255, 255)');
  const rect = (await plot.locator('[data-bar]').first().boundingBox())!;
  const text = (await label.boundingBox())!;
  expect(text.y).toBeGreaterThan(rect.y);
  expect(text.y + text.height).toBeLessThan(rect.y + rect.height);
});


for (const width of [360, 768, 1440]) {
  test(`Charts: size containment keeps a chart visible as a flex item at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, 'Responsive financial bars');
    await page.addStyleTag({ content: '.p-6:has(> [data-kk-chart]) { display: flex; padding: 0 !important; }' });
    const chart = (await page.locator('[data-kk-chart]').boundingBox())!;
    expect(chart.width).toBeCloseTo(width, 0);
    await expect(page.locator('[data-chart-plot]:visible')).toHaveCount(1);
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}
