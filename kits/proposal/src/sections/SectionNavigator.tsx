import type { SectionBaseProps } from '@/types';

/**
 * A compact, fixed presentation rail for moving between the major beats of a long scroll narrative. Use it with one thumbnail entry for each destination section on the page.
 */
export interface SectionNavigatorProps extends SectionBaseProps {
  /** Accessible label for the navigation landmark. 2–5 words, title case. */
  label: string;
  /** Destination beats. 3–8 items, ordered as they appear on the page; each item has a 1–3 word label, an in-page #anchor href, an image URL, and a concise image description. */
  items: {
    /** Visible destination label. 1–3 words, title case. */
    label: string;
    /** In-page destination anchor. @kind url */
    href: string;
    /** Thumbnail image representing this page beat. @kind image */
    image: string;
    /** Accessible description of the thumbnail. 3–8 words. */
    imageAlt: string;
  }[];
}

export function SectionNavigator({ id, label, items }: SectionNavigatorProps) {
  return (
    <aside
      id={id ?? undefined}
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 sm:bottom-6 sm:px-6 lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-1/2 lg:w-28 lg:-translate-y-1/2 lg:px-0"
    >
      <nav className="pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-2 rounded-2xl border border-background/20 bg-foreground/90 p-2 shadow-xl backdrop-blur-sm lg:grid lg:w-full lg:gap-2">
        {items.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            aria-label={`${index + 1}. ${item.label}`}
            className="group relative block size-11 shrink-0 overflow-clip rounded-lg outline-offset-2 outline-primary focus-visible:outline-2 sm:size-12 lg:size-full lg:aspect-[1.35]"
          >
            <img src={item.image} alt={item.imageAlt} className="size-full object-cover transition duration-300 group-hover:scale-110" />
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-foreground/35 transition group-hover:bg-foreground/0" />
            <span className="pointer-events-none absolute inset-x-1 bottom-1 hidden rounded bg-foreground/85 px-1.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-background lg:block lg:translate-y-8 lg:transition lg:group-hover:translate-y-0">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

export const SectionNavigatorDemo: SectionNavigatorProps = {
  id: 'section-navigation',
  label: 'Presentation sections',
  items: [
    { label: 'Opening', href: '#top', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=360&q=80', imageAlt: 'Team meeting around a table' },
    { label: 'Approach', href: '#strategy', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=360&q=80', imageAlt: 'Colleagues working together' },
    { label: 'Programme', href: '#showcase', image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=360&q=80', imageAlt: 'Plants in bright daylight' },
    { label: 'Rollout', href: '#tour', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=360&q=80', imageAlt: 'Mountain landscape in daylight' },
    { label: 'Next', href: '#next', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=360&q=80', imageAlt: 'Building against a clear sky' },
    { label: 'Close', href: '#footer', image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=360&q=80', imageAlt: 'Leaf in warm sunlight' }
  ]
};
