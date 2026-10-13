// Shared publisher/build validation for the optional host-driven adoption contract.
//
// `root` is where a catalog's files land in a workspace: `src/components/` for
// the advanced-components catalog, `src/sections/` for a section catalog. The
// barrel the export is appended to defaults to `<root>index.ts`; `adopt.barrel`
// may name another file under the same root.
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
export function validateAdoption(adopt, directory, { root = 'src/components/' } = {}) {
  if (adopt === undefined) return [];
  const problems = [];
  const safe = (value) => typeof value === 'string' && value.length > 0 && !value.includes('\\') && !value.startsWith('/') && value.split('/').every((part) => part !== '..' && part !== '.' && part !== '');
  if (!adopt || typeof adopt !== 'object' || Array.isArray(adopt)) return ['adopt must be an object'];
  if (!Array.isArray(adopt.files) || !adopt.files.length) problems.push('adopt.files must be a non-empty array');
  else {
    const targets = new Set();
    for (const file of adopt.files) {
      if (!safe(file?.from) || !safe(file?.to) || !file.to.startsWith(root)) {
        problems.push(`adopt.files entries need safe from/to paths under ${root}`);
        continue;
      }
      if (file.from.includes('.demo.') || file.from.startsWith('skeleton.') || file.from === 'component.json') problems.push(`adopt.files must not copy ${file.from}`);
      const source = resolve(directory, file.from);
      if (!existsSync(source) || !statSync(source).isFile()) problems.push(`adopt source is not a file: ${file.from}`);
      if (targets.has(file.to)) problems.push(`duplicate adopt destination: ${file.to}`);
      targets.add(file.to);
    }
    if (!safe(adopt.theme) || !targets.has(adopt.theme)) problems.push('adopt.theme must name one adopt.files destination');
  }
  if (typeof adopt.export !== 'string' || !/^export \* from ['"]\.\/[A-Za-z0-9_-]+['"];?$/.test(adopt.export)) problems.push('adopt.export must be one relative export-all statement');
  if (adopt.barrel !== undefined && (!safe(adopt.barrel) || !adopt.barrel.startsWith(root) || !adopt.barrel.endsWith('/index.ts'))) problems.push(`adopt.barrel must be an index.ts under ${root}`);
  if (!Array.isArray(adopt.checks) || !adopt.checks.every((file) => safe(file) && file.endsWith('.mjs') && existsSync(resolve(directory, file)))) problems.push('adopt.checks must name existing relative .mjs files');
  return problems;
}
