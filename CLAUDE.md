# kopla-kits — public repo rules

**This repository is PUBLIC.** Everything in it — code, comments, docs,
commit messages, PR descriptions — is world-readable, served by the live
gallery + MCP at kits.kopla.ai, and copied verbatim into users' projects.
Write accordingly.

## Hard rules

1. **No secrets, ever.** No API keys, tokens, credentials, internal URLs,
   or `.env` values — not in code, not in fixtures, not in commit
   messages. GitHub push protection is on, but don't rely on it.
2. **Kits are host-agnostic.** A kit is a self-contained UI library that
   knows nothing about any consuming application (see `CONTRACT.md`).
   Never reference a consumer's internal architecture, infrastructure,
   service names, database schema, file paths, or business logic — in
   code, comments, or docs. Say "the host" / "consumers" when the
   workspace contract genuinely requires mentioning one.
3. **Commit messages are public.** Describe what changed in THIS repo;
   don't narrate consumer-side context or internal plans.
4. **CI enforces this** — `scripts/check-public-safety.mjs` greps for
   host-specific terms and secret-shaped strings on every PR. If it
   flags something you believe is legitimate (e.g. a brand name in demo
   content), extend its allowlist deliberately, in its own reviewed
   commit.

## What this repo is

- `kits/` — `_base` substrate + kit overlays. The workspace model,
  required files, token declaration, and toolchain (`bun install &&
  bun run build`) are specified in `CONTRACT.md` — breaking it is a
  major version.
- `demo/` — Next.js gallery (`/`), per-kit live render (`/kit/<slug>`),
  MCP server (`/api/mcp`). Merging to `main` deploys it immediately.
- Releases are tags (`vX.Y.Z`); consumers pin an exact ref.

## Authoring kits

Follow `kits/_base/AGENTS.md` (section conventions, props JSDoc, demo
exports) and `kits/README.md` (kit format, tokens). Every kit must pass
`node scripts/build-kit.mjs <slug>` — run it before pushing.
