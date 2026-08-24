// Cards stacked with their headers showing, driven by the page's scroll. Two
// modes, both zero JavaScript:
//
//   pile     — cards sit in document order and PIN under one another as the page
//              scrolls past them: `position: sticky` at stepped offsets, and the
//              stacking is what scrolling does to the layout.
//   shuffle  — the stack is already formed, every card's header visible as a rim
//              above the front card, and the whole thing pins while scrolling
//              PULLS the front card partway down off the stack — the direction
//              the reader is scrolling, so the scroll reads as the hand doing
//              the pulling — where it slips under and rides back up into the
//              deepest rim. One card per scroll segment; scroll up and the
//              shuffle runs backwards, because a scrubbed animation is
//              bidirectional by nature.
//
// The shuffle is CSS scroll-driven animation, the substrate's own mechanism
// (see _base/src/motion/motion.css): the root carries a named `view-timeline`,
// each card gets machine-generated keyframes covering its whole journey —
// front, pulled down, tucked under, climb one slot per segment — and the
// scrubbing is the browser's. No state, no effects, no hooks, nothing to
// hydrate; it works identically on a page that never loads JavaScript.
//
// The degrade is the other mode, on purpose. All shuffle CSS sits behind
// `@supports (animation-timeline: view())` AND `prefers-reduced-motion:
// no-preference`; the ungated rules ARE the pile. A browser without
// scroll-driven animations, or a reader who asked for less motion, gets the
// pinned pile — every card still fully readable in document order — rather
// than a stack whose buried cards can never be reached. A degrade that loses
// CONTENT would fail this catalog's contract; a degrade to the sibling
// behaviour loses only flourish.
//
// Nothing here is interactive in either mode, and the markup says so: no group
// role, no tab stop, no live region, no `inert`. The shuffle is what SCROLLING
// does to the stack.

import { Children, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One card, when the stack is driven by data rather than authored markup. */
export interface ScrollStackItem {
  /** Card heading. Shown twice — once in the strip that stays visible when the
   *  card is behind, once in the body. 2–8 words. */
  title: string;
  /** Card body copy. 1–3 sentences. */
  body?: string | null;
  /** Small label above the title, e.g. a category or step. */
  kicker?: string | null;
  /** Card image. @kind image */
  image?: string | null;
}

/**
 * Cards stacked with their headers visible, driven by the page's scroll — as a
 * pile that forms while you scroll past it, or a formed stack that shuffles its
 * front card to the back as you scroll. Pure CSS: no JavaScript, no hydration.
 *
 * Pass the authored cards as `children` to keep the design's own markup — this
 * component positions them and never draws them. `items` is a data fallback so
 * the stack can be previewed, since a showcase must be static literals.
 */
export interface ScrollStackProps {
  /** The authored cards, one node each. Takes precedence over `items`. Each one
   *  needs whatever should stay visible inside its first `peek` px. */
  children?: ReactNode;
  /** Data cards, used when there are no children. 2–8 entries. */
  items?: ScrollStackItem[];
  /**
   * How scrolling drives the stack.
   *
   * `pile` — cards pin under one another as the page scrolls past them; the
   *   stack FORMS as you go. Cards stay in document flow at their natural
   *   heights.
   * `shuffle` — the stack is already formed with every header visible, pinned
   *   for `perCard` viewport-heights per card while scroll scrubs the front
   *   card to the back. Falls back to `pile` under `prefers-reduced-motion`
   *   and in browsers without CSS scroll-driven animations. Cards are clipped
   *   to the pinned box, so keep a card's content under a screen tall.
   */
  mode?: 'pile' | 'shuffle';
  /** Px of each card left showing above the next. Default 56 — one header row. */
  peek?: number;
  /** `pile` only: px each card further back is inset on each side, which is what
   *  makes the pile look like it recedes. Default 16. 0 for a flush stack.
   *  (`shuffle` draws depth with the stepped rims alone — a scale taper would
   *  shrink each rim's own tap target below 44px.) */
  inset?: number;
  /** `shuffle` only: how much scroll sends one card to the back, in
   *  viewport-heights. Default 0.75 — under half feels twitchy, over 1.5 feels
   *  stuck. */
  perCard?: number;
  /** Classes for the stack's own box — constrain the measure here. */
  className?: string;
  /** Classes for each card's positioning wrapper. */
  cardClassName?: string;
  /** Id root. Each card gets `<id>-card-<n>`, so a link elsewhere on the page can
   *  point at one. */
  id?: string;
}

/**
 * A stable id derived from the component's own content.
 *
 * Not `useId`: this component is static — no `@hydrate`, no client JS — and a
 * hook would make it a client component for the sake of a string.
 */
function contentId(parts: string[]): string {
  let hash = 0;
  for (const char of parts.join(' ')) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * An author's `id` as something a CSS selector and a timeline name can carry.
 * A CSS identifier cannot start with a digit, and one invalid selector drops a
 * whole generated rule — same rule and same reason as Tabs.
 */
function safeId(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_-]/g, '-');
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : `stack-${cleaned}`;
}

