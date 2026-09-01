// A horizontal gallery on a scroll-snap track. THIS FILE HAS NO LOOK IN IT, and
// that is the contract, not an accident of how it was written:
//
//   1. useCarousel        the ENGINE: state, timing, locking, measurement and
//                         announcement logic. No JSX, no classNames.
//   2. Carousel*          SLOT PRIMITIVES: minimal elements carrying only what
//                         the mechanics and accessibility need (role/aria/
//                         data-state/hidden/handlers), styled by the AUTHOR.
//                         `asChild` on every interactive one, so the design's
//                         own arrow or dot IS the control.
//
// The only classes in here are ones that ARE mechanics — `CarouselTrack`'s
// `flex snap-x snap-mandatory overflow-x-auto` is literally what swipes and
// snaps, and `sr-only` on the live region is an accessibility fact — so if you
// find yourself adding a colour, a radius or a spacing here, it belongs in the
// section. Start from `skeleton.carousel-*.tsx` beside this file and reshape its
// markup freely: the mechanics come from here and the appearance is yours.
//
// The styled <Carousel> lives in `Carousel.demo.tsx`, which is the lab's demo
// and is NOT copied into a workspace. It used to be a third layer in this file;
// the reason it moved is written at the top of that one, and the rule it leaves
// behind is: anything true of EVERY design with a carousel in it belongs here,
// and everything else belongs there.
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
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────────────────────────────────────
 * asChild plumbing (kept file-local: this is a copy-in component, and the next
 * fork must not depend on a sibling that wasn't copied with it)
 * ──────────────────────────────────────────────────────────────────────────── */

type AnyProps = Record<string, unknown>;

/** `useLayoutEffect` where there is a layout, `useEffect` where there is not.
 *  Chosen once per environment, never per render, so it is not a conditional
 *  hook — React warns about the layout variant during server rendering, and a
 *  copy-in component lands in apps that render on a server. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function composeRefs(...refs: (Ref<unknown> | undefined)[]): (node: unknown) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') (ref as { current: unknown }).current = node;
    }
  };
}

/** Merge the primitive's mechanics props with the author's own.
 *
 *  The author wins on plain attributes (their aria-label beats our default),
 *  classNames and styles concatenate, and handlers COMPOSE — the author's runs
 *  first, and `preventDefault` in it cancels ours, which is the escape hatch for
 *  a design that wants to own one interaction without giving up the rest. */
function mergeSlotProps(ours: AnyProps, child: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...child };
  for (const key of Object.keys(ours)) {
    const ourValue = ours[key];
    const childValue = child[key];
    if (/^on[A-Z]/.test(key) && typeof ourValue === 'function') {
      merged[key] =
        typeof childValue === 'function'
          ? (event: { defaultPrevented?: boolean }) => {
              (childValue as (e: unknown) => void)(event);
              if (!event?.defaultPrevented) (ourValue as (e: unknown) => void)(event);
            }
          : ourValue;
    } else if (key === 'className') {
      merged.className = cn(ourValue as string, childValue as string);
    } else if (key === 'style') {
      merged.style = { ...(ourValue as CSSProperties), ...(childValue as CSSProperties) };
    } else if (childValue === undefined) {
      merged[key] = ourValue;
    }
  }
  return merged;
}

/** Render the primitive as its default tag, or — `asChild` — AS the author's own
 *  element, mechanics merged into it. Radix's contract: exactly one element. */
function renderSlot(
  asChild: boolean | undefined,
  tag: 'div' | 'button',
  ours: AnyProps,
  children: ReactNode,
): ReactElement {
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) throw new Error('asChild expects a single element child');
    const childProps = child.props as AnyProps;
    const merged = mergeSlotProps(ours, childProps);
    merged.ref = composeRefs(ours.ref as Ref<unknown> | undefined, childProps.ref as Ref<unknown> | undefined);
    return cloneElement(child, merged);
  }
  const Tag = tag;
  return <Tag {...(ours as HTMLAttributes<HTMLElement>)}>{children}</Tag>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Layer 1 — the engine
 * ──────────────────────────────────────────────────────────────────────────── */

