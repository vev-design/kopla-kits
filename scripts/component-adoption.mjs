// Shared publisher/build validation for the optional host-driven adoption contract.
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The two trees an adoption may land in. A COMPONENT entry (Chart, Carousel)
 * lands under src/components and is registered in that barrel; a SECTION entry
 * (the proposal archetypes) lands under src/sections and is registered in
 * `src/sections/index.ts`, whose line order is the recommended composition
 * chain — which is what `adopt.order` is for. The host tells the two apart by
 * the export's target, exactly as `adoptionKind` does here.
 */
export const ADOPTION_TREES = [
  { kind: 'component', dir: 'src/components/', index: 'src/components/index.ts' },
  { kind: 'section', dir: 'src/sections/', index: 'src/sections/index.ts' },
];

/** `component` or `section`, read off which tree `adopt.export` resolves into; null when it resolves into neither. */
export function adoptionKind(adopt) {
  const target = exportTarget(adopt?.export);
  if (!target) return null;
  const destinations = new Set((adopt.files ?? []).map((f) => f?.to));
  for (const tree of ADOPTION_TREES) {
    const to = `${tree.dir}${target}.tsx`;
    if (destinations.has(to) || destinations.has(`${tree.dir}${target}.ts`)) return tree.kind;
  }
  return null;
}

function exportTarget(statement) {
  const match = typeof statement === 'string' ? /^export \* from ['"]\.\/([A-Za-z0-9_-]+)['"];?$/.exec(statement) : null;
  return match?.[1] ?? null;
}

export function validateAdoption(adopt, directory) {
  if (adopt === undefined) return [];
  const problems = [];
  const safe = (value) => typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.startsWith('/') && value.split('/').every((part) => part !== '..' && part !== '.' && part !== '');
  if (!adopt || typeof adopt !== 'object' || Array.isArray(adopt)) return ['adopt must be an object'];
  if (!Array.isArray(adopt.files) || !adopt.files.length) problems.push('adopt.files must be a non-empty array');
  else {
    const targets = new Set();
    for (const file of adopt.files) {
      const tree = safe(file?.to) ? ADOPTION_TREES.find((t) => file.to.startsWith(t.dir)) : undefined;
      if (!safe(file?.from) || !tree) {
        problems.push('adopt.files entries need safe from/to paths under src/components or src/sections');
        continue;
      }
      if (file.to === tree.index) problems.push(`adopt.files must not overwrite the barrel ${tree.index}`);
      if (file.from.includes('.demo.') || file.from.startsWith('skeleton.') || file.from === 'component.json') problems.push(`adopt.files must not copy ${file.from}`);
      const source = resolve(directory, file.from);
      if (!existsSync(source) || !statSync(source).isFile()) problems.push(`adopt source is not a file: ${file.from}`);
      if (targets.has(file.to)) problems.push(`duplicate adopt destination: ${file.to}`);
      targets.add(file.to);
    }
    if (!safe(adopt.theme) || !targets.has(adopt.theme)) problems.push('adopt.theme must name one adopt.files destination');
  }
  if (!exportTarget(adopt.export)) problems.push('adopt.export must be one relative export-all statement');
  else if (Array.isArray(adopt.files) && !adoptionKind(adopt)) problems.push('adopt.export must name a .tsx/.ts file adopt.files puts in src/components or src/sections');
  if (adopt.order !== undefined && !(Number.isInteger(adopt.order) && adopt.order >= 0)) problems.push('adopt.order must be a non-negative integer when present');
  if (!Array.isArray(adopt.checks) || !adopt.checks.every((file) => safe(file) && file.endsWith('.mjs') && existsSync(resolve(directory, file)))) problems.push('adopt.checks must name existing relative .mjs files');
  return problems;
}
