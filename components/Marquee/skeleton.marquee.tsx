// SECTION skeleton for `marquee`. Reshape the markup and styling to the source.
// Keep Marquee's loop and MarqueePause's native control. Pass original artwork
// through logos or children; never replace logos with text to fit the component.
import { Marquee, MarqueePause } from '@/components/Marquee';

export interface CustomerStripProps {
  /** Customer logos in source order, with their measured dimensions. */
  logos: { src: string; alt: string; width: number; height: number }[];
}

export function CustomerStrip({ logos }: CustomerStripProps) {
  return (
    <section>
      <Marquee logos={logos} gap={48} controls={
        <label className="inline-flex min-h-11 items-center gap-2">
          <MarqueePause /> Pause animation
        </label>
      } />
    </section>
  );
}

export const CustomerStripDemo: CustomerStripProps = { logos: [] };