export interface UseCarouselOptions {
  /** How many slides the track holds. */
  count: number;
  /**
   * The slide the track RESTS on before the reader touches it, 0-based.
   *
   * A design's still frame routinely shows a gallery mid-deck — the third
   * project is the hero image, the second card is the one centered. That is a
   * fact about the design, and it needs an option, because the alternative an
   * author reaches for otherwise is to ROTATE the slide array so the resting
   * slide is first. Rotating reproduces the frame and breaks the gallery: every
   * index-addressed control (`CarouselDot index=`, a deep link, `slideProps`)
   * now points at a different slide than its label, so pressing the marker that
   * reads "4" rewinds to the left-hand end of the track. Set this instead and
   * the slides stay in document order, where dot n IS slide n.
   *
   * Applied as an instant, unannounced jump once the engine has a track — and
   * re-applied if the value itself changes, so a prop control moves it. It
   * never fights the reader: their own scrolling wins from then on.
   *
   * With scripts off the track rests at slide 1 regardless (`scrollLeft` starts
   * at 0 and there is no script to move it), so the slide the design drew is a
   * hydration-time position, not a server-rendered one. Every slide is real
   * content in document order either way.
   */
  initialIndex?: number;
  /**
   * Advance on a timer, in milliseconds.
   *
   * How long a reader gets with each slide is the design's decision wherever
   * the design makes one — a prototype's AFTER_TIMEOUT delay always wins. Where
   * the source cannot state a timing at all, a readable default (5000) is the
   * right answer and omission is not: a gallery asked to advance itself and
   * handed no interval is a manual gallery, and its pause control hides itself
   * because there is nothing to pause. Leave it out only for a gallery that is
   * genuinely reader-driven.
   * Ignored under `prefers-reduced-motion`, and REFUSED entirely when no
   * `CarouselPause` is mounted — moving content needs a way to stop it
   * (WCAG 2.2.2), and a dev-time console error beats a silent failure.
   */
  autoAdvanceMs?: number | null;
  /** Wrap from the last slide back to the first when AUTO-advancing. Reader
   *  controls never wrap: an arrow that jumps from the end back to the start
   *  reads as broken, so `hasNext`/`hasPrev` answer from the scroll position
   *  whatever this says. Default false. */
  loop?: boolean;
}

/** What `useCarousel` returns: mechanics only, no markup. Wire it to the
 *  design's own elements through the Carousel* primitives (preferred), or spread
 *  `trackProps`/`slideProps` by hand. */
