// A pile of cards that pins as the page scrolls: each card keeps a strip visible
// at the top, and the ones behind sit progressively inset so the set reads as
// receding into the page.
//
// `position: sticky` at stepped offsets is the entire mechanism. That is a
// LAYOUT, not a script — so this component has no state, no effects, no hooks and
// nothing to hydrate, and it does exactly the same thing on a page that never
// loads any JavaScript.
//
// It used to be `CardStack`'s `layout="peek"`. Splitting it out was a production
// fix, not tidying: hydration is inferred per FILE, so sharing a file with the
// deck's `useState` meant every page using this pile was marked `@hydrate` and
// shipped a drag threshold, a keyboard map and a live region it would never run.
// The two share almost no code — that they read as one component with a `layout`
// prop was a naming coincidence, and the shared file cost every consumer bytes.
//
// Nothing here is interactive, and the markup says so: no group role, no tab
// stop, no live region, no `inert`. Every card is fully readable at once, in
// document order. The stacking is what SCROLLING does to it.

import { Children, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One card, when the pile is driven by data rather than authored markup. */
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
 * Cards drawn as a pile that pins under one another as the page scrolls, each
 * keeping a header strip visible. Pure CSS: no JavaScript, no hydration.
 *
 * Pass the authored cards as `children` to keep the design's own markup — this
 * component positions them and never draws them. `items` is a data fallback so
 * the pile can be previewed, since a showcase must be static literals.
 */
export interface ScrollStackProps {
  /** The authored cards, one node each. Takes precedence over `items`. Each one
   *  needs whatever should stay visible inside its first `peek` px. */
  children?: ReactNode;
  /** Data cards, used when there are no children. 2–8 entries. */
  items?: ScrollStackItem[];
  /** Px of each card left showing above the next. Default 56 — one header row. */
  peek?: number;
  /** Px each card further back is inset on each side, which is what makes the
   *  pile look like it recedes. Default 16. 0 for a flush stack. */
  inset?: number;
  /** Classes for the pile's own box — constrain the measure here. */
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
  peek = 56,
  inset = 16,
  className,
  cardClassName,
  id,
}: ScrollStackProps) {
  // Authored children win. `Children.toArray` drops nullish entries and keys the
  // rest, so a section mapping over its own data with a conditional doesn't leave
  // a hole in the pile.
  const authored = Children.toArray(children).filter(
    (c) => isValidElement(c) || typeof c === 'string',
  );
  const cards: ReactNode[] =
    authored.length > 0
      ? authored
      : (items ?? []).map((item, i) => <PileCard key={i} item={item} n={i + 1} />);
  const count = cards.length;
  if (count === 0) return null;

  const rootId = id ?? `scroll-stack-${contentId((items ?? []).map((item) => item.title))}`;

  return (
    // `data-slot`, following the idiom the _base primitives already use: a stable
    // hook a design system can target for the parts this component owns without
    // depending on our class names.
    //
    // Note the root deliberately has NO `overflow-x-clip`. A clipping ancestor is
    // the classic way to break `position: sticky`, and sticky is the whole
    // component. There is no rotation here to need clipping.
    <div data-slot="scroll-stack" className={cn('relative', className)}>
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
    // The shape this was designed for: numbered narrative sections that pin under
    // one another as the page scrolls.
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
    // Both axes plus the count that stresses them: `peek: 40, inset: 0` is the
    // flush variant, and six cards is where the stacked sticky offsets add up far
    // enough to push the last card's pin down the viewport.
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
];
