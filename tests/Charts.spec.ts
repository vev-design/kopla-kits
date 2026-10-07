import { test, expect, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';
import { documentOverflow } from './helpers';

const catalog = components.find((component) => component.name === 'Charts')!;
function url(label: string, theme = 'blank') {
  const stress: Record<string, string> = {
    'Large outside labels': 'chart-large-pie-labels',
    'Maximum size outside labels': 'chart-max-pie-labels',
    'Ten categories and long label': 'chart-ten-pie-categories',
  };
  if (stress[label]) return `/fixture/${stress[label]}?theme=${theme}`;
  const index = catalog.cases.indexOf(label);
  if (index < 0) throw new Error(`Missing chart case: ${label}`);
  return `/component/Charts?case=${index}&theme=${theme}`;
}
async function open(page: Page, label: string) {
  await page.goto(url(label));
  await expect(page.locator('[data-kk-chart]')).toBeVisible();
}

async function themeValue(page: Page, value: string, property = 'color') {
  return page.evaluate(({ value, property }) => {
    const probe = document.createElement('span');
    probe.style.setProperty(property, value);
    document.body.append(probe);
    const result = getComputedStyle(probe).getPropertyValue(property);
    probe.remove();
    return result;
  }, { value, property });
}

test('Charts: the surface selects approved colors and font roles', async ({ page }) => {
  await open(page, 'Fundraising goal');
  const chart = page.locator('[data-kk-chart]');
  await expect(chart).toHaveCSS('background-color', await themeValue(page, 'var(--foreground)'));
  await expect(page.locator('[data-chart-plot]:visible [data-slice][data-category="raised"]')).toHaveCSS('fill', await themeValue(page, 'var(--chart-1)'));
  const focal = page.locator('[data-chart-plot]:visible [data-center-value]');
  await expect(focal).toHaveCSS('font-family', await themeValue(page, 'var(--font-display, var(--font-sans, sans-serif))', 'font-family'));
  await expect(focal).toHaveCSS('fill', await themeValue(page, 'var(--background)'));
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
  await open(page, 'Training completion');
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

for (const width of [360, 768, 1440]) for (const label of ['Ten categories and long label', 'Large outside labels', 'Maximum size outside labels']) {
  test(`Charts: ${label} avoids collisions and stays within its SVG at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
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
  await expect(page.locator('[data-chart-plot]:visible [data-trend-line]')).toHaveCSS('stroke', await themeValue(page, 'var(--chart-2)'));
  await expect(points.first()).toHaveCSS('fill', await themeValue(page, 'var(--chart-1)'));
});

test('Charts: bubbles and their size legend share the same area scale', async ({ page }) => {
  await open(page, 'Bubble area comparison');
  const small = Number(await page.locator('[data-chart-plot]:visible [data-observation="a"] [data-bubble]').getAttribute('r'));
  const large = Number(await page.locator('[data-chart-plot]:visible [data-observation="b"] [data-bubble]').getAttribute('r'));
  expect((large * large) / (small * small)).toBeCloseTo(4, 8);
  await expect(page.locator('[data-chart-plot]:visible [data-size-reference][data-size="100"]')).toHaveAttribute('r', String(large));
  await expect(page.locator('[data-chart-plot]:visible [data-observation="a"] [data-bubble-label]')).toHaveCSS('font-family', await themeValue(page, 'var(--font-display, var(--font-sans, sans-serif))', 'font-family'));
  await open(page, 'Bubble concentric rings');
  await expect(page.locator('[data-chart-plot]:visible [data-bubble-ring]')).toHaveCount(32);
  await expect(page.locator('[data-chart-plot]:visible [data-bubble]').first()).toHaveAttribute('fill', 'none');
  await expect(page.locator('[data-kk-chart]')).toHaveCSS('background-color', await themeValue(page, 'var(--foreground)'));
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

const responsiveCases = ['Responsive financial bars', 'Responsive financial line', 'Revenue by customer segment',
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
  test(`Charts: bar title, legend and category spacing stay coherent at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const label of ['Grouped bars', 'Bottom bar legend']) {
      await open(page, label);
      const title = (await page.locator('[data-chart-caption]').boundingBox())!;
      const legend = (await page.locator('[data-chart-legend]').boundingBox())!;
      const plot = page.locator('[data-chart-plot]:visible');
      const plotBox = (await plot.boundingBox())!;
      const valueTicks = await plot.locator('[data-value-tick]').all();
      for (const tick of valueTicks) expect((await tick.boundingBox())!.x).toBeCloseTo(title.x, 1);
      if (label === 'Grouped bars' && width >= 600) {
        expect(legend.x - (plotBox.x + plotBox.width)).toBeCloseTo(24, 1);
        expect(legend.y + legend.height / 2).toBeCloseTo(plotBox.y + plotBox.height / 2, 1);
      } else {
        expect(legend.x).toBeCloseTo(title.x, 1);
        expect(legend.y - (plotBox.y + plotBox.height)).toBeGreaterThanOrEqual(8);
        expect(legend.y - (plotBox.y + plotBox.height)).toBeLessThanOrEqual(16);
      }
      const baseline = (await plot.locator('[data-baseline]').boundingBox())!;
      const category = (await plot.locator('[data-category-label]').first().boundingBox())!;
      expect(category.y - baseline.y).toBeGreaterThanOrEqual(6);
      expect(category.y - baseline.y).toBeLessThanOrEqual(14);
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
    }
  });

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
  test(`Charts: pie and donut titles center over the plot with default side legends at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ['Semantic pie', 'Fundraising goal', 'Electricity from renewable sources']) {
      await open(page, label);
      const caption = page.locator('[data-chart-caption]');
      await expect(caption).toHaveCSS('text-align', 'center');
      const title = (await caption.boundingBox())!;
      const plot = (await page.locator('[data-chart-plot]:visible').boundingBox())!;
      expect(title.x + title.width / 2).toBeCloseTo(plot.x + plot.width / 2, 1);
      expect(title.y + title.height).toBeLessThanOrEqual(plot.y);
      if (label !== 'Electricity from renewable sources') {
        const legend = (await page.locator('[data-chart-legend]').boundingBox())!;
        if (width === 360) expect(legend.y).toBeGreaterThanOrEqual(plot.y + plot.height);
        else {
          expect(legend.x).toBeGreaterThanOrEqual(plot.x + plot.width);
          const sliceRight = await page.locator('[data-chart-plot]:visible [data-slice]').evaluateAll((slices) =>
            Math.max(...slices.map((slice) => slice.getBoundingClientRect().right)));
          expect(legend.x - sliceRight).toBeGreaterThanOrEqual(24);
          expect(legend.x - sliceRight).toBeLessThanOrEqual(64);
        }
      }
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
    }
  });

  test(`Charts: brand pie label roles avoid redundant legends at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, 'Customer acquisition channels');
    const plot = page.locator('[data-chart-plot]:visible');
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveCount(3);
    const outside = await plot.locator('[data-pie-label]').evaluateAll((els) => els.map((el) => el.childNodes[0]?.textContent?.trim()));
    expect(outside.sort()).toEqual(['Organic search', 'Paid campaigns', 'Referrals']);
    await open(page, 'Electricity from renewable sources');
    await expect(plot.locator('[data-pie-label]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveCount(2);
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]').first()).toContainText('78%Renewable');
  });
}