export interface CarouselEngine {
  /** Where the track IS — measured from the scroll position, never counted from
   *  clicks, so a swipe, a wheel and a keyboard arrow all keep it honest. */
  index: number;
  count: number;
  /** Scroll to a slide, announcing the move (a reader-driven jump). */
  goTo: (index: number) => void;
  /** One slide forward from wherever the reader was last HEADED — two quick
   *  presses move two slides even mid-scroll. */
  next: () => void;
  prev: () => void;
  /** Answered from the SCROLL POSITION, not the slide count: with two or three
   *  slides in view the last reachable index is not `count - 1`, and a control
   *  that stays live at the end of the track does nothing when pressed. */
  hasNext: boolean;
  hasPrev: boolean;
  atStart: boolean;
  atEnd: boolean;
  /** The reader pressed pause. Hover/focus holds are separate and internal. */
  paused: boolean;
  pause: () => void;
  resume: () => void;
  /** False until hydration lands. Controls drawn before this is true are lying
   *  about being pressable — hide them or mark them `inert` (the primitives do). */
  interactive: boolean;
  reducedMotion: boolean;
  /** Auto-advance is configured and motion is welcome — i.e. a pause control has
   *  a job to do right now. */
  rotating: boolean;
  /** What the live region should say. Set only when the READER moved the track —
   *  a carousel that narrates its own timer talks over the page. */
  announced: string;
  /** Spread onto the scroll container. Slides must be its DIRECT children — the
   *  measurement walks `track.children`. */
  trackProps: { ref: RefObject<HTMLElement | null>; tabIndex: number };
  /** Spread onto the element that should pause the timer while hovered or
   *  focused — normally the whole gallery region. */
  rootProps: {
    ref: RefObject<HTMLElement | null>;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  /** Per-slide state for hand-wired markup; the CarouselSlide primitive spreads
   *  this for you. */
  slideProps: (index: number) => { 'data-active': '' | undefined };
  /** CarouselPause calls this; returns the unregister. The timer refuses to run
   *  while nothing is registered. */
  registerPause: () => () => void;
}

export function useCarousel({
  count,
  initialIndex = 0,
  autoAdvanceMs,
  loop = false,
}: UseCarouselOptions): CarouselEngine {
  const trackRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  const start = Math.max(0, Math.min(Math.trunc(initialIndex), count - 1));

  // Seeded at the resting slide rather than at 0: the markers are rendered
  // before any measurement can run, and a dot row that marks slide 1 for a
  // frame and then jumps is the flicker this option exists to remove.
  const [index, setIndex] = useState(start);
  const [atStart, setAtStart] = useState(start === 0);
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

  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // under the pointer, or holding focus
  const [announced, setAnnounced] = useState('');

  // The hover/focus that PRECEDED hydration. `pointerenter` and `focus` only
  // fire at boundaries, so a cursor already parked over the carousel — or a
  // keyboard focus already inside it, the track is focusable from the server —
  // when the handlers attach never announces itself, and the timer would start
  // moving slides under a pointer that thinks it is pausing them. Hydration has
  // to ASK. (Found by CI: a cold server made the test's hover land before the
  // handlers existed, which is exactly a slow reader's first second on the page.)
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
  // in render. (This ref is ALSO why "press dot 5 from slide 4" moves exactly one
  // slide forward instead of rewinding past everything: the jump is computed from
  // the target slide's own offset, not from an accumulated guess.)
  const targetRef = useRef(start);
  // Resyncing the target after a scroll SETTLES is what keeps it honest: a swipe,
  // a wheel, a keyboard arrow and a snap-back all move the track without going
  // through this engine, and after any of them the scroll position is the truth.
  // Debounced because there is no reliable `scrollend` across the browsers a
  // customer's page has to work in.
  const settleRef = useRef(0);

  // Where the track actually is, measured rather than counted.
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const children = [...track.children] as HTMLElement[];
    let best = 0;
    let closest = Number.POSITIVE_INFINITY;
    // Centers against the viewport center, not offsetLeft against scrollLeft:
    // the start-aligned comparison misreads a snap-center track at its clamped
    // end, where the centered slide's offsetLeft sits a whole peek-width past
    // scrollLeft — the dots then mark the slide BEFORE the one on screen.
    // Center-to-center is alignment-agnostic: for snap-start tracks the two
    // measures agree, because every slide is offset from its own center by the
    // same half-width.
    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    children.forEach((el, i) => {
      const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - viewportCenter);
      if (distance < closest) {
        closest = distance;
        best = i;
      }
    });
    setIndex(best);
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
    // retires the forward control.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      track.removeEventListener('scroll', measure);
      observer.disconnect();
      window.clearTimeout(settleRef.current);
    };
  }, [measure, count]);

  const scrollToIndex = useCallback(
    (target: number, fromReader: boolean, instant = false) => {
      const track = trackRef.current;
      const clamped = Math.max(0, Math.min(target, count - 1));
      const slide = track?.children[clamped] as HTMLElement | undefined;
      if (!track || !slide) return;
      targetRef.current = clamped;
      // `scrollTo` on the track, not `slide.scrollIntoView()`: scrollIntoView
      // scrolls every scrollable ancestor, so a carousel halfway down a page
      // yanks the whole document to itself on the first arrow press.
      //
      // The target honours the slide's OWN snap alignment, because "scroll to
      // offsetLeft and let mandatory snap settle it" is wrong for snap-center:
      // a start-aligned target lands nearly EQUIDISTANT between two center
      // snap points, and the browser's re-snap picks whichever is a pixel
      // closer — which is how the last dot of a peek carousel settled back
      // onto the slide before it. Landing ON the snap point leaves the snap
      // nothing to correct.
      const align = getComputedStyle(slide).scrollSnapAlign;
      let left = slide.offsetLeft;
      if (align.includes('center')) left -= (track.clientWidth - slide.offsetWidth) / 2;
      else if (align.includes('end')) left -= track.clientWidth - slide.offsetWidth;
      left = Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
      // `behavior` in the options object overrides the track's own
      // `scroll-behavior: smooth`, which is what makes the opening jump land
      // before the first paint instead of animating in from slide 1.
      track.scrollTo({ left, behavior: instant || reduced ? 'auto' : 'smooth' });
      // Announced only when the READER moved it. A carousel that narrates its
      // own timer talks over everything else on the page every few seconds.
      if (fromReader) setAnnounced(`Slide ${clamped + 1} of ${count}`);
    },
    [count, reduced],
  );

  // Park the track on the design's resting slide. A LAYOUT effect, so the jump
  // is committed in the same frame as the first paint — a passive effect would
  // show slide 1 and then slide sideways on every load.
  //
  // Guarded by the value rather than by "have I run": re-running when
  // `initialIndex` CHANGES is what makes it a live prop (a prop control in an
  // editor moves the gallery), while re-running on every render would drag the
  // track back under a reader who had scrolled away.
  const appliedStart = useRef<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (appliedStart.current === start) return;
    if (!trackRef.current) return;
    appliedStart.current = start;
    if (start === 0) return; // already where a fresh track sits
    scrollToIndex(start, false, true);
  }, [start, scrollToIndex]);

  const goTo = useCallback((i: number) => scrollToIndex(i, true), [scrollToIndex]);
  /** One slide along from wherever the reader was last headed. */
  const step = useCallback(
    (direction: 1 | -1) => scrollToIndex(targetRef.current + direction, true),
    [scrollToIndex],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  // The pause-control roster. A ref so the count is right the moment a child's
  // mount effect runs (child effects flush before this hook's own), plus a state
  // bump so the timer effect re-evaluates when the roster changes later.
  const pauseControls = useRef(0);
  const [pauseRoster, setPauseRoster] = useState(0);
  const registerPause = useCallback(() => {
    pauseControls.current += 1;
    setPauseRoster((v) => v + 1);
    return () => {
      pauseControls.current -= 1;
      setPauseRoster((v) => v + 1);
    };
  }, []);
  const warnedNoPause = useRef(false);

  const rotating = Boolean(autoAdvanceMs && autoAdvanceMs > 0 && !reduced);
  const advancing = Boolean(interactive && rotating && !paused && !held);

  useEffect(() => {
    if (!advancing || !autoAdvanceMs) return;
    // Refuse, out loud, rather than rotate unstoppably: moving content that
    // lasts more than five seconds needs a control that stops it (WCAG 2.2.2),
    // and "hover somewhere" is not a control.
    if (pauseControls.current === 0) {
      if (!warnedNoPause.current) {
        warnedNoPause.current = true;
        console.error(
          'useCarousel: autoAdvanceMs is set but no CarouselPause is mounted — auto-advance refuses to run. ' +
            'Mount a CarouselPause (asChild over your own button) or drop the interval.',
        );
      }
      return;
    }
    // The interval deliberately does NOT depend on the position: with `index`
    // in the dependency list every frame of a smooth scroll would restart the
    // countdown, and the carousel would never advance a second time.
    const timer = window.setInterval(() => {
      const target = targetRef.current + 1;
      if (target >= count) {
        if (loop) scrollToIndex(0, false);
        return;
      }
      scrollToIndex(target, false);
    }, autoAdvanceMs);
    return () => window.clearInterval(timer);
  }, [advancing, autoAdvanceMs, count, loop, scrollToIndex, pauseRoster]);

  return {
    index,
    count,
    goTo,
    next,
    prev,
    hasNext: !atEnd,
    hasPrev: !atStart,
    atStart,
    atEnd,
    paused,
    pause,
    resume,
    interactive,
    reducedMotion: reduced,
    rotating,
    announced,
    trackProps: { ref: trackRef, tabIndex: 0 },
    rootProps: {
      ref: rootRef,
      // Pausing while the pointer is over it or focus is inside it: the pause
      // button satisfies the guideline, this is what stops the slide moving out
      // from under someone mid-sentence. (React's onFocus/onBlur delegate
      // focusin/focusout, so focus anywhere inside counts.)
      onPointerEnter: () => setHeld(true),
      onPointerLeave: () => setHeld(false),
      onFocus: () => setHeld(true),
      onBlur: () => setHeld(false),
    },
    slideProps: (i: number) => ({ 'data-active': i === index ? ('' as const) : undefined }),
    registerPause,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Layer 2 — slot primitives
 *
 * Each carries ONLY what the mechanics and accessibility need. Looks are the
 * author's: style them via className/children and the data- attributes
 * (`data-active`, `data-has-target`, `data-paused`) — never by editing baked
 * classes, because there are none to edit.
 * ──────────────────────────────────────────────────────────────────────────── */

interface CarouselContextValue {
  car: CarouselEngine;
  id: string;
  label?: string;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext(where: string): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error(`${where} must be rendered inside a CarouselRoot`);
  return ctx;
}

export interface CarouselRootProps extends HTMLAttributes<HTMLElement> {
  /** The engine, from `useCarousel`. */
  car: CarouselEngine;
  /** What the gallery IS, for a screen reader — "Customer stories", "Our work".
   *  A carousel announced only as "carousel" tells the reader nothing. */
  label?: string;
  /** Id root: each slide gets `<id>-slide-<n>` so a link can point at one. */
  id?: string;
  asChild?: boolean;
  children?: ReactNode;
}

/** The gallery region: APG carousel semantics, the hover/focus hold, and the
 *  live region that speaks only when the reader moved the track. */
export function CarouselRoot({ car, label, id, asChild, children, ...rest }: CarouselRootProps) {
  const autoId = useId();
  const rootId = id ?? `carousel-${autoId.replace(/[:]/g, '')}`;
  const ours: AnyProps = {
    'data-slot': 'carousel',
    // The APG carousel pattern: a group whose role is DESCRIBED as a carousel,
    // named by what it holds.
    role: 'group',
    'aria-roledescription': 'carousel',
    'aria-label': label,
    ...car.rootProps,
    ...rest,
  };
  // Empty until the reader moves the track themselves — see the engine's
  // `scrollToIndex`. Appended after the author's children so it never disturbs
  // their layout (it is visually hidden anyway).
  const live = (
    <span aria-live="polite" aria-atomic="true" className="sr-only">
      {car.announced}
    </span>
  );
  let body: ReactElement;
  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) throw new Error('CarouselRoot asChild expects a single element child');
    const childProps = child.props as AnyProps;
    const merged = mergeSlotProps(ours, childProps);
    merged.ref = composeRefs(ours.ref as Ref<unknown> | undefined, childProps.ref as Ref<unknown> | undefined);
    body = cloneElement(
      child,
      merged,
      <>
        {(childProps as { children?: ReactNode }).children}
        {live}
      </>,
    );
  } else {
    body = (
      <div {...(ours as HTMLAttributes<HTMLDivElement>)}>
        {children}
        {live}
      </div>
    );
  }
  return (
    <CarouselContext.Provider value={{ car, id: rootId, label }}>{body}</CarouselContext.Provider>
  );
}

