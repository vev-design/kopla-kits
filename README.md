# kopla-kits

The design-system kits for Kopla: a shared `_base` substrate plus
per-kit overlays (theme tokens + a curated section chain), a demo site
that renders every kit live, and an MCP server so agents can pull any
kit into a project as a standalone UI library.

```
kits/
  _base/      Kit-invariant substrate: framework, toolchain, primitives,
              motion. NOT a kit; never picked directly.
  blank/      A kit — an OVERLAY on _base. See kits/README.md for the
  saas/       kit format, and CONTRACT.md for what consumers rely on.
  …
demo/         Next.js app: gallery (/), per-kit live render (/kit/saas),
              and the MCP server (/api/mcp). Every PR gets a Vercel
              preview URL — review kits visually.
scripts/
  pack-kits.mjs    Build the published artifact (dist/kits-bundle.json).
  build-kit.mjs    Contract check: assemble {_base ∪ kit}, bun install, bun run build.
```

> **Merging to `main` is publishing**: every merge deploys to
> [kits.kopla.ai](https://kits.kopla.ai) and is immediately served by the
> gallery and the MCP.

## Working on a kit

```bash
pnpm install
pnpm --filter @kopla/kits-demo dev    # gallery on http://localhost:3000
```

Edit anything under `kits/` — the demo hot-reloads. Sections render with
their `<Name>Demo` props in the order of `src/sections/index.ts`.

Add a kit: copy an existing kit folder, edit `kit.json` + sections, and
restart dev (the per-kit Tailwind entry is generated in `predev`).

Before pushing, run what CI runs:

```bash
node scripts/build-kit.mjs <slug>     # or --all
```

## The MCP server

The deployed demo exposes a Model Context Protocol endpoint at
`/api/mcp` (streamable HTTP, stateless). Point an agent at it:

```bash
claude mcp add --transport http kopla-kits https://kits.kopla.ai/api/mcp
```

Tools: `list_kits` (catalog + section chains), `get_kit` (manifest,
README, copy recipe), `list_kit_files` / `read_kit_file` (the merged
`{_base ∪ kit}` workspace, file by file — works even without direct
repo access). The data source is `kits-bundle.json`, the same
published artifact every consumer uses. The copy recipe is plain
degit:

```bash
npx degit vev-design/kopla-kits/kits/_base my-ds
npx degit vev-design/kopla-kits/kits/saas my-ds --force
rm my-ds/kit.json && cd my-ds && bun install && bun run build
```

## Releasing

1. Bump `version` in `package.json`, merge to `main`, tag `v<version>`.
2. `pnpm publish` — `prepublishOnly` builds `dist/kits-bundle.json`,
   which is the entire published artifact (see CONTRACT.md for why a
   JSON bundle and not the raw tree).
3. Consumers pin an exact version and upgrade via a normal dependency
   bump.

Demo deploys: Vercel project with **Root Directory = `demo`**
(framework: Next.js — auto-detected). Production on `main`, previews
per PR; the MCP endpoint ships with every deploy, so preview URLs get
their own `/api/mcp` too.
