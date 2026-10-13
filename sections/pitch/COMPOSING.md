# Composing a brand's pitch

`pitch-composition.tsx` is the one file a brand's component build edits. It
holds two things: `pitchTheme`, the values every part reads (ink, the field
under a main, surfaces, what each rank looks like, the stat, the bullet
marker, the value column), and `composeFrame`, which DRAWS the header and
footer every pitch section wears from the parts in `pitch-primitives.tsx`.
The parts and the mains are never edited; an upstream fix reaches every brand
on its next adoption.

A guide shows how a brand lays out a page: where the label sits, how the title
is set, what carries the key line, where the mark goes. A sample deck or
proposal, when the brand has one, shows it exactly. Reproduce THAT, from these
parts, rather than describing it.

## The frame

`composeFrame(c)` returns `{ header, footer, field? }`. Both are assembled
from parts; `stack` and `row` lay them out.

| Part | What it draws | The decisions it takes |
| --- | --- | --- |
| `kicker(c, { color, size, weight, transform, letterSpacing })` | the small label above the title | its colour and case; nothing when the section has none |
| `title(c, { color, size, weight, letterSpacing, fontFamily })` | the section's claim | the face and weight a title carries; a serif here is a brand decision |
| `rule(c, { color, width })` | a horizontal line | whether the brand draws one, under the title or over the footer |
| `band(c, { leadIn, leadInColor, leadInWeight, marker, background, color, size })` | the takeaway, set apart | the lead-in words per kind (`{ implication: 'So what' }`), `leadIn: null` for none, a marker glyph, its surface |
| `footnote(c, text, { color, size })` | running text: confidentiality, client, date | which of `c.running` the brand shows, and how quietly |
| `logo(c, { height })` | the brand's mark, when handed one | where it sits and how big |
| `row(left, right, { gap, align })` | parts side by side, right ones at the far edge | footer arrangement |
| `stack(parts, { gap })` | parts one under another | header and footer arrangement |

`c` (`FrameContext`) carries `kicker`, `title`, `takeaway`, `takeawayKind`,
`running` (`note`, `client`, `date`), `logo`, `compact` and the theme.

## The theme

| Value | Read by | Means |
| --- | --- | --- |
| `typography` | everything | the body face, size and line height |
| `ink`, `page` | the frame | body ink; the page behind header and footer |
| `field` | the frame | the surface under every main — the deck's "same background on every slide" |
| `surface`, `divider` | `KeyValues`, cards | a surface placed on the field, and the line between its rows |
| `ranks.lead / support / aside` | `Panel` | the bar behind a ranked heading: background, ink, weight |
| `stat` | `Stat` | the focal figure's colour, size, weight and, if the brand sets one, its own face |
| `bullet` | `Bullets` | `triangle`, `dot`, `dash` or `none`, and its colour |
| `values` | `KeyValues` | the value column's weight and alignment |
| `neverDo` | authors | structural restrictions, kept here for whoever edits a main |

## What the mains do with it

A main (`Fees`, …) never styles. It names a rank for each of its parts, lays
them out with `Columns`, and wraps everything in `PitchFrame`. Changing this
file changes every main at once; that is the point.

Two frames, to show the range:

```tsx
// A red label over a dark one-line title; the takeaway on a white band with a
// red lead-in word; confidentiality left, mark right.
export function composeFrame(c: FrameContext): FrameComposition {
  return {
    header: stack([kicker(c, { color: '#CC0000', size: 12 }), title(c, { size: 28 })], { gap: 6 }),
    footer: stack([
      band(c, { leadInColor: '#CC0000', size: 17 }),
      { node: row([footnote(c, c.running?.note, { size: 8, color: '#9a9a9a' })], [logo(c)]) },
    ], { gap: 22 }),
  };
}

// No kicker colour; a light serif title with a rule under it; the takeaway
// as a plain sentence with no lead-in; the mark on the left, the date right.
export function composeFrame(c: FrameContext): FrameComposition {
  return {
    header: stack([kicker(c, { weight: 400, transform: 'uppercase', letterSpacing: '0.08em' }), title(c, { fontFamily: 'Merriweather, serif', weight: 300, size: 30 }), rule(c, { color: '#25408f', width: 2 })], { gap: 12 }),
    footer: stack([band(c, { leadIn: null }), rule(c), { node: row([logo(c)], [footnote(c, c.running?.date)]) }], { gap: 16 }),
  };
}
```

Rules that hold for every composition:

- **Static.** No hooks, no browser APIs, no imports beyond `./pitch-primitives`
  and React types. The function runs during server rendering.
- **Every value in the theme is set.** A part reads the theme and nothing
  else; an unset rank is an unstyled heading on every page.
- **Nothing invented.** The band draws the author's takeaway or nothing; the
  frame never adds a call to action, a page number it was not given, or copy.
- **The field is one colour per brand.** A main never paints its own.
- **Report what the parts cannot express** rather than approximating it: a
  treatment the guide shows that these parts cannot draw is a gap to name in
  the build's reply, and the reason a part gets added upstream.
