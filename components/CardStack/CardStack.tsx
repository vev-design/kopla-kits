// A deck of cards with one on top. Sending the top card away brings up the next
// and puts it at the back, so the deck cycles forever.
//
// This component owns the MECHANICS and nothing about appearance: which card is
// on top, the z-order, the drag threshold, the throw, the keyboard map, the live
// announcement, and honouring reduced motion. What a card LOOKS like is the
// design's — pass the authored cards as `children` and this positions them
// without drawing anything itself.
//
// Three decisions shape the whole file:
//
//   * The TOP card is in normal flow; only the cards behind are absolutely
//     positioned over it. So the deck is exactly as tall as its top card plus
//     the rim of cards peeking above — no required height class, no dead space
//     under short content, and no way to render a 0px-tall deck by forgetting
//     one. (The previous version positioned every card absolutely, which
//     demanded a hard-coded height and showed half-empty cards inside it.)
//   * The cards behind peek UPWARD, a clear `offset` px rim each, scaled from
//     their top edge so they taper without hiding. A deck must read as a deck
//     at rest; rims the size of a hairline do not.
//   * A card sent away FLIES OUT in the gesture's direction before re-entering
//     at the back. The gesture keeps its momentum; under reduced motion the
//     flight is skipped and the deck simply cycles.
//
// Two content routes, and the split is deliberate:
//
//   children — the real one. One node per card, authored exactly as the design
//              draws it. A design that was imported from Figma comes through
//              here, so nothing about the card is this component's opinion.
//   items    — a data fallback, and what the showcase uses. A showcase must be
//              static JSON-serializable literals (the design extractor reads
//              literals only), and a ReactNode is not one — so without `items`
//              this component could not be previewed at all.
//
// Unhydrated it renders the whole deck with the first card on top: every card's
// content is in the DOM and readable, the cycling is simply unavailable. That is
// the state a published page shows when the section using it forgot `@hydrate`.
//
// The gesture code carries three lessons, each shipped as a bug once:
//
//   * `setPointerCapture` retargets the following `click` to the capturing
//     element, so there is no `onClick` anywhere — tap and drag are both decided
//     on release, from the distance travelled.
//   * `pointercancel` is NOT a release. It is the browser saying "this gesture
//     was never yours" — a page scroll, usually. Treating it as a release made
//     scrolling past the deck on a phone shuffle it: the near-zero horizontal
//     travel of a vertical scroll read as a tap.
//   * `touch-action: pan-y` splits the axes with the browser up front:
//     horizontal is the deck's, vertical stays native scroll. Without it the
//     browser cancels drags whenever it likes.

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Children, isValidElement } from 'react';
import { cn } from '@/lib/utils';

/** One card, when the deck is driven by data rather than authored markup. */
export interface CardStackItem {
  /** Card heading. 2–8 words. */
  title: string;
  /** Card body copy. 1–3 sentences. */
  body?: string | null;
  /** Small label above the title, e.g. a category or step. */
  kicker?: string | null;
  /** Card image. @kind image */
  image?: string | null;
}

/**
 * A shuffling deck of cards: the top card is sent to the back by clicking or
 * dragging it, revealing the next one. The deck sizes itself from the top card —
 * constrain the width at the call site and the height follows the content.
 *
 * Pass the cards as `children` to keep the design's own markup — this component
 * positions them and owns the interaction, never their appearance.
 * @hydrate
 */
export interface CardStackProps {
  /** The authored cards, one node each. Takes precedence over `items`. */
  children?: ReactNode;
  /** Data cards, used when there are no children. 2–8 entries. */
  items?: CardStackItem[];
  /** How the top card is sent to the back. */
  advanceOn?: 'both' | 'click' | 'drag';
  /** Which card starts on top. Default 0. */
  defaultIndex?: number;
  /** Controlled top-card index. Pair with `onIndexChange`. */
  index?: number;
  /** Fires with the new top-card index whenever the deck cycles. */
  onIndexChange?: (index: number) => void;
  /** Px of rim each card behind shows above the one in front of it. Default 14. */
  offset?: number;
  /** How much the top card rotates while dragged and thrown, in degrees per
   *  ~120px of travel. Default 3. 0 keeps the card square in the hand. */
  tilt?: number;
  /** Classes for the deck's own box — constrain the WIDTH here (e.g.
   *  `max-w-sm`). Height comes from the top card's content. */
  className?: string;
  /** Classes for each card's positioning wrapper. */
  cardClassName?: string;
  /** Id root. Each card gets `<id>-card-<n>`, so a link elsewhere on the page
   *  can point at one. */
  id?: string;
}

