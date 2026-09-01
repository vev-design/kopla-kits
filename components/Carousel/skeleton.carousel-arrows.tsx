// SKELETON for `carousel-arrows` — copy this into a SECTION file and reshape.
//
// Everything visible here is a PLACEHOLDER: every element, class, and piece of
// copy below is yours to change to what the design draws. The parts to KEEP are
// the hook, the primitives, and the wiring between them — they carry the tested
// mechanics (last-slide snap math, measured position, keyboard, ARIA, the
// pre-hydration inert state) that hand-rolled tracks get wrong invisibly.
//
// Rules that survive any reshape:
// - Slides must be DIRECT children of CarouselTrack, in the DESIGN's own order
//   (measurement walks them). If the frame rests on a later slide — the third
//   project is the hero image — say so with `initialIndex`, and never by
//   rotating the array to bring that slide to the front: every numbered control
//   then addresses a different slide than it labels, and the marker reading "4"
//   rewinds the deck to its left-hand end.
// - Mount BOTH arrows even when the design draws one: a directional control
//   renders exactly when it has a target, so the lone arrow's mirror appears
//   once a slide is behind. Render only the controls the design draws — no dot
//   row unless the frame has one, and vice versa.
// - The track scrolls and swipes with NO JS; the `@hydrate` tag below is what
//   makes the arrows and dots live on the published page. Keep it.

import {
  CarouselDot,
  CarouselNext,
  CarouselPrev,
  CarouselRoot,
  CarouselSlide,
  CarouselTrack,
  useCarousel,
} from '@/components/Carousel';

interface GallerySkeletonProps {
  /** @hydrate */
  title?: string;
}

const SLIDES = [1, 2, 3, 4, 5]; // ← the design's own slides

export function GallerySkeleton({ title = 'Gallery' }: GallerySkeletonProps) {
  const car = useCarousel({ count: SLIDES.length });
  return (
    <section className="py-16">
      <h2 className="mb-8 text-3xl font-semibold">{title}</h2>
      <CarouselRoot car={car} label={title} className="relative">
        {/* The design's own track: full-bleed, peeking neighbours, whatever the
            frame shows — the classes are yours, the primitive is the engine. */}
        <CarouselTrack className="flex snap-x snap-mandatory gap-4 overflow-x-auto">
          {SLIDES.map((slide, i) => (
            <CarouselSlide key={slide} index={i} className="w-full shrink-0 snap-start">
              {/* ← the design's slide markup */}
            </CarouselSlide>
          ))}
        </CarouselTrack>
        <CarouselPrev asChild>
          {/* ← the design's own arrow, wherever it draws it */}
          <button aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2">
            ←
          </button>
        </CarouselPrev>
        <CarouselNext asChild>
          <button aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2">
            →
          </button>
        </CarouselNext>
        {/* Only when the design draws markers: */}
        <div className="mt-6 flex justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <CarouselDot key={slide} index={i} aria-label={`Slide ${i + 1}`} className="size-2.5 rounded-full bg-muted aria-[current]:bg-foreground" />
          ))}
        </div>
      </CarouselRoot>
    </section>
  );
}
