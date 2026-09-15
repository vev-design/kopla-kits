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

`lib/prop-type.mjs` holds shape rules over an emitted `PropType`. The one there
now is the BOOLEAN COLLAPSE: TypeScript models `boolean` as `true | false`, so
an optional flag (`autoplay?: boolean`) used to be emitted as
`nullable → union(literal false, literal true)`, which a consumer's inspector
draws as the union's first option — a read-only literal. It is a FORMAT change,
which is why this snapshot carries it: CI has to check kits against the shape a
host will actually compile them into.

`lib/ts.mjs` resolves the TypeScript these scripts parse with: an explicit
directory when `DESIGN_EXTRACTOR_TS_DIR` is set, otherwise normal resolution —
which in an assembled workspace finds the `typescript` that
`_base/package.json` declares. `lib/tokens.mjs` is also imported directly by
`pack-kits.mjs`, so kit tokens parse identically at pack time and at build
time.
