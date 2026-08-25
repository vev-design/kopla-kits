# scripts/extractor — this repo's OWN extraction toolchain

A snapshot of the compiler that turns an assembled workspace's source into
`design.json`. It is **not part of `_base`** and never ships to a consumer:
whoever compiles a workspace stages their own extractor onto
`scripts/extract-design.mjs` + `scripts/lib/*.mjs` before the build
(CONTRACT.md → "The toolchain travels"). This copy exists so the CI contract
checks (`build-kit.mjs --all`, `build-components.mjs`) can build kits the way
a real consumer workspace builds — they stage these files the same way.

There is **no sync promise** between this snapshot and any host's copy. What
both sides owe each other is `design.json`'s FORMAT (CONTRACT.md) — when the
format grows, update this snapshot so CI checks kits against the new shape.

`lib/ts.mjs` resolves the TypeScript these scripts parse with: an explicit
directory when `DESIGN_EXTRACTOR_TS_DIR` is set, otherwise normal resolution —
which in an assembled workspace finds the `typescript` that
`_base/package.json` declares. `lib/tokens.mjs` is also imported directly by
`pack-kits.mjs`, so kit tokens parse identically at pack time and at build
time.
