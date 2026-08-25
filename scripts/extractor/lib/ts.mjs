// The extractor's own TypeScript — resolved independently of the workspace.
//
// This compiler travels to every workspace (ds-extractor.ts), and workspaces
// disagree about TypeScript forever: picking a kit is a detach, so a system
// seeded before the kits repo's TS7 manifest bump pins `typescript ^6` for
// good, while systems seeded after it carry `^7` — and the two packages'
// APIs are disjoint (7 is the native compiler; the in-process JS API 6
// shipped is gone, and 6 has no `typescript/unstable/*`). Resolving the
// WORKSPACE's copy therefore cannot work for both, so the extractor brings
// its own: the container image bakes typescript at DESIGN_EXTRACTOR_TS_DIR
// (Dockerfile) and this module resolves it there first. The fallback — normal
// resolution from this file's own location — is what lets the same file run
// outside the image: the container test suite (typescript is a devDependency
// of container/package.json) and any workspace that happens to carry 7.
//
// Bun-only on purpose. The toolchain contract is `bun run build`, and the
// extractor uses TS7's async client precisely because the sync one needs a
// raw child-process fd that Node exposes and Bun does not.

import { pathToFileURL } from 'node:url';

function resolveFrom(base, subpath) {
  try {
    return Bun.resolveSync(subpath, base);
  } catch {
    return null;
  }
}

async function load(subpath) {
  const own = process.env.DESIGN_EXTRACTOR_TS_DIR;
  const resolved =
    (own ? resolveFrom(own, subpath) : null) ?? resolveFrom(import.meta.dir, subpath);
  if (!resolved) {
    throw new Error(
      `extract-design: cannot resolve "${subpath}" — this extractor needs typescript >= 7. ` +
        'Set DESIGN_EXTRACTOR_TS_DIR to a directory whose node_modules provides it ' +
        '(the container image does), or install typescript@^7 beside the workspace.',
    );
  }
  return import(pathToFileURL(resolved).href);
}

export const tsAsync = await load('typescript/unstable/async');
export const tsAst = await load('typescript/unstable/ast');
