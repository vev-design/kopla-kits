// SKELETON for `carousel-auto` — copy into a SECTION file and reshape.
//
// Same contract as skeleton.carousel-arrows.tsx (read its header): the markup
// is yours, the hook and primitives are the engine. The auto-advance delta:
//
// - `autoAdvanceMs` comes from the DESIGN's own timing (a prototype's
//   AFTER_TIMEOUT) whenever the design states one. Where the source cannot
//   state a timing at all — a still frame, a captured page — keep the 5000
//   below rather than dropping the prop: a gallery asked to advance itself and
//   handed no interval simply does not advance, and the pause control hides
//   itself because there is nothing to pause. Shipping the behaviour off is a
//   worse answer than a readable default.
// - A `CarouselPause` MUST be mounted: moving content needs a way to stop
//   (WCAG 2.2.2), and the engine refuses to run the timer without one. Style it
//   as the design's pause control, or as a small unobtrusive one if the design
//   drew none — this is the one control that may exist undrawn.
// - The timer already pauses on hover/focus and stops under
//   prefers-reduced-motion; nothing to wire.

import {
  CarouselPause,
  CarouselRoot,
  CarouselSlide,
  CarouselTrack,
  useCarousel,
} from '@/components/Carousel';

interface AutoGallerySkeletonProps {
  /** @hydrate */
  title?: string;
}

const SLIDES = [1, 2, 3];

export function AutoGallerySkeleton({ title = 'Highlights' }: AutoGallerySkeletonProps) {
  const car = useCarousel({ count: SLIDES.length, autoAdvanceMs: 5000, loop: true });
  return (
    <section className="py-16">
      <CarouselRoot car={car} label={title} className="relative">
        <CarouselTrack className="flex snap-x snap-mandatory gap-4 overflow-x-auto">
          {SLIDES.map((slide, i) => (
            <CarouselSlide key={slide} index={i} className="w-full shrink-0 snap-start">
              {/* ← the design's slide markup */}
            </CarouselSlide>
          ))}
        </CarouselTrack>
        <CarouselPause className="absolute bottom-4 right-4" />
      </CarouselRoot>
    </section>
  );
}