export interface CarouselTrackProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: ReactNode;
}

/** The scroll-snap mechanism — the no-JS core. The four baked classes ARE the
 *  behaviour (`overflow-x-auto` + `snap-x snap-mandatory` on a `flex` row is
 *  what swipes and snaps before any script runs) and `relative` is measurement
 *  (a slide's offsetLeft must be read from the track, not from some positioned
 *  ancestor). Everything else — gap, radius, scrollbar, smoothness — is yours. */
export function CarouselTrack({ asChild, children, className, ...rest }: CarouselTrackProps) {
  const { car, label } = useCarouselContext('CarouselTrack');
  const ours: AnyProps = {
    'data-slot': 'carousel-track',
    // Focusable, and deliberately so: a scroll container that a mouse can
    // drag but a keyboard cannot reach is a WCAG failure, and one tab stop
    // buys the whole native arrow-key-and-snap behaviour with no key handler
    // of ours.
    ...car.trackProps,
    'aria-label': label ? `${label}, slides` : 'Slides',
    className: cn('relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain', className),
    ...rest,
  };
  return renderSlot(asChild, 'div', ours, children);
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLElement> {
  /** Position in the track, 0-based. Must match document order. */
  index: number;
  asChild?: boolean;
  children?: ReactNode;
}

/** One slide. Always in the markup — visibility is the track's scroll position,
 *  never conditional rendering, so every word survives with JavaScript off. */
export function CarouselSlide({ index, asChild, children, ...rest }: CarouselSlideProps) {
  const { car, id } = useCarouselContext('CarouselSlide');
  const ours: AnyProps = {
    id: `${id}-slide-${index + 1}`,
    'data-slot': 'carousel-slide',
    // Each slide named by its position, per APG. Not `aria-hidden` when
    // off-screen: they are scrolled past, not withheld, and hiding them
    // would take real content out of the page for the one reader who
    // cannot see that it is merely off to the right.
    role: 'group',
    'aria-roledescription': 'slide',
    'aria-label': `${index + 1} of ${car.count}`,
    ...car.slideProps(index),
    ...rest,
  };
  return renderSlot(asChild, 'div', ours, children);
}

interface CarouselDirectionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** What to do when there is no slide in this direction: `hide` (default — the
   *  mirror of a lone drawn arrow appears exactly when a slide is behind) or
   *  `disable` (keep the element, mark it disabled). */
  noTarget?: 'hide' | 'disable';
  children?: ReactNode;
}

