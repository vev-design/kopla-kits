// Playwright for the advanced-components catalog.
//
// It drives the component LAB (demo/app/(gallery)/components + the
// /component/<dir> frame), reading the same generated registry and the same
// showcase cases a human clicking through the lab sees. That sharing is the
// point: a green suite here cannot mean something different from what the lab
// shows, and adding a component to the catalog gets it tested without touching
// this config or the shared spec.
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.LAB_PORT ?? 4020);

export default defineConfig({
  testDir: './tests',
  // The catalog is small and the assertions are cheap; failing fast on CI beats
  // a retry loop that hides a genuinely flaky drag gesture.
  retries: 0,
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // A trace on a failure is what makes "no horizontal overflow at 360" a
    // finding rather than a number.
    trace: 'retain-on-failure',
  },
  // One project, Chromium: these are behaviour and layout invariants, not
  // browser-compatibility checks. `devices` presets are used per-test for the
  // touch cases instead, which is where engine emulation actually matters.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // `next dev` rather than a production build: the lab's own generators run in
    // predev, so this picks up a component added a minute ago with no build step
    // to remember. Slower first paint, and worth it for a catalog dev loop.
    // `--port` goes to next, and pnpm's `--` passthrough would hand it to the
    // script runner instead; PORT is what next reads.
    command: 'pnpm --filter @kopla/kits-demo dev',
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/components`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
