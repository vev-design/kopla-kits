import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { adoptionKind, validateAdoption } from '../scripts/component-adoption.mjs';
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
  const ARCHETYPES = ['ProposalHero', 'StatBand', 'EvidenceChart', 'EvidenceTable', 'Narrative', 'Quote', 'Steps', 'ProposalClosing'];
  test('archetype sections validate, land in src/sections, share one slots file and carry a composition order', () => {
    const slots = new Set<string>();
    const orders: number[] = [];
    for (const name of ARCHETYPES) {
      const dir = resolve(import.meta.dir, '../components', name);
      const m = JSON.parse(readFileSync(resolve(dir, 'component.json'), 'utf8'));
      expect(validateAdoption(m.adopt, dir)).toEqual([]);
      expect(adoptionKind(m.adopt)).toBe('section');
      expect(m.hydrate).toBe(false);
      expect(m.adopt.theme).toBe('src/sections/archetype-slots.tsx');
      expect(m.adopt.files.every((f: { to: string }) => f.to.startsWith('src/sections/'))).toBe(true);
      slots.add(readFileSync(resolve(dir, 'archetype-slots.tsx'), 'utf8'));
      orders.push(m.adopt.order);
    }
    // Identical bytes in every entry: the host keeps a theme file the brand
    // edited and treats identical bytes as untouched, so eight entries sharing
    // one slots file must ship the same one or the second adoption parks it.
    expect(slots.size).toBe(1);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(orders).size).toBe(orders.length);
  });
  test('kind is read off the export target, and an export into neither tree is refused', () => {
    expect(adoptionKind(manifest.adopt)).toBe('component');
    const section = { ...manifest.adopt, files: [{ from: 'Chart.tsx', to: 'src/sections/Chart.tsx' }], theme: 'src/sections/Chart.tsx' };
    expect(validateAdoption(section, directory)).toEqual([]);
    expect(adoptionKind(section)).toBe('section');
    const stray = { ...manifest.adopt, export: "export * from './Elsewhere';" };
    expect(validateAdoption(stray, directory).length).toBeGreaterThan(0);
    const barrel = { ...manifest.adopt, files: [...manifest.adopt.files, { from: 'Chart.tsx', to: 'src/sections/index.ts' }] };
    expect(validateAdoption(barrel, directory).length).toBeGreaterThan(0);
    expect(validateAdoption({ ...manifest.adopt, order: -1 }, directory).length).toBeGreaterThan(0);
    expect(validateAdoption({ ...manifest.adopt, order: 1.5 }, directory).length).toBeGreaterThan(0);
    expect(validateAdoption({ ...manifest.adopt, order: 30 }, directory)).toEqual([]);
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