/** Shared by CarouselNext/CarouselPrev — a hook, called unconditionally from
 *  exactly those two component bodies. */
function useDirectionControl(direction: 1 | -1, slot: string, { asChild, noTarget = 'hide', children, ...rest }: CarouselDirectionProps) {
  const { car } = useCarouselContext(direction === 1 ? 'CarouselNext' : 'CarouselPrev');
  const has = direction === 1 ? car.hasNext : car.hasPrev;
  const ours: AnyProps = {
    'data-slot': slot,
    // Directional controls KNOW their target — answered from the scroll
    // position, so it is right whatever `perView` and the viewport did.
    'data-has-target': has ? '' : undefined,
    hidden: noTarget === 'hide' && !has ? true : undefined,
    disabled: noTarget === 'disable' && !has ? true : undefined,
    // Dead honestly until hydration: no tab stop, out of the accessibility
    // tree, rather than a control that looks live and swallows the press.
    inert: car.interactive ? undefined : true,
    onClick: direction === 1 ? car.next : car.prev,
    ...(asChild ? {} : { type: 'button' }),
    ...rest,
  };
  return renderSlot(asChild, 'button', ours, children);
}

/** The forward control. `asChild` makes the design's own drawn arrow the
 *  control; give it an `aria-label` when its content is only a glyph. */
