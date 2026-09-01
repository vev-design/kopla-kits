// The STYLED Carousel — the lab's demo, and the fallback for a design that drew
// no gallery UI of its own.
//
// It lives OUTSIDE `Carousel.tsx` and is NOT copied into a workspace
// (`scripts/build-components.mjs` skips `*.demo.tsx` the same way it skips
// `skeleton.*`). That separation is the point, and it took a real failure to
// learn: while this lived in the copied file, a customer's design system ended
// up with a rendered <Carousel> registered in its own component catalog that
// nothing on the site used — and, worse, an agent reaching for the nearest
// runnable thing took the styled wrapper and then fought its chrome, rather
// than wearing the engine underneath. Every other library in this space draws
// the same line: the look ships somewhere other than the artifact you copy.
//
// So what belongs here is exactly what a LOOK is: this file may hold classes,
// glyphs, spacing and layout. What must NEVER live here is behaviour — if a
// property of this component would be true of every design with a carousel in
// it (measurement, keyboard, ARIA, timing, the pre-hydration state), it belongs
// in the engine or the primitives, or an authored section silently loses it.

import { Children, isValidElement, useId, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CarouselDot,
  CarouselNext,
  CarouselPause,
  CarouselPrev,
  CarouselRoot,
  CarouselSlide,
  CarouselTrack,
  useCarousel,
} from './Carousel';

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
 * track and the controls, never a slide's appearance. And when the design drew
 * its own gallery UI (an arrow of its own, numbered markers, a cropped-peek
 * layout), do not use this wrapper at all: drive the design's markup with
 * `useCarousel` + the Carousel* primitives instead.
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
   * The design's own timing wins where it states one (a prototype's
   * `AFTER_TIMEOUT`). Where the source states none, 5000 rather than nothing —
   * see `UseCarouselOptions.autoAdvanceMs`, which this forwards to. Ignored
   * under `prefers-reduced-motion`.
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

const CONTROL_CLASS =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

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

  const car = useCarousel({ count, autoAdvanceMs, loop });

  if (count === 0) return null;

  const showArrows = car.interactive && (controls === 'arrows' || controls === 'both');
  const showDots = car.interactive && (controls === 'dots' || controls === 'both');
  const rotating = car.interactive && car.rotating;

  return (
    <CarouselRoot car={car} id={rootId} label={label} className={cn('flex flex-col gap-4', className)}>
      <CarouselTrack
        className={cn(
          'gap-4 rounded-xl',
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
          <CarouselSlide
            key={i}
            index={i}
            className={cn(
              // One slide per view on a phone whatever `perView` says: three
              // cards across 360px is three unreadable cards.
              'shrink-0 basis-full snap-start',
              'md:basis-[calc((100%-(var(--per-view)-1)*var(--slide-gap))/var(--per-view))]',
              slideClassName,
            )}
          >
            {slide}
          </CarouselSlide>
        ))}
      </CarouselTrack>

      {showArrows || showDots || rotating ? (
        <div data-slot="carousel-controls" className="flex flex-wrap items-center gap-2">
          {rotating ? (
            <CarouselPause asChild>
              <button className={CONTROL_CLASS}>
                {car.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            </CarouselPause>
          ) : null}

          {showArrows ? (
            <>
              {/* `noTarget="disable"`: this chrome draws BOTH arrows, so the one
                  with nothing behind it dims rather than vanishing — a pair that
                  blinks in and out reads as broken. A design that drew a single
                  arrow wants the default instead. */}
              <CarouselPrev asChild noTarget="disable">
                <button
                  aria-label="Previous slide"
                  className={cn(CONTROL_CLASS, 'disabled:pointer-events-none disabled:opacity-40')}
                >
                  <ChevronLeft className="size-4" />
                </button>
              </CarouselPrev>
              <CarouselNext asChild noTarget="disable">
                <button
                  aria-label="Next slide"
                  className={cn(CONTROL_CLASS, 'disabled:pointer-events-none disabled:opacity-40')}
                >
                  <ChevronRight className="size-4" />
                </button>
              </CarouselNext>
            </>
          ) : null}

          {showDots ? (
            <div className="flex flex-wrap items-center gap-0.5">
              {slides.map((_, i) => (
                <CarouselDot key={i} index={i} asChild>
                  <button
                    aria-label={`Go to slide ${i + 1}`}
                    // 44px of button around an 8px dot. The dot is the drawing; the
                    // target is what a thumb has to hit.
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-2 rounded-full motion-safe:transition-colors',
                        i === car.index ? 'bg-primary' : 'bg-border',
                      )}
                    />
                  </button>
                </CarouselDot>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </CarouselRoot>
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
