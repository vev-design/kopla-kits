import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..');

const nextConfig: NextConfig = {
  // Kit sources live outside the demo root (../kits) — both bundlers
  // need to know the real project boundary to compile + trace them.
  outputFileTracingRoot: REPO_ROOT,
  turbopack: { root: REPO_ROOT },
  experimental: { externalDir: true },
};

export default nextConfig;