export function CarouselNext(props: CarouselDirectionProps) {
  return useDirectionControl(1, 'carousel-next', props);
}

/** The backward control. With the default `noTarget="hide"` it renders `hidden`
 *  until a slide is actually behind — which is why a design that drew ONE arrow
 *  stays faithful: mount both, and the mirror appears exactly when it can act. */
export function CarouselPrev(props: CarouselDirectionProps) {
  return useDirectionControl(-1, 'carousel-prev', props);
}

export interface CarouselDotProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The slide this dot jumps to, 0-based. */
  index: number;
  asChild?: boolean;
  children?: ReactNode;
}

/** One position marker. `aria-current` reflects the MEASURED scroll position, so
 *  a swipe moves the marker just like a click does. */
export function CarouselDot({ index, asChild, children, ...rest }: CarouselDotProps) {
  const { car } = useCarouselContext('CarouselDot');
  const ours: AnyProps = {
    'data-slot': 'carousel-dot',
    'aria-current': car.index === index ? 'true' : undefined,
    inert: car.interactive ? undefined : true,
    onClick: () => car.goTo(index),
    ...(asChild ? {} : { type: 'button' }),
    ...rest,
  };
  return renderSlot(asChild, 'button', ours, children);
}

export interface CarouselPauseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}

/** The stop control, REQUIRED whenever `autoAdvanceMs` is set — the engine
 *  refuses to rotate until one is mounted. Hidden whenever there is nothing to
 *  pause (reduced motion, no timer, not yet hydrated), so it is never present
 *  and pointless. Carries a default `aria-label` that flips with the state;
 *  an author's own label wins. */
export function CarouselPause({ asChild, children, ...rest }: CarouselPauseProps) {
  const { car } = useCarouselContext('CarouselPause');
  useEffect(() => car.registerPause(), [car.registerPause]);
  const showing = car.interactive && car.rotating;
  const ours: AnyProps = {
    'data-slot': 'carousel-pause',
    'data-paused': car.paused ? '' : undefined,
    hidden: showing ? undefined : true,
    // `aria-label`, never sr-only TEXT, on anything that only exists once
    // hydrated: sr-only text is real text, so it would show up in the hydrated
    // render and be absent from the unhydrated one, and "does any content
    // disappear without JS" would start failing on the labels of controls
    // rather than on content.
    'aria-label': car.paused ? 'Play the slideshow' : 'Pause the slideshow',
    onClick: () => (car.paused ? car.resume() : car.pause()),
    ...(asChild ? {} : { type: 'button' }),
    ...rest,
  };
  return renderSlot(asChild, 'button', ours, children);
}
