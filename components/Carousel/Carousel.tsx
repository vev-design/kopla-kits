// A horizontal gallery on a scroll-snap track, with arrows, dots and optional
// auto-advance.
//
// The split between what the PLATFORM does and what JS adds is the whole design
// of this component, and it is not an implementation detail — it is what a
// published page ships:
//
//   free, no JS   the track itself. `overflow-x: auto` + `scroll-snap-type`
//                 gives touch swiping, trackpad and wheel scrolling, keyboard
//                 arrows on the focused track, and snapping to each slide. Every
//                 slide is real content in document order the whole time.
//   needs JS      the arrows, the dots, the announced position, and advancing on
//                 a timer. All of it is CONTROLS over a track that already
//                 works, so without JS the gallery degrades to a swipeable strip
//                 rather than to a dead one.
//
// Worth knowing for later: CSS is arriving at all of this — `::scroll-button()`
// and `::scroll-marker` give arrows and dots with no script at all. Not yet
// across the browsers a customer's page has to work in, so the controls are still
// JS here; when that changes, this component gets smaller.

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/** One slide, when the gallery is driven by data rather than authored markup. */
export interface CarouselItem {
  /** Slide heading. 2–8 words. */
  title: string;
  /** Slide body copy. 1–3 sentences. */
  body?: string | null;
  /** Small label above the title, e.g. a category. */
  kicker?: string | null;
  /** Slide image. @kind image */
  image?: string | null;
}

/**
 * A horizontal gallery of slides on a scroll-snap track, with arrows, dots and
 * optional auto-advance.
 *
 * Pass the slides as `children` to keep the design's own markup — this owns the
 * track and the controls, never a slide's appearance.
 * @hydrate
 */
export interface CarouselProps {
  /** The authored slides, one node each. Takes precedence over `items`. */
  children?: ReactNode;
  /** Data slides, used when there are no children. 2–10 entries. */
  items?: CarouselItem[];
  /** Which controls to draw over the track. The track scrolls and snaps without
   *  any of them. */
  controls?: 'arrows' | 'dots' | 'both' | 'none';
  /**
   * Advance on a timer, in milliseconds.
   *
   * Set this ONLY from the design's own timing — a Figma prototype's
   * `AFTER_TIMEOUT` delay is where it comes from. Leave it out and the carousel
   * does not auto-advance, which is the right default: how long a reader gets
   * with each slide is the design's decision, and inventing a number makes it
   * ours. Ignored under `prefers-reduced-motion`.
   */
  autoAdvanceMs?: number | null;
  /**
   * How many slides sit side by side from the `md` breakpoint up. Always one on a
   * phone, whatever this says.
   *
   * A string union rather than `1 | 2 | 3` because that is what becomes a VARIANT
   * AXIS: the extractor turns enum props into the matrix a designer flips through
   * in the component canvas, and a numeric union is silently not one — the prop
   * still works and simply stops being discoverable.
   */
  perView?: 'one' | 'two' | 'three';
  /** Wrap from the last slide back to the first when auto-advancing. */
  loop?: boolean;
  /** What the gallery IS, for a screen reader — "Customer stories", "Our work".
   *  A carousel announced only as "carousel" tells the reader nothing. */
  label?: string;
  /** Classes for the carousel's own box. */
  className?: string;
  /** Classes for each slide's wrapper. */
  slideClassName?: string;
  /** Id root. Each slide gets `<id>-slide-<n>`, so a link elsewhere on the page
   *  can point at one. */
  id?: string;
}

/** The gap between slides, in the one place both the class and the width
 *  calculation can read it. */
const GAP = '1rem';

const PER_VIEW = { one: 1, two: 2, three: 3 } as const;