test('Charts: simple bar values use the approved inside ink', async ({ page }) => {
  await open(page, 'Simple bars with inside values');
  const plot = page.locator('[data-chart-plot]:visible');
  const label = plot.locator('text').filter({ hasText: /^24/ });
  await expect(label).toHaveCSS('fill', await themeValue(page, 'oklch(from var(--chart-1) clamp(0, (0.6 - l) * 1000, 1) 0 0)'));
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

for (const width of [360, 768, 1440]) {
  test(`Charts: reference pie treatments preserve their labels and callouts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const plot = page.locator('[data-chart-plot]:visible');
    await open(page, 'Survey agreement — outside names');
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveText(['78%', '14%', '8%']);
    expect((await plot.locator('[data-pie-label] title').allTextContents()).sort()).toEqual(['Agree', 'Disagree', 'Neutral']);

    await open(page, 'Survey sentiment — emphasized majority');
    const majority = plot.locator('[data-pie-inside-label][data-category="positive"]');
    const minority = plot.locator('[data-pie-inside-label][data-category="negative"]');
    await expect(majority).toHaveText('78%Positive');
    await expect(minority).toHaveText('22%Negative');
    const size = async (locator: typeof majority) => locator.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(await size(majority)).toBeGreaterThan(await size(minority) * 1.5);

    await open(page, 'Household spending — outside names');
    await expect(plot.locator('[data-pie-label]')).toHaveCount(5);
    await expect(page.locator('[data-chart-legend]')).toHaveCount(0);
    await expect(plot.locator('[data-pie-inside-label]')).toHaveText(['30%', '25%', '20%', '15%', '10%']);
    expect((await plot.locator('[data-pie-label] title').allTextContents()).sort()).toEqual(['Food', 'Housing', 'Other', 'Savings', 'Transport']);
    if (width >= 768) await expect(plot.locator('[data-pie-label][data-category]')).toHaveCount(5);

    await open(page, 'Project funding — detailed legend');
    await expect(page.locator('[data-chart-legend] li')).toHaveCount(9);
    await expect(plot.locator('[data-center-value]')).toContainText('$10M');
    const inks = await page.locator('[data-chart-key]').evaluateAll(keys => keys.map(key => getComputedStyle(key).backgroundColor));
    expect(new Set(inks).size).toBe(9);

    await open(page, 'Investment priorities — annotated donut');
    await expect(page.locator('[data-pie-annotation]:visible')).toHaveCount(3);
    for (const annotation of await page.locator('[data-pie-annotation]:visible').all()) {
      const text = await annotation.textContent();
      await expect(page.getByRole('table').getByRole('cell', { name: text!, exact: true })).toHaveCount(1);
      const fits = await annotation.evaluate(el => {
        const parent = el.getBoundingClientRect();
        const child = (el.firstElementChild ?? el).getBoundingClientRect();
        return child.bottom <= parent.bottom + 1 && child.right <= parent.right + 1;
      });
      expect(fits).toBe(true);
    }
    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });
}

for (const width of [360, 768, 1440]) {
  test(`Charts: line and XY layouts share aligned titles and responsive keys at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const label of ['Editorial line', 'Rounded line', 'Scatter with trend', 'Bubble area comparison']) {
      await open(page, label);
      const caption = (await page.locator('[data-chart-caption]').boundingBox())!;
      const plot = page.locator('[data-chart-plot]:visible');
      const plotBox = (await plot.boundingBox())!;
      for (const tick of await plot.locator('[data-value-tick], [data-y-tick]').all()) {
        expect((await tick.boundingBox())!.x).toBeCloseTo(caption.x, 1);
      }
      const legend = page.locator('[data-chart-legend]');
      if (label === 'Editorial line' || label === 'Scatter with trend') {
        await expect(legend).toHaveCount(0);
      } else {
        const key = (await legend.boundingBox())!;
        if (width === 360) expect(key.y - plotBox.y - plotBox.height).toBeCloseTo(12, 1);
        else expect(key.x - plotBox.x - plotBox.width).toBeCloseTo(24, 1);
      }
      if (label === 'Editorial line') {
        await expect(plot.locator('[data-end-value]')).toHaveCount(3);
        const baseline = (await plot.locator('[data-baseline]').boundingBox())!;
        const category = (await plot.locator('[data-category-label]').first().boundingBox())!;
        expect(category.y - baseline.y).toBeGreaterThanOrEqual(6);
        expect(category.y - baseline.y).toBeLessThanOrEqual(14);
      }
      if (label === 'Bubble area comparison') {
        const bottoms = await plot.locator('[data-size-reference]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
        expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(1);
        await expect(plot.locator('[data-x-axis-label]')).not.toContainText('…');
        await expect(plot.locator('[data-y-axis-label]')).not.toHaveAttribute('transform');
      }
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
    }
  });
}

test('Charts: themes without chart tokens still distinguish pie slices', async ({ page }) => {
  await page.goto(url('Household spending — outside names', 'fintech-launch'));
  const slices = page.locator('[data-chart-plot]:visible [data-slice]');
  await expect(slices).toHaveCount(5);
  await expect.poll(() => slices.evaluateAll(elements => new Set(elements.map(element => getComputedStyle(element).fill)).size)).toBe(5);
});

for (const theme of ['blank', 'proposal', 'enterprise-campaign']) {
  test(`Charts: outside pie and donut leaders meet the label center in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1000 });
    for (const label of ['Household spending — outside names', 'Survey agreement — outside names']) {
      await page.goto(url(label, theme));
      const plot = page.locator('[data-chart-plot]:visible');
      await expect(plot.locator('[data-pie-label]').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const alignments = await plot.evaluate((svg) => [...svg.querySelectorAll<SVGPathElement>('[data-pie-leader]')].map((leader) => {
        const text = svg.querySelector<SVGTextElement>(`[data-pie-label][data-category="${leader.dataset.category}"]`)!;
        const end = leader.getPointAtLength(leader.getTotalLength());
        const point = new DOMPoint(end.x, end.y).matrixTransform(leader.getScreenCTM()!);
        const bounds = text.getBoundingClientRect();
        return { vertical: Math.abs(point.y - (bounds.y + bounds.height / 2)),
          gap: Math.min(Math.abs(point.x - bounds.x), Math.abs(point.x - bounds.right)) };
      }));
      for (const alignment of alignments) {
        expect(alignment.vertical).toBeLessThanOrEqual(1);
        expect(alignment.gap).toBeCloseTo(6, 0);
      }
    }
  });
}