/** How many cards are drawn behind the top one. Deeper cards stay in the DOM
 *  (their content is real) but are not painted — a stack of nine visible rims
 *  is noise, not depth. */
const VISIBLE_DEPTH = 3;

/** Drag distance that counts as "sent away", as a fraction of the deck's width,
 *  floored so a narrow deck on a phone doesn't advance on a stray tap-slide. */
const SWIPE_FRACTION = 0.25;
const SWIPE_MIN_PX = 64;

/** Movement under this counts as a tap rather than an abandoned drag. A finger
 *  never travels exactly zero pixels. */
const TAP_SLOP = 10;

/** The throw's duration. The transition class and the cycle timer both derive
 *  from it, so the card cannot land before or after its own flight. */
const FLY_MS = 200;

function DataCard({ item }: { item: CardStackItem }) {
  return (
    <article className="flex flex-col gap-3 overflow-hidden rounded-[inherit] border bg-card p-6 text-card-foreground">
      {item.image ? (
        <img src={item.image} alt="" className="h-40 w-full rounded-md object-cover" />
      ) : null}
      {item.kicker ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.kicker}
        </p>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
      {item.body ? <p className="text-sm text-muted-foreground">{item.body}</p> : null}
    </article>
  );
}

export function CardStack({
  children,
  items,
  advanceOn = 'both',
  defaultIndex = 0,
  index: controlledIndex,
  onIndexChange,
  offset = 14,
  tilt = 3,
  className,
  cardClassName,
  id,
}: CardStackProps) {
  // Authored children win. `Children.toArray` drops nullish entries and keys the
  // rest, so a section mapping over its own data with a conditional doesn't leave
  // a hole in the deck.
  const authored = Children.toArray(children).filter((c) => isValidElement(c) || typeof c === 'string');
  const cards: ReactNode[] =
    authored.length > 0 ? authored : (items ?? []).map((item, i) => <DataCard key={i} item={item} />);
  const count = cards.length;

  const autoId = useId();
  const rootId = id ?? `stack-${autoId.replace(/[:]/g, '')}`;

  const [uncontrolled, setUncontrolled] = useState(defaultIndex);
  const isControlled = controlledIndex !== undefined;
  const top = count > 0 ? ((isControlled ? controlledIndex : uncontrolled) % count + count) % count : 0;

  const setTop = useCallback(
    (next: number) => {
      if (count === 0) return;
      const wrapped = ((next % count) + count) % count;
      if (!isControlled) setUncontrolled(wrapped);
      onIndexChange?.(wrapped);
    },
    [count, isControlled, onIndexChange],
  );

  // ── the throw ───────────────────────────────────────────────────────
  // `leaving` is the flight: the top card is mid-air in `dir`, input is ignored,
  // and when the timer lands the deck cycles. `snapped` is the card that just
  // landed at the back — it gets ONE transition-free render so it appears there
  // instead of visibly sliding back across the deck from off-screen.
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const [snapped, setSnapped] = useState<number | null>(null);
  const flyTimer = useRef(0);
  const snapTimer = useRef(0);
  useEffect(
    () => () => {
      window.clearTimeout(flyTimer.current);
      window.clearTimeout(snapTimer.current);
    },
    [],
  );

  const fly = useCallback(
    (dir: 1 | -1) => {
      if (count < 2 || leaving) return;
      // Reduced motion: no flight, no 200ms of nothing — the deck just cycles.
      // The transitions are motion-safe anyway; this skips the dead time too.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTop(top + 1);
        return;
      }
      const flying = top;
      setLeaving(dir);
      flyTimer.current = window.setTimeout(() => {
        setLeaving(0);
        setSnapped(flying);
        setTop(top + 1);
        snapTimer.current = window.setTimeout(() => setSnapped(null), 40);
      }, FLY_MS + 30);
    },
    [count, leaving, setTop, top],
  );

  const retreat = useCallback(() => {
    if (count < 2 || leaving) return;
    setTop(top - 1);
  }, [count, leaving, setTop, top]);

  // ── the gesture ─────────────────────────────────────────────────────
  // Pointer Events, not mouse or touch events: one code path covers mouse, pen
  // and touch, and `setPointerCapture` keeps the gesture alive when the pointer
  // leaves the card — which is exactly what a fling does.
  const boxRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const canDrag = advanceOn === 'drag' || advanceOn === 'both';
  const canClick = advanceOn === 'click' || advanceOn === 'both';

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (count < 2 || leaving) return;
    // A press that lands on a link or button inside the card belongs to that
    // control, not to the deck — authored cards routinely hold a CTA. Leaving
    // `dragStart` null is what makes the release a no-op.
    if ((e.target as HTMLElement).closest('a,button,input,select,textarea,[data-no-drag]')) return;
    dragStart.current = e.clientX;
    if (canDrag) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null || !canDrag) return;
    setDragX(e.clientX - dragStart.current);
  };

  // ONE pointer path for both the tap and the fling, and no `onClick` anywhere:
  // `setPointerCapture` retargets the following `click` to the capturing element,
  // so a card's own click handler is a trap. Tap-vs-drag is decided here, on
  // release, from the distance travelled.
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const travelled = e.clientX - dragStart.current;
    dragStart.current = null;
    setDragX(0);
    const width = boxRef.current?.offsetWidth ?? 0;
    const threshold = Math.max(width * SWIPE_FRACTION, SWIPE_MIN_PX);
    if (canDrag && Math.abs(travelled) >= threshold) {
      // The throw continues the gesture: which way it flies is which way it was
      // going. Either direction advances — the direction is a gesture, not a
      // choice of card.
      fly(travelled > 0 ? 1 : -1);
      return;
    }
    // A press that barely moved is a tap. The slack is what keeps a tap on a
    // touchscreen — which never travels exactly zero px — from being read as an
    // abandoned drag.
    if (canClick && Math.abs(travelled) <= TAP_SLOP) fly(1);
  };

  // NOT the release handler. `pointercancel` means the browser reclaimed the
  // gesture — almost always because it became a page scroll — and a vertical
  // scroll travels ~0px horizontally, which the release path reads as a TAP.
  // Wired to the release handler, scrolling past the deck on a phone shuffled
  // it. The only correct response is to abandon cleanly.
  const onPointerCancel = () => {
    dragStart.current = null;
    setDragX(0);
  };

  // A deck that grew or shrank must not leave the top index past the end.
  useEffect(() => {
    if (count > 0 && top >= count) setTop(0);
  }, [count, top, setTop]);

  if (count === 0) return null;

  // The rim: how much room the cards behind need above the top card. Reserved as
  // padding so the deck's own box contains them — nothing overlaps the section
  // above, and the focus ring wraps the whole stack.
  const peekDepth = Math.min(count - 1, VISIBLE_DEPTH);
  const reserve = peekDepth * offset;

  return (
    <div
      // No overflow clipping, on purpose. At rest nothing exceeds the box (the
      // rim is padded for, and resting cards are never rotated), and clipping
      // would slice the drag and the throw at the deck's edge — the one moment
      // the card is SUPPOSED to leave the box. The transform is paint-only, so
      // nothing reflows; `isolate` keeps the z-order local.
      className={cn('relative isolate', className)}
      ref={boxRef}
      data-slot="card-stack"
    >
      {/* The whole deck is one stop in the tab order, with the arrow keys moving
          through it — the pattern a listbox uses. Focusing every buried card
          instead would make a five-card deck five tab stops of hidden content. */}
      <div
        role="group"
        aria-roledescription="Card deck"
        aria-label={`${count} cards`}
        tabIndex={0}
        style={{ paddingTop: reserve }}
        className={cn(
          'relative outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // `touch-pan-y` splits the axes with the browser before the gesture
          // starts: horizontal belongs to the deck, vertical stays native page
          // scroll. `select-none` because a horizontal drag over text otherwise
          // SELECTS it — the cost is that a draggable deck's copy cannot be
          // selected, which is the lesser loss. Click-only decks keep selection.
          canDrag && 'touch-pan-y select-none',
        )}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fly(1);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            retreat();
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {cards.map((card, i) => {
          const depth = (i - top + count) % count;
          const isTop = depth === 0;
          const buried = depth > VISIBLE_DEPTH;
          // Buried cards park AT the deepest rim slot, invisible, rather than
          // translating ever higher — surfacing is then a one-step move instead
          // of a dive in from far above the deck.
          const slot = Math.min(depth, VISIBLE_DEPTH);
          const style: CSSProperties = isTop
            ? {
                zIndex: count,
                transform: leaving
                  ? // The throw: past its own width, rotating with the motion,
                    // fading as it goes. Percentages, so no measuring.
                    `translateX(${leaving * 110}%) rotate(${leaving * tilt * 2}deg)`
                  : `translateX(${dragX}px) rotate(${(dragX * tilt) / 120}deg)`,
                opacity: leaving ? 0 : 1,
              }
            : {
                zIndex: count - depth,
                top: reserve,
                // The rim: each card behind sits `offset` px higher, scaled from
                // its TOP edge so the rim keeps its full height while the sides
                // taper — scaling from the center is what turned the previous
                // version's rims into hairlines.
                transform: `translateY(${-slot * offset}px) scale(${1 - slot * 0.04})`,
                transformOrigin: 'top',
                opacity: buried ? 0 : 1,
              };
          return (
            <div
              key={i}
              id={`${rootId}-card-${i + 1}`}
              data-slot="card-stack-item"
              className={cn(
                'rounded-xl',
                isTop
                  ? // In normal flow: the top card is what gives the deck its
                    // height. Everything else is painted over it.
                    'relative'
                  : // Pinned to the top card's box, clipped to it: a longer card
                    // behind must not hang out under the deck.
                    'absolute inset-x-0 bottom-0 overflow-hidden',
                isTop && (canDrag ? 'cursor-grab active:cursor-grabbing' : canClick ? 'cursor-pointer' : undefined),
                !isTop && 'pointer-events-none',
                // Reduced motion is honoured by the platform variant rather than
                // by a prop, so it is right by default and cannot be forgotten.
                // No transition while dragging (the card tracks the finger) and
                // none on the render where a thrown card lands at the back —
                // without that hold-out it slides visibly home from off-screen.
                dragStart.current === null &&
                  snapped !== i &&
                  'motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out',
                cardClassName,
              )}
              style={style}
              // React 19 renders `inert`, which removes the subtree from the tab
              // order AND from the accessibility tree — the correct answer for a
              // card sitting behind another, and better than aria-hidden alone
              // (which leaves its links focusable).
              inert={!isTop}
            >
              {card}
            </div>
          );
        })}
      </div>
      {/* Announced, not drawn: the deck's position is obvious to someone looking
          at it and invisible to someone who is not. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Card {top + 1} of {count}
      </div>
    </div>
  );
}

export const CardStackShowcase = [
  {
    label: 'Three cards',
    props: {
      className: 'max-w-sm',
      items: [
        { kicker: 'Trail', title: 'Sunrise ridge', body: 'A four-hour loop above the treeline, best before the heat.' },
        { kicker: 'Water', title: 'Cold lake swim', body: 'Twenty minutes from the trailhead, shallow at the north end.' },
        { kicker: 'Camp', title: 'Night under pines', body: 'Six pitches, a fire ring, and nothing else for a mile.' },
      ],
    },
  },
  {
    // Three adversarial dimensions in ONE case on purpose — the minimum item
    // count, a heading that has to wrap, and no body at all. A combined case is
    // likelier to break a layout than three tidy ones, and the label still names
    // it when it does.
    label: 'Two cards, overlong heading, no body',
    props: {
      className: 'max-w-sm',
      items: [
        { title: 'A deliberately overlong card heading that has to wrap onto several lines without pushing anything out of the card' },
        { title: 'Short one' },
      ],
    },
  },
  {
    // Longhand on purpose. `Array.from(...)` reads better and is WRONG here:
    // extract-design.mjs reads static literals only, so a generated showcase
    // entry is skipped entirely — it would still render in the component lab
    // (which imports the real module) while being absent from design.json.
    label: 'Ten cards',
    props: {
      className: 'max-w-sm',
      items: [
        { kicker: 'Day 1', title: 'Stage 1', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 2', title: 'Stage 2', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 3', title: 'Stage 3', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 4', title: 'Stage 4', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 5', title: 'Stage 5', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 6', title: 'Stage 6', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 7', title: 'Stage 7', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 8', title: 'Stage 8', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 9', title: 'Stage 9', body: 'One leg of the route, with a hut at the end of it.' },
        { kicker: 'Day 10', title: 'Stage 10', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    label: 'No image on one card',
    props: {
      className: 'max-w-sm',
      items: [
        { title: 'With a picture', body: 'This one has an image.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60' },
        { title: 'Without a picture', body: 'This one does not, and must not collapse.' },
        { title: 'With a picture again', body: 'Back to an image.', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60' },
      ],
    },
  },
  {
    label: 'Drag only, no tilt',
    props: {
      className: 'max-w-sm',
      tilt: 0,
      advanceOn: 'drag',
      items: [
        { title: 'No tilt', body: 'The card stays square in the hand while dragged.' },
        { title: 'Drag to advance', body: 'Clicking does nothing in this mode.' },
        { title: 'Third', body: 'And around again.' },
      ],
    },
  },
];
