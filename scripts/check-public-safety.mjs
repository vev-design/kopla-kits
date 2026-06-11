#!/usr/bin/env node
// Public-safety lint, run in CI on every PR. Two checks over all
// git-tracked text files:
//
//   1. Host-agnosticism (CONTRACT.md: kits know nothing about consumers) —
//      consumer-specific terms are lint errors in code, comments, and docs.
//   2. Secret-shaped strings — long opaque tokens that look like
//      credentials.
//
// False positive? Extend ALLOW below in its own reviewed commit, with a
// comment saying why.

import { execFileSync } from 'node:child_process';

// Each entry: [regex, why it's banned]
const BANNED = [
  [/\bsandbox(es|ed|ing)?\b/i, 'consumer infrastructure term — say "the host" / "consumer workspace"'],
  [/\bmonorepo\b/i, 'consumer repo structure'],
  [/\binfisical\b/i, 'consumer tooling'],
  [/\bkit_slug\b/, 'consumer database column'],
  [/\bapps\/web\b/, 'consumer repo path'],
  [/\bsite-runtime\b/, 'consumer package'],
  [/\bkits\.config\.json\b/, 'consumer config file'],
  [/(api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-/+]{16,}['"]/i, 'secret-shaped assignment'],
  [/\b(sk|ddp|ddo|ghp|gho|github_pat)_[A-Za-z0-9_]{12,}\b/, 'credential-shaped string'],
];

// path → patterns that are fine there, with the reason they're allowed.
const ALLOW = [
  // Brand names in demo/sponsor content are content, not architecture.
  { path: /Sponsors\.tsx$/, re: /Supabase/ },
];

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !/\.(png|jpg|jpeg|webp|svg|woff2?|ico)$/.test(f) && !f.includes('bun.lock'));

let failures = 0;
for (const file of files) {
  let text;
  try {
    text = execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch {
    continue; // new/unreadable in HEAD — CI runs on the merge commit, so skip
  }
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const [re, why] of BANNED) {
      if (!re.test(line)) continue;
      if (ALLOW.some((a) => a.path.test(file) && a.re.test(line))) continue;
      console.error(`${file}:${i + 1}: ${why}\n  ${line.trim().slice(0, 140)}`);
      failures += 1;
    }
  });
}

if (failures > 0) {
  console.error(`\ncheck-public-safety: ${failures} finding(s). This repo is public and`);
  console.error('host-agnostic — see CLAUDE.md. Legit exception? Extend ALLOW deliberately.');
  process.exit(1);
}
console.log(`check-public-safety: ${files.length} files clean`);
