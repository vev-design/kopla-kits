// The lab's look. Consumers copy the mechanics and author their own section.
import { Marquee as MarqueeEngine, MarqueePause, type MarqueeProps } from './Marquee';

export function Marquee(props: MarqueeProps) {
  return (
    <div className="py-8 text-foreground">
      <MarqueeEngine {...props} gap={48} controls={
        <label className="mt-6 inline-flex min-h-11 items-center gap-2 rounded border px-3 text-sm">
          <MarqueePause /> Pause animation
        </label>
      } />
    </div>
  );
}

export const MarqueeShowcase = [
  {
    label: 'Two logos',
    props: { logos: [
      { src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="40"%3E%3Ctext x="8" y="28" font-size="26" fill="%235b5bd6"%3EAcme%3C/text%3E%3C/svg%3E', alt: 'Acme', width: 120, height: 40 },
      { src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="40"%3E%3Ctext x="8" y="28" font-size="24" fill="%235b5bd6"%3ENorthwind%3C/text%3E%3C/svg%3E', alt: 'Northwind', width: 160, height: 40 },
    ] },
  },
  { label: 'Ten text items', props: { items: ['Acme', 'Northwind', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Wonka', 'Hooli', 'Vehement'], speed: 'slow' } },
  { label: 'Long label', props: { items: ['An intentionally long customer name that still needs to remain readable at the narrowest viewport', 'Northwind'], speed: 'fast' } },
  { label: 'Missing logo', props: { logos: [
    { src: '', alt: 'Acme — image unavailable', width: 120, height: 40 },
    { src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="40"%3E%3Ctext x="8" y="28" font-size="24" fill="%235b5bd6"%3ENorthwind%3C/text%3E%3C/svg%3E', alt: 'Northwind', width: 160, height: 40 },
  ], pauseOnHover: false } },
];
