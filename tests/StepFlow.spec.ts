// StepFlow's own behaviour. The shared catalog.spec.ts covers what every
// component must do (fit, hit 44px, survive no JS, honour reduced motion, stay
// quiet); this covers what only a step flow does — walking the steps, where focus
// lands when one replaces another, and the three things a quiz gets wrong in ways
// that look fine: letting you advance without answering, letting you change an
// answer after seeing the verdict, and scoring the change.
//
// Every locator is scoped to the component's own subtree. Next's dev overlay
// shares the document and brings a button whose accessible name CONTAINS "Next",
// so an unscoped `getByRole('button', { name: 'Next' })` is ambiguous — and would
// fail on the tooling rather than on the component.

import { test, expect, type Locator, type Page } from '@playwright/test';
import { components } from '../demo/components.gen/manifests';

/** A showcase case by LABEL, not by index.
 *
 *  `?case=` is positional, and hardcoding a number breaks silently the moment a
 *  case is inserted above it — the test then exercises a different configuration
 *  and fails for the wrong reason. The label is the stable name. */
function caseIndex(componentName: string, label: string): number {
  const found = components.find((c) => c.name === componentName);
  const at = found?.cases.indexOf(label) ?? -1;
  if (at < 0) throw new Error(`${componentName} has no showcase case labelled "${label}"`);
  return at;
}

async function open(page: Page, label: string): Promise<Locator> {
  await page.goto(`/component/StepFlow?case=${caseIndex('StepFlow', label)}&theme=blank`);
  await page.waitForLoadState('networkidle');
  return page.locator('[data-slot="step-flow"]');
}

/** The panels that are actually on screen. One, once this has hydrated. */
function panels(flow: Locator) {
  return flow.locator('[data-slot="step-flow-panel"]:not([hidden])');
}

const STEPPER = 'Stepper — three steps';
const QUIZ = 'Quiz — two questions, bar';

test('shows one step at a time once hydrated, and walks both ways', async ({ page }) => {
  const flow = await open(page, STEPPER);
  await expect(panels(flow)).toHaveCount(1);
  await expect(panels(flow)).toContainText('Connect your design system');

  await flow.getByRole('button', { name: 'Next' }).click();
  await expect(panels(flow)).toContainText('Describe the page');
  await expect(flow.getByText('Step 2 of 3')).toBeVisible();

  await flow.getByRole('button', { name: 'Back' }).click();
  await expect(panels(flow)).toContainText('Connect your design system');
});

test('dead-ends rather than wrapping, at both ends', async ({ page }) => {
  // A flow is a sequence, not a carousel: wrapping from the last step back to the
  // first would tell the reader they had not finished.
  const flow = await open(page, STEPPER);
  await expect(flow.getByRole('button', { name: 'Back' })).toBeDisabled();
  await flow.getByRole('button', { name: 'Next' }).click();
  await flow.getByRole('button', { name: 'Next' }).click();
  await expect(flow.getByText('Step 3 of 3')).toBeVisible();
  await expect(flow.getByRole('button', { name: 'Next' })).toBeDisabled();
});

test('moves focus to the new panel, so a keyboard user is not left behind', async ({ page }) => {
  const flow = await open(page, STEPPER);
  await flow.getByRole('button', { name: 'Next' }).click();
  // Without this, focus stays on Next while the panel it described is gone — a
  // screen reader then reads nothing at all about where the reader now is.
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-slot'));
  expect(focused).toBe('step-flow-panel');
});

test('marks the current step in the progress list', async ({ page }) => {
  const flow = await open(page, STEPPER);
  // `aria-current="step"` is the specified answer to "where am I in a sequence",
  // and exactly one thing can be the answer.
  await expect(flow.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(flow.locator('[aria-current="step"]')).toHaveText(/1/);
  await flow.getByRole('button', { name: 'Next' }).click();
  await expect(flow.locator('[aria-current="step"]')).toHaveText(/2/);
});

test.describe('quiz', () => {
  test('will not advance until the question is answered', async ({ page }) => {
    const flow = await open(page, QUIZ);
    await expect(flow.getByRole('button', { name: 'Next' })).toBeDisabled();
    await flow.getByRole('radio', { name: 'No', exact: true }).check();
    await expect(flow.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  test('locks the answer once given, and says why it was right', async ({ page }) => {
    const flow = await open(page, QUIZ);
    await flow.getByRole('radio', { name: 'No', exact: true }).check();

    // The feedback is announced, not just drawn — it arrives in response to the
    // reader's own click, so `status` is right and an alert would be rude.
    await expect(flow.locator('[role="status"]')).toContainText('Scroll-snap scrolls');

    // Locked by the platform, not by a handler that politely ignores the change:
    // a quiz you can re-answer after seeing the verdict has no score worth
    // showing.
    await expect(flow.getByRole('radio', { name: 'Yes', exact: true })).toBeDisabled();
    await expect(flow.getByRole('radio', { name: 'No', exact: true })).toBeChecked();
  });

  test('marks the right answer even when the reader picked another', async ({ page }) => {
    const flow = await open(page, QUIZ);
    await flow.getByRole('radio', { name: 'Yes', exact: true }).check();
    // Both are marked: the one they chose as wrong, and the one they missed as
    // right. Colour alone cannot say that, so each carries the verdict in words.
    await expect(flow.locator('[data-state="wrong"]')).toContainText('Yes');
    await expect(flow.locator('[data-state="correct"]')).toContainText('No');
    await expect(flow.locator('[data-state="correct"]')).toContainText('Correct answer');
  });

  test('scores what was answered, and clears on restart', async ({ page }) => {
    const flow = await open(page, QUIZ);
    await flow.getByRole('radio', { name: 'No', exact: true }).check(); // right
    await flow.getByRole('button', { name: 'Next' }).click();
    await flow.getByRole('radio', { name: '<div role="button">' }).check(); // wrong
    await flow.getByRole('button', { name: 'See result' }).click();

    const result = flow.locator('[data-slot="step-flow-result"]');
    await expect(result).toContainText('1');
    await expect(result).toContainText('of 2');

    await flow.getByRole('button', { name: 'Start over' }).click();
    await expect(panels(flow)).toContainText('Does a CSS-only carousel auto-advance');
    await expect(flow.getByRole('radio', { name: 'No', exact: true })).not.toBeChecked();
    await expect(flow.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

test('with no JavaScript, reads as one outline of every step', async ({ browser, baseURL }) => {
  // The degraded render, and the state a published page ships when the section
  // using this forgot `@hydrate`. The shared spec checks parity with the hydrated
  // render; this checks the thing parity cannot see — that the outline really is
  // every step, not just the first one repeated.
  const at = caseIndex('StepFlow', QUIZ);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/component/StepFlow?case=${at}&theme=blank`);
  const flow = page.locator('[data-slot="step-flow"]');

  await expect(panels(flow)).toHaveCount(2);
  const text = await flow.innerText();
  for (const phrase of [
    'Does a CSS-only carousel auto-advance?',
    'Which element announces its own expanded state?',
    '<summary>',
  ]) {
    expect(text).toContain(phrase);
  }

  // And the controls are honestly dead rather than fake-alive: `inert` takes them
  // out of the tab order AND the accessibility tree, so nobody is offered a Next
  // that cannot advance.
  await expect(flow.locator('[data-slot="step-flow-nav"][inert]')).toHaveCount(1);
  await context.close();
});
