# Field Report

Field Report is a scroll-first editorial system for science, sustainability, and material-transition stories. It takes its visual language from a research publication rather than a product site: warm paper grounds, near-black report typography, fine rules, and oversized graphic letterforms give each claim enough room to feel investigated. Type is Figtree throughout, with the display role taking the light cut — an expansive display voice over a precise geometric body face.

Its palette is deliberately restrained: white and paper-soft grounds carry the reading, near-black establishes authority, and lavender, cyan, green, blue, and violet appear as translucent material signals. Sections are designed to work without JavaScript; scroll-entry animation and the single slow orbit on a data graphic are CSS-only with a reduced-motion fallback.

## Composition

The sequence begins with `StoryToolbar`, a quiet orientation device that remains useful at every viewport width without competing with the story. `CampaignHero` then earns the reader’s attention through a full-screen typographic mark, faint dotted orbital circles, and a broad report descriptor that shares the evidence spread’s generous reading field—its visual scale makes the campaign feel like a publication cover rather than a marketing banner.

`Introduction` slows the rhythm into a deliberate two-column reading spread: its wider left field carries the opening argument, while a narrower right field holds the sourced quote and attribution in parallel. This gives the opening argument room without losing the editorial counterpoint before `ChapterDivider` makes a decisive full-bleed change of register. `EvidenceSpread` follows with the highest density in the system: report copy shares a deliberately widened gutter with a circular, oversized fact set toward the outer right edge, making argument and proof visible at once. `ClosingCTA` releases the tension with a calm, open invitation, while `StoryFooter` adds source credit and a small return path without turning the end of the report into a conventional website footer.

## Catalog

The sections compose three shared editorial primitives: `SectionKicker` for chapter rhythm, `PullQuote` for source-led punctuation, and `EditorialButton` for understated actions. The kit’s base `Button` remains available for any future task that genuinely needs a conventional control, while the report sections deliberately use the lighter editorial action primitive.

## Brand foundations

- Body and headings: Figtree, with the display role at weight 300.
- Ground: white with a subtle paper grain; ink is black / #222 in visual role.
- Accent vocabulary: lavender chapter fields with violet, cyan, green, and deep-blue overlapping data and title forms.
- Voice: authoritative, science-forward, and investigative—short chapter labels, declarative headlines, sourced quotations, and standalone proof points.