/**
 * The shuffle, as one generated stylesheet — the same move Tabs makes: a
 * component that needs CSS the utility layer cannot express ships that CSS with
 * itself, computed from props on the server.
 *
 * Layout math: with `n` cards there are `n-1` scroll segments. During segment
 * `j`, card `j` (the front) is pulled partway down past the stack, slips under
 * at the lowest point of the pull, and rides back up behind the stack into the
 * deepest slot; every other card climbs one slot. A card's
 * slot after `j` segments is `(i - j + n) % n`, and each slot `s` sits
 * `s * peek` px higher — full width at every depth, because each rim is also
 * a tap target that must not shrink.
 *
 * The ungated rules at the top ARE the pile — they are what a reader gets when
 * the gated block does not apply, and the gated block resets exactly the
 * properties the pile set (margins, tops, position). Order matters: the gated
 * block comes last, so on ties it wins.
 */
function shuffleCss(
  rootId: string,
  count: number,
  peek: number,
  inset: number,
  perCard: number,
): string {
  const segments = count - 1;
  const L = 100 / segments;
  const rim = segments * peek;
  const pct = (v: number) => `${Math.min(100, Math.max(0, v)).toFixed(3)}%`;
  // No scale taper on the slots, and the reason is the tap target: each rim IS
  // a `peek`-tall link, and a rim inside a scale(0.84) wrapper is a 37px
  // target — under the 44px contract by exactly the amount of decoration.
  // Depth reads from the stepped offsets and the card borders instead.
  const pose = (s: number) => `translateY(${-s * peek}px)`;

  const fallback = [
    `#${rootId} > [data-shuffle-pin] { display: contents; }`,
    // The jump affordance is a SHUFFLE affordance: in the pile fallback every
    // card is already on the page in order, so the links and their anchors
    // simply don't exist there.
    `#${rootId} [data-shuffle-jump], #${rootId} [data-shuffle-link] { display: none; }`,
    ...Array.from({ length: count }, (_, i) =>
      [
        `#${rootId} .${rootId}-c${i} { position: sticky;`,
        `top: ${i * peek}px; z-index: ${i + 1};`,
        `margin-inline: ${(count - 1 - i) * inset}px;`,
        `margin-bottom: ${i === count - 1 ? 0 : peek}px; }`,
      ].join(' '),
    ),
  ];

  const frames = Array.from({ length: count }, (_, i) => {
    const stops: string[] = [];
    for (let j = 0; j <= segments; j += 1) {
      const s = (i - j + count) % count;
      stops.push(`${pct(j * L)} { transform: ${pose(s)}; z-index: ${count - s}; opacity: 1; }`);
    }
    if (i < segments) {
      // The pull, scrubbed: the front card is dragged DOWN past the stack — the
      // same direction the reader is scrolling, so the scroll reads as the hand
      // doing the pulling — but only PARTWAY, about half its own box, not off
      // the screen. At the lowest point it slips under: a tight dissolve
      // (~10% of the segment, a blink at normal scroll speed) hides the z
      // handoff — which would otherwise pop wherever the pulled card still
      // overlaps the incoming front, and how much they overlap depends on
      // content no stylesheet can know — then it re-emerges behind the stack
      // and rides up into the deepest rim. Pulled from the top, tucked under.
      stops.push(
        `${pct((i + 0.4) * L)} { transform: translateY(48%) rotate(2.5deg); z-index: ${count}; opacity: 1; }`,
        `${pct((i + 0.46) * L)} { transform: translateY(56%) rotate(2.5deg); z-index: ${count}; opacity: 0; }`,
        `${pct((i + 0.5) * L)} { transform: translateY(56%) rotate(2.5deg); z-index: 1; opacity: 0; }`,
        `${pct((i + 0.56) * L)} { transform: translateY(48%) scale(0.98); z-index: 1; opacity: 1; }`,
      );
    }
    return `@keyframes ${rootId}-k${i} {\n${stops.map((s) => `  ${s}`).join('\n')}\n}`;
  });

  const gated = [
    '@media (prefers-reduced-motion: no-preference) {',
    '@supports (animation-timeline: view()) {',
    // The tall root IS the timeline: `contain 0% 100%` spans exactly the stretch
    // where the root fully covers the viewport, which is exactly when the pin
    // inside it is stuck — the scrub maps 1:1 onto the pinned time.
    `#${rootId} { height: ${100 + segments * perCard * 100}vh; height: ${100 + segments * perCard * 100}svh; view-timeline-name: --${rootId}; }`,
    // `overflow: clip` (never `hidden`, which would make a scroll container and
    // freeze every view() timeline inside — the motion.css gotcha): whatever a
    // transform pushes past the pin's edges is cut there rather than leaking
    // into the page's scrollable overflow.
    `#${rootId} > [data-shuffle-pin] { display: block; position: sticky; top: 0; height: 100vh; height: 100svh; overflow: clip; }`,
    // `animation-range: contain` — the bare keyword, deliberately. The longhand
    // `contain 0% 100%` READS as the same thing and is not: in the shorthand a
    // bare percentage does not inherit the preceding range name, so `100%` means
    // 100% of the WHOLE timeline (the cover range) — the scrub then ends ~40%
    // early, every boundary lands one segment behind the scroll, and the final
    // card can never reach the front. Start and end were silently measured
    // against different ranges, and nothing warns.
    `#${rootId} [data-slot="scroll-stack-item"] { position: absolute; left: 0; right: 0; top: ${rim}px; bottom: 0; margin: 0; overflow: hidden; transform-origin: top center; animation: 1s linear both; animation-timeline: --${rootId}; animation-range: contain; }`,
    ...Array.from(
      { length: count },
      (_, i) => `#${rootId} .${rootId}-c${i} { animation-name: ${rootId}-k${i}; }`,
    ),
    // Click-to-jump, the platform's way. Each card's header rim is a fragment
    // link to an invisible anchor parked at that card's segment boundary inside
    // the tall root — navigating there puts the root's view progress exactly at
    // the boundary where that card is front. The scrub is DERIVED from scroll
    // position, so the jump cannot desync from the animation: they are the same
    // number.
    // `display: block` here is load-bearing, not styling: the fallback hides
    // these anchors unconditionally, and a display:none element has NO BOX —
    // and a fragment navigation to a boxless target scrolls nowhere at all.
    // The links worked and the destinations didn't exist; this is the line
    // that makes them exist.
    `#${rootId} > [data-shuffle-jump] { display: block; position: absolute; }`,
    ...Array.from(
      { length: count },
      (_, i) =>
        `#${rootId} > [data-shuffle-jump]:nth-of-type(${i + 1}) { top: ${(i * perCard * 100).toFixed(2)}vh; top: ${(i * perCard * 100).toFixed(2)}svh; }`,
    ),
    // The link overlays the card's top `peek` px — exactly the strip that stays
    // visible when the card is behind, so "click the header you can see" is the
    // whole interaction. It rides the card's own animated wrapper, which is what
    // keeps the hit area on the rim wherever the rim currently is.
    `#${rootId} [data-shuffle-link] { display: block; position: absolute; inset-inline: 0; top: 0; height: ${peek}px; }`,
    // Global on purpose, and gated twice: fragment jumps animate the scroll —
    // which PLAYS the shuffle scrub in between — only where scroll-driven
    // animations exist at all, and never for reduced-motion readers (this whole
    // block sits inside that media query). The one page-wide side effect this
    // catalog ships, stated rather than hidden.
    'html { scroll-behavior: smooth; }',
    ...frames,
    '}',
    '}',
  ];

  return [...fallback, ...gated].join('\n');
}