function DataSlide({ item }: { item: CarouselItem }) {
  return (
    <article className="flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-6 text-card-foreground">
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

export function Carousel({
  children,
  items,
  controls = 'both',
  autoAdvanceMs,
  perView = 'one',
  loop = true,
  label,
  className,
  slideClassName,
  id,
}: CarouselProps) {
  const authored = Children.toArray(children).filter(
    (c) => isValidElement(c) || typeof c === 'string',
  );
  const slides: ReactNode[] =
    authored.length > 0 ? authored : (items ?? []).map((item, i) => <DataSlide key={i} item={item} />);
  const count = slides.length;

  const autoId = useId();
  const rootId = id ?? `carousel-${autoId.replace(/[:]/g, '')}`;

  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // The controls only exist once this has hydrated: an arrow that cannot scroll
  // is worse than no arrow, and the track underneath already swipes.
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);

  // Read from the media query rather than taken as a prop, so it is right by
  // default and cannot be forgotten at a call site. Live, because someone can
  // turn it on while the page is open.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false); // under the pointer, or holding focus
  const [announced, setAnnounced] = useState('');

  // The hover/focus that PRECEDED hydration. `pointerenter` and `focus` only
  // fire at boundaries, so a cursor already parked over the carousel — or a
  // keyboard focus already inside it, the track is focusable from the server —
  // when the handlers attach never announces itself, and the timer would start
  // moving slides under a pointer that thinks it is pausing them. Hydration has
  // to ASK. (Found by CI: a cold server made the test's hover land before the
  // handlers existed, which is exactly a slow reader's first second on the page.)
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (root.matches(':hover') || root.contains(document.activeElement)) {
      setHeld(true);
    }
  }, []);

  // Where the reader is HEADED, which is not the same as where the track has got
  // to. Two clicks of the forward arrow in quick succession must move two slides,
  // and a smooth scroll takes a few hundred milliseconds to arrive — so a second
  // click that counted from the measured position would ask for the slide already
  // being scrolled to and move nothing at all. Read it in an event handler, never
  // in render.
  const targetRef = useRef(0);
  // Resyncing the target after a scroll SETTLES is what keeps it honest: a swipe,
  // a wheel, a keyboard arrow and a snap-back all move the track without going
  // through this component, and after any of them the scroll position is the
  // truth. Debounced because there is no reliable `scrollend` across the browsers
  // a customer's page has to work in.
  const settleRef = useRef(0);

  // Where the track actually is, measured rather than counted.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const children = [...track.children] as HTMLElement[];
    let best = 0;
    let closest = Number.POSITIVE_INFINITY;
    children.forEach((el, i) => {
      const distance = Math.abs(el.offsetLeft - track.scrollLeft);
      if (distance < closest) {
        closest = distance;
        best = i;
      }
    });
    setCurrent(best);
    // A pixel of slack: fractional layout means an exactly-scrolled track
    // routinely lands a hair short of its own scrollWidth.
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);

    window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      targetRef.current = best;
    }, 120);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    track.addEventListener('scroll', measure, { passive: true });
    // Resize as well as scroll: how many slides fit changes with the viewport,
    // and with it whether the track is already at its end — which is what
    // disables the forward arrow.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', measure);
      observer.disconnect();
      window.clearTimeout(settleRef.current);
    };
  }, [measure, count]);

  const goTo = useCallback(
    (index: number, fromReader: boolean) => {
      const track = trackRef.current;
      const clamped = Math.max(0, Math.min(index, count - 1));
      const slide = track?.children[clamped] as HTMLElement | undefined;
      if (!track || !slide) return;
      targetRef.current = clamped;
      // `scrollTo` on the track, not `slide.scrollIntoView()`: scrollIntoView
      // scrolls every scrollable ancestor, so a carousel halfway down a page
      // yanks the whole document to itself on the first arrow press.
      track.scrollTo({ left: slide.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      // Announced only when the READER moved it. A carousel that narrates its
      // own timer talks over everything else on the page every few seconds.
      if (fromReader) setAnnounced(`Slide ${clamped + 1} of ${count}`);
    },
    [count, reduced],
  );

  /** One slide along from wherever the reader was last headed. */
  const step = useCallback(
    (direction: 1 | -1) => goTo(targetRef.current + direction, true),
    [goTo],
  );

  const advancing = Boolean(
    interactive && autoAdvanceMs && autoAdvanceMs > 0 && !reduced && playing && !held,
  );

  useEffect(() => {
    if (!advancing || !autoAdvanceMs) return;
    // The interval deliberately does NOT depend on the position: with `current`
    // in the dependency list every frame of a smooth scroll would restart the
    // countdown, and the carousel would never advance a second time.
    const timer = window.setInterval(() => {
      const next = targetRef.current + 1;
      if (next >= count) {
        if (loop) goTo(0, false);
        return;
      }
      goTo(next, false);
    }, autoAdvanceMs);
    return () => window.clearInterval(timer);
  }, [advancing, autoAdvanceMs, count, loop, goTo]);

  if (count === 0) return null;

  const showArrows = interactive && (controls === 'arrows' || controls === 'both');
  const showDots = interactive && (controls === 'dots' || controls === 'both');
  const rotating = Boolean(interactive && autoAdvanceMs && autoAdvanceMs > 0 && !reduced);

  return (
    <div
      ref={rootRef}
      data-slot="carousel"
      // The APG carousel pattern: a group whose role is DESCRIBED as a carousel,
      // named by what it holds. `aria-roledescription` without a real label
      // announces "carousel" and nothing else, which is why `label` exists.
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('flex flex-col gap-4', className)}
      // Pausing while the pointer is over it or focus is inside it: the pause
      // button satisfies the guideline, this is what stops the slide moving out
      // from under someone mid-sentence.
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div
        ref={trackRef}
        data-slot="carousel-track"
        // Focusable, and deliberately so: a scroll container that a mouse can
        // drag but a keyboard cannot reach is a WCAG failure, and one tab stop
        // buys the whole native arrow-key-and-snap behaviour with no key handler
        // of ours. `relative` so a slide's offsetLeft is measured from the track.
        tabIndex={0}
        aria-label={label ? `${label}, slides` : 'Slides'}
        className={cn(
          'relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-xl',
          // Smooth only when motion is welcome — this is what `scrollTo` inherits
          // for keyboard scrolling too.
          'motion-safe:scroll-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // The scrollbar is hidden because the dots are the affordance. Without
          // controls it stays, so a bare track never becomes a strip with no way
          // to tell it scrolls.
          controls !== 'none' && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        style={{ '--per-view': PER_VIEW[perView], '--slide-gap': GAP } as CSSProperties}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            id={`${rootId}-slide-${i + 1}`}
            data-slot="carousel-slide"
            // Each slide named by its position, per APG. Not `aria-hidden` when
            // off-screen: they are scrolled past, not withheld, and hiding them
            // would take real content out of the page for the one reader who
            // cannot see that it is merely off to the right.
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn(
              // One slide per view on a phone whatever `perView` says: three
              // cards across 360px is three unreadable cards.
              'shrink-0 basis-full snap-start',
              'md:basis-[calc((100%-(var(--per-view)-1)*var(--slide-gap))/var(--per-view))]',
              slideClassName,
            )}
          >
            {slide}
          </div>
        ))}
      </div>

      {showArrows || showDots || rotating ? (
        <div data-slot="carousel-controls" className="flex flex-wrap items-center gap-2">
          {rotating ? (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              // `aria-label`, never sr-only TEXT, on anything that only exists
              // once hydrated: sr-only text is real text, so it would show up in
              // the hydrated render and be absent from the unhydrated one, and
              // "does any content disappear without JS" would start failing on
              // the labels of controls rather than on content.
              aria-label={playing ? 'Pause the slideshow' : 'Play the slideshow'}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          ) : null}

          {showArrows ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={atStart}
                aria-label="Previous slide"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                // Disabled from the SCROLL POSITION, not from the index: with two
                // or three slides in view the last reachable index is not
                // `count - 1`, and an arrow that stays enabled at the end of the
                // track is an arrow that does nothing when pressed.
                disabled={atEnd}
                aria-label="Next slide"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          ) : null}

          {showDots ? (
            <div className="flex flex-wrap items-center gap-0.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i, true)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                  // 44px of button around an 8px dot. The dot is the drawing; the
                  // target is what a thumb has to hit.
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'size-2 rounded-full motion-safe:transition-colors',
                      i === current ? 'bg-primary' : 'bg-border',
                    )}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Empty until the reader moves the track themselves — see `goTo`. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </div>
    </div>
  );
}

