import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateAdoption } from '../scripts/component-adoption.mjs';
const directory = resolve(import.meta.dir, '../components/Chart');
const manifest = JSON.parse(readFileSync(resolve(directory, 'component.json'), 'utf8'));

describe('catalog adoption contract', () => {
  test('finished primitives validate and only declare real deliverables', () => {
    for (const name of ['Chart', 'Carousel']) {
      const dir = resolve(import.meta.dir, '../components', name);
      const m = JSON.parse(readFileSync(resolve(dir, 'component.json'), 'utf8'));
      expect(validateAdoption(m.adopt, dir)).toEqual([]);
      expect(m.adopt.files.some((f: { to: string }) => f.to === m.adopt.theme)).toBe(true);
      expect(m.adopt.checks).toEqual(['check.mjs']);
    }
  });
  test('a section pack adopts under src/sections, into its own barrel', () => {
    const dir = resolve(import.meta.dir, '../sections/pitch');
    const m = JSON.parse(readFileSync(resolve(dir, 'component.json'), 'utf8'));
    expect(validateAdoption(m.adopt, dir, { root: 'src/sections/' })).toEqual([]);
    expect(m.adopt.barrel).toBe('src/sections/index.ts');
    expect(m.adopt.theme).toBe('src/sections/pitch-composition.tsx');
    for (const main of m.exports) expect(m.adopt.files.some((f: { to: string }) => f.to === `src/sections/${main}.tsx`)).toBe(true);
    // The same manifest read as a component is rejected: a pack never lands beside components.
    expect(validateAdoption(m.adopt, dir).length).toBeGreaterThan(0);
    expect(validateAdoption({ ...m.adopt, barrel: 'src/components/index.ts' }, dir, { root: 'src/sections/' }).length).toBeGreaterThan(0);
  });
  test('legacy skeleton components need no adoption manifest', () => {
    expect(validateAdoption(undefined, directory)).toEqual([]);
  });
  test('rejects traversal, duplicate destinations, and missing check files', () => {
    const cases = [
      { ...manifest.adopt, files: [{ from: '../Carousel/Carousel.tsx', to: 'src/components/Chart.tsx' }] },
      { ...manifest.adopt, files: [{ from: 'Chart.tsx', to: '/tmp/Chart.tsx' }] },
      { ...manifest.adopt, files: [...manifest.adopt.files, manifest.adopt.files[0]] },
      { ...manifest.adopt, checks: ['missing.mjs'] },
      { ...manifest.adopt, export: "export * from './Chart'; doAnything()" },
      { ...manifest.adopt, theme: 'src/components/missing.ts' },
    ];
    for (const value of cases) expect(validateAdoption(value, directory).length).toBeGreaterThan(0);
  });
});
