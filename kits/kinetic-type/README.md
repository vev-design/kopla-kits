# Kinetic Type

A system that treats bold, variable-weight type as the primary interface
element and lets motion do the work imagery normally does. The ground is a
warm off-white, the ink a near-black, and exactly one loud chartreuse-lime
accent is held in reserve for emphasis — everything else in the system is
quiet so that the type can move. Archivo, a genuinely variable font spanning
roughly 100 to 900, carries both headlines and body copy; that range is not
decorative, it is the mechanism the system's signature move depends on —
headlines that sweep from hairline to black weight as the page scrolls
through them. JetBrains Mono carries the eyebrow labels and ticker chrome, a
small technical counterpoint to Archivo's expressive range.

There is minimal to no photography anywhere in this system. Where another
kit would reach for a hero image, a product shot, or an icon, this one
reaches for scale, weight, and rhythm: an oversized scroll-scrubbed
headline, an idling marquee of value props, a manifesto-style numbered grid,
animated counters, and a staggered, mask-revealed pull-quote. Use it for
product launches, campaign or drop pages, and studio or portfolio sites that
want the page to feel alive as you scroll rather than static from the first
frame.

## Composition

The chain is built to introduce the system's motion vocabulary in ascending
order of commitment, then close it out. **Navbar** states the premise in one
glance — the wordmark itself sits at Archivo's heaviest weight, so the
brand's whole idea is visible before a single pixel has moved. **Hero**
immediately makes good on that promise: it pins in place with `position:
sticky` across a scroll track taller than the viewport, and for as long as
it holds the screen its headline's `font-variation-settings` weight,
scale, and tracking are wired directly to scroll progress — hairline and
loose at the start, black and tight by the time the pin releases — while a
small monospace counter ticks the progress in the corner and the eyebrow,
subhead, and CTAs hold back until the final stretch. The first thing a
visitor does — scroll — is also the first thing that visibly, sustainedly
changes the page. That is the system's core mechanic, and putting it first
means every section after it is read against that
expectation of movement.

**Marquee** deliberately breaks the scroll-linked pattern: it idles
continuously regardless of scroll position, giving the page a pulse even
when the visitor pauses, and resetting the rhythm before the next section.
**StatementGrid** turns explanation into a numbered list rendered at
type-as-image scale — each huge index numeral does the work a feature icon
would do elsewhere, so the "what this is" section still reads as pure
typography. **StatShowcase** raises the stakes with a one-shot count-up,
proof rendered in the same oversized black-weight numerals as everything
else, so credibility arrives without ever leaving the type-only vocabulary.

**Testimonial** slows down and goes quiet: a pull-quote staggers in phrase
by phrase, a mask-reveal that reads as someone speaking rather than a wall
of text appearing at once — the system's most intimate beat. **CTA** closes
with the loudest single statement on the page, the lime accent finally
spent on the primary button after being held in reserve the entire way
down. **Footer** is the calm landing after the motion — structured,
static, and legible, closing the page the same way it opened: with type
alone.