export const CarouselShowcase = [
  {
    label: 'Three slides, arrows and dots',
    props: {
      label: 'Customer stories',
      className: 'max-w-3xl',
      items: [
        {
          kicker: 'Retail',
          title: 'Launched a campaign in an afternoon',
          body: 'Their design system was already in Figma. The landing page came out of it the same day.',
        },
        {
          kicker: 'Fintech',
          title: 'Forty pages, one system',
          body: 'Every regional page now reads as the same brand, because it is built from the same tokens.',
        },
        {
          kicker: 'Media',
          title: 'Release notes that ship themselves',
          body: 'Written from the changelog, laid out by the system, published to their own domain.',
        },
      ],
    },
  },
  {
    label: 'Two slides, arrows only',
    props: {
      label: 'Our work',
      className: 'max-w-3xl',
      controls: 'arrows',
      items: [
        { title: 'A brand refresh', body: 'Tokens first, pages after.' },
        { title: 'A product launch', body: 'One system, four channels.' },
      ],
    },
  },
  {
    label: 'Three per view',
    props: {
      label: 'Services',
      className: 'max-w-5xl',
      perView: 'three',
      items: [
        { title: 'Audit', body: 'What you have, and what it costs you.' },
        { title: 'System', body: 'Decided once, written down.' },
        { title: 'Build', body: 'Pages out of the system, not beside it.' },
        { title: 'Measure', body: 'What the pages did, in your own analytics.' },
        { title: 'Iterate', body: 'Change the token, not the forty pages.' },
      ],
    },
  },
  {
    // Longhand on purpose. `Array.from(...)` reads better and is WRONG here:
    // extract-design.mjs reads static literals only, so a generated case is
    // skipped entirely — it would still render in the component lab (which
    // imports the real module) while being absent from design.json.
    label: 'Ten slides',
    props: {
      label: 'The route',
      className: 'max-w-3xl',
      items: [
        { title: 'Stage 1', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 2', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 3', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 4', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 5', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 6', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 7', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 8', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 9', body: 'One leg of the route, with a hut at the end of it.' },
        { title: 'Stage 10', body: 'One leg of the route, with a hut at the end of it.' },
      ],
    },
  },
  {
    label: 'Long title, no body, no image',
    props: {
      label: 'Notes',
      className: 'max-w-3xl',
      items: [
        {
          title:
            'A deliberately overlong slide heading that has to wrap onto several lines without pushing anything out of the slide or the document',
        },
        { title: 'Short one' },
        { title: 'Another perfectly ordinary heading' },
      ],
    },
  },
  {
    label: 'Image on one slide only',
    props: {
      label: 'Gallery',
      className: 'max-w-3xl',
      items: [
        {
          title: 'With a picture',
          body: 'This one has an image.',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=60',
        },
        { title: 'Without a picture', body: 'This one does not, and must not collapse.' },
        {
          title: 'With a picture again',
          body: 'Back to an image.',
          image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60',
        },
      ],
    },
  },
  {
    // The interval here is the SHOWCASE's own number, chosen to be watchable in
    // the component lab. A real page's interval comes from the design's own
    // prototype timing, never from this file and never from a guess.
    label: 'Auto-advancing every 4s',
    props: {
      label: 'Featured',
      className: 'max-w-3xl',
      autoAdvanceMs: 4000,
      items: [
        { kicker: 'One', title: 'First up', body: 'Advances on its own, and stops when you touch it.' },
        { kicker: 'Two', title: 'Then this', body: 'The pause control is the first thing in the row.' },
        { kicker: 'Three', title: 'And back around', body: 'Because loop is on by default.' },
      ],
    },
  },
  {
    label: 'Auto-advancing, no loop, dots only',
    props: {
      label: 'Featured',
      className: 'max-w-3xl',
      autoAdvanceMs: 3000,
      loop: false,
      controls: 'dots',
      items: [
        { title: 'First', body: 'Runs to the end and stops there.' },
        { title: 'Second', body: 'No wrap-around.' },
        { title: 'Third', body: 'And that is where it stays.' },
      ],
    },
  },
  {
    label: 'Bare track, no controls',
    props: {
      label: 'Logos',
      className: 'max-w-3xl',
      controls: 'none',
      perView: 'three',
      items: [
        { title: 'Acme Corp' },
        { title: 'Northwind' },
        { title: 'Globex' },
        { title: 'Initech' },
        { title: 'Umbrella' },
      ],
    },
  },
];
