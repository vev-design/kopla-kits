// A horizontal card strip built on CSS scroll-snap. No client JS: the browser
// does the scrolling, the snapping, the momentum and the keyboard/trackpad
// handling. The previous/next controls are anchor links to the slides, so they
// work without a script too.
//
// It scrolls; it does not auto-advance. That is the deliberate trade — an
// autoplaying carousel needs a timer, which needs JavaScript, which would make
// every page hosting it ship the hydration bundle.

import { cn } from '@/lib/utils';

/**
 * A horizontally scrollable strip of cards that snaps to each slide.
 * CSS-only: no JavaScript, no hydration. Scrollable by drag, wheel,
 * trackpad and keyboard; does not auto-advance.
 */
export interface CarouselProps {
  /**
   * Unique id for this carousel on the page — the arrow links target its
   * slides. kebab-case, e.g. "testimonials".
   */
  id: string;
  /** The slides, in order. 3–10 items. */
  items: {
    /** Card heading. 1 sentence, max 8 words. */
    title: string;
    /** Card body. 1–3 sentences, 15–50 words. */
    body: string;
    /** Optional image behind or above the text. */
    image?: string | null;
    /** Optional small label above the heading. 1–3 words. */
    eyebrow?: string | null;
  }[];
  /** Slide width. `wide` shows roughly one card, `narrow` shows several. */
  size?: 'narrow' | 'normal' | 'wide';
  /** Render previous/next arrow links below the strip. Default true. */
  showControls?: boolean;
}

const WIDTH: Record<NonNullable<CarouselProps['size']>, string> = {
  narrow: 'w-[16rem]',
  normal: 'w-[22rem]',
  wide: 'w-[min(34rem,85vw)]',
};

export function Carousel({ id, items, size = 'normal', showControls = true }: CarouselProps) {
  const slideId = (i: number) => `${id}-slide-${i}`;

  return (
    <div className="w-full">
      <div
        // `snap-x snap-mandatory` + `snap-start` on each child is the whole
        // mechanism. `scroll-smooth` makes the arrow links glide.
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        role="region"
        aria-label="Scrollable content"
      >
        {items.map((item, i) => (
          <article
            key={item.title}
            id={slideId(i)}
            className={cn(
              'flex shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card',
              WIDTH[size],
            )}
          >
            {item.image ? (
              <img src={item.image} alt="" className="h-48 w-full object-cover" />
            ) : null}
            <div className="flex flex-col gap-2 p-6">
              {item.eyebrow ? (
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.eyebrow}
                </span>
              ) : null}
              <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </article>
        ))}
      </div>

      {showControls && items.length > 1 ? (
        // Anchor links, not buttons: jumping to a slide's id scrolls the
        // snap container to it with no script. They move one slide from
        // either end, which is the useful case without tracking position.
        <div className="mt-2 flex items-center justify-end gap-2">
          <a
            href={`#${slideId(0)}`}
            aria-label="Scroll to start"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
              <path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={`#${slideId(items.length - 1)}`}
            aria-label="Scroll to end"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
              <path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      ) : null}
    </div>
  );
}

export const CarouselShowcase = [
  {
    props: {
      id: 'testimonials',
      items: [
        {
          eyebrow: 'Northwind',
          title: 'Launched in a weekend',
          body: 'We replaced a six-week agency cycle with an afternoon, and the brand still looks like ours.',
        },
        {
          eyebrow: 'Globex',
          title: 'One system, nine markets',
          body: 'Every regional team publishes from the same design system, so nothing drifts.',
        },
        {
          eyebrow: 'Initech',
          title: 'Half the page weight',
          body: 'Static pages out of the box meant our landing pages got measurably faster.',
        },
      ],
    },
    label: 'Testimonials',
  },
  {
    props: {
      id: 'menu-preferences',
      size: 'narrow',
      showControls: false,
      items: [
        { title: 'Family friendly', body: 'Classic dishes with a twist kids actually eat.' },
        { title: 'Quick and easy', body: 'On the table in twenty minutes or less.' },
        { title: 'Vegetarian', body: 'Vegetable-forward plates with real protein.' },
        { title: 'Fish and greens', body: 'Light, bright dinners built around seafood.' },
      ],
    },
    label: 'Narrow, no controls',
  },
];
