# Liquid Glass

A translucent, light-reactive design system built around one idea: every
surface is a pane of glass, and glass only reads as glass when there is
something colorful behind it to bend. The canvas is a fixed, viewport-wide
mesh of three saturated hues — violet, electric cyan, and magenta — bleeding
into a near-black base, and it never scrolls away, so the same vivid backdrop
sits behind every section from the navbar to the footer. Every panel on top
of it is built from one primitive, `GlassCard`: a `backdrop-blur` fill drawn
from translucent tokens (never raw white), a bright inset line along the top
edge standing in for a specular highlight, and a soft border that only
becomes visible against color. Foreground type is near-white so it stays
legible over the shifting canvas; the one confident accent is an electric
cyan (`#00C3F3`) reserved for primary actions, so it pops against the
violet/magenta wash rather than blending into it. Sora carries display
moments and Inter carries body copy — clean and geometric, so the type reads
premium rather than decorative. Radii are generous throughout (1.25rem base)
because soft corners sell glass; sharp ones read as plastic.

This is a marketing page system, not a presentation deck. Every section is a
fluid, full-width band that a downstream caller fills through props: a
sticky glass navbar, a hero with a floating tinted stat panel, a stat row of
light glass tiles, a bento capability grid of stacked glass cells, a
glass-paneled testimonial, glass pricing tiers with one tinted and lifted, a
closing CTA panel over an intensified glow, and a glass-topped footer.
Motion is restrained — scroll-in reveals and gentle staggers — because the
glass itself is the spectacle; the hover-triggered specular sweep on every
button is pure CSS, no JavaScript required.

## Composition

The chain exists to prove the glass effect early and keep it working at
every scale down the page. **Navbar** opens as the thinnest possible glass
surface — a blurred strip content drifts beneath as it scrolls — so the
translucency reads before anything else does. **Hero** states the core
promise beside or above a floating `tinted` `GlassCard` stat panel: this is
the first full demonstration of the primitive, deliberately given the most
saturated treatment (a primary-washed fill plus a glow) so first impression
is unmistakably "glass," not "card with a blur filter bolted on." **Stats**
follows with a row of `light` glass tiles — the faintest variant — building
trust through numbers while proving the primitive also works at low
emphasis, tiled and dense.

**FeatureGrid** does the explaining as a bento: a `tinted` anchor cell spans
2×2 among `light` singles and half-row cells, so the grid itself demonstrates
the intensity range (light → tinted) at a glance while breaking the product
into scannable capabilities. **Testimonial** pulls back to one `frosted`
panel — the system's middle intensity — floating alone with generous
padding, because a single human voice needs room, not a grid cell.
**Pricing** raises the stakes again: two `light` tiers flank one `tinted`
tier lifted with a primary glow, the same anchor-cell trick from the bento
now steering a purchase decision. **CTA** is the climax — a `tinted` panel
sitting inside a locally intensified version of the canvas glow, the single
brightest, most saturated moment on the page, so the closing message reads
as a payoff rather than a formality. **Footer** settles back down to a quiet
glass shelf — translucent but understated — the calm landing after the
pitch. The intensity arc (thin → tinted → light → mixed → frosted → mixed →
tinted+glow → quiet) is deliberate: it keeps the eye moving by varying how
hard the glass "shines" at each stop, rather than repeating the same panel
weight for eight sections in a row.