/**
 * The data card: a header strip that stays visible when the next card covers this
 * one, then the body.
 *
 * The header is what the layout is FOR — it is the part still on screen once the
 * card is behind, so it carries the number and the title. A design passing its own
 * cards as `children` replaces all of this.
 */
function PileCard({ item, n }: { item: ScrollStackItem; n: number }) {
  return (
    <article className="overflow-hidden rounded-[inherit] border bg-card text-card-foreground">
      <header className="flex items-center gap-3 px-6 py-4">
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {String(n).padStart(2, '0')}
        </span>
        <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
        <span aria-hidden className="ml-auto text-muted-foreground">
          ↓
        </span>
      </header>
      <div className="grid gap-6 border-t px-6 py-8 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-3">
          {item.kicker ? (
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{item.kicker}</p>
          ) : null}
          <h4 className="text-2xl font-semibold tracking-tight md:text-3xl">{item.title}</h4>
          {item.body ? <p className="text-sm text-muted-foreground">{item.body}</p> : null}
        </div>
        {item.image ? (
          <img src={item.image} alt="" className="h-56 w-full rounded-md object-cover" />
        ) : (
          <div className="h-56 w-full rounded-md bg-muted" />
        )}
      </div>
    </article>
  );
}

export function ScrollStack({
  children,
  items,
  mode = 'pile',
  peek = 56,
  inset = 16,
  perCard = 0.75,
  className,
  cardClassName,
  id,
}: ScrollStackProps) {
  // Authored children win. `Children.toArray` drops nullish entries and keys the
  // rest, so a section mapping over its own data with a conditional doesn't leave
  // a hole in the stack.
  const authored = Children.toArray(children).filter(
    (c) => isValidElement(c) || typeof c === 'string',
  );
  const cards: ReactNode[] =
    authored.length > 0
      ? authored
      : (items ?? []).map((item, i) => <PileCard key={i} item={item} n={i + 1} />);
  const count = cards.length;
  if (count === 0) return null;

  const rootId = id
    ? safeId(id)
    : `scroll-stack-${contentId((items ?? []).map((item) => item.title))}`;

  // A one-card shuffle has nothing to shuffle (and its segment math divides by
  // zero) — it is a pile of one either way.
  if (mode === 'shuffle' && count > 1) {
    return (
      // No overflow on the ROOT: an ancestor scroll container is what freezes a
      // view() timeline, and the root is the timeline's subject. The pin inside
      // clips instead.
      <div id={rootId} data-slot="scroll-stack" data-mode="shuffle" className={cn('relative', className)}>
        <style>{shuffleCss(rootId, count, peek, inset, perCard)}</style>
        {/* The jump targets: zero-size, parked at each segment boundary by the
            generated CSS. In the root and NOT the pin — the pin is sticky, and a
            fragment target that moves with the scroll is a target the browser
            can never settle on. */}
        {cards.map((_, i) => (
          <div key={i} id={`${rootId}-jump-${i + 1}`} data-shuffle-jump="" aria-hidden />
        ))}
        <div data-shuffle-pin="">
          {cards.map((card, i) => (
            <div
              key={i}
              id={`${rootId}-card-${i + 1}`}
              data-slot="scroll-stack-item"
              className={cn(`${rootId}-c${i}`, 'rounded-xl', cardClassName)}
            >
              {card}
              {/* A real link, so the keyboard and the focus ring are the
                  platform's. It covers the header strip — the part of a buried
                  card you can see is the part you can click. Keep that strip
                  free of the card's own interactive content in shuffle mode. */}
              <a
                data-shuffle-link=""
                href={`#${rootId}-jump-${i + 1}`}
                aria-label={`Go to ${items?.[i]?.title ?? `card ${i + 1}`}`}
                className="rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // `data-slot`, following the idiom the _base primitives already use: a stable
    // hook a design system can target for the parts this component owns without
    // depending on our class names.
    //
    // Note the root deliberately has NO `overflow-x-clip`. A clipping ancestor is
    // the classic way to break `position: sticky`, and sticky is the whole
    // component. There is no rotation here to need clipping.
    <div id={rootId} data-slot="scroll-stack" data-mode="pile" className={cn('relative', className)}>
      {cards.map((card, i) => {
        const behind = count - 1 - i;
        return (
          <div
            key={i}
            id={`${rootId}-card-${i + 1}`}
            data-slot="scroll-stack-item"
            className={cn('sticky rounded-xl', cardClassName)}
            style={{
              // Each card pins one strip lower than the one before, so the headers
              // fan down the top of the viewport as the pile grows.
              top: i * peek,
              // Later cards cover earlier ones, matching document order.
              zIndex: i + 1,
              // The static inset is what reads as depth. Doing it with margin
              // rather than a transform keeps the sticky box honest: a scaled card
              // still occupies its unscaled height, which would leave a gap under
              // the pile.
              marginInline: behind * inset,
              // Nothing but the last card needs room below it; the pile forms
              // because each card scrolls up under the next.
              marginBottom: i === count - 1 ? 0 : peek,
            }}
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}

export const ScrollStackShowcase = [
  {
    // The shape the pile was designed for: numbered narrative sections that pin
    // under one another as the page scrolls.
    label: 'Pinned narrative',
    props: {
      className: 'max-w-3xl',
      items: [
        {
          kicker: 'How it works',
          title: 'How it works',
          body: 'Kopla reads your tokens, type styles and pipeline data, then writes the narrative and lays it out. You review and send.',
        },
        {
          kicker: 'Why Kopla',
          title: 'Why Kopla',
          body: 'One design system, every channel. The look is decided once and applied everywhere without a hand-off.',
        },
        {
          kicker: 'What it makes',
          title: 'What it makes',
          body: 'Landing pages, release notes, campaign microsites — published to your own domain in a couple of minutes.',
        },
      ],
    },
  },
  {
    // Both pile axes plus the count that stresses them: `peek: 40, inset: 0` is
    // the flush variant, and six cards is where the stacked sticky offsets add up
    // far enough to push the last card's pin down the viewport.
    label: 'Flush, six cards',
    props: {
      className: 'max-w-3xl',
      peek: 40,
      inset: 0,
      items: [
        { title: 'Stage one', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage two', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage three', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage four', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage five', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage six', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    // Two cards, an overlong heading and no body in one case: a combined
    // adversarial case is likelier to break a layout than three tidy ones.
    label: 'Two cards, overlong heading, no body',
    props: {
      className: 'max-w-3xl',
      items: [
        {
          title:
            'A deliberately overlong card heading that has to wrap onto several lines without pushing the strip out of the card',
        },
        { title: 'Short one' },
      ],
    },
  },
  {
    // The formed stack: every header visible as a rim, scroll scrubs the front
    // card to the back. Scroll up and it shuffles backwards.
    label: 'Shuffle — three cards',
    props: {
      mode: 'shuffle',
      className: 'max-w-2xl',
      items: [
        {
          kicker: 'Discover',
          title: 'Discover',
          body: 'What the audit turns up, and what it means for the system you already have.',
        },
        {
          kicker: 'Design',
          title: 'Design',
          body: 'The system, decided once — tokens, type and components in one place.',
        },
        {
          kicker: 'Deliver',
          title: 'Deliver',
          body: 'Published to your own domain, measured in your own analytics.',
        },
      ],
    },
  },
  {
    label: 'Shuffle — five cards, tight strip',
    props: {
      mode: 'shuffle',
      className: 'max-w-2xl',
      peek: 44,
      items: [
        { title: 'Stage one', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage two', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage three', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage four', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage five', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    label: 'Shuffle — two cards, overlong heading, no body',
    props: {
      mode: 'shuffle',
      className: 'max-w-2xl',
      items: [
        {
          title:
            'A deliberately overlong card heading that has to wrap onto several lines without pushing the strip out of the card',
        },
        { title: 'Short one' },
      ],
    },
  },
];
