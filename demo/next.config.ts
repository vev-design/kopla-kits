import type { NextConfig } from 'next';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..');

// Mirror the kit overlay ({ ..._base, ...<kit> }) for the demo's `@/` imports.
// tsconfig aliases `@/*` to `_base/src` only — fine for editor/tsc — but a kit
// section that imports a kit-OWNED primitive (e.g. `@/components/Card`, which
// lives in kits/<slug>/src/components, not _base) can't be resolved by that
// single alias. This resolver reproduces how a materialized kit workspace
// resolves `@/*`: try the importing kit's own src first, then fall back to
// _base — kit wins on collision, exactly like the published bundle.
const KIT_SRC_RE = /[/\\]kits[/\\]([^/\\]+)[/\\]src(?:[/\\]|$)/;
const EXTS = ['', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'];
const INDEX = ['/index.tsx', '/index.ts', '/index.js'];

function overlayResolve(issuerDir: string, sub: string): string | null {
  const roots: string[] = [];
  const m = KIT_SRC_RE.exec(issuerDir);
  if (m && m[1] !== '_base') roots.push(resolve(REPO_ROOT, 'kits', m[1], 'src'));
  roots.push(resolve(REPO_ROOT, 'kits/_base/src'));
  for (const root of roots) {
    const target = resolve(root, sub);
    for (const suffix of [...EXTS, ...INDEX]) {
      const candidate = target + suffix;
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

// enhanced-resolve plugin. Taps the first hook (`resolve`) so it preempts
// Next's tsconfig-paths plugin (which runs later, on `described-resolve`) and
// rewrites `@/x` straight to a concrete file the normal pipeline then resolves.
class KitOverlayResolver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(resolver: any) {
    const hook = resolver.ensureHook('resolve');
    resolver
      .getHook('resolve')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .tapAsync('KitOverlayResolver', (request: any, resolveContext: any, callback: any) => {
        const req: string | undefined = request.request;
        if (!req || !req.startsWith('@/')) return callback();
        const issuerDir: string = request.path || request.context?.issuer || '';
        const file = overlayResolve(issuerDir, req.slice(2));
        if (!file) return callback();
        resolver.doResolve(
          hook,
          { ...request, request: file },
          `kit-overlay: ${req}`,
          resolveContext,
          callback,
        );
      });
  }
}

const nextConfig: NextConfig = {
  // Kit sources live outside the demo root (../kits) — both bundlers
  // need to know the real project boundary to compile + trace them.
  outputFileTracingRoot: REPO_ROOT,
  turbopack: { root: REPO_ROOT },
  experimental: { externalDir: true },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack(config: any) {
    config.resolve ??= {};
    config.resolve.plugins ??= [];
    config.resolve.plugins.push(new KitOverlayResolver());
    return config;
  },
};

export default nextConfig;
