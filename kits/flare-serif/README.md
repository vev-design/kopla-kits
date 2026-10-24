# Flare & Wedge

A specimen system for the return of display serifs to categories that had
gone entirely sans. After a decade in which the flat geometric sans was the
default for everything, type designers and brand studios started reaching back
to inscriptional and expressive letterforms — flare serifs cut on Roman
square-capital proportions, wedge terminals and sculptural spurs on faces that
read monolinear at distance and modulated up close. Flare & Wedge is built for
presenting exactly that: the letterform is the subject of the page, not its
decoration.

The consequence runs through every token. Because the contrast lives in the
terminals, the palette recedes and refuses to compete: a warm oatmeal ground
(`--background`), a warm near-black ink (`--foreground`), and exactly one hot
red (`--primary`) that is permitted on rules and small marks and nowhere else.
Headlines are never colored. Stacking a color contrast on top of a terminal
contrast is the failure mode this system exists to avoid, so the accent is
budgeted rather than distributed.

Type is a three-slot system. `--font-display` is Cinzel, drawn on Roman
square-capital proportions with flared serifs — the inscriptional voice, set
from 64px upward and always uppercase. `--font-wedge` is Bricolage Grotesque,
a genuinely variable sans with spurred, modulated terminals — the expressive
voice, used for figures, callout terms and anything that should read as drawn
rather than carved. `--font-sans` is Inter, held at 16–18px so it stays plain
and lets the display face carry the contrast. Because the display family has no
italic, `.emphasis` sets emphasis as weight plus small caps instead of slant.

Two details in the tokens are doing more work than their size suggests.
Numerals are **two** tokens, not one: `--numeric-text` (oldstyle, proportional)
for running prose and `--numeric-table` (lining, tabular) for anything that has
to align in a column — a table set in oldstyle figures will not align, and a
sentence set in tabular figures reads like a receipt. And `--tracking-caps` is
+3%, because all-caps blocks in a flare serif need air where a grotesk does
not; `--tracking-label` is +26%, so the small label voice reads as an index
mark rather than a small heading. `--measure` holds body copy to 66 characters,
the classical measure Roman-capital proportions expect. `--radius` is 2px:
near-square, because nothing about an inscriptional face is soft.

## Composition

The chain is a specimen page, not a funnel, and it moves at deliberately
descending scale — from the face filling the viewport to a single glyph to a
numeral in a table — before pulling back out to the ask.

**Lockup** opens with the nameplate given a full cap height of clear space on
every side. The clear space is the argument: crowding an inscriptional wordmark
into a header strip is what makes it read as a logo rather than a mark, so the
first thing the page demonstrates is restraint about its own name.

**SpecimenHero** is the face at full size and nothing else — no image, no
button, no color on the type. Its letterspacing opens and its scale lifts as
the viewer scrolls through it, which is the system's entire motion budget spent
in one place, on the one property a Roman-capital setting is most sensitive to.

**Manifesto** is the only dense passage of running text in the chain, which is
why it is set in the plain grotesk at classical measure with the release's hard
figures ruled beneath it. Placing the argument immediately after the specimen
means the viewer has already seen the thing being argued for.

The next four sections examine the drawing at descending scale, and their
rhythm is the pacing device. **WeightRamp** inverts to ink-on-background — the
one dark section in the system — and repeats a single word down the page at
ascending weights, because a weight count in a spec sheet cannot substitute for
seeing hairline and black stacked. **Anatomy** drops to one letterform filling
half the screen with the drawing decisions named beside it; it is the section
that earns the rest, since it teaches the viewer what to look at. **Alternates**
narrows further to individual characters, shown in default and alternate cuts
with this system's choice marked once — treating alternates as a locked token
rather than a per-instance decision is what keeps an expressive face reading as
one family. **Figures** is the smallest scale in the chain, setting the two
numeral tokens against each other so the split is arguable rather than
theoretical.

**InUse** pulls back out and puts the face on something real through a media
slot that takes a photograph or a clip. A display serif is an argument about a
category, so the argument has to be tested: the tracked lockup over an image
proves it survives placement.

**Enquiry** closes with the largest all-caps block on the page — the system
ends the way it opened, at full scale — and spends the accent once on the
primary action. **Colophon** signs off as a foundry would, naming the faces the
page itself is set in, which is the right last word for a system whose whole
subject is the letterform.
